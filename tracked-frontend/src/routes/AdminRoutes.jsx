import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard';
import NotFound from '../pages/NotFound';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Add more admin routes here as needed */}
      {/* <Route path="/users" element={<UserManagement />} /> */}
      {/* <Route path="/courses" element={<CourseManagement />} /> */}
      {/* <Route path="/reports" element={<Reports />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;