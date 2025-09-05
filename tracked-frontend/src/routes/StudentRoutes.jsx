import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/students/Dashboard';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default StudentRoutes;
