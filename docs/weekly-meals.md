# Nhiều món trong một bữa

Mỗi ô ngày/bữa trong thực đơn tuần hiển thị tất cả các món đã lưu và luôn có nút **Thêm món**. Người dùng có thể chọn nhiều món trong một lần, tìm theo tên hoặc lọc canh/súp và rau củ. Mỗi món được đổi công thức, đổi khẩu phần hoặc xóa riêng.

Lịch dùng các dòng món nhỏ với ảnh thu nhỏ, tên và khẩu phần. Mỗi ô hiển thị trước ba món; các món còn lại nằm trong phần mở rộng “món khác” để giữ lịch gọn.

Khách tiếp tục dùng khóa lưu trữ `cookora.guest-week-plans.document-v2`, không cần chuyển dữ liệu và không cắt bớt các tuần có trên 100 món. Tài khoản dùng API MealEntry hiện có: thêm từng món với phiên bản thực đơn mới nhất và khóa gửi lại riêng, không thay cả bữa. Nếu một lần thêm nhiều món bị gián đoạn, các món đã lưu được giữ lại và chỉ thử lại các món còn thiếu.

Tạo thực đơn tự động chỉ bổ sung các bữa trống. Đồng bộ Eat Fit thêm món chưa có, không ghi đè món khác trong cùng bữa. Danh sách đi chợ gộp nguyên liệu từ tất cả món theo khẩu phần riêng; danh sách đã tạo được đánh dấu cần cập nhật khi thực đơn thay đổi.

Kiểm tra: `npm test`, `npm run typecheck`, build frontend; kiểm thử localhost với tài khoản tạm bằng `npm exec -w backend -- tsx --test test/multi-dish-planner.integration.ts` (SQL Server local). Kiểm thử này lưu ba món vào một bữa, tải lại, đổi khẩu phần, kiểm tra đi chợ, xóa riêng một món và dọn tài khoản thử.
