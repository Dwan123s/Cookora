// Expanded explanations for the abbreviated Eat Fit recipes, using their listed ingredients.
// These guides do not supply missing nutrition figures or guarantee cooking times.
const guides: Record<string, string[]> = {
  'Salad ức gà và bơ': [
    'Nhặt xà lách, rửa sạch cùng cà chua bi và để thật ráo. Cắt xà lách vừa ăn, bổ đôi cà chua. Bơ bỏ vỏ và hạt, thái miếng; chỉ cắt bơ khi sắp trộn để hạn chế thâm.',
    'Thấm khô ức gà, dàn miếng thịt có độ dày tương đối đều. Cho một phần dầu ô liu vào chảo, làm nóng rồi áp chảo gà trên lửa vừa, trở mặt để chín đều. Kiểm tra phần dày nhất đã chín hoàn toàn; không chỉ dựa vào màu vàng bên ngoài.',
    'Gắp gà ra đĩa sạch, để bớt nóng rồi thái lát hoặc xé sợi. Khuấy phần dầu ô liu còn lại với nước cốt chanh; thêm chanh từng ít để điều chỉnh độ chua.',
    'Cho xà lách, cà chua và gà vào tô, rưới sốt rồi đảo nhẹ. Thêm bơ sau cùng để không bị nát, bày ra đĩa và dùng ngay.',
  ],
  'Salad tôm xoài': [
    'Bóc vỏ tôm, bỏ đầu và chỉ lưng. Rửa xà lách, dưa leo và cà rốt rồi để ráo; gọt vỏ xoài, bỏ hạt và thái sợi hoặc miếng vừa ăn. Cà rốt và dưa leo thái sợi.',
    'Đun nước sôi, cho tôm vào luộc đến khi thân tôm chuyển đục và chín đều. Vớt ra, để ráo và nguội bớt; nếu tôm lớn có thể cắt đôi theo chiều dọc.',
    'Cho nước cốt chanh và một ít nước mắm vào bát, khuấy đều. Nếm rồi điều chỉnh từng ít cho vị chua mặn vừa ăn; không đổ toàn bộ nước mắm vào ngay.',
    'Xếp xà lách, dưa leo, cà rốt, xoài và tôm vào tô. Rưới nước trộn từng ít, đảo nhẹ để xoài không nát và dùng ngay sau khi trộn.',
  ],
  'Salad cá ngừ trứng luộc': [
    'Rửa xà lách, cà chua bi và dưa leo rồi để ráo. Cắt xà lách vừa ăn, bổ đôi cà chua và thái lát dưa leo.',
    'Cho trứng vào nồi, thêm nước ngập trứng rồi luộc đến khi lòng trắng và lòng đỏ đông chín. Vớt ra ngâm nước mát, bóc vỏ và bổ múi cau.',
    'Mở cá ngừ ngâm nước, chắt bỏ nước và dùng nĩa tách thịt cá thành miếng vừa ăn. Loại cá ngừ đóng hộp đã chín không cần luộc lại.',
    'Khuấy sữa chua với một ít nước cốt chanh, nếm và điều chỉnh độ chua. Trộn sốt với rau và cá ngừ, xếp trứng lên trên sau cùng để không bị vỡ.',
  ],
  'Salad khoai lang trứng': [
    'Rửa khoai lang, cắt bỏ phần hỏng rồi hấp đến khi có thể xiên đũa qua dễ dàng. Để nguội bớt, bóc vỏ nếu muốn và cắt miếng vừa ăn.',
    'Luộc trứng đến khi chín, ngâm nước mát rồi bóc vỏ và bổ múi cau. Dùng dụng cụ sạch để cắt trứng chín.',
    'Rửa xà lách, cà chua và dưa leo, để ráo rồi thái vừa ăn. Khuấy sữa chua với một ít nước cốt chanh theo phần sốt trong công thức; thêm chanh từng chút để tránh quá chua.',
    'Cho rau và khoai đã bớt nóng vào tô, rưới sốt và trộn nhẹ. Xếp trứng lên trên; không đảo mạnh để khoai và trứng giữ nguyên miếng.',
  ],
  'Salad đậu gà kiểu Địa Trung Hải': [
    'Dùng 130g đậu gà đã nấu chín như phần nguyên liệu. Nếu dùng đậu đóng hộp, chắt nước, rửa lại và để ráo. Không dùng đậu gà khô trực tiếp để trộn salad.',
    'Rửa sạch 80g cà chua bi, 70g dưa leo và 50g xà lách, để ráo. Bổ đôi cà chua, thái dưa leo hạt lựu và cắt xà lách vừa ăn. Bóc vỏ 30g hành tím, thái thật mỏng; có thể ngâm nước mát rồi để ráo để bớt hăng.',
    'Cho 1 thìa cà phê dầu olive vào bát, thêm một ít nước cốt chanh và khuấy đều. Nếm rồi thêm chanh từng ít đến độ chua bạn thích; nếu dùng tiêu theo công thức gốc thì thêm một chút ở bước này.',
    'Cho đậu gà, cà chua, dưa leo và hành tím vào tô, rưới nước trộn rồi đảo nhẹ cho phủ đều. Thêm xà lách sau cùng và trộn lại; rau cần ráo nước để sốt không bị loãng.',
    'Bày ra đĩa và dùng ngay để rau còn giòn. Nếu chuẩn bị trước, để riêng nước trộn và chỉ rưới lên salad khi sắp ăn.',
  ],
  'Salad cá hồi nướng': [
    'Kiểm tra và gỡ xương còn sót trong cá hồi, thấm khô cá. Ướp với chút muối và tiêu theo công thức gốc, để khoảng 10 phút.',
    'Rửa xà lách, cà chua bi và dưa leo, để thật ráo rồi cắt vừa ăn. Bơ bỏ vỏ, hạt và thái lát khi sắp dùng.',
    'Nướng hoặc áp chảo cá hồi, trở mặt nếu dùng chảo để cá chín đều. Kiểm tra phần giữa miếng cá đã chín, thịt dễ tách thớ; thời gian phụ thuộc độ dày và thiết bị.',
    'Xếp rau và bơ ra đĩa, đặt cá đã chín lên trên. Vắt chanh từng ít và rắc tiêu theo khẩu vị, dùng ngay.',
  ],
  'Salad đậu hũ bông cải': [
    'Cắt bông cải thành nhánh nhỏ, rửa sạch. Cà rốt gọt vỏ, thái lát mỏng; đậu hũ để ráo và cắt miếng vừa ăn. Edamame trong nguyên liệu là loại đã chín.',
    'Hấp bông cải và cà rốt đến khi chín nhưng vẫn giữ được hình dạng. Hâm nóng edamame đã chín cùng rau rồi lấy ra, để ráo.',
    'Dùng chảo chống dính và lượng dầu nhỏ theo cách làm gốc để áp chảo đậu hũ. Đợi mặt dưới se lại rồi mới trở nhẹ, tránh làm vỡ miếng đậu.',
    'Pha nước tương ít muối với một ít nước cốt chanh, nếm và điều chỉnh từng chút. Cho rau, edamame và đậu hũ vào tô, rưới sốt rồi đảo nhẹ trước khi dùng.',
  ],
  'Salad bò áp chảo ớt chuông': [
    'Rửa ớt chuông, bỏ cuống và hạt rồi thái sợi. Rửa xà lách, cà chua bi và dưa leo, để ráo rồi cắt vừa ăn. Băm nhỏ tỏi.',
    'Thấm khô thịt bò, thái ngang thớ nếu miếng thịt dày. Ướp cùng tỏi và một ít tiêu theo cách làm gốc.',
    'Làm nóng chảo chống dính rồi áp chảo bò, trở mặt để thịt chín đều. Kiểm tra phần dày nhất, không mặc định mặt ngoài vàng nghĩa là bên trong đã chín.',
    'Cho bò ra đĩa sạch, để bớt nóng rồi thái lát vừa ăn. Trộn cùng rau củ, thêm nước cốt chanh từng ít và dùng ngay.',
  ],
  'Salad quinoa ức gà': [
    'Phần nguyên liệu dùng 100g quinoa đã nấu chín. Nếu bắt đầu từ quinoa khô, rửa hạt và nấu theo hướng dẫn bao bì; chỉ cân phần chín để dùng cho món này.',
    'Luộc riêng ức gà đến khi chín hoàn toàn, kiểm tra phần thịt dày nhất. Vớt ra đĩa sạch, để bớt nóng rồi xé sợi hoặc thái lát.',
    'Rửa xà lách, cà chua bi và dưa leo, để ráo rồi cắt vừa ăn. Bơ bỏ vỏ và hạt, thái miếng khi sắp trộn.',
    'Cho quinoa, gà và rau vào tô. Rưới nước cốt chanh từng ít và trộn đều; nếu dùng nước mắm, tỏi, ớt theo phần sốt của công thức gốc thì pha riêng, nếm rồi mới rưới. Thêm bơ sau cùng và đảo nhẹ.',
  ],
  'Salad gà bắp cải kiểu Việt': [
    'Luộc ức gà đến khi chín hoàn toàn, gắp ra đĩa sạch và để bớt nóng rồi xé sợi. Không dùng dao, thớt vừa xử lý gà sống để cắt gà chín.',
    'Rửa bắp cải, cà rốt, hành tây và rau răm. Bào mỏng bắp cải, thái sợi cà rốt và hành tây; rau răm thái nhỏ. Để rau ráo trước khi trộn.',
    'Pha nước mắm với nước cốt chanh và một ít nước, khuấy đều rồi nếm. Điều chỉnh từng chút để nước trộn không quá mặn hoặc quá chua.',
    'Trộn gà với rau củ, rưới nước trộn từng ít và đảo đều. Thêm rau răm và đậu phộng rang sau cùng để giữ mùi thơm và độ giòn.',
  ],
  'Cháo yến mạch thịt bằm rau củ': [
    'Rửa cà rốt, gọt vỏ và thái hạt lựu nhỏ để dễ chín. Hành lá rửa sạch, thái nhỏ. Chuẩn bị 40g yến mạch cán dẹt và 100g thịt bằm theo nguyên liệu.',
    'Đun nước trong nồi, cho thịt bằm vào và dùng thìa khuấy tơi để thịt không vón cục. Nấu đến khi thịt chín, hớt bọt nếu có.',
    'Cho cà rốt vào nấu mềm rồi thêm yến mạch, khuấy đều trên lửa nhỏ. Thêm nước nóng từng ít nếu cháo quá đặc; nấu đến khi yến mạch nở mềm, cà rốt và thịt đều chín.',
    'Nêm nhạt theo khẩu vị, thêm hành lá rồi tắt bếp. Múc ra bát và dùng khi còn ấm; khuấy lại trước khi ăn vì yến mạch tiếp tục đặc hơn khi nguội.',
  ],
  'Cá hồi nướng măng tây': [
    'Kiểm tra và gỡ xương còn sót của cá hồi rồi thấm khô. Măng tây rửa sạch, cắt bỏ gốc già và cắt khúc vừa ăn.',
    'Ướp cá với chút muối và tiêu đen khoảng 10 phút theo công thức gốc. Làm nóng lò hoặc nồi chiên không dầu trước khi cho cá vào.',
    'Xếp cá và măng tây thành một lớp. Nướng ở 180°C khoảng 10–12 phút theo công thức gốc, rồi kiểm tra phần giữa miếng cá và độ mềm của măng tây; tiếp tục nấu nếu chưa chín, không coi thời gian là dấu hiệu duy nhất.',
    'Bày cá và măng tây ra đĩa sạch, vắt thêm nước từ lát chanh ngay trước khi ăn.',
  ],
  'Cơm gạo lức và thịt bò xào súp lơ': [
    'Chuẩn bị cơm gạo lứt đã chín. Bông cải rửa sạch, cắt nhánh nhỏ rồi chần trong nước sôi đến khi vừa mềm, vớt ra để ráo.',
    'Thịt bò thái lát mỏng ngang thớ. Ướp với tỏi và gia vị được nêu trong cách làm gốc; dùng từng ít để không quá mặn.',
    'Làm nóng chảo chống dính, cho bò vào dàn thành lớp mỏng và đảo nhanh để thịt chín đều. Thêm bông cải đã chần, đảo cho nóng và ngấm gia vị; kiểm tra bò đã chín trước khi tắt bếp.',
    'Xới cơm ra đĩa, thêm bò và bông cải. Nếu cơm đã nguội, hâm nóng kỹ trước khi dùng.',
  ],
  'Cơm gạo lứt ức gà áp chảo': [
    'Rửa bông cải, chia thành nhánh nhỏ rồi hấp đến khi chín vừa. Chuẩn bị 150g cơm gạo lứt đã chín theo nguyên liệu.',
    'Thấm khô ức gà, dàn miếng thịt có độ dày đều hơn. Ướp cùng tỏi và tiêu; gia vị khác trong cách làm gốc chỉ thêm từng ít theo khẩu vị.',
    'Làm nóng chảo với 5g dầu olive, cho gà vào áp chảo trên lửa vừa. Trở mặt để thịt chín đều, kiểm tra phần dày nhất đã chín hoàn toàn rồi mới lấy ra.',
    'Để gà bớt nóng trên đĩa sạch rồi thái lát. Bày cùng cơm nóng và bông cải đã hấp, dùng ngay.',
  ],
  'Cơm bò áp chảo rau củ': [
    'Chuẩn bị 180g cơm chín. Rửa bông cải, cắt nhánh nhỏ; cà rốt gọt vỏ và thái lát để các miếng có độ dày gần nhau.',
    'Thấm khô thịt bò, ướp với tỏi băm và tiêu theo cách làm gốc. Thái ngang thớ nếu cần chia nhỏ miếng thịt.',
    'Hấp bông cải và cà rốt đến khi chín. Trong lúc đó, làm nóng chảo với 5g dầu ăn, áp chảo bò và trở mặt để thịt chín đều; kiểm tra phần dày nhất trước khi lấy ra.',
    'Cho bò ra đĩa sạch, để bớt nóng rồi thái vừa ăn. Bày cùng cơm nóng và rau củ đã hấp.',
  ],
  'Cá hồi áp chảo khoai lang': [
    'Rửa khoai lang, cắt phần hỏng rồi hấp đến khi xiên đũa qua dễ dàng. Để bớt nóng, bóc vỏ nếu muốn và cắt miếng vừa ăn.',
    'Măng tây rửa sạch, bỏ gốc già và cắt khúc. Cá hồi kiểm tra xương, thấm khô rồi thêm tiêu theo khẩu vị.',
    'Làm nóng chảo với một phần trong 5g dầu olive. Áp chảo cá hồi trên lửa vừa, trở mặt để cá chín đều; kiểm tra phần giữa đã chín, không chỉ quan sát mặt ngoài.',
    'Hấp măng tây hoặc xào bằng phần dầu còn lại đến khi chín vừa. Bày cùng khoai và cá, vắt chanh từng ít trước khi ăn.',
  ],
  'Mì Ý nguyên cám sốt cà chua ức gà': [
    'Luộc 80g mì nguyên cám trong nước sôi theo hướng dẫn trên bao bì. Trước khi vớt mì, giữ lại một ít nước luộc để điều chỉnh sốt.',
    'Cà chua và hành tây rửa sạch, thái nhỏ; tỏi băm, húng quế nhặt và rửa sạch. Thấm khô gà, thêm gia vị theo công thức gốc rồi áp chảo bằng một phần dầu đến khi chín hoàn toàn, lấy ra đĩa sạch và thái miếng.',
    'Cho phần dầu còn lại vào chảo, phi thơm tỏi và hành tây rồi thêm cà chua. Đun lửa vừa, đảo và dằm nhẹ đến khi cà chua mềm; thêm từng ít nước luộc mì nếu sốt quá khô.',
    'Cho mì và gà đã chín vào sốt, đảo đều đến khi nóng. Nếm lại, thêm húng quế rồi bày ra đĩa; tổng lượng dầu dùng theo phần nguyên liệu là 5g.',
  ],
  'Đậu hũ sốt cà chua tôm': [
    'Tôm bóc vỏ, bỏ chỉ lưng và để ráo. Đậu hũ cắt miếng vừa ăn. Cà chua rửa sạch, thái nhỏ; tỏi băm và hành lá thái nhỏ.',
    'Dùng một phần trong 5g dầu ăn để phi thơm tỏi. Cho tôm vào đảo đến khi chuyển đục và chín, lấy ra bát sạch để tôm không bị nấu quá lâu.',
    'Cho cà chua vào chảo với phần dầu còn lại, đảo đến khi mềm. Thêm một ít nước và dằm nhẹ để tạo sốt; nêm theo khẩu vị rồi hạ lửa.',
    'Nhẹ tay cho đậu hũ vào sốt, đun đến khi nóng và thấm gia vị. Thêm tôm đã chín trở lại, đảo nhẹ cho nóng đều, rắc hành lá rồi tắt bếp.',
  ],
  'Sandwich trứng phô mai ức gà': [
    'Rửa xà lách và cà chua, để thật ráo rồi thái vừa ăn. Phần nguyên liệu dùng 60g ức gà đã chín: thái lát hoặc xé nhỏ, hâm nóng nếu đang nguội.',
    'Làm nóng chảo chống dính. Đập trứng vào bát rồi cho vào chảo, chiên đến độ chín phù hợp; nếu dùng dầu theo cách làm gốc thì chỉ dùng một lớp mỏng.',
    'Đặt một lát bánh mì nguyên cám lên mặt phẳng sạch, lần lượt xếp rau, cà chua, gà, trứng và 20g phô mai. Đậy bằng lát bánh mì còn lại.',
    'Áp chảo sandwich trên lửa nhỏ, trở nhẹ đến khi hai mặt bánh ấm giòn và phô mai mềm. Lấy ra, cắt đôi và dùng ngay.',
  ],
  'Cơm thịt heo nạc nướng sả': [
    'Thịt thăn heo thái miếng có độ dày tương đối đều. Sả và tỏi làm sạch, băm nhỏ rồi trộn với thịt và nước mắm theo khẩu vị, ướp khoảng 15–20 phút theo cách làm gốc.',
    'Rửa dưa leo và cà rốt. Dưa leo thái lát; cà rốt thái sợi hoặc hấp chín nếu thích. Chuẩn bị 180g cơm chín.',
    'Dùng 5g dầu đã chuẩn bị để chống dính khi áp chảo, hoặc nướng thịt. Trở mặt để thịt chín đều; kiểm tra phần dày nhất chín hoàn toàn trước khi lấy ra.',
    'Bày thịt ra đĩa sạch cùng cơm nóng, dưa leo và cà rốt. Không rưới phần nước ướp thịt sống lên món đã chín.',
  ],
};

export function eatFitCookingGuide(title: string, context: string) {
  const original = context.split(/(?:^|\n+)\s*Bước\s+\d+\s*[.:]\s*/i).map((step) => step.trim()).filter(Boolean);
  const detailed = guides[title];
  // Preserve a fuller source recipe if it is later supplied by the catalog.
  if (!detailed || original.join(' ').length >= detailed.join(' ').length) return { steps: original, expanded: false };
  return { steps: detailed, expanded: true };
}
