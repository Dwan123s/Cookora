# Nhiều món trong một bữa

Thanh bảy ngày hiển thị ngày và số món để chọn nhanh. Bên dưới là ba bữa của ngày đang chọn, với tên món đầy đủ thay vì các ô lịch hẹp. Ngày đã chọn được giữ trong URL `?day=YYYY-MM-DD`, kể cả khi tải lại hoặc chuyển tuần. Nút **Về hôm nay** trở về ngày hiện tại.

Mỗi bữa có nút **Thêm món**. Có thể chọn nhiều món trong một lần, tìm theo tên hoặc lọc canh/súp và rau củ. Mỗi dòng món có bộ chọn số người ăn để lưu trực tiếp, bấm tên để đổi món và nút xóa riêng. Thao tác xóa có **Hoàn tác** cho món vừa xóa. Các món đều hiển thị đầy đủ, không bị cắt tên hoặc giấu sau “món khác”.

Khách tiếp tục dùng khóa lưu trữ `cookora.guest-week-plans.document-v2`, không cần chuyển dữ liệu và không cắt bớt các tuần có trên 100 món. Tài khoản dùng API MealEntry hiện có: thêm từng món với phiên bản thực đơn mới nhất và khóa gửi lại riêng, không thay cả bữa. Nếu một lần thêm nhiều món bị gián đoạn, các món đã lưu được giữ lại và chỉ thử lại các món còn thiếu.

Tạo thực đơn tự động chỉ bổ sung các bữa trống. Đồng bộ Eat Fit thêm món chưa có, không ghi đè món khác trong cùng bữa. Danh sách đi chợ gộp nguyên liệu từ tất cả món theo khẩu phần riêng; danh sách đã tạo được đánh dấu cần cập nhật khi thực đơn thay đổi.

Kiểm tra: `npm test`, `npm run typecheck`, build frontend; kiểm thử localhost với tài khoản tạm bằng `npm exec -w backend -- tsx --test test/multi-dish-planner.integration.ts` (SQL Server local). Kiểm thử này lưu ba món vào một bữa, tải lại, đổi khẩu phần, kiểm tra đi chợ, xóa riêng một món và dọn tài khoản thử.
