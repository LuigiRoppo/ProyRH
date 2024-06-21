import React, { useState } from 'react';
import moment from 'moment-timezone';
import './AddEmployeeForm.css';
import { getEmpleadoById, getUltimoRegistroByEmpleadoId, marcarEntrada, marcarSalida, getHorarioByEmpleadoId } from './apiService';

function AddEmployeeForm() {
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [step, setStep] = useState(1); 
    const [idRegistro, setIdRegistro] = useState(null);

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

    const handleEntrada = async () => {
        const now = moment().tz('Europe/Madrid'); 
        const fecha = now.format('YYYY-MM-DD');
        const diasSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
        const diaSemana = diasSemana[now.day()]; 
        
        try {
            const horarioArray = await getHorarioByEmpleadoId(employeeId);
            console.log('Horario:', horarioArray);
            const horariosDelDia = horarioArray.filter(h => h.dia_semana === diaSemana);
            console.log('Horarios del día:', horariosDelDia);
    
            if (horariosDelDia.length > 0) {
                const horario = horariosDelDia.reduce((earliest, current) => {
                    return moment(current.hora_inicio, 'HH:mm').isBefore(moment(earliest.hora_inicio, 'HH:mm')) ? current : earliest;
                });
                console.log('Horario seleccionado:', horario);
    
                const horaInicioPermitida = moment(`${fecha}T${horario.hora_inicio}`).subtract(30, 'minutes').tz('Europe/Madrid');
                console.log('Hora de inicio permitida:', horaInicioPermitida.format('HH:mm')); 
                console.log('Hora actual:', now.format('HH:mm'));
    
                if (now.isSameOrAfter(horaInicioPermitida) && now.isBefore(moment(`${fecha}T${horario.hora_fin}`).tz('Europe/Madrid'))) {
                    const entradaRespuesta = await marcarEntrada({
                        id_empleado: employeeId,
                        fecha
                    });
                    console.log('Respuesta de la API:', entradaRespuesta);
                    setIdRegistro(entradaRespuesta.id); 
                    alert('Hora de entrada registrada con éxito');
                    resetForm();
                } else {
                    alert(`No se permite marcar entrada antes de las ${horaInicioPermitida.format('HH:mm')} o después de las ${horario.hora_fin}`);
                }
            } else {
                alert('No se encontró el horario para este empleado o la hora de inicio no está definida.');
            }
        } catch (error) {
            console.error('Error al verificar horario o marcar entrada:', error);
            alert('Error al realizar la operación, Debes marcar dentro del Horario Establecido! ;)');
        }
    };
    
    

    const handleSalida = async () => {
        if (!employeeId) {
            alert("Primero debe ingresar su ID de empleado.");
            return;
        }

        try {
            console.log('Consultando último registro para empleado ID:', employeeId);
            const ultimoRegistro = await getUltimoRegistroByEmpleadoId(employeeId);
            console.log('Último registro obtenido:', ultimoRegistro);
            if (ultimoRegistro && !ultimoRegistro.hora_salida) {
                const salidaRespuesta = await marcarSalida({
                    id_registro: ultimoRegistro.id_registro
                });
                console.log('Respuesta de marcar salida:', salidaRespuesta);
                alert('Hora de salida registrada: ' + salidaRespuesta.message);
                resetForm();
            } else {
                alert('No se encontró un registro de entrada sin hora de salida para este empleado.');
            }
        } catch (error) {
            console.error('Error al marcar salida:', error);
            alert('Error al realizar la operación de salida');
        }
    };

    const resetForm = () => {
        setEmployeeId('');
        setEmployeeName('');
        setStep(1);
        setIdRegistro(null);
    };

    return (
        <div className="form-container">
            {step === 1 ? (
                <div className="form-step">
                    <h1 className="form-title">Control Horario</h1>
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
                <div className="form-step">
                    <h2>Hola, {employeeName}</h2>
                    <div className="action-buttons">
                        <button onClick={handleEntrada} className="button">Marcar Entrada</button>
                        <button onClick={handleSalida} className="button">Marcar Salida</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddEmployeeForm;
