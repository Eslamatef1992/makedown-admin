import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminsPage from './pages/admins/AdminsPage';
import RolesPage from './pages/roles/RolesPage';
import UsersPage from './pages/users/UsersPage';
import SchoolsPage from './pages/schools/SchoolsPage';
import QuizzesPage from './pages/quizzes/QuizzesPage';
import GameCategoriesPage from './pages/game-categories/GameCategoriesPage';
import GameSessionsPage from './pages/game-sessions/GameSessionsPage';
import OrdersPage from './pages/orders/OrdersPage';
import ChatPage from './pages/chat/ChatPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductCategoriesPage from './pages/products/ProductCategoriesPage';
import VariantTypesPage from './pages/variant-types/VariantTypesPage';
import PackagesPage from './pages/packages/PackagesPage';
import ContactMessagesPage from './pages/contact/ContactMessagesPage';
import CmsPageEditor from './pages/cms/CmsPageEditor';
import FaqsPage from './pages/cms/FaqsPage';
import SocialLinksPage from './pages/cms/SocialLinksPage';
import HomeVideoPage from './pages/cms/HomeVideoPage';
import ContactInfoPage from './pages/cms/ContactInfoPage';

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/admins" element={<Protected><AdminsPage /></Protected>} />
          <Route path="/roles" element={<Protected><RolesPage /></Protected>} />

          <Route path="/users" element={<Protected><UsersPage /></Protected>} />
          <Route path="/users/special" element={<Protected><UsersPage /></Protected>} />

          <Route path="/schools" element={<Protected><SchoolsPage /></Protected>} />
          <Route path="/quizzes" element={<Protected><QuizzesPage /></Protected>} />

          <Route path="/game-categories" element={<Protected><GameCategoriesPage /></Protected>} />
          <Route path="/game-sessions" element={<Protected><GameSessionsPage /></Protected>} />

          <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
          <Route path="/orders/guest" element={<Protected><OrdersPage /></Protected>} />

          <Route path="/chat" element={<Protected><ChatPage /></Protected>} />

          <Route path="/products" element={<Protected><ProductsPage /></Protected>} />
          <Route path="/product-categories" element={<Protected><ProductCategoriesPage /></Protected>} />
          <Route path="/variant-types" element={<Protected><VariantTypesPage /></Protected>} />

          <Route path="/packages" element={<Protected><PackagesPage /></Protected>} />
          <Route path="/contact-messages" element={<Protected><ContactMessagesPage /></Protected>} />

          <Route path="/cms/pages/:slug" element={<Protected><CmsPageEditor /></Protected>} />
          <Route path="/cms/faqs" element={<Protected><FaqsPage /></Protected>} />
          <Route path="/cms/social-links" element={<Protected><SocialLinksPage /></Protected>} />
          <Route path="/cms/home-video" element={<Protected><HomeVideoPage /></Protected>} />
          <Route path="/cms/contact-info" element={<Protected><ContactInfoPage /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
