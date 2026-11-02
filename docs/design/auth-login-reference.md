# Cookora — đăng nhập theo ảnh tham chiếu

Trang local: http://127.0.0.1:5173/dang-nhap

Giao diện React gồm phần giới thiệu và ảnh món ăn ở bên trái, form đăng nhập/đăng ký bên phải. Bố cục chuyển thành một cột ở màn hình nhỏ. Toàn bộ chữ, form, nút, biểu tượng và họa tiết lá/nồi được dựng bằng HTML/CSS/SVG; không dùng ảnh chụp giao diện để thay thế thành phần tương tác.

Luồng đăng nhập/đăng ký tiếp tục gọi API hiện có, giữ CSRF và chuyển hướng sau khi đăng nhập. Chức năng ghi nhớ lưu tên tài khoản sau khi đăng nhập thành công; không lưu mật khẩu. Thời hạn session ở máy chủ giữ nguyên. Đăng nhập mạng xã hội và khôi phục mật khẩu hiển thị thông tin về khả năng hiện có, không giả lập một luồng xác thực thành công.

Ảnh nền được tạo bằng công cụ image_gen tích hợp, tham chiếu `frontend/public/images/auth-left-artwork.jpg`, xuất tại `frontend/public/images/auth-kitchen-background.webp`. Lá và nồi trang trí là SVG. Câu lệnh ảnh đã dùng:

> Use case: precise-object-edit. This image is a reference for the photographic background of a real implemented login page. EDIT this exact square scene: remove ALL lettering, logo, green icon boxes, chef/calendar/leaf icons and yellow drawn marks from the upper-left and middle-left wall area. Reconstruct the removed regions as a softly lit smooth ivory kitchen wall, clean empty negative space. Preserve closely the placement, photographic realism, scale and composition of the chicken rice bowl with avocado and egg in the lower RIGHT, the tomatoes and cut avocado on the wooden table at bottom LEFT, the linen napkin, blurred green plant along the top RIGHT, and soft natural daylight. Keep the upper-left 65% of the wall uncluttered and empty for HTML text. Do not add anything else. No text, no UI, no lettering, no logos, no icons, no watermark. Square photographic background.

Kiểm tra: frontend build; giao diện ở kích thước tham chiếu 1024 × 576 và điện thoại 375 × 812; đổi tab đăng ký; hiện/ẩn mật khẩu; thông báo mạng xã hội; API trả lỗi tài khoản không hợp lệ; frontend, API live và SQL readiness trả HTTP 200.
