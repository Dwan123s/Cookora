import { Component, type ReactNode } from 'react';
import { CookingPot } from 'lucide-react';

export class PageLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="cookora-chunk-error" role="alert">
        <CookingPot size={40} strokeWidth={1.5} />
        <h2>Chưa mở được trang này</h2>
        <p>Kiểm tra kết nối rồi tải lại để lấy bản Cookora mới nhất.</p>
        <button className="btn" type="button" onClick={() => window.location.reload()}>
          Tải lại trang
        </button>
      </main>
    );
  }
}
