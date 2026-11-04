# AI gợi ý món theo ngân sách — 04/11/2026

Người dùng xác định luồng chính: thiết lập số tiền và khẩu phần, rồi AI dựa trên ngân sách đó để gợi ý món ăn. Trang `/ngan-sach` đã đưa nút **Gợi ý món theo ngân sách** vào ngay khung thiết lập tiền, số người, số ngày và số bữa/ngày. Nút dùng trực tiếp cùng form với sở thích/nơi mua tùy chọn và cùng API `POST /api/v1/ai/suggest-budget`.

Khung tóm tắt giải thích tổng ngân sách AI sẽ dùng. CTA trước đây chuyển sang lịch tuần đã được thay bằng hướng dẫn nhận gợi ý AI, tránh hiểu nhầm phải tự lập thực đơn sau khi nhập tiền. Sở thích/nơi mua được thu gọn và không bắt buộc. Khi AI trả kết quả, trang cuộn tới phần món gợi ý; thay đổi đầu vào vẫn đánh dấu kết quả cũ và yêu cầu bấm gợi ý lại.

Backend gửi rõ ba mức tiền cho mô hình: tổng ngân sách, tiền mỗi bữa cho cả nhóm, tiền mỗi bữa mỗi người. Ví dụ 100.000đ/ngày, 2 ngày, 2 người, 2 bữa/ngày tương ứng 200.000đ tổng, 50.000đ/bữa cho nhóm, 25.000đ/bữa/người. Chỉ dẫn yêu cầu chọn món và nguyên liệu dựa vào các mức tiền này, không gán giá thấp giả tạo cho món đắt. Nếu thực tế không phù hợp ngân sách, trả chi phí ước tính và báo vượt.

Backend vẫn kiểm tra ID món thuộc catalog, đủ mọi ô ngày/bữa và tự cộng lại chi phí. Giá là ước tính của AI, chưa phải báo giá chợ. Phạm vi lần này không thêm lưu lịch sử, đồng bộ thực đơn vào tài khoản hoặc dùng bảng giá tự nhập cho AI.

Kiểm tra unit/HTTP: 91 đạt, 0 lỗi, bao gồm mức tiền của nhóm/người được gửi tới mô hình; typecheck đạt. Bằng chứng và build: `.review/budget-workflow-check.log`.

Deployment `dpl_7Vs2ZprzDfe9deJXA9P5uNyiQ2RL` READY trên https://cookora-rose.vercel.app/ngan-sach. Build hoàn tất trong 6.21 giây. Đã đối chiếu asset public khớp build local và bảy route ứng dụng hoạt động.

Kiểm tra AI thật qua HTTPS public với 100.000đ/ngày × 2 ngày, 2 người, 2 bữa/ngày: HTTP 201, đủ 4 bữa, tổng chi phí AI ước tính 183.000đ trên ngân sách 200.000đ, còn 17.000đ. Backend trả đúng input, tổng tiền và ID món đã đối chiếu API catalog thật; có danh sách nguyên liệu. Request kiểm tra mất 37.951ms. Đây là kết quả một lần sinh, các lần gợi ý khác có thể chọn món/ước tính khác. Không khẳng định mọi ngân sách đều có thực đơn vừa tiền.

Log `.review/budget-workflow-public-ai.log`, `.review/budget-workflow-public-assets.log`, `.review/budget-workflow-deploy.log`. Lần chạy này không kiểm tra UI trực quan vì local browser use đang tắt trong Work settings. Không thêm hoặc sửa dữ liệu tài khoản khi kiểm tra AI.
