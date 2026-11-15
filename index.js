const { Zalo } = require("zca-js");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Tạo web server ảo để Render không cho bot "ngủ đông"
app.get("/", (req, res) => {
  res.send("Bot Zalo FF đang chạy ổn định!");
});
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

async function startBot() {
  try {
    // Đăng nhập bằng Cookie lấy từ Zalo Web
    const cookie = process.env.ZALO_COOKIE;
    if (!cookie) {
      console.log("Lỗi: Chưa cấu hình ZALO_COOKIE trong Environment Variables!");
      return;
    }

    const zalo = new Zalo({ cookie: cookie });
    console.log("Đang kết nối tới Zalo...");

    // Lắng nghe sự kiện tin nhắn đến
    zalo.listen({
      onMessage: async (message) => {
        try {
          // Kiểm tra nếu tin nhắn là ảnh và được gửi trong nhóm giải đấu
          if (message.type === "image" && message.isGroup) {
            console.log("Phát hiện ảnh kết quả trận đấu được gửi lên nhóm!");
            
            // Ở đây bạn có thể gọi API Gemini để phân tích ảnh, 
            // hoặc tạm thời phản hồi lại nhóm để test kết nối:
            await message.reply("Đã nhận ảnh kết quả trận đấu! Bot đang tiến hành tính điểm...");
          }
        } catch (err) {
          console.error("Lỗi khi xử lý tin nhắn:", err);
        }
      }
    });

  } catch (error) {
    console.error("Không thể khởi động bot:", error);
  }
}

startBot();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Bot Zalo Free Fire đang chạy!');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});


