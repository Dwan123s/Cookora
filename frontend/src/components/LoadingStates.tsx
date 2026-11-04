import { CookingPot } from 'lucide-react';

export function Loading({ label = 'Đang chuẩn bị căn bếp…' }: { label?: string }) {
  return (
    <div className="cookora-loading" role="status" aria-live="polite">
      <span className="cookora-loading-mark" aria-hidden="true">
        <span className="cookora-steam">
          <i />
          <i />
          <i />
        </span>
        <CookingPot size={32} strokeWidth={1.6} />
      </span>
      <span>{label}</span>
      <span className="cookora-loading-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="cookora-skeleton-card">
      <div className="cookora-skeleton cookora-skeleton-photo" />
      <div className="cookora-skeleton-copy">
        <div className="cookora-skeleton cookora-skeleton-line is-title" />
        <div className="cookora-skeleton cookora-skeleton-line" />
        <div className="cookora-skeleton cookora-skeleton-line is-short" />
      </div>
    </div>
  );
}

export function RecipeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="cookora-skeleton-region" role="status" aria-label="Đang tải danh sách món ăn">
      <span className="cookora-loading-sr">Đang tải danh sách món ăn…</span>
      <div className="cookora-skeleton-grid" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <main className="cookora-page-skeleton" role="status" aria-label="Đang tải công thức">
      <span className="cookora-loading-sr">Đang tải nguyên liệu và cách nấu…</span>
      <div className="cookora-detail-skeleton" aria-hidden="true">
        <div className="cookora-skeleton cookora-skeleton-detail-photo" />
        <div className="cookora-skeleton-copy">
          <div className="cookora-skeleton cookora-skeleton-line is-short" />
          <div className="cookora-skeleton cookora-skeleton-heading" />
          <div className="cookora-skeleton cookora-skeleton-line" />
          <div className="cookora-skeleton cookora-skeleton-line" />
          <div className="cookora-skeleton cookora-skeleton-button" />
        </div>
      </div>
      <div className="cookora-skeleton-copy" aria-hidden="true">
        <div className="cookora-skeleton cookora-skeleton-line is-title" />
        <div className="cookora-skeleton cookora-skeleton-line" />
        <div className="cookora-skeleton cookora-skeleton-line" />
      </div>
    </main>
  );
}

export function PageLoading({ path }: { path: string }) {
  if (path.startsWith('/cong-thuc/')) return <RecipeDetailSkeleton />;
  if (path === '/dang-nhap')
    return (
      <main className="cookora-page-skeleton">
        <Loading label="Đang mở trang đăng nhập…" />
        <div className="cookora-auth-skeleton" aria-hidden="true">
          <div className="cookora-skeleton cookora-skeleton-heading" />
          <div className="cookora-skeleton cookora-skeleton-field" />
          <div className="cookora-skeleton cookora-skeleton-field" />
          <div className="cookora-skeleton cookora-skeleton-button" />
        </div>
      </main>
    );
  return (
    <main className="cookora-page-skeleton">
      <Loading label="Đang mở căn bếp của bạn…" />
      <RecipeGridSkeleton count={4} />
    </main>
  );
}

export function AiSuggestionLoading() {
  return (
    <div className="cookora-ai-loading">
      <Loading label="Đang kết hợp nguyên liệu và chuẩn bị cách nấu…" />
      <div className="cookora-ai-skeletons" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div className="cookora-ai-skeleton" key={index}>
            <div className="cookora-skeleton cookora-ai-skeleton-photo" />
            <div className="cookora-skeleton-copy">
              <div className="cookora-skeleton cookora-skeleton-line is-title" />
              <div className="cookora-skeleton cookora-skeleton-line is-short" />
            </div>
          </div>
        ))}
      </div>
      <p className="cookora-ai-loading-note">Bạn có thể chuyển trang, gợi ý sẽ được lưu khi hoàn tất.</p>
    </div>
  );
}
