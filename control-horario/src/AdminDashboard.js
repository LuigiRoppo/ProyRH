import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [targetPath, setTargetPath] = useState('');

    const correctPin = '1234'; 

    const handleButtonClick = (path) => {
        setTargetPath(path);
        setShowPinModal(true);
    };

    const handlePinSubmit = () => {
        if (pin === correctPin) {
            navigate(targetPath);
            setShowPinModal(false);
            setPin('');
        } else {
            alert('PIN incorrecto');
            setPin('');
        }
    };

    return (
        <div className="dashboard">
            <h1>Panel de Administración</h1>
            <div className="button-group">
                <button onClick={() => handleButtonClick('/admin/create-employee')} className="button">Crear Empleado</button>
                <button onClick={() => handleButtonClick('/admin/edit-schedule')} className="button">Crear Horario</button>
                <button onClick={() => handleButtonClick('/admin/manage-schedules')} className="button">Gestionar Horarios</button>
                <button onClick={() => handleButtonClick('/admin/employee-list')} className="button">Ver Lista de Empleados</button>
                <button onClick={() => navigate('/employee')} className="buttonEmployee">Control Horario</button>
                <button onClick={() => navigate('/EmployeeDashboard')} className="buttonEmployee">Panel de Empleado</button>
            </div>

            {showPinModal && (
                <div className="pin-modal">
                    <h2>Ingrese PIN</h2>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                    />
                    <button onClick={handlePinSubmit} className="button">Enviar</button>
                    <button onClick={() => setShowPinModal(false)} className="button">Cancelar</button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
