# Điều chỉnh danh mục ngày 04/11/2026

Theo yêu cầu người dùng, đã xóa món **Jumeokbap (Cơm nắm Hàn Quốc)** (`doc-han-036-jumeokbap-com-nam-han-quoc`) khỏi database production. Danh mục còn **418 món**, trong đó **414 món có ảnh**. Món Cơm nấm Nhật Bản (Kinoko Gohan) được giữ; đây là món cơm nấm, không phải cơm nắm.

Đã bổ sung `totalMinutes` cho **74 món** đang thiếu: 23 món khôi phục từ dòng thời gian trong tài liệu Menu món, lấy cận trên nếu có khoảng; 51 món ước tính theo cách làm (50 món Thái và cháo yến mạch). Thời gian của các món đã có số phút được giữ nguyên. Các giá trị bổ sung mang trạng thái `ESTIMATED`, chưa phải kết quả nấu thử; ghi chú nêu thời gian ngâm, ướp, làm nguội và nguyên liệu cần chuẩn bị sẵn khi có.

Nguồn tài liệu gốc vẫn giữ đủ 419 công thức trong `database/seeds/document-recipes.json`. Các điều chỉnh nằm riêng tại `backend/src/catalog-adjustments.json`; `activeDocumentRecipes` áp dụng chúng khi tạo dữ liệu seed hoặc thay danh mục. Vì vậy nạp lại dữ liệu không khôi phục món đã xóa hoặc bỏ mất thời gian bổ sung.

Lệnh quản trị `npm exec -w backend -- tsx scripts/amend-catalog.ts` chỉ xem trước. Thêm `--apply` để áp dụng đúng project/branch production đã cấu hình. Trước khi thay đổi, lệnh ghi và kiểm tra bản sao lưu các hàng bị tác động cùng SHA-256 trong `.review/catalog-backups/`, sau đó thực hiện trong một transaction. Lần áp dụng này không có liên kết thực đơn bị tác động.
