import { Routes, Route } from 'react-router-dom';
import TrainerDashboard from '../pages/trainers/TrainerDashboard';

const TrainerRoutes = () => {
  return (
    <Routes>
      <Route path="/trainer-dashboard" element={<Dashboard />} />
      {/* Add more trainer routes here as needed */}
      {/* <Route path="/classes" element={<MyClasses />} /> */}
      {/* <Route path="/students" element={<StudentProgress />} /> */}
      {/* <Route path="/materials" element={<CourseMaterials />} /> */}
      {/* <Route path="/schedule" element={<Schedule />} /> */}
    </Routes>
  );
};

export default TrainerRoutes;
