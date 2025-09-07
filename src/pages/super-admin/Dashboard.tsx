import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Overview } from './Overview';
import Hospitals from './Hospitals';

const SuperAdminDashboard = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="hospitals" element={<Hospitals />} />
        {/* Add more routes here as needed */}
      </Route>
    </Routes>
  );
};

export default SuperAdminDashboard;
