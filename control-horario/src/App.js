import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CreateEmployeeForm from './CreateEmployeeForm';
import HorarioForm from './HorarioForm';
import ManageSchedules from './ManageSchedules';
import AddEmployeeForm from './AddEmployeeForm';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';  
import EmployeeList from './EmployeeList';
import EmployeeDashboard from './EmployeeDashboard';
import EmployeeRecords from './EmployeeRecords';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/employee-records/:id_empleado" element={<EmployeeRecords />} />
        <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-employee" element={<CreateEmployeeForm />} />
        <Route path="/admin/edit-schedule" element={<HorarioForm />} />
        <Route path="/admin/manage-schedules" element={<ManageSchedules />} />
        <Route path="/employee" element={<AddEmployeeForm />} />
        <Route path="/admin/employee-list" element={<EmployeeList />} />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

