# Tiếng Việt có dấu trong câu trả lời AI

Luồng trợ lý công thức, lập thực đơn theo ngân sách và ước tính chi phí tuần yêu cầu nội dung tiếng Việt có đầy đủ dấu, kể cả khi yêu cầu hoặc lịch sử nhập không dấu.

Trước khi trả kết quả, backend kiểm tra các trường văn bản do AI tạo. Các cụm tiếng Việt rõ ràng bị thiếu dấu hoặc câu không dấu được gửi lại mô hình để khôi phục dấu một lần. Chỉ những chuỗi cần sửa được gửi; không yêu cầu tạo lại thực đơn. Kết quả sửa phải giữ nguyên chữ cái gốc, chữ hoa/thường, số, khoảng trắng và dấu câu sau khi bỏ dấu. ID, cấu trúc JSON, giá tiền, khẩu phần và nội dung gốc của người dùng không bị thay đổi.

Câu đã có dấu không gọi thêm mô hình. Nếu sửa không đạt, backend trả lỗi tiếng Việt, không hiển thị câu trả lời lỗi hoặc lặp vô hạn. Đây là kiểm tra theo dấu hiệu ngôn ngữ, không phải trình kiểm tra chính tả toàn diện; các nội dung lịch sử đã lưu không tự viết lại.
