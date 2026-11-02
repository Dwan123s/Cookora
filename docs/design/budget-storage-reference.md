# Cookora — Ngân sách & Bảo quản

## Thay đổi

Hai trang được sửa trực tiếp trong dự án, dùng React/CSS thật, Be Vietnam Pro và màu Sage Green / Warm Cream. Header, routing và đăng nhập được giữ lại. Không sử dụng ảnh thiết kế làm nền.

- `frontend/src/pages/MealCost.tsx`: ngân sách tuần/ngày, slider và số tiền định dạng VNĐ, số ngày/người/bữa, kết quả tính thực, CTA thực đơn, bốn thẻ công thức thật, trạng thái thiếu giá, lọc món đủ giá, yêu thích qua API hiện có.
- `frontend/src/components/RecipePriceEditor.tsx`: nhập/cập nhật giá nguyên liệu theo lượng mua hoặc gói; phân biệt chi phí sử dụng và tiền mua tròn gói. Bỏ trống để xóa giá đã nhập.
- `frontend/src/meal-cost.ts`: kiểm tra tham số, quy đổi g/kg và ml/l, gộp nguyên liệu trùng, không quy đổi khối lượng sang thể tích, không đoán giá hoặc định lượng thiếu.
- `frontend/src/pages/FoodStorage.tsx`: hero tủ lạnh, tìm kiếm không dấu, bộ lọc nhóm, ngăn mát/đông, thẻ ảnh, hướng dẫn chi tiết và nguồn.
- `frontend/src/components/FoodStorageTools.tsx`: form thời điểm/điều kiện, thêm/sửa/xóa, trạng thái tham khảo, đối chiếu nguyên liệu chín qua API công thức.
- `frontend/src/food-storage.ts`: dữ liệu hướng dẫn có nguồn, kiểm tra thời gian/điều kiện, mốc riêng cho cơm, cập nhật trạng thái theo thời gian.
- `frontend/src/tool-data.ts`: tải toàn bộ trang công thức thật; lưu giá và đồ thừa trên thiết bị, dùng khóa riêng cho khách/từng tài khoản.
- `frontend/src/tools-reference.css`: layout desktop/tablet/mobile, modal, tương tác và reduced motion.
- `frontend/src/pages/Planner.tsx`: nhận ngân sách và khẩu phần qua URL; dùng cho ngân sách và món mới, không đổi các bữa đã lưu.
- `frontend/src/App.tsx`: tiêu đề hai trang.
- `scripts/test-tools.ts`: 6 kiểm thử tính giá, ngân sách và trạng thái bảo quản.
- `frontend/public/images/{budget-hero,storage-hero,storage-chicken,storage-fish,storage-greens,storage-rice}.webp`: 6 asset mới từ built-in image_gen, có ảnh riêng cho từng thực phẩm. Prompt và đường dẫn nguồn trong `utility-image-prompts.json`.

## Dữ liệu và giới hạn thực tế

API hiện có 57 công thức, chưa có API giá hoặc bảng lưu đồ thừa. Không giữ bảng giá gán sẵn từ phiên bản cũ. Món thiếu giá/định lượng vẫn có thể khám phá, nhưng không được gắn nhãn đáp ứng ngân sách. Giá mới là giá do người dùng nhập, không phải báo giá trực tiếp. Không có dữ liệu đồ thừa điền sẵn. Dữ liệu lưu cục bộ theo khóa tài khoản, chưa đồng bộ giữa thiết bị.

Gợi ý đồ thừa hiện đối chiếu các nguyên liệu cơm chín/cơm nguội trong catalog. Không thay nguyên liệu sống bằng món đã nấu. Nhóm khác thiếu nguyên liệu chín tương ứng hiển thị giải thích. Đồ bảo quản sai, thiếu thông tin, quá mốc nhắc dùng, cơm đã hâm hoặc món đang đông chưa được xử lý phù hợp không được đưa vào gợi ý. Không dùng thời gian/mùi/vẻ ngoài để tự xác nhận an toàn.

Mốc 3 ngày cho thịt/gia cầm/canh là mốc nhắc dùng thận trọng trong khoảng 3–4 ngày tham khảo; cơm dùng mốc riêng 24 giờ. Thời gian tính từ lúc nấu, không đặt lại từ lúc sửa ngày lưu. Giờ nhập/hiển thị dùng Việt Nam (GMT+7). Chỉ áp dụng khi dữ liệu điều kiện người dùng ghi nhận phù hợp; đây không phải đánh giá an toàn độc lập.

## Nguồn đã đối chiếu

- [FoodSafety.gov — Cold Food Storage Chart](https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts)
- [FDA — Are You Storing Food Safely?](https://www.fda.gov/consumers/consumer-updates/are-you-storing-food-safely)
- [USDA — What methods of reheating food are safe?](https://ask.fsis.usda.gov/article/What-methods-of-reheating-food-are-safe)
- [FSA — Home food fact checker, Rice](https://www.gov.uk/government/publications/home-food-fact-checker/home-food-fact-checker)
- [Utah State University Extension — Spinach](https://extension.usu.edu/nutrition/research/spinach)

## Kiểm tra

- Root typecheck và frontend production build đạt. Vite vẫn có cảnh báo kích thước bundle hiện có; build không lỗi.
- 21 backend tests + 13 utility/Eat Fit/weekly-plan tests đạt, gồm 6 test mới cho hai trang.
- Trình duyệt: ngân sách tuần 300.000/7 ngày/2 bữa/1 người = 21.429 đ/bữa; ngân sách ngày 50.000 × 3 ngày/2 người/2 bữa = 12.500 đ/bữa. Kiểm tra ngân sách 0, thấp và đủ giá.
- Nhập đủ 7 giá kiểm thử cho công thức trứng, kiểm tra tiền dùng thực tế khác mua tròn gói, lọc đủ giá và lưu sau reload. Đã xóa các giá kiểm thử qua UI, trở lại trạng thái chưa có giá.
- Tìm `CA TUOI` không dấu/hoa; chuyển ngăn đông; lọc rau; mở hướng dẫn. Thêm/sửa món cơm kiểm thử với giờ nấu/lưu riêng, reload vẫn còn, API trả công thức cơm thật; điều kiện sai chuyển cảnh báo. Đã xóa bản ghi kiểm thử qua UI.
- Desktop 1536×1024, tablet 768×1024, mobile 390×844; không tràn ngang. Form ngày giờ mở rộng trên mobile cũng không tràn. Không ghi nhận lỗi console ở trang bảo quản.
- Ảnh QA: `budget-desktop.jpg`, `budget-mobile.jpg`, `storage-desktop.jpg`, `storage-mobile.jpg`.
