# Cookora — Có gì nấu nấy và Thực đơn tuần

## Trang Có gì nấu nấy

URL local: http://127.0.0.1:5173/co-gi-nau-nay

Trang mở trực tiếp luồng Trợ lý AI, gồm hai cột nhập nguyên liệu và gợi ý món. Đã bỏ tab Kho nguyên liệu và khung trợ lý cố định bên cạnh.

Người dùng tự nhập nguyên liệu và yêu cầu, chọn khẩu phần rồi nhấn “Đề xuất món với AI”. Đã bỏ các nút nguyên liệu có sẵn, chức năng chọn/thêm nguyên liệu và prompt điền nhanh; không có nguyên liệu mặc định hoặc yêu cầu gửi khi ô nhập trống. Một yêu cầu AI phân tích đầu vào, ưu tiên chọn món phù hợp trong kho Cookora và đồng thời tạo gợi ý món mới ngoài kho.

Backend lấy các công thức đang được phép hiển thị, nhận diện tên/alias nguyên liệu để truy xuất tối đa 12 ứng viên cho Gemini; khi chưa nhận diện được, gửi tối đa 12 công thức đầu để AI cân nhắc. AI trả ID món trong kho cùng lý do lựa chọn, đồng thời tạo 1–3 món khác. Backend chỉ chấp nhận ID trong tập ứng viên, bỏ ID bịa/lặp và trả nguyên công thức đã lưu; loại tên món ngoài kho trùng tên công thức hiện có. Kết quả hiển thị món trong kho trước, sau đó món mới do AI tạo, có nhãn nguồn riêng. Không có bước bấm thêm để lấy món ngoài kho và không tìm công thức trên Internet. Thay nguyên liệu hoặc khẩu phần sẽ xóa kết quả cũ để hỏi lại AI.

Ảnh ba món canh đậu hũ thịt băm, chả giò Thái và gỏi miến tôm thịt được tạo đúng món, dùng cho ảnh minh họa trên các trang mới. Prompt và đường dẫn nằm trong `docs/recipe-images/manifest.json`.

## Chatbot trợ lý nổi

Nút gấu đầu bếp ở góc phải dưới mở cửa sổ chat, có ô tự nhập yêu cầu, chọn khẩu phần, trạng thái đang trả lời và thử lại khi lỗi. Dùng chung trên các trang (ẩn ở trang đăng nhập); thu gọn hoặc chuyển trang vẫn giữ cuộc trò chuyện trong phiên hiện tại. Enter gửi, Shift + Enter xuống dòng, Escape thu gọn và đưa focus về nút mở. Bố cục co theo màn hình và chiều cao viewport điện thoại.

Chat gọi cùng API gợi ý AI, gửi tối đa bốn lượt trao đổi hoàn tất gần nhất (tối đa 6.000 ký tự mỗi tin lịch sử). Backend chuyển vai hội thoại sang user/model của Gemini và nhận diện nguyên liệu từ cả ngữ cảnh trước đó. Người dùng có thể hỏi tiếp về cách nấu hoặc điều chỉnh món; câu trả lời chỉ giải thích có thể không kèm món mới. Món trong kho được ưu tiên, mở công thức thật; món AI tạo mở cửa sổ chi tiết với nhãn nguồn. Lịch sử chỉ giữ trong bộ nhớ trình duyệt, không lưu sau khi tải lại trang.

Popup chi tiết món AI dùng bố cục hai cột trên máy tính, một cột trên điện thoại; có thẻ thời gian, khẩu phần và độ khó, hai nhóm nguyên liệu kèm lượng và ghi chú, các bước nấu đánh số. Tiêu đề và thanh đóng cố định, nội dung cuộn riêng; cùng thiết kế cho kết quả trang và chatbot.

Mọi món mới do AI tạo dùng tiêu chuẩn hướng dẫn cho người mới: thường 6–10 công đoạn, nêu cách sơ chế và kích thước thái, lượng gia vị từng lần, mức lửa/thời gian khi có nấu, dấu hiệu chuyển bước và mẹo tránh lỗi. Backend kiểm tra tối thiểu 5 bước, tiêu đề có nghĩa và hướng dẫn mỗi bước ít nhất 80 ký tự; đây là kiểm tra độ đầy đủ về cấu trúc, không thay thế biên tập hoặc nấu thử. Nếu có món quá sơ sài, yêu cầu AI bổ sung một lần cho cùng các món; vẫn thiếu thì trả lỗi `AI_RECIPE_INCOMPLETE` thay vì hiển thị như công thức hoàn chỉnh. Áp dụng cho gợi ý mới ở cả trang và chatbot; nội dung đã trả trước đó cần gửi yêu cầu lại để tạo mới.

Kho SQL local đã được đối chiếu qua database và API: 7 công thức hiện có đều được mở rộng thành 7–8 bước chi tiết riêng, không chèn hướng dẫn chung. Nội dung nằm trong `database/seeds/detailed-recipe-steps.json`, dùng cho seed mới và updater `backend/scripts/update-recipe-instructions.ts`. Updater mặc định chỉ xem trước; thêm `--apply` để cập nhật local, có sao lưu, transaction và kiểm tra thay đổi đồng thời; từ chối ghi đè món đã xuất bản hoặc công thức bị chỉnh khác nguồn ban đầu. Các món hiện có đã áp dụng thành công, revision 2; giữ nguyên nguyên liệu, khẩu phần và trạng thái bản thảo.

## Trang Thực đơn tuần

URL local: http://127.0.0.1:5173/thuc-don

Lịch gồm bảy ngày và ba bữa mỗi ngày. Nhấn một ô để đổi món, đổi khẩu phần hoặc bỏ món; điều hướng tuần dùng ngày thực tế theo múi giờ Việt Nam. Bản dùng thử lưu riêng trên thiết bị và lấy món từ danh mục công thức thực tế. Khi đăng nhập, kế hoạch được đọc/ghi bằng API của tài khoản; tự động xếp món chỉ thêm vào những bữa còn trống.

API PATCH cho một món trong thực đơn cập nhật trong transaction, kiểm tra chủ sở hữu và phiên bản để tránh ghi đè thay đổi ở nơi khác. Danh sách đi chợ dùng cơ chế quản lý phiên bản và kiểm tra danh sách đã mua hiện có.

Danh sách nguyên liệu cộng theo khẩu phần gốc từng công thức, gộp g/kg và ml/l riêng, giữ lượng chưa rõ và bỏ nguyên liệu tùy chọn. Bản dùng thử chỉ giữ dấu đã có khi định lượng của nguyên liệu vẫn khớp. Nút xuất tạo CSV UTF-8 với BOM; đã kiểm tra file tải xuống gồm tiêu đề và 32 dòng nguyên liệu.

Giá là dữ liệu minh họa, giao diện ghi số nguyên liệu đã có giá và số còn thiếu. Tổng hiển thị chỉ tính những nguyên liệu có đơn giá và định lượng phù hợp; không thay thế giá thị trường.

## Kiểm tra

- TypeScript frontend/backend và build đều đạt.
- 21 kiểm thử hiện có đạt; đồng bộ mã lỗi kiểm thử AI với hợp đồng API hiện tại và kiểm tra cấu hình Vertex AI.
- Bốn kiểm tra riêng về tổng hợp, đơn vị, lượng chưa rõ và giá còn thiếu đạt.
- SQL local: thay món giữ nguyên ID, đổi khẩu phần, chặn phiên bản cũ, chặn sửa tài khoản khác, rollback khi không tìm thấy món, tạo danh sách và đánh dấu đã mua đều đạt. Chỉ tài khoản thử và dữ liệu do lần kiểm tra tạo được dọn sau đó.
- Trình duyệt: đổi tuần, chỉnh khẩu phần 2 → 3 → 2 người và cập nhật lượng đậu hũ 900 g → 1,05 kg → 900 g; đánh dấu nguyên liệu; tải CSV; giao diện máy tính và điện thoại.

Minh họa giao diện được tạo bằng image_gen tích hợp; đường dẫn và prompt đầy đủ trong `cookora-ui-image-prompts.json`. Ảnh chụp xác nhận nằm cùng thư mục này.
