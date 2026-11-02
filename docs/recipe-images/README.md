# Ảnh món ăn Cookora

Danh mục gồm 431 món, đối chiếu từ `Cookora_Thong_Ke_431_Mon_6_File.docx` và sáu file `Menu món (1–6).docx` người dùng cung cấp. Tài liệu nguồn được dùng làm dữ liệu món ăn; yêu cầu thực hiện là tạo ảnh và sắp xếp theo nhóm/quốc gia.

| Menu | Nhóm | Thư mục ảnh trong dự án | Số món |
| --- | --- | --- | ---: |
| 1 | Eat Fit | `frontend/public/recipes/eat-fit/` | 50 |
| 2 | Hàn Quốc | `frontend/public/recipes/korea/` | 50 |
| 3 | Thái Lan | `frontend/public/recipes/thai/` | 50 |
| 4 | Trung Quốc | `frontend/public/recipes/china/` | 63 |
| 5 | Việt Nam | `frontend/public/recipes/vietnam/` | 169 |
| 6 | Nhật Bản | `frontend/public/recipes/japan/` | 49 |

Ảnh được tạo riêng bằng công cụ `image_gen` tích hợp, xuất JPEG 1200 × 900 px. Tên file giữ mẫu `STT_ten_mon.jpg` trong danh mục, bao gồm các khoảng số bị thiếu ở nguồn. Eat Fit là nhóm thực đơn riêng, không được tự gán thành một quốc gia.

`manifest.json` lưu tên món, nhóm, số thứ tự, nguyên liệu, nội dung công thức đối chiếu và trạng thái. Ảnh đã lưu có `status: generated`, `image` và `prompt` chứa chính xác câu lệnh đã dùng. Món chưa tạo có `status: pending` và `image: null`. `progress.csv` là bảng theo dõi có thể mở bằng Excel, được cập nhật sau mỗi ảnh.

Prompt chung: ảnh thực phẩm chân thực, thành phẩm đúng tên món và công thức, ánh sáng tự nhiên, bát/đĩa phù hợp, mặt bàn sáng đơn giản, góc ba phần tư, khung ngang 4:3, không chữ/logo/watermark/ảnh ghép. Tên món, nguyên liệu và công thức được đưa riêng vào từng lượt tạo.

Ảnh cũ trong dự án được giữ nguyên. Các ảnh mới có số thứ tự được lưu độc lập; chương trình lưu từ chối ghi đè ảnh có sẵn. Chưa đánh dấu ảnh cũ là ảnh hoàn thành trong danh mục mới.
