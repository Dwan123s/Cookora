# Ảnh minh họa 50 món Thái

Ngày bổ sung: 04/11/2026. Nguồn là file PowerPoint “50 ảnh minh họa món Thái Lan.pptx” do người dùng cung cấp, 50 slide và 50 ảnh. Tên món tiếng Thái/phiên âm cùng mô tả tiếng Việt trên từng slide khớp đúng 50 công thức `doc-thai-001` đến `doc-thai-050` trong danh mục.

Ảnh gốc được trích từ media nhúng trong PowerPoint, giữ tỉ lệ và tối ưu WebP cạnh tối đa 1200 px. Không dùng ảnh chụp toàn bộ slide. Các nguồn ảnh trên slide được giữ trong `imageCredit`; đây là ảnh minh họa, không thay đổi trạng thái biên tập/nấu thử của công thức.

Danh mục `database/seeds/document-recipes.json` giữ 419 công thức, nay có 415 món có ảnh và 4 món còn thiếu ảnh. Metadata `imageSupplements` ghi tên và SHA256 file nguồn; từng ảnh có slide, media gốc, SHA256 ảnh gốc và SHA256 WebP. `embeddedImageCount` của tài liệu Word gốc giữ nguyên, không tính nhầm ảnh bổ sung thành ảnh có sẵn trong Word.

Chạy `backend/scripts/apply-document-images.ts` bằng tsx từ backend với cấu hình database phù hợp để áp dụng vào database đã có. Script chỉ cập nhật `image` và `imageCredit`, lưu bản sao các giá trị cũ trong `.review/thai-images/` trước khi ghi, kiểm tra khớp tên/slug/ẩm thực và từ chối đè ảnh khác đã có. Chạy lại giữ nguyên ảnh đã áp dụng. Không chạy lệnh thay thế danh mục hoặc xóa/reseed database để cập nhật ảnh.

Khi đưa lên môi trường khác, triển khai cả ảnh trong `frontend/public/recipes/documents/` và áp dụng script cho database của môi trường đó. Seed mới sẽ dùng ảnh mới từ manifest; seed idempotent không tự ghi đè công thức đã tồn tại.
