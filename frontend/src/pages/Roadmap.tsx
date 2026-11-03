import { PageHead } from '../shared';

export function Roadmap() {
  return (
    <main className="container">
      <PageHead
        eyebrow="TỪNG BƯỚC HOÀN THIỆN CĂN BẾP"
        title="Cookora đang được xây dựng"
        description="Bản đầu tập trung khám phá, nguyên liệu, thực đơn và đi chợ. Các công cụ dưới đây chưa được phát hành."
      />
      <div className="how-grid">
        {[
          {
            title: 'Eat Fit & dinh dưỡng',
            text: 'Chờ mapping nguồn dinh dưỡng, review công thức và chính sách mục tiêu.',
          },
          { title: 'Chi phí & ngân sách', text: 'Chờ dữ liệu giá theo vùng, đơn vị và nguồn cập nhật.' },
        ].map((x) => (
          <div className="roadmap-card" key={x.title}>
            <span className="badge">Giai đoạn tiếp theo</span>
            <h2>{x.title}</h2>
            <p>{x.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
