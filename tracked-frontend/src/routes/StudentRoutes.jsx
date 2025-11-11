import { Routes, Route } from 'react-router-dom';
import ProtectedStudentRoute from '../components/ProtectedStudentRoute';
import StudentDashboard from '../pages/lms/Dashboard';
import ClassSchedule from '../pages/lms/ClassSchedule';
import Attendance from '../pages/lms/Attendance';
import CourseMaterials from '../pages/lms/CourseMaterials';
import Assessments from '../pages/lms/Assessments';
import TakeAssessment from '../pages/lms/TakeAssessment';
import AssessmentResults from '../pages/lms/AssessmentResults';
import AssessmentResultDetail from '../pages/lms/AssessmentResultDetail';
import Certificates from '../pages/lms/Certificates';
import ProfileSettings from '../pages/lms/ProfileSettings';
import ForgotPassword from '../pages/lms/ForgotPassword';
import ResetPassword from '../pages/lms/ResetPassword';
import Exams from '../pages/lms/Exams';

const StudentRoutes = () => {
  return (
    <Routes>
      {/* SMI LMS Student Routes - accessible at /smi-lms/* */}
      
      {/* Public routes - no authentication required */}
      <Route 
        path="/forgot-password" 
        element={<ForgotPassword />} 
      />
      <Route 
        path="/reset-password" 
        element={<ResetPassword />} 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedStudentRoute>
            <StudentDashboard />
          </ProtectedStudentRoute>
        } 
      />
      <Route 
        path="/schedule" 
        element={
          <ProtectedStudentRoute>
            <ClassSchedule />
          </ProtectedStudentRoute>
        } 
      />
      <Route 
        path="/attendance" 
        element={
          <ProtectedStudentRoute>
            <Attendance />
          </ProtectedStudentRoute>
        } 
      />
      <Route 
        path="/course-materials" 
        element={
          <ProtectedStudentRoute>
            <CourseMaterials />
          </ProtectedStudentRoute>
        } 
      />
      <Route
        path='/exams'
        element={
          <ProtectedStudentRoute>
            <Exams />
          </ProtectedStudentRoute>
        }
      />
      <Route 
        path="/assessments" 
        element={
          <ProtectedStudentRoute>
            <Assessments />
          </ProtectedStudentRoute>
        } 
      />
      <Route 
        path="/take-assessment/:id" 
        element={
          <ProtectedStudentRoute>
            <TakeAssessment />
          </ProtectedStudentRoute>
        } 
      />
      <Route 
        path="/assessment-results" 
        element={
          <ProtectedStudentRoute>
            <AssessmentResults />
          </ProtectedStudentRoute>
        } 
      />
      <Route 
        path="/assessment-result-detail/:attemptId" 
        element={
          <ProtectedStudentRoute>
            <AssessmentResultDetail />
          </ProtectedStudentRoute>
        } 
      />
      <Route 
        path="/certificates" 
        element={
          <ProtectedStudentRoute>
            <Certificates />
          </ProtectedStudentRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedStudentRoute>
            <ProfileSettings />
          </ProtectedStudentRoute>
        } 
      />
    </Routes>
  );
};

export default StudentRoutes;
