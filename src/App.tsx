import { Route, Routes, useLocation } from 'react-router'
import { lazy, Suspense } from 'react'
import { useLanguage } from './i18n/LanguageContext'
import RoutePosition from './components/RoutePosition'
import PageErrorBoundary from './components/PageErrorBoundary'
import { publicPaths } from './data/publicContent'
const CmsAdmin = lazy(() => import('./cms/CmsAdmin'))
const AdminNavigation = lazy(() => import('./cms/AdminNavigation'))
const PublicPage = lazy(() => import('./pages/PublicPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Home = lazy(() => import('./pages/Home'))
const RateSnack = lazy(() => import('./pages/RateSnack'))
const Products = lazy(() => import('./pages/Products'))
const ProductFamily = lazy(() => import('./pages/ProductFamily'))
const RatingsDashboard = lazy(() => import('./pages/RatingsDashboard'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const StaffSessionProvider = lazy(() => import('./auth/StaffSession').then(module => ({ default: module.StaffSessionProvider })))
const RequireStaffSession = lazy(() => import('./auth/StaffSession').then(module => ({ default: module.RequireStaffSession })))

export default function App() {
  const { t } = useLanguage()
  const location = useLocation()
  return <PageErrorBoundary key={location.pathname} message={t.pageError} retry={t.pageRetry}><Suspense fallback={<p className="route-loading" role="status">{t.pageLoading}</p>}><RoutePosition /><Routes><Route path="/" element={<Home />} />{publicPaths.map(path => <Route key={path} path={path} element={<PublicPage />} />)}<Route element={<StaffSessionProvider />}><Route path="/admin/login" element={<AdminLogin />} /><Route element={<RequireStaffSession />}><Route path="/dashboard/ratings" element={<><AdminNavigation /><RatingsDashboard /></>} /><Route path="/admin/:section" element={<CmsAdmin />} /></Route></Route><Route path="/products" element={<Products />} /><Route path="/products/:productSlug" element={<ProductFamily />} /><Route path="/rate/:productSlug/:flavorSlug" element={<RateSnack />} /><Route path="*" element={<NotFound />} /></Routes></Suspense></PageErrorBoundary>
}
