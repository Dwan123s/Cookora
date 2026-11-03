# Cấu hình đăng nhập Google

Cookora dùng Google OAuth 2.0 Web application, lấy email và hồ sơ cơ bản rồi tạo phiên đăng nhập riêng bằng cookie HttpOnly. Đây là thông tin OAuth riêng, không dùng Vertex AI API key.

## 1. Tạo OAuth client

1. Mở [Google Cloud Console](https://console.cloud.google.com/auth/overview), chọn hoặc tạo project của bạn.
2. Trong Google Auth Platform, cấu hình **Branding**: tên ứng dụng Cookora, email hỗ trợ và email liên hệ.
3. Trong **Audience**, chọn External nếu dùng Gmail cá nhân. Khi ứng dụng còn Testing, thêm email bạn dùng vào Test users.
4. Trong **Clients**, chọn Create client → **Web application**, đặt tên Cookora Local.
5. Thêm Authorized redirect URIs đúng môi trường bạn chạy:
   - `npm run dev`: `http://localhost:5173/api/v1/auth/google/callback`
   - Docker frontend: `http://localhost:8080/api/v1/auth/google/callback`
6. Lưu và sao chép Client ID cùng Client Secret vào `.env` local. Không gửi Client Secret vào chat, commit Git hoặc đặt trong biến `VITE_*`.

Luồng này chuyển trang qua backend, không cần JavaScript origin để nạp Google SDK. Chỉ yêu cầu `openid email profile`; không xin quyền Drive, Gmail hoặc quyền API khác.

## 2. Điền cấu hình trên máy

Các biến sau đã được thêm vào `.env.example`; điền giá trị thật trong `.env`:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

Để `GOOGLE_REDIRECT_URI` trống sẽ dùng `APP_ORIGIN` + `/api/v1/auth/google/callback`. Khi chạy Vite, đặt `APP_ORIGIN=http://localhost:5173`; khi chạy Docker, Compose dùng `http://localhost:8080`. Mở đúng địa chỉ localhost tương ứng, không đổi qua 127.0.0.1 giữa luồng. Nếu cấu hình URI tường minh, URI đó phải cùng origin với ứng dụng và khớp tuyệt đối URI đã đăng ký với Google.

## 3. Cập nhật database và chạy

```powershell
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Với Docker:

```powershell
docker compose -f compose.yaml -f compose.app.yaml up -d --build
```

Migration thêm bảng GoogleIdentity và cho phép tài khoản chỉ dùng Google không có mật khẩu. Giữ nguyên tài khoản, công thức, thực đơn và phiên hiện có. Không tạo database mới hoặc xóa volume.

Mở `/dang-nhap` → Tiếp tục với Google → chọn tài khoản → trở về trang bạn định mở, mặc định `/thuc-don`. Nút Google chỉ bật khi backend có đủ cấu hình; email/mật khẩu vẫn dùng được khi chưa có OAuth client.

## Hành vi tài khoản và kiểm tra lỗi

- Tài khoản Google được nhận diện bằng `sub` đã xác minh chữ ký, audience, issuer, expiry và nonce; state cookie ký có hạn 10 phút, kèm PKCE. Token của Google không được lưu trong localStorage hoặc gửi vào URL của frontend.
- Lần đầu đăng nhập sẽ tạo tài khoản USER. Với email Gmail/Workspace được Google quản lý, có thể nối với tài khoản Cookora cùng email để giữ thực đơn/yêu thích. Email bên thứ ba trùng tài khoản hiện có phải dùng mật khẩu cũ, không tự nối tài khoản.
- Tài khoản đã nối tiếp tục được nhận diện bằng Google subject khi email Google thay đổi. Không tự thay email Cookora hoặc gộp các tài khoản khác.
- Tài khoản EDITOR/ADMIN vẫn bị chặn ở production cho tới khi hệ thống có MFA. Đăng ký bằng mật khẩu ở production giữ nguyên gate hiện có; đăng ký Google dùng email được Google xác minh.
- `redirect_uri_mismatch`: kiểm tra URI Google Console, APP_ORIGIN và GOOGLE_REDIRECT_URI.
- `access_denied` khi Testing: thêm email vào Test users; nếu người dùng bấm Hủy thì chỉ cần thử lại.
- Phiên hết hạn: bắt đầu lại bằng nút Google; không mở lại URL callback cũ.

Khi đưa lên domain thật, tạo/cập nhật OAuth client với URI HTTPS của domain đó, đặt APP_ORIGIN đúng domain và lưu secret trên server. Cấu hình Docker hiện tại dành cho local development.

## Kiểm tra kỹ thuật

`npm run check` kiểm tra TypeScript, unit/HTTP tests và build. Với SQL local đã migrate, chạy `npm exec -w backend -- tsx --test test/google-auth.integration.ts` để kiểm tra lưu Google identity, nối tài khoản đúng chủ sở hữu và phiên đăng nhập thật. Các hàng test được rollback trong transaction, không để lại tài khoản test. Việc chọn tài khoản và đồng ý trên Google cần kiểm tra thủ công sau khi đã điền OAuth client thật.

Tham khảo: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [xác minh ID token và quyền sở hữu email](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).
