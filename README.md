# ScienceLens AI v3.0 — Ảnh nào cũng có khoa học

Ứng dụng độc lập chạy trên **Vercel**, không dùng ToanX, không tài khoản, không cơ sở dữ liệu.

## Thay đổi so với bản v2

- **Đã bỏ hoàn toàn chọn khối 6–9 và chọn chủ đề.** AI tự xem ảnh và chọn khía cạnh khoa học phổ thông phù hợp; không có danh sách môn/chủ đề khóa cứng.
- Đầu trang ưu tiên **Camera AI**, "Chơi thử" là chế độ mẫu dự phòng với bốn thử thách tự soạn.
- Robot Mây đưa ra một **nhận định sai có chủ ý** dựa vào vật thể thực tế và yêu cầu người học bác bỏ bằng bằng chứng.
- Đối thoại phản biện nhiều lượt; khi lập luận đủ thuyết phục, robot thừa nhận sai, trả kết luận đúng và có thể trao đổi tiếp.
- Hai lượt xử lý AI lúc tạo thử thách: (1) phân tích ảnh và tạo ngộ nhận; (2) kiểm duyệt độ đúng/sai và mức độ an toàn. AI vẫn có thể sai, cần kiểm tra khi dùng trong lớp.
- Camera có chiều cao giới hạn để không chiếm màn hình điện thoại; không upload ảnh lên database.

## Chạy trên Vercel

1. Giải nén ZIP, đặt các tệp `index.html`, `vercel.json`, `package.json` và thư mục `api`, `assets`, `shared` trực tiếp trong root của GitHub repository.
2. Vercel → Project → Settings → Environment Variables:
   - `GEMINI_API_KEY`: API key lấy từ Google AI Studio.
   - `GEMINI_MODEL`: tên mô hình Gemini có hỗ trợ ảnh và xuất JSON (giữ tên mô hình đã hoạt động ở dự án cũ).
3. Commit / Push mã nguồn lên nhánh Production của repository đang liên kết Vercel. Deploy tự động nếu Git integration được kết nối đúng.
4. Mở `https://<ten-du-an>.vercel.app/api/analyze`. API trả về `version: "3.0.0"`, `configured: true` khi đã có khóa. Đây chỉ là kiểm tra cấu hình khóa, không phải kiểm tra quota hoặc khả năng gọi mô hình.
5. Trên điện thoại (HTTPS): mở Camera AI → chụp/ chọn ảnh → Tạo thử thách → Phản biện nhiều lượt. Trường hợp chưa có Gemini, có thể chọn **Chơi thử** (không gọi AI).

### Cập nhật từ GitHub v2

**Cách an toàn:** GitHub Desktop → Clone repo → Sao chép/ghi đè các tệp từ ZIP v3 vào repo → Commit → Push origin. Không chép vào thư mục con, không xóa `.git`.

Tệp `shared/curriculum.js` của v2 **không còn dùng**: có thể xóa khỏi repository để sạch dự án; nếu chưa xóa thì app v3 không import tệp này nữa.

### Kiểm thử

```bash
npm test
```

Không có server Python, MariaDB, Firebase, n8n hay hệ thống đăng nhập. Các API nằm trong `api/analyze.js`.

## Quyền riêng tư và giới hạn

- Ảnh, hội thoại và tình trạng phiên chỉ lưu ở **RAM của trang trình duyệt** cho đến khi kết thúc, rời trang hoặc hết thời gian không thao tác theo cơ chế của frontend. Trình duyệt có thể giữ tab trong bộ nhớ khi ở nền; không cam kết xóa tức thì khỏi mọi nơi.
- Ảnh được gửi qua Vercel Function đến Gemini để xử lý. Ứng dụng không lưu chủ động vào disk/database, tuy nhiên hạ tầng Vercel/Gemini có chính sách xử lý và lưu giữ dữ liệu riêng. Không chụp khuôn mặt hay giấy tờ cá nhân.
- Không bao giờ ghi khóa Gemini vào mã client hay GitHub. Thiết lập quota/cảnh báo chi phí nếu chia sẻ công khai, vì bản demo không có xác thực/rate-limit theo người dùng.
- AI không thể bảo đảm độ chính xác 100%. Nếu ảnh không rõ, có mặt người hoặc không tạo được câu hỏi có cơ sở, ứng dụng yêu cầu chụp lại, thay vì bịa khoa học.

## Cấu trúc

```
index.html
assets/styles.css
assets/app.js
api/analyze.js
shared/demo.js
tests/smoke.test.mjs
package.json
vercel.json
.env.example
.gitignore
```
