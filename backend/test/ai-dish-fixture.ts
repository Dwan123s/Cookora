export function detailedDish(title = 'Trứng hấp cà chua') {
  return {
    title,
    steps: [
      {
        order: 1,
        title: 'Sơ chế cà chua',
        instruction:
          'Rửa cà chua dưới vòi nước, bỏ cuống rồi cắt hạt lựu cạnh khoảng 1 cm. Để cà chua ráo trong rổ sạch trước khi trộn để hỗn hợp trứng không bị quá loãng.',
      },
      {
        order: 2,
        title: 'Chuẩn bị trứng',
        instruction:
          'Đập lần lượt từng quả trứng vào một chén nhỏ để kiểm tra, sau đó mới cho vào tô trộn. Dùng đũa đánh nhẹ khoảng 30 giây để lòng trắng và lòng đỏ hòa đều, tránh đánh quá nhiều bọt.',
      },
      {
        order: 3,
        title: 'Nêm và chia phần',
        instruction:
          'Thêm 1/4 thìa cà phê muối và 30 ml nước vào tô trứng, khuấy đều rồi cho cà chua vào. Chia vào hai chén chịu nhiệt nhỏ, chỉ đổ khoảng hai phần ba chén để dễ hấp chín đều.',
      },
      {
        order: 4,
        title: 'Chuẩn bị nồi hấp',
        instruction:
          'Cho nước vào nồi, giữ mặt nước thấp hơn đáy xửng rồi đun sôi ở lửa vừa. Đặt chén trứng lên xửng bằng kẹp hoặc khăn cách nhiệt, tránh để tay gần luồng hơi nóng thoát lên.',
      },
      {
        order: 5,
        title: 'Hấp trứng',
        instruction:
          'Đậy nắp và hạ lửa vừa nhỏ, hấp khoảng 10–12 phút để trứng đông từ từ. Kiểm tra phần giữa chén không còn lỏng; nếu còn lỏng, đậy lại và hấp thêm từng đợt 1–2 phút rồi kiểm tra lại.',
      },
      {
        order: 6,
        title: 'Kiểm tra và dọn món',
        instruction:
          'Tắt bếp, hé nắp theo hướng tránh mặt rồi dùng kẹp lấy chén ra. Để nghỉ khoảng 1 phút, kiểm tra trứng đã đông đều và dùng khi còn ấm; không bưng chén nóng trực tiếp bằng tay trần.',
      },
    ],
  };
}
