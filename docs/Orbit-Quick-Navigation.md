# Tiện ích trên đường ray elip 3D

Dải bảy tiện ích trang chủ dùng phối cảnh giống một kệ trưng bày xoay: các thẻ đứng trên đường ray kính elip thấp, nghiêng theo vị trí, lớn hơn khi đến gần và thu nhỏ khi quay ra phía sau. Thẻ phía trước tâm có ánh sáng xanh; giữ nguyên các liên kết tính năng.

- Quỹ đạo dành phần lớn thời gian cho cung phía trước để người dùng đọc được nhãn. Cung quay về nằm lùi phía sau, giảm độ nổi và độ sáng. Chuyển động tự chạy một vòng khoảng 60 giây.
- Nút trái/phải xoay từng tiện ích đến giữa. Focus bàn phím đưa tiện ích được chọn ra trước và dừng tự xoay. Dừng khi rê chuột vào vùng thẻ, bấm Tạm dừng, ra ngoài viewport hoặc chuyển tab.
- Mobile giữ elip ngang và cắt phần thẻ ở hai mép, thay vì dựng elip cao. Dùng nút xoay để tiếp cận đủ bảy tiện ích. Nút điều khiển có vùng bấm 44px.
- Cài đặt giảm chuyển động giữ dải ở trạng thái tĩnh; nút trái/phải và focus chuyển trực tiếp đến vị trí mới. Bản in dùng lưới liên kết.
- ResizeObserver cập nhật quỹ đạo. requestAnimationFrame chỉ cập nhật transform, opacity và độ sáng, không render React mỗi frame.

Đã kiểm tra hình học qua 720 vị trí trên 7 kích thước: giá trị hữu hạn, vòng lặp liên tục, vị trí theo chiều dọc không vượt khung. Kiểm tra trình duyệt desktop 1360px, mobile 390px và 320px; chọn bằng bàn phím đưa thẻ ra giữa, nút xoay hoạt động và không tràn trang theo chiều ngang. Chưa thử thao tác cảm ứng trên thiết bị thật.
