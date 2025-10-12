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

const TrainerRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<TrainerLogin />} />
      <Route path="/dashboard" element={<TrainerDashboard />} />
      <Route path="/certification" element={<CertificationManagement />} />
      <Route path="/course-management" element={<CourseManagement />} />
      <Route path="/course-materials" element={<CourseMaterials />} />
      <Route path="/assessments" element={<TrainerAssessments />} />
      <Route path="/attendance" element={<TrainerAttendance />} />
      <Route path="/grades" element={<TrainerGrades />} />
      <Route path="/profile" element={<TrainerProfile />} />
    </Routes>
  );
};

export default TrainerRoutes;
