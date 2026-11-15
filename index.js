const { GoogleGenAI } = require("@google/genai");
const express = require("express");
const { ZCA } = require("zca-js");

// 1. Khởi tạo Web Server nhỏ để Render không bị lỗi cổng (Port scan timeout)
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Bot Zalo Tinh Diem Free Fire dang chay!");
});

app.listen(PORT, () => {
  console.log(`Server dang chay tren cong ${PORT}`);
});

// 2. Khởi tạo Gemini AI (Tự động nhận API key từ biến môi trường GEMINI_API_KEY)
const ai = new GoogleGenAI();

async function analyzeFreeFireImage(imageUrl) {
  try {
    // Tải ảnh từ URL của Zalo xuống dưới dạng buffer để gửi cho Gemini
    const fetch = (await import("node-fetch")).default;
    const imageRes = await fetch(imageUrl);
    const imageBuffer = await imageRes.buffer();
    const imageBase64 = imageBuffer.toString("base64");

    // Gọi Gemini để đọc bảng điểm Free Fire và tính điểm
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64,
          },
        },
        {
          text: "Đây là ảnh kết quả trận đấu Free Fire. Hãy trích xuất danh sách các đội (tên team, vị trí top, số mạng hạ gục) và lập bảng xếp hạng tính điểm tổng (Quy ước: Top 1 = 12 điểm, Top 2 = 9 điểm, Top 3 = 8 điểm, Top 4-12 = 1 điểm cho mỗi vị trí giảm dần, kèm theo 1 kill = 1 điểm hoặc theo quy chuẩn thông thường). Trình bày kết quả gọn gàng, dễ nhìn bằng tiếng Việt.",
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Lỗi khi gọi Gemini xử lý ảnh:", error);
    .error("Lỗi khi xử lý ảnh kết quả trận đấu.");
  }
}

// 3. Khởi động Zalo Bot
async function startZaloBot() {
  try {
    // Lấy cookie từ biến môi trường ZALO_COOKIE trên Render
    const zaloCookie = process.env.ZALO_COOKIE;
    
    if (!zaloCookie) {
      console.log("CẢNH BÁO: Chưa cấu hình ZALO_COOKIE trong Environment của Render!");
      return;
    }

    const zca = new ZCA(JSON.parse(zaloCookie));
    
    console.log("Bot đang kết nối tới Zalo...");

    // Lắng nghe sự kiện tin nhắn đến
    zca.on("message", async (message) => {
      try {
        const { threadId, data, type } = message;

        // Kiểm tra nếu tin nhắn có đính kèm hình ảnh
        if (type === "image" || (data && data.imageUrl)) {
          const imageUrl = data.imageUrl || data.url;
          console.log("Nhận được ảnh kết quả từ nhóm, đang tiến hành đọc điểm...");

          // Gửi thông báo cho nhóm đang phân tích
          await zca.sendMessage({
            msg: "🤖 Bot đã nhận được ảnh kết quả trận đấu! Đang phân tích và tính điểm...",
            threadId,
            type: "direct",
          });

          // Gọi Gemini phân tích ảnh
          const leaderboardResult = await analyzeFreeFireImage(imageUrl);

          // Gửi kết quả bảng xếp hạng về lại nhóm Zalo
          await zca.sendMessage({
            msg: `🏆 **BẢNG XẾP HẠNG TỔNG KẾT** 🏆\n\n${leaderboardResult}`,
            threadId,
            type: "direct",
          });
        }
      } catch (err) {
        console.error("Lỗi xử lý tin nhắn:", err);
      }
    });

  } catch (error) {
    console.error("Lỗi khởi động Zalo Bot:", error);
  }
}

startZaloBot();

