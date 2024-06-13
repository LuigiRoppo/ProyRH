import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard">
            <h1>Panel de Administración</h1>
            <div className="button-group">
                <button onClick={() => navigate('/admin/create-employee')} className="button">Crear Empleado</button>
                <button onClick={() => navigate('/admin/edit-schedule')} className="button">Crear Horario</button>
                <button onClick={() => navigate('/admin/manage-schedules')} className="button">Gestionar Horarios</button>
                <button onClick={() => navigate('/admin/employee-list')} className="button">Ver Lista de Empleados</button>
                <button onClick={() => navigate('/employee')} className="buttonEmployee">Control Horario</button>
                <button onClick={() => navigate('/EmployeeDashboard')} className="buttonEmployee">Panel de Empleado</button>
            </div>
        </div>
    );
};

export default AdminDashboard;
