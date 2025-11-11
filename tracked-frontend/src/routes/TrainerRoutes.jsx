import { Routes, Route } from 'react-router-dom';
import TrainerDashboard from '../pages/trainers/TrainerDashboard';
import TrainerLogin from '../pages/trainers/TrainerLogin';
import CertificationManagement from '../pages/trainers/CertificationManagement';
import CourseManagement from '../pages/trainers/CourseManagement';
import CourseMaterials from '../pages/trainers/CourseMaterials';
import TrainerAssessments from '../pages/trainers/TrainerAssessments';
import TrainerAttendance from '../pages/trainers/TrainerAttendance';
import TrainerGrades from '../pages/trainers/TrainerGrades';
import TrainerProfile from '../pages/trainers/TrainerProfile';
import TrainerExams from '../pages/trainers/TrainerExams';
import TrainerExamDetails from '../pages/trainers/TrainerExamDetails';
import ProtectedTrainerRoute from '../components/ProtectedTrainerRoute';
import TrainerAnnouncements from '../pages/trainers/TrainerAnnouncements';

const TrainerRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<TrainerLogin />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedTrainerRoute>
            <TrainerDashboard />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/certification" 
        element={
          <ProtectedTrainerRoute>
            <CertificationManagement />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/course-management" 
        element={
          <ProtectedTrainerRoute>
            <CourseManagement />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/course-materials" 
        element={
          <ProtectedTrainerRoute>
            <CourseMaterials />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/announcements" 
        element={
          <ProtectedTrainerRoute>
            <TrainerAnnouncements />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/assessment-management" 
        element={
          <ProtectedTrainerRoute>
            <TrainerAssessments />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/assessments" 
        element={
          <ProtectedTrainerRoute>
            <TrainerAssessments />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/attendance" 
        element={
          <ProtectedTrainerRoute>
            <TrainerAttendance />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/exams" 
        element={
          <ProtectedTrainerRoute>
            <TrainerExams />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/exams/:examId" 
        element={
          <ProtectedTrainerRoute>
            <TrainerExamDetails />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/grades" 
        element={
          <ProtectedTrainerRoute>
            <TrainerGrades />
          </ProtectedTrainerRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedTrainerRoute>
            <TrainerProfile />
          </ProtectedTrainerRoute>
        } 
      />
    </Routes>
  );
};

export default TrainerRoutes;
