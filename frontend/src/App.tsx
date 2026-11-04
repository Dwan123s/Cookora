import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { m } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Search, X } from 'lucide-react';
import type { User } from '@cookora/contracts';
import { request } from './api';
import { noticeContext, authContext, Loading, Empty } from './shared';
import { Header, Footer, ScrollTop } from './layout';
import { PageLoading } from './components/LoadingStates';
import { PageLoadBoundary } from './components/PageLoadBoundary';
import { CookingAssistant } from './components/CookingAssistant';
import { MobileBottomBar } from './components/MobileBottomBar';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Discover = lazy(() => import('./pages/Discover').then((module) => ({ default: module.Discover })));
const Detail = lazy(() => import('./pages/Recipe').then((module) => ({ default: module.Detail })));
const Cooking = lazy(() => import('./pages/Recipe').then((module) => ({ default: module.Cooking })));
const Matcher = lazy(() => import('./pages/Matcher').then((module) => ({ default: module.Matcher })));
const Planner = lazy(() => import('./pages/Planner').then((module) => ({ default: module.Planner })));
const Shopping = lazy(() => import('./pages/Shopping').then((module) => ({ default: module.Shopping })));
const Favorites = lazy(() => import('./pages/Favorites').then((module) => ({ default: module.Favorites })));
const AuthPage = lazy(() => import('./pages/Auth').then((module) => ({ default: module.AuthPage })));
const Editor = lazy(() => import('./pages/Editor').then((module) => ({ default: module.Editor })));
const Roadmap = lazy(() => import('./pages/Roadmap').then((module) => ({ default: module.Roadmap })));
const EatFit = lazy(() => import('./pages/EatFit').then((module) => ({ default: module.EatFit })));
const MealCost = lazy(() => import('./pages/MealCost').then((module) => ({ default: module.MealCost })));
const Nutrition = lazy(() => import('./pages/Nutrition').then((module) => ({ default: module.Nutrition })));
const PortionAdjust = lazy(() =>
  import('./pages/PortionAdjust').then((module) => ({ default: module.PortionAdjust })),
);

export function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/dang-nhap';
  const [notice, setNotice] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const assistantPanelId = useId();
  const mobileChatTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setAssistantOpen(false);
  }, [location.pathname, location.search]);
  const auth = useQuery({
    queryKey: ['auth'],
    queryFn: () => request<User>('/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Có gì, nấu nấy',
      '/cong-thuc': 'Khám phá công thức',
      '/co-gi-nau-nay': 'Có gì nấu nấy',
      '/thuc-don': 'Thực đơn tuần',
      '/eat-fit': 'Eat Fit · Dinh dưỡng cá nhân hóa',
      '/ngan-sach': 'Ngân sách ăn uống',
      '/yeu-thich': 'Món đã lưu',
      '/dang-nhap': 'Bếp của tôi',
      '/bien-tap': 'Không gian biên tập',
    };
    document.title = `${titles[location.pathname] || 'Bếp nhà'} · Cookora`;
  }, [location.pathname]);
  return (
    <noticeContext.Provider value={setNotice}>
      <authContext.Provider value={auth.data?.data || null}>
        <div className={`app-shell${isAuthPage ? '' : ' has-mobile-bottom-bar'}`}>
          <ScrollTop />
          {!isAuthPage && (
            <>
              <a href="#page-content" className="skip-link">
                Đến nội dung chính
              </a>
            </>
          )}
          <Header hidden={isAuthPage} />
          <m.div
            id="page-content"
            tabIndex={-1}
            key={location.pathname}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.16 }}
          >
            <PageLoadBoundary key={location.pathname}>
              <Suspense fallback={<PageLoading path={location.pathname} />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/cong-thuc" element={<Discover />} />
                  <Route path="/cong-thuc/:slug" element={<Detail />} />
                  <Route path="/cong-thuc/:slug/nau" element={<Cooking />} />
                  <Route path="/khau-phan" element={<PortionAdjust />} />
                  <Route path="/khau-phan/:slug" element={<PortionAdjust />} />
                  <Route path="/co-gi-nau-nay" element={<Matcher />} />
                  <Route path="/thuc-don" element={auth.isPending ? <Loading /> : <Planner />} />
                  <Route path="/eat-fit" element={<EatFit />} />
                  <Route path="/ngan-sach" element={<MealCost />} />
                  <Route path="/dinh-duong" element={<Nutrition />} />
                  <Route path="/di-cho/:planId" element={auth.isPending ? <Loading /> : <Shopping />} />
                  <Route path="/yeu-thich" element={auth.isPending ? <Loading /> : <Favorites />} />
                  <Route path="/dang-nhap" element={auth.isPending ? <Loading /> : <AuthPage />} />
                  <Route path="/bien-tap" element={auth.isPending ? <Loading /> : <Editor />} />
                  <Route path="/lo-trinh" element={<Roadmap />} />
                  <Route
                    path="*"
                    element={
                      <main className="container">
                        <Empty icon={<Search size={32} />} title="Không tìm thấy trang">
                          <Link className="btn" to="/">
                            Về trang chủ
                          </Link>
                        </Empty>
                      </main>
                    }
                  />
                </Routes>
              </Suspense>
            </PageLoadBoundary>
          </m.div>
          {!isAuthPage && <Footer />}
          <CookingAssistant
            hidden={isAuthPage}
            open={assistantOpen}
            onOpenChange={setAssistantOpen}
            panelId={assistantPanelId}
            mobileTriggerRef={mobileChatTrigger}
          />
          {!isAuthPage && (
            <MobileBottomBar
              chatOpen={assistantOpen}
              onChatToggle={() => setAssistantOpen((open) => !open)}
              onChatClose={() => setAssistantOpen(false)}
              chatPanelId={assistantPanelId}
              chatTriggerRef={mobileChatTrigger}
            />
          )}
          {notice && (
            <div className="toast" role="status">
              <CheckCircle2 size={18} />
              {notice}
              <button aria-label="Đóng thông báo" onClick={() => setNotice('')}>
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      </authContext.Provider>
    </noticeContext.Provider>
  );
}
