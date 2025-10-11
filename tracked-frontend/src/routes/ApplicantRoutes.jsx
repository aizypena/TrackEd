import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/applicants/ApplicantDashboard';
import TrainingPrograms from '../pages/applicants/TrainingPrograms';
import ManageDocuments from '../pages/applicants/ManageDocuments';
import Login from '../pages/Login';

const ApplicantRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/training-programs" element={<TrainingPrograms />} />
      <Route path="/manage-documents" element={<ManageDocuments />} />
      
    </Routes>
  );
};

export default ApplicantRoutes;
