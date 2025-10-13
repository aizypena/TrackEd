import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import About from '../pages/About';
import CourseOffered from '../pages/CourseOffered';
import FAQ from '../pages/FAQ';
import TermsAndCondition from '../pages/TermsAndCondition';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Application from '../pages/applicants/Application';

import AdminRoutes from './AdminRoutes';
import StudentRoutes from './StudentRoutes';
import TrainerRoutes from './TrainerRoutes';
import StaffRoutes from './StaffRoutes';
import ApplicantRoutes from './ApplicantRoutes';
import NotFound from '../pages/NotFound';

// applicant routes
import ApplicantDashboard from '../pages/applicants/ApplicantDashboard';

// admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminForgotPassword from '../pages/admin/AdminForgotPassword';
import AdminLogin from '../pages/admin/AdminLogin';
import AllUsers from '../pages/admin/AllUsers';
import AdminApplications from '../pages/admin/AdminApplications';
import Enrollments from '../pages/admin/Enrollments';
import EnrollmentTrends from '../pages/admin/EnrollmentTrends';
import ArimaForecasting from '../pages/admin/ArimaForecasting';
import CoursePrograms from '../pages/admin/CoursePrograms';
import BatchManagement from '../pages/admin/BatchManagement';
import VoucherManagement from '../pages/admin/VoucherManagement';
import EnrollmentReports from '../pages/admin/EnrollmentReports';
import AdminAssessmentResults from '../pages/admin/AdminAssessmentResults';
import InventoryUsage from '../pages/admin/InventoryUsage';
import StudentList from '../pages/admin/StudentList';
import SystemSettings from '../pages/admin/SystemSettings';
import SystemLogs from '../pages/admin/SystemLogs';
import AdminProfileSettings from '../pages/admin/AdminProfileSettings';

//trainer
import TrainerLogin from '../pages/trainers/TrainerLogin';

//staff
import StaffLogin from '../pages/staff/StaffLogin';

//student
import StudentLogin from '../pages/lms/StudentLogin';

// Protected Route Component
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Home/Landing Page */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<CourseOffered />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path='/terms-and-conditions' element={<TermsAndCondition />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/application' element={<Application />} />

        {/* Applicant Routes */}
        <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />

        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLogin />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path='/admin/forgot-password' element={<AdminForgotPassword />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />
        <Route
          path="/admin/all-users"
          element={
            <ProtectedAdminRoute>
              <AllUsers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedAdminRoute>
              <AdminApplications />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/enrollments"
          element={
            <ProtectedAdminRoute>
              <Enrollments />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/enrollment-trends"
          element={
            <ProtectedAdminRoute>
              <EnrollmentTrends />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/arima-forecasting"
          element={
            <ProtectedAdminRoute>
              <ArimaForecasting />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/course-programs"
          element={
            <ProtectedAdminRoute>
              <CoursePrograms />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/batch-management"
          element={
            <ProtectedAdminRoute>
              <BatchManagement />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/voucher-management"
          element={
            <ProtectedAdminRoute>
              <VoucherManagement />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/enrollment-reports"
          element={
            <ProtectedAdminRoute>
              <EnrollmentReports />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/assessment-results"
          element={
            <ProtectedAdminRoute>
              <AdminAssessmentResults />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/inventory-usage"
          element={
            <ProtectedAdminRoute>
              <InventoryUsage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/student-list"
          element={
            <ProtectedAdminRoute>
              <StudentList />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/system-settings"
          element={
            <ProtectedAdminRoute>
              <SystemSettings />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/system-logs"
          element={
            <ProtectedAdminRoute>
              <SystemLogs />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/profile-settings"
          element={
            <ProtectedAdminRoute>
              <AdminProfileSettings />
            </ProtectedAdminRoute>
          }
        />

        {/* Student Routes */}
        <Route path="/smi-lms/login" element={<StudentLogin />} />
        <Route path="/smi-lms/*" element={<StudentRoutes />} />
        <Route path="/students" element={<Navigate to="/students/dashboard" replace />} />
        <Route path="/students/*" element={<StudentRoutes />} />
        
        {/* Trainer Routes */}
        <Route path="/trainer-lms/login" element={<TrainerLogin />} />
        <Route path="/trainer-lms" element={<Navigate to="/trainer-lms/dashboard" replace />} />
        <Route path="/trainer-lms/*" element={<TrainerRoutes />} />

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
