# Chuẩn hóa container Cookora — 04/11/2026

Chỉ sửa local. Không push, không deploy. Theo yêu cầu mới nhất, không chạy build/test, không mở trình duyệt đo lại và không chụp before/after.

## Chuẩn dùng chung

Định nghĩa tại `frontend/src/cookora-tokens.css`:

- `--cookora-content-max: 1280px`: chiều rộng tối đa của nội dung, không tính gutter.
- `--cookora-content-gutter: 32px`: desktop từ 1200px trở lên.
- Gutter 24px ở 640–1199px; 16px ở dưới 640px.
- `--cookora-container-max`: 1280px cộng hai gutter; outer box tối đa 1344px trên desktop.
- `width: 100%`, `box-sizing: border-box`, `margin-inline: auto`, `min-width: 0`.

Class `.cookora-content-container` và các wrapper có sẵn dùng cùng một rule. Không thêm wrapper React, không nhân đôi gutter. Footer dùng cùng đường căn lề. Header giữ hệ kích thước riêng và vẫn căn giữa như trước.

## Nguyên nhân và thay đổi theo trang

| Trang | Khai báo cũ gây lệch | Thay đổi |
| --- | --- | --- |
| Trang chủ | 90%, max 1200px; breakpoint đổi sang `calc(100% - 40px)`, `calc(100% - 32px)`; hero thụt thêm 24px | Dùng container chung; bỏ padding ngang phụ của hero; giữ đủ section và carousel |
| Khám phá | 90%/94%, max 1380px; hero padding ngang 88/55/30/10px; nội dung có margin-left −8px | Dùng container chung, bỏ lệch trái và thụt hero; sidebar desktop 240px, gap 24px để giữ bốn card khi đủ rộng; giữ breakpoint ba/hai cột |
| Có gì nấu nấy | Wrapper cũ max 1680px/padding 40px; bản mới ghi đè 87,6%, max 1464px rồi 92% hoặc các `calc()` riêng; hero còn padding 9,1% | Dùng container chung cho cả hai lớp style, bỏ gutter chồng và thụt hero; giữ hai cột cùng responsive hiện tại |
| Thực đơn tuần | Max 1680px, padding 40/25/16px; hero có padding ngang 31/20/6px | Dùng container chung, bỏ phần thụt ngang hero; giữ lịch, sidebar và scroll bảng riêng |
| Eat Fit | Max 1400px, padding 36/24/16px | Dùng token chung; giữ grid và breakpoint của dashboard |
| Công cụ/Ngân sách | Max 1240px, padding 28/16px | Dùng token chung; giữ grid, form và ảnh hiện tại |
| Chi tiết, khẩu phần, dinh dưỡng, yêu thích, đi chợ, biên tập, lộ trình | `.container` có max 1200px trong `styles.css` và max 1320px trong `redesign.css`; padding 48/36/32/25/24/20/16px tùy rule | Gỡ các khai báo ngang cạnh tranh, tái sử dụng cùng container |

Màn hình đăng nhập/đăng ký giữ bố cục hai mảng full-bleed riêng, là ngoại lệ có chủ đích; không ép form hoặc modal vào khung 1280px. Các background và artwork được phép tràn khỏi đường nội dung như thiết kế hiện tại. Ảnh vẫn dùng aspect ratio/object-fit có sẵn, không dùng scale để giả lập chiều rộng.

## File chỉnh sửa

- `frontend/src/cookora-tokens.css`: token và rule container chung, bao gồm footer.
- `frontend/src/styles.css`, `frontend/src/redesign.css`: gỡ kích thước/padding ngang cũ của wrapper chung.
- `frontend/src/home-alignment.css`: gỡ width riêng và padding ngang phụ của hero.
- `frontend/src/discover-reference.css`: chuẩn hóa wrapper/hero, bỏ margin âm, cân lại sidebar; artwork dùng token mới.
- `frontend/src/matcher-reference.css`, `frontend/src/matcher-photo.css`: gỡ width/gutter chồng của Có gì nấu nấy.
- `frontend/src/planner-reference.css`, `frontend/src/eatfit-reference.css`, `frontend/src/tools-reference.css`: gỡ các chuẩn chiều rộng riêng, giữ spacing dọc.

Khai báo trước sửa được lưu trong [container-alignment-before.json](container-alignment-before.json). Không thay đổi API, database, authentication, business logic hay component Header. Chưa có kết quả kiểm thử responsive thực tế cho đợt sửa này vì người dùng yêu cầu tự kiểm tra.
