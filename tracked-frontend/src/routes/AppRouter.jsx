import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import About from '../pages/About';
import CourseOffered from '../pages/CourseOffered';
import FAQ from '../pages/FAQ';
import TermsAndCondition from '../pages/TermsAndCondition';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Application from '../pages/applicants/Application';


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
import CertificationManagement from '../pages/trainers/CertificationManagement';
import CourseManagement from '../pages/trainers/CourseManagement';
import CourseMaterials from '../pages/trainers/CourseMaterials';
import TrainerAssessments from '../pages/trainers/TrainerAssessments';
import TrainerAttendance from '../pages/trainers/TrainerAttendance';
import TrainerDashboard from '../pages/trainers/TrainerDashboard';
import TrainerGrades from '../pages/trainers/TrainerGrades';
import TrainerProfile from '../pages/trainers/TrainerProfile';

// Protected Route Component
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';

// Staff Routes
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffApplications from '../pages/staff/StaffApplications';
import StaffEnrollmentsRecord from '../pages/staff/StaffEnrollmentsRecord';
import StaffDocumentManagement from '../pages/staff/StaffDocumentManagement';
import StaffStudentProfile from '../pages/staff/StaffStudentProfile';
import StaffAcademicRecords from '../pages/staff/StaffAcademicRecords';
import StaffPaymentRecords from '../pages/staff/StaffPaymentRecords';
import StaffTrainingSched from '../pages/staff/StaffTrainingSched';
import StaffBatchManagement from '../pages/staff/StaffBatchManagement';
import StaffAssessmentResults from '../pages/staff/StaffAssessmentResults';

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
        <Route path='/terms-and-conditions' element={<TermsAndCondition />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/application' element={<Application />} />

        {/* Applicant Routes */}
        <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />

        {/* SMI LMS Dashboard - Direct Route (student) */}
        <Route path="/smi-lms/dashboard" element={<StudentDashboard />} />
        <Route path="/smi-lms/my-courses" element={<MyCourses />} />
        <Route path="/smi-lms/schedule" element={<ClassSchedule />} />
        <Route path="/smi-lms/attendance" element={<Atttendance />} />
        <Route path="/smi-lms/assessments" element={<Assessments />} />
        <Route path="/smi-lms/assessment-results" element={<AssessmentResults />} />
        <Route path="/smi-lms/certificates" element={<Certificates />} />
        <Route path="/smi-lms/profile" element={<ProfileSettings />} />

        {/* SMI LMS TRAINER */}

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
        <Route path="/students" element={<Navigate to="/students/dashboard" replace />} />
        <Route path="/students/*" element={<StudentRoutes />} />
        
        {/* Trainer Routes */}
        <Route path="/trainer-lms/certification" element={<CertificationManagement />} />
        <Route path="/trainer-lms/course-management" element={<CourseManagement />} />
        <Route path="/trainer-lms/course-materials" element={<CourseMaterials />} />
        <Route path="/trainer-lms/assessments" element={<TrainerAssessments />} />
        <Route path="/trainer-lms/attendance" element={<TrainerAttendance />} />
        <Route path="/trainer-lms/dashboard" element={<TrainerDashboard />} />
        <Route path="/trainer-lms/grades" element={<TrainerGrades />} />
        <Route path="/trainer-lms/profile" element={<TrainerProfile />} />

        {/* Staff Routes */}
        <Route path="staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/enrollments/applications" element={<StaffApplications />} />
        <Route path="/staff/enrollments/records" element={<StaffEnrollmentsRecord />} />
        <Route path="/staff/enrollments/documents" element={<StaffDocumentManagement />} />
        <Route path='/staff/students/profiles' element={<StaffStudentProfile />} />
        <Route path='/staff/students/academics' element={<StaffAcademicRecords />} />
        <Route path='/staff/students/payments' element={<StaffPaymentRecords />} />
        <Route path='/staff/training/schedule' element={<StaffTrainingSched />} />
        <Route path='/staff/training/batches' element={<StaffBatchManagement />} />
        <Route path='/staff/training/assessments' element={<StaffAssessmentResults />} />
        
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
