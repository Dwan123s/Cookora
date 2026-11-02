# Cookora — Có gì nấu nấy và Thực đơn tuần

## Trang Có gì nấu nấy

URL local: http://127.0.0.1:5173/co-gi-nau-nay

Hai tab Kho nguyên liệu và Trợ lý AI dùng chung khoảng cách, tiêu đề, chiều cao phần đầu và vị trí điều hướng. Ba khối trong từng tab căn cùng mép trên và mép dưới. Trợ lý dùng gấu đầu bếp theo yêu cầu cập nhật của người dùng.

Kho nguyên liệu gọi API nguyên liệu và đối chiếu công thức; điểm phù hợp và số món là dữ liệu trả về thực tế. Có bộ lọc thời gian, nhóm món, độ khó, sắp xếp và xem thêm. Nút lưu món sử dụng luồng yêu thích hiện có. Trợ lý tiếp tục gọi API gợi ý AI; giao diện hiển thị trạng thái đang xử lý và lỗi dịch vụ.

Ảnh ba món canh đậu hũ thịt băm, chả giò Thái và gỏi miến tôm thịt được tạo đúng món, dùng cho ảnh minh họa trên các trang mới. Prompt và đường dẫn nằm trong `docs/recipe-images/manifest.json`.

## Trang Thực đơn tuần

URL local: http://127.0.0.1:5173/thuc-don

Lịch gồm bảy ngày và ba bữa mỗi ngày. Nhấn một ô để đổi món, đổi khẩu phần hoặc bỏ món; điều hướng tuần dùng ngày thực tế theo múi giờ Việt Nam. Bản dùng thử lưu riêng trên thiết bị và lấy món từ danh mục công thức thực tế. Khi đăng nhập, kế hoạch được đọc/ghi bằng API của tài khoản; tự động xếp món chỉ thêm vào những bữa còn trống.

API PATCH cho một món trong thực đơn cập nhật trong transaction, kiểm tra chủ sở hữu và phiên bản để tránh ghi đè thay đổi ở nơi khác. Danh sách đi chợ dùng cơ chế quản lý phiên bản và kiểm tra danh sách đã mua hiện có.

Danh sách nguyên liệu cộng theo khẩu phần gốc từng công thức, gộp g/kg và ml/l riêng, giữ lượng chưa rõ và bỏ nguyên liệu tùy chọn. Bản dùng thử chỉ giữ dấu đã có khi định lượng của nguyên liệu vẫn khớp. Nút xuất tạo CSV UTF-8 với BOM; đã kiểm tra file tải xuống gồm tiêu đề và 32 dòng nguyên liệu.

Giá là dữ liệu minh họa, giao diện ghi số nguyên liệu đã có giá và số còn thiếu. Tổng hiển thị chỉ tính những nguyên liệu có đơn giá và định lượng phù hợp; không thay thế giá thị trường.

## Kiểm tra

- TypeScript frontend/backend và build đều đạt.
- 21 kiểm thử hiện có đạt; đồng bộ mã lỗi kiểm thử AI với hợp đồng API hiện tại và cô lập cấu hình Groq khi kiểm tra Vertex.
- Bốn kiểm tra riêng về tổng hợp, đơn vị, lượng chưa rõ và giá còn thiếu đạt.
- SQL local: thay món giữ nguyên ID, đổi khẩu phần, chặn phiên bản cũ, chặn sửa tài khoản khác, rollback khi không tìm thấy món, tạo danh sách và đánh dấu đã mua đều đạt. Chỉ tài khoản thử và dữ liệu do lần kiểm tra tạo được dọn sau đó.
- Trình duyệt: đổi tuần, chỉnh khẩu phần 2 → 3 → 2 người và cập nhật lượng đậu hũ 900 g → 1,05 kg → 900 g; đánh dấu nguyên liệu; tải CSV; giao diện máy tính và điện thoại.

Minh họa giao diện được tạo bằng image_gen tích hợp; đường dẫn và prompt đầy đủ trong `cookora-ui-image-prompts.json`. Ảnh chụp xác nhận nằm cùng thư mục này.
