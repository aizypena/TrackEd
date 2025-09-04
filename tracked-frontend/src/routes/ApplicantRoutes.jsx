import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/applicants/Dashboard';

const ApplicantRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Add more applicant routes here as needed */}
      {/* <Route path="/application" element={<ApplicationForm />} /> */}
      {/* <Route path="/status" element={<ApplicationStatus />} /> */}
      {/* <Route path="/programs" element={<AvailablePrograms />} /> */}
      {/* <Route path="/documents" element={<DocumentUpload />} /> */}
    </Routes>
  );
};

export default ApplicantRoutes;
