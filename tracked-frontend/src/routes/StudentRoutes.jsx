import { Routes, Route } from 'react-router-dom';
import ProtectedStudentRoute from '../components/ProtectedStudentRoute';
import StudentDashboard from '../pages/lms/Dashboard';
import ClassSchedule from '../pages/lms/ClassSchedule';
import Attendance from '../pages/lms/Attendance';
import Assessments from '../pages/lms/Assessments';
import AssessmentResults from '../pages/lms/AssessmentResults';
import Certificates from '../pages/lms/Certificates';
import ProfileSettings from '../pages/lms/ProfileSettings';

const StudentRoutes = () => {
  return (
    <Routes>
      {/* SMI LMS Student Routes - accessible at /smi-lms/* */}
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
        path="/assessments" 
        element={
          <ProtectedStudentRoute>
            <Assessments />
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
