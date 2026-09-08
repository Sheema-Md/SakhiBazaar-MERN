import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboardComplete';
import { useContext } from 'react';
import { AdminAuthContext } from './context/AdminAuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { adminUser } = useContext(AdminAuthContext);
  if (!adminUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
