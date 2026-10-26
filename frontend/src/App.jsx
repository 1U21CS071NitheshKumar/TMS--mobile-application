import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

import Departments from './pages/Masters/Departments';
import Programmes from './pages/Masters/Programmes';
import Blocks from './pages/Masters/Blocks';
import Rooms from './pages/Masters/Rooms';
import Roles from './pages/Masters/Roles';
import Users from './pages/Masters/Users';
import RaiseTicket from './pages/RaiseTicket';
import TicketList from './pages/TicketList';
import Reports from './pages/Reports';

// Protection Wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const isSuperAdmin = user.role === 'SuperAdmin' || user.role?.name === 'SuperAdmin';
  if (adminOnly && !isSuperAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Master Screens */}
          <Route path="/masters/departments" element={<ProtectedRoute adminOnly><Departments /></ProtectedRoute>} />
          <Route path="/masters/programmes" element={<ProtectedRoute adminOnly><Programmes /></ProtectedRoute>} />
          <Route path="/masters/blocks" element={<ProtectedRoute adminOnly><Blocks /></ProtectedRoute>} />
          <Route path="/masters/rooms" element={<ProtectedRoute adminOnly><Rooms /></ProtectedRoute>} />
          <Route path="/masters/roles" element={<ProtectedRoute adminOnly><Roles /></ProtectedRoute>} />
          <Route path="/masters/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />

          {/* Tickets */}
          <Route path="/tickets/raise" element={<ProtectedRoute><RaiseTicket /></ProtectedRoute>} />
          <Route path="/tickets/list" element={<ProtectedRoute><TicketList /></ProtectedRoute>} />

          {/* Reports */}
          <Route path="/reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
