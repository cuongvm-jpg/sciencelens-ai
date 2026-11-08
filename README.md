# ScienceLens AI — bản Vercel không lưu dữ liệu

Đây là **ứng dụng độc lập** cho môn Khoa học tự nhiên, không tích hợp ToanX, không tài khoản, không MariaDB, không Firebase, không server Python. Chỉ sử dụng HTML + JavaScript + một Vercel Function (Node.js) làm proxy gọi Gemini.

## Cấu trúc

```text
index.html          Giao diện di động, trạng thái giữ ở RAM trình duyệt
api/analyze.js      API GET kiểm tra cấu hình, POST tạo câu hỏi / phản hồi
vercel.json         Cấu hình function, cache-control no-store
package.json        Kích hoạt JavaScript ES Modules
.env.example        Ví dụ 2 biến môi trường (không chứa khóa thật)
```

## Deploy lên Vercel

1. Tạo repo GitHub mới. Upload **các file trong thư mục này ở gốc repo**, gồm cả thư mục `api`.
2. Truy cập https://vercel.com/new, chọn **Import Git Repository** và chọn repo vừa tạo.
3. Framework Preset: **Other**. Root Directory để `./`. Không cần database hay Build Command. Deploy.
4. Vào Vercel → Project → Settings → Environment Variables, tạo:
   - `GEMINI_API_KEY`: khóa API tạo tại https://aistudio.google.com/apikey
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite` (hoặc một model có hỗ trợ ảnh đang được phép dùng trong dự án).
5. **Redeploy** sau khi thêm biến. Mở URL `https://ten-ung-dung.vercel.app` trên điện thoại, chọn `AI phân tích ảnh`.

Có thể thử demo mẫu trước khi có khóa Gemini. Không dùng tên biến `NEXT_PUBLIC_GEMINI_API_KEY` vì sẽ làm lộ khóa phía trình duyệt.

Chạy local (nếu muốn): `npx vercel dev`. Cần Node.js 20+ và Vercel CLI đăng nhập/liên kết dự án. Không chạy bằng cách mở file `index.html` trực tiếp nếu muốn dùng AI thật.

## Dòng đời dữ liệu

- Mở camera trực tiếp qua `getUserMedia` (trên HTTPS), chụp đúng một khung hình bằng canvas → JPEG chất lượng 0.76 ở cạnh tối đa 1200 px → chỉ giữ trong biến JS. Không dùng API chụp ảnh của hệ điều hành, không ghi tệp/lịch sử hoặc localStorage/sessionStorage/IndexedDB. Có nút chọn ảnh đã có để dự phòng: ảnh gốc đó có thể được hệ điều hành lưu từ trước.
- Khi bấm "AI tạo thử thách": browser gửi một yêu cầu JSON đến `/api/analyze`; Function gọi Gemini bằng API key phía server, trả JSON rồi kết thúc. Function không ghi ảnh/đáp án vào file, database hoặc console.
- Khi trả lời: chỉ gửi câu hỏi và câu trả lời bằng văn bản, không gửi lại ảnh lần thứ hai.
- "Kết thúc & xóa phiên": dừng camera, xóa ảnh, câu hỏi, câu trả lời, phản hồi khỏi state và giao diện, hủy yêu cầu đang chờ. Tải lại/đóng trang cũng không giữ lịch sử; tự reset sau 15 phút không hoạt động.
- Không đăng ký service worker, không cài analytics, không tạo cookies hoặc bộ nhớ máy chủ để lưu nội dung.

**Cần phân biệt:** App không lưu dữ liệu một cách chủ động ≠ mọi bản sao của dữ liệu ở Vercel, Google, bộ nhớ trình duyệt hoặc mạng lập tức bị xóa. API request đã gửi đi không thể thu hồi; nhà cung cấp có thể có log theo chính sách. JavaScript không thể ép hệ điều hành xóa sạch RAM tức thì. Chỉ gửi ảnh vật thể và không gửi thông tin cá nhân trẻ em. Nếu cần điều kiện *zero-retention* nghiêm ngặt, phải thỏa thuận và cấu hình riêng với nhà cung cấp hoặc dùng xử lý tại thiết bị.

## Kiểm thử

- Demo mẫu: bút trong nước, nam châm, bóng tối. Chế độ này **không dùng AI**.
- AI thật: chọn ảnh vật thể, bấm phân tích, nhập phần giải thích, nhận phản hồi từ Gemini. Phải có API key và kết nối mạng.
- Xóa: nhấn nút "Kết thúc & xóa phiên"; kiểm tra ảnh và câu trả lời biến mất. F5 không khôi phục phiên.

## Hạn chế và bảo mật cần biết

- Vercel Functions giới hạn request/response 4.5 MB; ứng dụng giảm ảnh tại thiết bị và kiểm tra giới hạn phía server.
- API không có xác thực đăng nhập hay rate limiting phân tán. Vì URL công khai, bất kỳ ai cũng có thể gọi API và tiêu thụ quota Gemini. Với cuộc thi nên dùng project API riêng, đặt **quota/cảnh báo chi phí** và cân nhắc Vercel Firewall/CAPTCHA nếu triển khai đại trà.
- Có thể dùng Hobby Vercel cho mục đích cá nhân phi thương mại; hoạt động thương mại phải chọn gói phù hợp chính sách Vercel.
- Gemini gói miễn phí có thể dùng nội dung để cải thiện sản phẩm; gói trả phí có chính sách khác nhưng vẫn có điều kiện lưu giữ nhất định. Không cung cấp ảnh chứa học sinh hoặc thông tin cá nhân khi chưa đánh giá pháp lý và được phép.
- Nội dung khoa học do AI tạo có thể sai. Giáo viên phải kiểm tra trước khi dùng trong bài học chính thức.

## Kịch bản demo dự thi (4 phút)

0:00–0:30: nói về việc khám phá khoa học từ đồ vật thật.
0:30–1:10: chụp bút trong cốc nước, bấm tạo thử thách AI.
1:10–2:00: học sinh dự đoán và thử nghiệm thực tế.
2:00–2:50: nhập phần giải thích để AI phản hồi.
2:50–3:30: trả lời câu hỏi mở rộng; chứng minh không lưu lịch sử.
3:30–4:00: tổng kết giá trị sư phạm, giới hạn của AI và phương án nhân rộng.

Thông tin nhà cung cấp: https://vercel.com/docs/functions , https://ai.google.dev/gemini-api/docs/models , https://ai.google.dev/gemini-api/terms .
