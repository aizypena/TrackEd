import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import About from '../pages/About';
import CourseOffered from '../pages/CourseOffered';
import FAQ from '../pages/FAQ';
import StudentDashboard from '../pages/lms/Dashboard';
import AdminRoutes from './AdminRoutes';
import StudentRoutes from './StudentRoutes';
import TrainerRoutes from './TrainerRoutes';
import StaffRoutes from './StaffRoutes';
import ApplicantRoutes from './ApplicantRoutes';
import NotFound from '../pages/NotFound';
import MyCourses from '../pages/lms/MyCourses';
import ClassSchedule from '../pages/lms/ClassSchedule';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Home/Landing Page */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<CourseOffered />} />
        <Route path="/faq" element={<FAQ />} />

        {/* SMI LMS Dashboard - Direct Route */}
        <Route path="/smi-lms/dashboard" element={<StudentDashboard />} />
        <Route path="/smi-lms/my-courses" element={<MyCourses />} />
        <Route path="/smi-lms/schedule" element={<ClassSchedule />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Student Routes */}
        <Route path="/students" element={<Navigate to="/students/dashboard" replace />} />
        <Route path="/students/*" element={<StudentRoutes />} />
        
        {/* Trainer Routes */}
        <Route path="/trainers" element={<Navigate to="/trainers/dashboard" replace />} />
        <Route path="/trainers/*" element={<TrainerRoutes />} />
        
        {/* Staff Routes */}
        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/staff/*" element={<StaffRoutes />} />
        
        {/* Applicant Routes */}
        <Route path="/applicants" element={<Navigate to="/applicants/dashboard" replace />} />
        <Route path="/applicants/*" element={<ApplicantRoutes />} />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
