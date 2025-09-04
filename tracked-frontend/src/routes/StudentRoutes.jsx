import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/students/Dashboard';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Add more student routes here as needed */}
      {/* <Route path="/courses" element={<MyCourses />} /> */}
      {/* <Route path="/assignments" element={<Assignments />} /> */}
      {/* <Route path="/progress" element={<Progress />} /> */}
      {/* <Route path="/profile" element={<Profile />} /> */}
    </Routes>
  );
};

export default StudentRoutes;
