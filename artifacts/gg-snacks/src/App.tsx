import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import HomePage from '@/pages/home';
import ProductsPage from '@/pages/products';
import RatingPage from '@/pages/rating';
import { AboutPage, ContactPage, DistributionPage, QualityPage } from '@/pages/standard-pages';
import { SiteShell } from '@/components/site-shell';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    <SiteShell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/quality" component={QualityPage} />
          <Route path="/distribution" component={DistributionPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/rate/:productSlug/:flavorSlug" component={RatingPage} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </SiteShell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
