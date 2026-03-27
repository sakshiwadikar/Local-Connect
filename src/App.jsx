import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import ServiceListing from './pages/ServiceListing';
import ServiceDetail from './pages/ServiceDetail';
import AddService from './pages/AddService';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProviderDashboard from './pages/ProviderDashboard';
import CustomerProfile from './pages/CustomerProfile';
import ProviderProfile from './pages/ProviderProfile';
import CustomerSettings from './pages/CustomerSettings';
import ProviderSettings from './pages/ProviderSettings';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
            <ToastContainer />
          <Navbar />
          <main className="pt-16 min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<ServiceListing />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/add-service" element={
                <ProtectedRoute requiredRole="provider">
                  <AddService />
                </ProtectedRoute>
              } />
              <Route path="/provider-dashboard" element={
                <ProtectedRoute requiredRole="provider">
                  <ProviderDashboard />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerProfile />
                </ProtectedRoute>
              } />
              <Route path="/provider-profile" element={
                <ProtectedRoute requiredRole="provider">
                  <ProviderProfile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerSettings />
                </ProtectedRoute>
              } />
              <Route path="/provider-settings" element={
                <ProtectedRoute requiredRole="provider">
                  <ProviderSettings />
                </ProtectedRoute>
              } />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
