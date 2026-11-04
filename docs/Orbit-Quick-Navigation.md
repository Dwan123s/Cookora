# Tiện ích trên quỹ đạo elip

Thay hàng bảy tiện ích trang chủ bằng một vòng elip. Các thẻ di chuyển quanh tâm “Bếp của bạn” nhưng giữ icon và chữ đứng thẳng. Giữ nguyên bảy liên kết tính năng.

- Một vòng khoảng 56 giây. Nội suy theo chiều dài đường đi để các mục giữ khoảng cách đều qua hai đầu elip.
- Dừng khi rê chuột vào vòng, focus bằng bàn phím, bấm Tạm dừng, ra ngoài viewport hoặc chuyển sang tab khác. Cài đặt giảm chuyển động giữ vòng ở trạng thái tĩnh.
- Kích thước quỹ đạo được đo bằng ResizeObserver. Desktop dùng elip ngang; mobile dùng elip hẹp, cao hơn để nhãn không chồng lên nhau. Thẻ có vùng bấm tối thiểu 78px trên màn hình nhỏ.
- Chuyển động dùng transform trực tiếp theo requestAnimationFrame, không render lại React mỗi frame và không chạy khi ngoài màn hình.

Đã kiểm tra hình học trên 8 kích thước, 360 vị trí của một vòng, không chồng thẻ hoặc vượt khung. Đã kiểm tra trực tiếp trong trình duyệt ở desktop 1280px và mobile 320px: đủ bảy mục, không tràn ngang; vị trí thay đổi khi chạy, nút tạm dừng/tiếp tục và focus bàn phím hoạt động. Chưa thử thao tác cảm ứng trên thiết bị thật.
