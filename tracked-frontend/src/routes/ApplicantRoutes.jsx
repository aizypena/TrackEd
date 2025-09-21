import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/applicants/ApplicantDashboard';
import Login from '../pages/Login';

const ApplicantRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      
    </Routes>
  );
};

export default ApplicantRoutes;
