# ScienceLens AI v3.3 — Camera điện thoại có nút chụp

Ứng dụng độc lập trên Vercel; không tài khoản, không database, không lưu lịch sử trên server ứng dụng. Giữ nguyên chức năng AI nhận ảnh bất kỳ, tạo nhận định khoa học sai để phản biện nhiều lượt.

## Sửa lỗi camera toàn màn hình

**Trên iPhone/Android:** nút **Chụp ảnh** mở giao diện camera **gốc của hệ điều hành** bằng HTML Media Capture: `<input type="file" accept="image/*" capture="environment">`. Camera native có nút chụp và bước xác nhận (ví dụ “Use Photo” / “Dùng ảnh”). Sau khi người dùng **xác nhận ảnh**, hệ điều hành tự đóng giao diện camera và trả ảnh về ứng dụng. ScienceLens hiển thị ảnh xem trước trong khung 16:9 và bật nút **Tạo thử thách từ ảnh**. Nút **Chụp lại** sử dụng cùng luồng. Khi hủy chụp lại, ảnh cũ được giữ nguyên.

**Tại sao không chèn thêm một nút HTML trên toàn màn hình?** Trên một số trình duyệt iOS hoặc WebView, camera dùng `getUserMedia()` có thể bị mở như trình phát video native toàn màn hình. Trang HTML **không thể vẽ nút chụp phía trên trình phát này**. Vì vậy bản v3.3 **không mở video stream trên điện thoại**, mà giao cho hệ điều hành thực hiện toàn bộ thao tác chụp.

**Trên laptop/desktop:** nút **Mở camera** vẫn dùng preview video 16:9 trong trang cùng nút chụp; **Chọn ảnh** cho phép tải ảnh từ máy. Nếu trình duyệt mobile không hỗ trợ `capture`, nó có thể mở bộ chọn ảnh thông thường thay vì camera; trong trường hợp đó hãy chọn “Chụp ảnh/Take Photo” nếu có hoặc chọn ảnh có sẵn. Không thể bảo đảm giống nhau với mọi trình duyệt/hệ điều hành.

## Hướng dẫn cập nhật lên Vercel

1. Giải nén ZIP và **sao chép toàn bộ các file bên trong** vào thư mục GitHub repository `sciencelens-ai` đã kết nối Vercel, chọn **Replace** khi Windows hỏi ghi đè. Không đưa cả thư mục ZIP vào một thư mục con của repository; không xóa `.git`.
2. GitHub Desktop → **Commit to main** → **Push origin**. Vercel sẽ tự deploy nếu Git integration đang hoạt động.
3. Không cần nhập lại `GEMINI_API_KEY` hay `GEMINI_MODEL`.
4. Kiểm tra `https://<du-an>.vercel.app/api/analyze`: nếu đúng phiên bản mới trả về `"version":"3.3.0"`.
5. Dùng tab mới trên điện thoại hoặc tải lại bỏ cache. **Camera AI → Chụp ảnh → chụp bằng nút ở đáy camera hệ điều hành → xác nhận/Dùng ảnh → trở về ScienceLens → Tạo thử thách từ ảnh**.

## Kiểm thử

```bash
npm test
```

Đã kiểm tra cú pháp JavaScript, API giả lập và luồng chọn tệp/native capture trên Chromium mô phỏng các độ rộng 360, 390, 768 px; desktop camera nội tuyến ở 1440 px. **Chưa chạy camera vật lý trên iPhone/Android**, vì giao diện camera gốc do hệ điều hành điều khiển, không thể mô phỏng đầy đủ bằng browser headless.

## Dữ liệu và quyền riêng tư

- Ảnh chỉ ở bộ nhớ trình duyệt trước khi học sinh bấm **Tạo thử thách từ ảnh**. Sau đó ảnh được gửi đến Gemini qua Vercel Function để AI phân tích. Không lưu database hoặc file ảnh trên ứng dụng.
- Nút kết thúc phiên/xóa phiên xóa trạng thái tạm trên web, **không thể xóa dữ liệu do nhà cung cấp API hoặc hệ điều hành lưu**. Tùy điện thoại, ứng dụng camera hệ điều hành **có thể lưu một bản ảnh vào thư viện**. Không chụp người hay thông tin riêng tư.
- Gemini API key nằm trong biến môi trường Vercel, không đi vào client. Nên thiết lập quota để tránh lạm dụng API khi app công khai.

## Cấu trúc

```
index.html
assets/app.js
assets/styles.css
api/analyze.js
shared/demo.js
tests/smoke.test.mjs
tests/native-camera.test.mjs
package.json
vercel.json
.env.example
.gitignore
```
