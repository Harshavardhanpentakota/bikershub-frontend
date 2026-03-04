import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import {
  ContactUsPage,
  FaqsPage,
  ShippingInfoPage,
  ReturnsPage,
  SizeGuidePage,
  TrackOrderPage,
  RidersBlogPage,
  BuyingGuidesPage,
  GearReviewsPage,
  AffiliatePage,
  PressPage,
} from "./pages/InfoPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* AuthProvider must wrap CartProvider so cart can read auth state */}
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact-us" element={<ContactUsPage />} />
              <Route path="/faqs" element={<FaqsPage />} />
              <Route path="/shipping-info" element={<ShippingInfoPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/size-guide" element={<SizeGuidePage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/riders-blog" element={<RidersBlogPage />} />
              <Route path="/buying-guides" element={<BuyingGuidesPage />} />
              <Route path="/gear-reviews" element={<GearReviewsPage />} />
              <Route path="/affiliate" element={<AffiliatePage />} />
              <Route path="/press" element={<PressPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
