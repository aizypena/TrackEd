import { Routes, Route } from 'react-router-dom';
import ProtectedStaffRoute from '../components/ProtectedStaffRoute';
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffApplications from '../pages/staff/StaffApplications';
import StaffApplicantView from '../pages/staff/StaffApplicantView';
import StaffEnrollmentsRecord from '../pages/staff/StaffEnrollmentsRecord';
import StaffDocumentManagement from '../pages/staff/StaffDocumentManagement';
import StaffStudentProfile from '../pages/staff/StaffStudentProfile';
import StaffAcademicRecords from '../pages/staff/StaffAcademicRecords';
import StaffPaymentRecords from '../pages/staff/StaffPaymentRecords';
import StaffTrainingSched from '../pages/staff/StaffTrainingSched';
import StaffBatchManagement from '../pages/staff/StaffBatchManagement';
import StaffAssessmentResults from '../pages/staff/StaffAssessmentResults';
import StaffEquipment from '../pages/staff/StaffEquipment';
import StaffStockTransactions from '../pages/staff/StaffStockTransactions';
import StaffEnrollmentTrends from '../pages/staff/StaffEnrollmentTrends';

const StaffRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedStaffRoute><StaffDashboard /></ProtectedStaffRoute>} />
      
      {/* Enrollment Management */}
      <Route path="/enrollments/applications" element={<ProtectedStaffRoute><StaffApplications /></ProtectedStaffRoute>} />
      <Route path="/enrollments/applications/:id" element={<ProtectedStaffRoute><StaffApplicantView /></ProtectedStaffRoute>} />
      <Route path="/enrollments/records" element={<ProtectedStaffRoute><StaffEnrollmentsRecord /></ProtectedStaffRoute>} />
      <Route path="/enrollments/documents" element={<ProtectedStaffRoute><StaffDocumentManagement /></ProtectedStaffRoute>} />
      
      {/* Student Management */}
      <Route path="/students/profiles" element={<ProtectedStaffRoute><StaffStudentProfile /></ProtectedStaffRoute>} />
      <Route path="/students/academics" element={<ProtectedStaffRoute><StaffAcademicRecords /></ProtectedStaffRoute>} />
      <Route path="/students/payments" element={<ProtectedStaffRoute><StaffPaymentRecords /></ProtectedStaffRoute>} />
      
      {/* Training Management */}
      <Route path="/training/schedule" element={<ProtectedStaffRoute><StaffTrainingSched /></ProtectedStaffRoute>} />
      <Route path="/training/batches" element={<ProtectedStaffRoute><StaffBatchManagement /></ProtectedStaffRoute>} />
      <Route path="/training/assessments" element={<ProtectedStaffRoute><StaffAssessmentResults /></ProtectedStaffRoute>} />
      
      {/* Inventory Management */}
      <Route path="/inventory/equipment" element={<ProtectedStaffRoute><StaffEquipment /></ProtectedStaffRoute>} />
      <Route path="/inventory/transactions" element={<ProtectedStaffRoute><StaffStockTransactions /></ProtectedStaffRoute>} />
      
      {/* Analytics */}
      <Route path="/analytics/enrollment" element={<ProtectedStaffRoute><StaffEnrollmentTrends /></ProtectedStaffRoute>} />
    </Routes>
  );
};

export default StaffRoutes;
