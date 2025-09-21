import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
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
import Atttendance from '../pages/lms/Attendance';
import Assessments from '../pages/lms/Assessments';
import AssessmentResults from '../pages/lms/AssessmentResults';
import Certificates from '../pages/lms/Certificates';
import ProfileSettings from '../pages/lms/ProfileSettings';

// applicant routes
import ApplicantDashboard from '../pages/applicants/Dashboard';

// admin
import AdminDashboard from '../pages/admin/Dashboard';
import AdminLogin from '../pages/admin/AdminLogin';

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
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Applicant Routes */}
        <Route path="/applicants/dashboard" element={<ApplicantDashboard />} />

        {/* SMI LMS Dashboard - Direct Route */}
        <Route path="/smi-lms/dashboard" element={<StudentDashboard />} />
        <Route path="/smi-lms/my-courses" element={<MyCourses />} />
        <Route path="/smi-lms/schedule" element={<ClassSchedule />} />
        <Route path="/smi-lms/attendance" element={<Atttendance />} />
        <Route path="/smi-lms/assessments" element={<Assessments />} />
        <Route path="/smi-lms/assessment-results" element={<AssessmentResults />} />
        <Route path="/smi-lms/certificates" element={<Certificates />} />
        <Route path="/smi-lms/profile" element={<ProfileSettings />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
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
