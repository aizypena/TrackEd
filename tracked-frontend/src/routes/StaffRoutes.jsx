import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/staff/Dashboard';

const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Add more staff routes here as needed */}
      {/* <Route path="/schedule" element={<ScheduleManagement />} /> */}
      {/* <Route path="/resources" element={<ResourceAllocation />} /> */}
      {/* <Route path="/communication" element={<Communication />} /> */}
      {/* <Route path="/reports" element={<StaffReports />} /> */}
    </Routes>
  );
};

export default StaffRoutes;
