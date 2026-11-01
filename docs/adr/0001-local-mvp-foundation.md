# Local MVP foundation

Ngày 31/10/2026. User đã cho phép bắt đầu source code sau giai đoạn lập kế hoạch. Các câu “không bắt đầu lập trình” trong tài liệu trước là phạm vi lịch sử, không áp dụng cho yêu cầu triển khai hiện tại.

Giữ React/TypeScript/Tailwind/NestJS/SQL Server/Docker. Dùng npm workspaces vì npm hiện sẵn, một lockfile cho FE/BE/contracts. Prisma pin 7.10.1 do SQL Server chưa hỗ trợ ORM8 trong tài liệu đối chiếu. Migration lock provider do engine 7.10.1 yêu cầu `mssql`, còn schema dùng provider `sqlserver`; đã chạy migrate deploy trên SQL Server thật.

Phạm vi là core MVP hoạt động local: 7 draft fixture, auth/favorites/planner/shopping/matching và backlog editor read-only. Không ngầm coi 300 ý tưởng là 300 recipe có lượng đã kiểm chứng. Database v1 sử dụng bảng Recipe với revision cố định, chưa có editor mutation; recipe revision bất biến và workflow publish phải được triển khai trước cho sửa nội dung qua ứng dụng.

Concurrency dùng integer version với atomic compare/update ở MealPlan/ShoppingList thay rowversion để typed CRUD rõ và được kiểm chứng ngay. Shopping generation dùng transaction Serializable và khóa active list unique/plan; nhận lại cùng plan version không tạo duplicate. Có mục đã mua thì chặn regenerate khác version, chờ flow review đầy đủ. Chưa có quantity-purchased một phần, pantry reservation hoặc package rounding.

Session không dùng JWT/localStorage. CSRF signed double-submit với token có thời hạn, kiểm tra origin; rate limit in-memory dành một instance local. Production đăng ký chưa có email nên bị tắt; role quản trị bị chặn đến khi có MFA. Chưa tuyên bố production-ready.

Ảnh dùng URL Unsplash minh họa, không thay ảnh nấu thử. Giọng đọc dùng speechSynthesis có voice tiếng Việt nếu thiết bị cung cấp, gắn nhãn trình duyệt; Azure integration chưa thực hiện.
