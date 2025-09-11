import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Overview } from './Overview';
import Hospitals from './Hospitals';
import Layout from './Layout';
import Users from './Users';
import Reports from './Reports.tsx';
import Billing from './Billing.tsx';
import Settings from './Settings.tsx';

const SuperAdminDashboard = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
        <Route path="billing" element={<Billing />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default SuperAdminDashboard;
