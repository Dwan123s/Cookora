# Danh mục công thức từ CSDL — 03/11/2026

## Nguyên nhân lúc 1, lúc 50 món Thái

Trang Discover dùng hai nguồn: SQL có 7 món (1 món Thái), còn danh sách tĩnh có 50 món Thái. Khi đang tải, rỗng hoặc lỗi API, giao diện chuyển sang danh sách tĩnh. Request `pageSize=100` cũng vượt giới hạn 50 của API Docker cũ. Bộ lọc memo thiếu dependency dữ liệu API nên không cập nhật ngay khi tải xong.

Discover hiện chỉ dùng API/SQL, có trạng thái tải/lỗi riêng, cập nhật bộ lọc khi dữ liệu thay đổi và tải đủ các trang với pageSize 50. API sắp theo createdAt rồi ID để giữ thứ tự phân trang ổn định. Các công cụ dùng chung cũng tải đủ danh mục.

## Nguồn dữ liệu

- 7 công thức ban đầu được giữ nguyên ID, nguyên liệu, hướng dẫn và revision.
- `database/seeds/thai-recipes.json`: 50 món từ bộ dữ liệu Thái của dự án, đủ nguyên liệu, bước và ảnh local. Tổng Thái là 51 vì giữ món Gai Yang phiên bản ban đầu riêng.
- `database/seeds/user-menu-recipes.json`: 50 món trong Menu món.docx do người dùng chọn làm danh sách chuẩn. Lưu sourceNumber và SHA-256 tài liệu; hướng dẫn theo nguyên văn, bỏ ký hiệu bullet trình bày. Không thêm món hoặc định lượng ngoài tài liệu. Có 106 dòng chưa có lượng và một món chưa ghi thời gian; dữ liệu tương ứng là null. Nguồn chưa ghi khẩu phần: tạm tính 1 phần và ghi rõ giả định trong preconditions. Chỉ 6 món có ảnh minh họa sẵn; các món còn lại hiển thị chỗ giữ ảnh.

Tổng local sau nhập: 107 công thức. Nội dung mới là DRAFT, thời gian ESTIMATED; không tự xét duyệt hoặc coi là công thức đã nấu thử.

## Nhập và kiểm tra

`npm run db:seed` nạp cả ba bộ, giữ nguyên món đã có theo slug. Hai lệnh riêng dưới đây mặc định chỉ xem trước; thêm `--apply` để nhập local. Trước khi nhập, lệnh lưu bản sao công thức trong `.review/*-import-before-*.json`; transaction không ghi đè nội dung đã có. Sau nhập kiểm tra lại nguồn và dữ liệu cũ.

```powershell
npm exec -w backend -- tsx scripts/import-thai-catalog.ts
npm exec -w backend -- tsx scripts/import-user-menu.ts
```

Kiểm thử bao gồm tải danh sách 107 món qua ba trang, lỗi/rỗng API không thay bằng dữ liệu tĩnh, bảo toàn giá trị chưa rõ, nhập lặp không trùng, giữ dữ liệu cũ, đổi đơn vị Decimal và đối chiếu hướng dẫn của 50 món từ tài liệu.
