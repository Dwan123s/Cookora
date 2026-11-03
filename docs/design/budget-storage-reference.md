# Cookora — Ngân sách

Cập nhật 03/11/2026: phần Bảo quản thực phẩm và quản lý đồ thừa đã được gỡ theo yêu cầu người dùng. Tài liệu này mô tả công cụ ngân sách còn được giữ lại; các ảnh bảo quản cũ trong thư mục thiết kế chỉ là tài liệu lịch sử.

## Phần đang sử dụng

- `frontend/src/pages/MealCost.tsx`: ngân sách tuần/ngày, số ngày/người/bữa, CTA thực đơn, công thức thật, trạng thái thiếu giá và yêu thích qua API.
- `frontend/src/components/RecipePriceEditor.tsx`: nhập giá nguyên liệu theo lượng mua/gói; phân biệt tiền dùng thực tế và tiền mua tròn gói.
- `frontend/src/meal-cost.ts`: kiểm tra tham số, chuẩn hóa g/kg và ml/l, gộp nguyên liệu trùng, không đoán giá hoặc định lượng thiếu.
- `frontend/src/tool-data.ts`: tải đầy đủ các trang công thức, lưu bảng giá riêng cho khách/từng tài khoản trên thiết bị.
- `frontend/src/tools-reference.css`: layout và các thành phần dùng cho ngân sách; đã xóa CSS riêng của bảo quản.
- `scripts/test-tools.ts`: ba kiểm thử ngân sách, quy đổi giá nguyên liệu và trường hợp thiếu dữ liệu.

## Dữ liệu và giới hạn

Bảng giá do người dùng nhập, chưa có API giá trực tiếp hoặc đồng bộ giữa thiết bị. Món thiếu giá hoặc định lượng vẫn có thể khám phá, nhưng không được gắn nhãn đáp ứng ngân sách. Mua tròn gói và lượng dùng thực tế được tính riêng.

## Gỡ tính năng bảo quản

Đã xóa trang FoodStorage, thành phần FoodStorageTools, module food-storage, route và mục điều hướng, shortcut/thẻ giới thiệu trên trang chủ, mục trong roadmap, CSS và kiểm thử riêng. Các script tạo giao diện cũ cũng được sửa để không tạo lại liên kết tới tính năng đã gỡ. Không xóa dữ liệu giá, kế hoạch tuần hoặc thông tin tài khoản.
