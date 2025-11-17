import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import About from '../pages/About';
import CourseOffered from '../pages/CourseOffered';
import FAQ from '../pages/FAQ';
import ContactUs from '../pages/ContactUs';
import TermsAndCondition from '../pages/TermsAndCondition';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Application from '../pages/applicants/Application';

import AdminRoutes from './AdminRoutes';
import StudentRoutes from './StudentRoutes';
import TrainerRoutes from './TrainerRoutes';
import StaffRoutes from './StaffRoutes';
import ApplicantRoutes from './ApplicantRoutes';
import NotFound from '../pages/NotFound';

// Applicant routes
import ApplicantDashboard from '../pages/applicants/ApplicantDashboard';

// Auth pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminForgotPassword from '../pages/admin/AdminForgotPassword';
import TrainerLogin from '../pages/trainers/TrainerLogin';
import StaffLogin from '../pages/staff/StaffLogin';
import StudentLogin from '../pages/lms/StudentLogin';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Home/Landing Page */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<CourseOffered />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path='/terms-and-conditions' element={<TermsAndCondition />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/application' element={<Application />} />

        {/* Applicant Routes */}
        <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Trainer Routes */}
        <Route path="/trainer-lms/login" element={<TrainerLogin />} />
        <Route path="/trainer-lms" element={<Navigate to="/trainer-lms/dashboard" replace />} />
        <Route path="/trainer-lms/*" element={<TrainerRoutes />} />

        {/* Student Routes */}
        <Route path="/smi-lms/login" element={<StudentLogin />} />
        <Route path="/smi-lms/*" element={<StudentRoutes />} />
        <Route path="/students" element={<Navigate to="/students/dashboard" replace />} />
        <Route path="/students/*" element={<StudentRoutes />} />

        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/staff/*" element={<StaffRoutes />} />

        {/* Applicant Routes */}
        <Route path="/applicant" element={<Navigate to="/applicant/dashboard" replace />} />
        <Route path="/applicant/*" element={<ApplicantRoutes />} />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
