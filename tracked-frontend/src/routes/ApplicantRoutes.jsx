import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/applicants/ApplicantDashboard';
import TrainingPrograms from '../pages/applicants/TrainingPrograms';
import Login from '../pages/Login';

const ApplicantRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/training-programs" element={<TrainingPrograms />} />
      
    </Routes>
  );
};

export default ApplicantRoutes;
