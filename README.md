# ScienceLens AI — Bắt lỗi robot Mây (v2.0)

**Ứng dụng thi giáo dục Khoa học tự nhiên độc lập, không liên quan ToanX.**

Học sinh chọn KHTN lớp 6/7/8/9, chụp vật thật, AI tạo *một nhận định khoa học cố tình sai*, rồi học sinh phản biện bằng lời giải thích và bằng chứng. Robot Mây phản hồi **từng lượt** và tiếp tục hỏi ngược. Khi lời giải thích có cơ sở, robot thừa nhận lỗi và kết luận đúng mức kiến thức đã chọn.

**Bản v2.0 vẫn giữ kiến trúc siêu nhẹ: HTML + CSS + JavaScript modules + Vercel Function Node.js + Gemini. Không React, không npm build, không database, không tài khoản, không lưu lịch sử.** Thiết kế lại theo phong cách ứng dụng React hiện đại nhưng không có dependency nhằm cập nhật dự án Vercel cũ thuận tiện nhất.

## Cấu trúc

```text
index.html                  Giao diện responsive
assets/styles.css           Design system + mobile CSS
assets/app.js               Camera, state RAM, trò chuyện đa lượt
shared/curriculum.js        3 chủ đề/khối + kiến thức đúng để neo AI
shared/demo.js              12 tình huống mẫu (3 tình huống mỗi lớp)
api/analyze.js              API stateless, hai chế độ challenge/feedback
vercel.json                 API maxDuration và các header bảo mật
package.json                Node ESM (không cần npm install)
.env.example                Tên biến cấu hình mẫu (không chứa khóa)
```

## Nâng cấp từ dự án đã có trên GitHub/Vercel

1. Giải nén ZIP v2.0.
2. Vào repo GitHub **đang kết nối với Vercel**; thay các file trùng tên (`index.html`, `api/analyze.js`, `vercel.json`, `package.json`, `README.md`) và **thêm** hai thư mục `assets/`, `shared/` ở gốc repository. Nếu GitHub không cho ghi đè bằng upload, mở từng file trong GitHub → Edit → dán nội dung mới, hoặc dùng GitHub Desktop để chép đè và Commit/Push.
3. Vercel tự deploy lại khi GitHub có commit mới. Trong Project → Settings → Build and Deployment, để **Framework Preset = Other**, **Root Directory = ./** và **không đặt Build Command/Output Directory** tùy chỉnh. Nếu bản cũ đang dùng Other, giữ nguyên.
4. Vercel → Project → Settings → Environment Variables:
   - `GEMINI_API_KEY` = API key tạo tại https://aistudio.google.com/apikey
   - `GEMINI_MODEL` = `gemini-3.5-flash-lite` (hoặc model hỗ trợ ảnh có quyền sử dụng)
5. Redeploy khi mới thay biến môi trường. Mở `https://<ten-du-an>.vercel.app/api/analyze` để kiểm tra: `configured: true`, `version: 2.0.0`.
6. Mở web trên điện thoại qua HTTPS và thử chế độ `Camera AI`. Các máy không hỗ trợ camera trực tiếp có nút chọn ảnh.

> Nếu tải mã nguồn mới qua GitHub web, **upload các file/thư mục đã giải nén**, không upload nguyên file ZIP.

## Quy tắc kiến thức theo khối (MVP)

| Khối | Chủ đề đã giới hạn |
|---|---|
| 6 | Sự chuyển thể; Lực ma sát; Năng lượng |
| 7 | Phản xạ ánh sáng; Âm thanh; Nam châm |
| 8 | Áp suất chất lỏng; Đòn bẩy; Sự truyền nhiệt |
| 9 | Khúc xạ ánh sáng; Thấu kính; Mạch điện đơn giản |

Mỗi chủ đề có một *knowledge anchor* (kiến thức chính xác) và danh sách nội dung không nên đi sâu. Backend:

1. Chỉ cho AI chọn trong 3 chủ đề của **đúng khối**.
2. Buộc AI tạo một nhận định sai, giải thích đúng và một hoạt động kiểm chứng an toàn.
3. Chạy **một lượt kiểm định AI thứ hai** so sánh claim/truth với knowledge anchor. Nếu không xác minh được, từ chối tạo thử thách thay vì dùng nội dung chưa chắc chắn.
4. Khi phản hồi từng lượt, gửi lại bộ anchor + 10 tin nhắn gần nhất được giữ trong RAM của trình duyệt (không lưu vào server). Nếu câu hỏi vượt nội dung lớp, AI được yêu cầu đưa học sinh trở lại phạm vi bài.

Đây là *guardrail*, **không bảo đảm đúng 100%**. Giáo viên nên kiểm tra lời giải trước khi sử dụng với học sinh thật. Mở rộng kiến thức qua `shared/curriculum.js` cần do giáo viên kiểm duyệt. Mỗi câu sai do AI tạo phải rõ ràng và có đáp án chuẩn.

## Vì sao khác chat Gemini/GPT thông thường?

- **Vật thật làm ngữ cảnh:** lời nhận định sai bắt đầu từ đồ vật chụp ngay trong lớp.
- **Đảo vai:** robot đóng vai người mắc lỗi, học sinh là người dạy lại robot.
- **Phải phản biện:** nói "AI sai" đơn thuần không được tính là sửa lỗi; AI đòi bằng chứng.
- **Tiếp tục đối thoại:** mỗi phản biện được đáp lại, kể cả sau khi học sinh tìm được lời giải.
- **Có kiểm chứng tại chỗ:** gợi ý một thí nghiệm 30–60 giây an toàn.
- **Giới hạn theo khối:** KHTN 6–9 được phân tách bằng danh sách chủ đề và kiến thức neo.

## Không lưu dữ liệu

- Hình ảnh được lấy từ `getUserMedia`, cắt theo khung 4:3 và nén JPEG 1024×768 ngay trên điện thoại.
- Ảnh, câu trả lời, lịch sử hội thoại, sao tích lũy nằm trong **RAM JavaScript** của tab. Không dùng `localStorage`, `sessionStorage`, IndexedDB, cookie, backend file, database hoặc analytics do ứng dụng cài đặt.
- Lúc nhấn `↻` hoặc `Khám phá khác`, khi `pagehide`, hoặc sau 15 phút không thao tác: dừng camera, xóa ảnh hiển thị, hội thoại và state phiên. Đóng tab thường hủy phiên; JavaScript không thể bảo đảm xóa byte trong RAM của hệ điều hành ngay lập tức.
- Khi tạo thử thách, ảnh được gửi đến Vercel Function và Gemini; **khi chat tiếp theo chỉ gửi văn bản**, không gửi ảnh thêm lần nữa.
- App không tự ghi payload vào log, nhưng **Vercel/Google có chính sách xử lý và lưu trữ riêng**, không bảo đảm zero-retention. Chỉ chụp đồ vật không chứa thông tin cá nhân; tránh chụp học sinh, khuôn mặt, giấy tờ. Nếu cần xóa tuyệt đối tại nhà cung cấp, phải dùng dịch vụ có cam kết tương ứng hoặc xử lý on-device.
- Trên camera, khung hình giới hạn `max-height: min(35dvh, 238px)` trên điện thoại. Không lưu ảnh chụp vào album khi dùng nút camera trực tiếp.

## Chế độ demo không có API key

Chọn `Chơi thử`, chọn lớp, chọn một trong 3 tình huống. Có **12 kịch bản**. Kịch bản demo dùng logic từ khóa đơn giản (được ghi rõ là mẫu), **không phải AI thực sự đánh giá độ đúng**. Để kiểm tra AI phân tích đúng ngữ cảnh học sinh, chuyển qua `Camera AI` với khóa Gemini hợp lệ.

## Kiểm tra API

`GET /api/analyze`: trả `{ "configured": true/false, "version": "2.0.0", "database": false }`.

`POST /api/analyze` có hai chế độ:
- `challenge`: `{ mode, grade, topicId: "auto" | id, image: "JPEG base64" }`
- `feedback`: `{ mode, grade, challenge, answer, history: [{ role: "user" | "bot", text }] }`

Mọi request dùng `Cache-Control: no-store`. Không khai báo `NEXT_PUBLIC_GEMINI_API_KEY`: API key phải nằm trong backend.

## Chi phí, quota và triển khai thật

- Không cần trả tiền database hoặc server riêng; chi phí AI tùy gói Gemini, số lần phân tích và số lượt hội thoại.
- Tạo một thử thách ảnh chạy **hai lần Gemini** (tạo + thẩm định); mỗi lượt phản biện gọi Gemini một lần. Điều này ưu tiên độ an toàn nội dung hơn là số lượt gọi thấp nhất.
- API công khai, chưa có rate limit phân tán hay captcha để giữ dự án không database và không login. Nếu chia sẻ đại trà, cần dùng quota riêng, cài hạn mức và bảo vệ đường API qua Vercel Firewall hoặc captcha không lưu hồ sơ. Không để key trong GitHub.
- Vercel Hobby cho dự án cá nhân phi thương mại trong giới hạn chính sách. Bản dự thi chỉ yêu cầu deploy web tĩnh và một Function.

## Kịch bản trình diễn 4 phút

1. **0:00–0:35:** Chiếu ScienceLens AI trên điện thoại: chọn lớp 9, chụp cây bút trong nước.
2. **0:35–1:20:** Mây đưa nhận định sai "Bút thực sự bị gãy". Học sinh bấm "Tớ không đồng ý" rồi nhập lập luận.
3. **1:20–2:20:** Mây phản hồi câu học sinh vừa nêu, yêu cầu bằng chứng. Học sinh rút bút ra và cho biết kết quả.
4. **2:20–3:15:** Mây nhận lỗi và giải thích đúng mức KHTN 9. Tiếp tục hội thoại một lượt để chứng minh không phải chatbot trả một câu cố định.
5. **3:15–4:00:** Chuyển KHTN 8 sang thử thách áp suất hoặc đòn bẩy; cho thấy chủ đề không lẫn lớp, bấm `↻` xóa phiên.

Nên chuẩn bị chế độ `Chơi thử` khi mạng/API không khả dụng, nhưng phải nói rõ đó là nội dung minh họa có sẵn.
