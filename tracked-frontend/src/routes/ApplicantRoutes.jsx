import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/applicants/ApplicantDashboard';
import TrainingPrograms from '../pages/applicants/TrainingPrograms';
import ManageDocuments from '../pages/applicants/ManageDocuments';
import Login from '../pages/Login';
import ProtectedApplicantRoute from '../components/ProtectedApplicantRoute';

const ApplicantRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedApplicantRoute>
          <Dashboard />
        </ProtectedApplicantRoute>
      } />
      <Route path="/training-programs" element={
        <ProtectedApplicantRoute>
          <TrainingPrograms />
        </ProtectedApplicantRoute>
      } />
      <Route path="/manage-documents" element={
        <ProtectedApplicantRoute>
          <ManageDocuments />
        </ProtectedApplicantRoute>
      } />
    </Routes>
  );
};

export default ApplicantRoutes;
