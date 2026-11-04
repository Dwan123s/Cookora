# Kiểm tra và sửa ảnh công thức — 04/11/2026

Thực hiện trên SQL Server và web local. Không push GitHub, không deploy.

## Nguyên nhân

- Database có 476 công thức; 54 bản ghi có `image` rỗng: 50 Thái, 2 Hàn, 1 Nhật và 1 Việt. Đây là thiếu dữ liệu ảnh từ tài liệu nguồn, không phải lỗi CSS hoặc ảnh tải chậm.
- Các món Dakgalbi, Jokbal và một số món khác đã có ảnh riêng trong dự án nhưng chưa được gắn vào database.
- Một script tải ảnh Thái cũ đã dùng các ảnh fallback lặp lại, gồm cả ảnh không đúng món. Không dùng lại script đó để sửa dữ liệu.
- 415 tham chiếu ảnh local ban đầu đều tồn tại và giải mã được; 7 ảnh Unsplash bên ngoài đều tải được.

## Cập nhật

- Bổ sung đủ 54 trường ảnh trống: dùng 18 ảnh riêng có sẵn, được ghi rõ là ảnh minh họa tạo bằng AI; thêm 36 ảnh món ăn từ Wikimedia Commons, có tác giả và giấy phép.
- Chuyển các ảnh tải mới sang WebP, không cắt khung, lưu local trong `frontend/public/recipes/repaired/`.
- Thay đường dẫn ảnh fallback của 50 công thức Thái cũ bằng ảnh của đúng món tương ứng. Tổng cộng cập nhật trường ảnh của 104 bản ghi.
- Chỉ cập nhật `Recipe.image` và `Recipe.imageCredit`. Giữ nguyên ID, slug, tên món, revision, thời gian, trạng thái, nguồn tài liệu, 3.323 dòng nguyên liệu và 2.077 bước nấu. So sánh fingerprint trước/sau trong transaction xác nhận bảo toàn nội dung.
- Không sửa dữ liệu trích xuất nguyên bản trong `database/seeds/document-recipes.json`. Bản vá media được lưu riêng tại `database/patches/recipe-image-repairs.json`.
- Trang chi tiết có liên kết nguồn dưới các ảnh Wikimedia; thông tin tác giả, nguồn và giấy phép nằm tại `/recipes/repaired/attribution.html`.

## Kết quả kiểm tra

- Tải đủ 476 công thức qua API thật, không trùng ID, tổng khớp metadata phân trang.
- Kiểm tra HTTP, MIME ảnh và giải mã ảnh cho toàn bộ 476 bản ghi, tương ứng 426 ảnh riêng: **476 đạt, 0 lỗi, 0 trường ảnh trống**.
- Đối chiếu trực tiếp giao diện Khám phá: Dakgalbi ở Hàn Quốc/trang 3 và kết quả tìm Jokbal đều hiển thị đúng ảnh, `naturalWidth > 0`.
- Build frontend (TypeScript + Vite) thành công; còn cảnh báo bundle >500kB như trước. `git diff --check` không có lỗi whitespace.
- Chạy lại công cụ sửa ở chế độ xem trước: 104 bản vá đã áp dụng, 0 thay đổi chờ, xác nhận có thể chạy lặp.

Đây là kiểm tra toàn bộ luồng tải ảnh, không phải kiểm thử thủ công mọi nghiệp vụ của 476 công thức.

## Công cụ và bằng chứng

```powershell
# Kiểm tra toàn bộ ảnh qua API/web local
node scripts/audit-recipe-images.mjs

# Xem trước bản vá database (không ghi)
node scripts/repair-recipe-images.mjs

# Áp dụng lại sau khi nhập lại bộ dữ liệu gốc, có backup và transaction
node scripts/repair-recipe-images.mjs --apply
```

Công cụ sửa giới hạn ở SQL Server local, kiểm tra hash/file ảnh trước khi ghi và từ chối ghi đè nếu giá trị ảnh hiện tại khác với bản gốc hoặc bản đã sửa. Bản sao trường ảnh trước lần cập nhật này: `.review/recipe-images-before-2026-11-03T17-29-21-325Z.json` (thời gian UTC; tương ứng 04/11 tại Việt Nam).

- [Kết quả từng công thức](live-image-audit.json)
- [Ảnh Dakgalbi đã sửa](korea-dakgalbi-fixed.jpg)
- [Ảnh Jokbal đã sửa](korea-jokbal-fixed.jpg)

Các thay đổi backend và giao diện khác đã tồn tại trong workspace được giữ nguyên; không thuộc bản sửa ảnh này.
