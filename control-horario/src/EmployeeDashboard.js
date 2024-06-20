import React, { useState } from 'react';
import Schedule from './Schedule';
import WorkLogs from './WorkLogs';
import { getEmpleadoById } from './apiService'; // Importamos la función necesaria
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [step, setStep] = useState(1);
  const [view, setView] = useState(null);

  const handleIdentify = async () => {
    try {
      const empleado = await getEmpleadoById(employeeId);
      if (empleado) {
        setEmployeeName(empleado.nombre);
        setStep(2);
      } else {
        alert('ID de empleado no encontrado.');
      }
    } catch (error) {
      console.error('Error al buscar el empleado:', error);
      alert('Error al buscar el empleado');
    }
  };


  const renderView = () => {
    switch (view) {
      case 'schedule':
        return <Schedule employeeId={employeeId} />;
      case 'worklogs':
        return <WorkLogs employeeId={employeeId} />;
      default:
        return <p>Por favor selecciona una opción</p>;
    }
  };

  return (
    <div className="dashboard">
      {step === 1 ? (
        <div className="form-step">
          <h1 className="form-title">Consultar Información</h1>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Ingrese su ID de empleado"
            className="form-element"
          />
          <button onClick={handleIdentify} className="button">Continuar</button>
        </div>
      ) : (
        <div>
          <div className="center-content">
            <h2>Hola, {employeeName}</h2>
            <div className="navigation-buttons">
              <button onClick={() => setView('schedule')} className="button">Ver mi Horario</button>
              <button onClick={() => setView('worklogs')} className="button">Ver mis Jornadas</button>
            </div>
          </div>
          <div className="content">
            {renderView()}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
