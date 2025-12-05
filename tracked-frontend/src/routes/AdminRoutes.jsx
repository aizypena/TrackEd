import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AllUsers from '../pages/admin/AllUsers';
import AddUser from '../pages/admin/AddUser';
import AdminApplications from '../pages/admin/AdminApplications';
import Enrollments from '../pages/admin/Enrollments';
import EnrollmentTrends from '../pages/admin/EnrollmentTrends';
import ArimaForecasting from '../pages/admin/ArimaForecasting';
import CoursePrograms from '../pages/admin/CoursePrograms';
import BatchManagement from '../pages/admin/BatchManagement';
import VoucherManagement from '../pages/admin/VoucherManagement';
import AdminCourseMaterials from '../pages/admin/AdminCourseMaterials';
import EnrollmentReports from '../pages/admin/EnrollmentReports';
import AdminAssessmentResults from '../pages/admin/AdminAssessmentResults';
import InventoryUsage from '../pages/admin/InventoryUsage';
import StudentList from '../pages/admin/StudentList';
import AdminCertificates from '../pages/admin/AdminCertificates';
import AdminEquipment from '../pages/admin/AdminEquipment';
import AdminStockTransactions from '../pages/admin/AdminStockTransactions';
import SystemSettings from '../pages/admin/SystemSettings';
import SystemLogs from '../pages/admin/SystemLogs';
import ContactMessages from '../pages/admin/ContactMessages';
import AdminProfileSettings from '../pages/admin/AdminProfileSettings';
import NotFound from '../pages/NotFound';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />

      {/* User Management */}
      <Route
        path="/all-users"
        element={
          <ProtectedAdminRoute>
            <AllUsers />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/users/add"
        element={
          <ProtectedAdminRoute>
            <AddUser />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedAdminRoute>
            <AdminApplications />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/enrollments"
        element={
          <ProtectedAdminRoute>
            <Enrollments />
          </ProtectedAdminRoute>
        }
      />

      {/* Reports Management */}
      <Route
        path="/enrollment-trends"
        element={
          <ProtectedAdminRoute>
            <EnrollmentTrends />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/arima-forecasting"
        element={
          <ProtectedAdminRoute>
            <ArimaForecasting />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/enrollment-reports"
        element={
          <ProtectedAdminRoute>
            <EnrollmentReports />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/assessment-results"
        element={
          <ProtectedAdminRoute>
            <AdminAssessmentResults />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/inventory-usage"
        element={
          <ProtectedAdminRoute>
            <InventoryUsage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/student-list"
        element={
          <ProtectedAdminRoute>
            <StudentList />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedAdminRoute>
            <AdminCertificates />
          </ProtectedAdminRoute>
        }
      />

      {/* Program Management */}
      <Route
        path="/course-programs"
        element={
          <ProtectedAdminRoute>
            <CoursePrograms />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/batch-management"
        element={
          <ProtectedAdminRoute>
            <BatchManagement />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/voucher-management"
        element={
          <ProtectedAdminRoute>
            <VoucherManagement />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/course-materials"
        element={
          <ProtectedAdminRoute>
            <AdminCourseMaterials />
          </ProtectedAdminRoute>
        }
      />

      {/* Inventory Management */}
      <Route
        path="/equipment"
        element={
          <ProtectedAdminRoute>
            <AdminEquipment />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/stock-transactions"
        element={
          <ProtectedAdminRoute>
            <AdminStockTransactions />
          </ProtectedAdminRoute>
        }
      />

      {/* System Management */}
      <Route
        path="/system-settings"
        element={
          <ProtectedAdminRoute>
            <SystemSettings />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/system-logs"
        element={
          <ProtectedAdminRoute>
            <SystemLogs />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/contact-messages"
        element={
          <ProtectedAdminRoute>
            <ContactMessages />
          </ProtectedAdminRoute>
        }
      />

      {/* Profile Settings */}
      <Route
        path="/profile-settings"
        element={
          <ProtectedAdminRoute>
            <AdminProfileSettings />
          </ProtectedAdminRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;