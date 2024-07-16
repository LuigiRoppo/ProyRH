import React, { useState } from 'react';
import moment from 'moment-timezone';
import './AddEmployeeForm.css';
import 
{ getEmpleadoById, 
  getUltimoRegistroByEmpleadoId, 
  marcarEntrada, 
  marcarSalida, 
  getHorarioByEmpleadoId, 
  verificarRegistroExistente 
} from './apiService';

function AddEmployeeForm() {
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [step, setStep] = useState(1); 
    const [idRegistro, setIdRegistro] = useState(null);

    // Función para calcular horas trabajadas
    const calcularHorasTrabajadas = (fechaEntrada, horaEntrada, fechaSalida, horaSalida) => {
        const entrada = moment.tz(`${fechaEntrada}T${horaEntrada}`, 'Europe/Madrid');
        const salida = moment.tz(`${fechaSalida}T${horaSalida}`, 'Europe/Madrid');

        // Manejar cruces de medianoche
        if (salida.isBefore(entrada)) {
            salida.add(1, 'day');
        }

        const duracion = moment.duration(salida.diff(entrada));
        const horas = duracion.asHours();

        return parseFloat(horas.toFixed(2));  // Limitar a 2 decimales
    };
    const handleIdentify = async () => {
        try {
            const empleado = await getEmpleadoById(employeeId);
            if (empleado) {
                const primerNombre = empleado.nombre.split(' ')[0]; 
                setEmployeeName(primerNombre);  
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
        const horaEntrada = now.format('HH:mm:ss');
        
        try {
            const horarioArray = await getHorarioByEmpleadoId(employeeId);
            console.log('Horario:', horarioArray);
            const diasSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"];
            const diaSemana = diasSemana[now.day()];
            const horariosDelDia = horarioArray.filter(h => h.dia_semana === diaSemana);
            console.log('Horarios del día:', horariosDelDia);
    
            if (horariosDelDia.length > 0) {
                for (let i = 0; i < horariosDelDia.length; i++) {
                    const horario = horariosDelDia[i];
                    const registrosExistentes = await verificarRegistroExistente(employeeId, fecha, horario.id_horario);
                    
                    if (registrosExistentes.length === 0) {
                        const horaInicioPermitida = moment(`${fecha}T${horario.hora_inicio}`).subtract(30, 'minutes').tz('Europe/Madrid');
                        const horaFinPermitida = moment(`${fecha}T${horario.hora_inicio}`).add(1, 'hour').tz('Europe/Madrid');
                        console.log('Horario seleccionado:', horario);
                        console.log('Hora de inicio permitida:', horaInicioPermitida.format('HH:mm')); 
                        console.log('Hora de fin permitida:', horaFinPermitida.format('HH:mm'));
                        console.log('Hora actual:', now.format('HH:mm'));
    
                        if (now.isBetween(horaInicioPermitida, horaFinPermitida)) {
                            const entradaRespuesta = await marcarEntrada({
                                id_empleado: employeeId,
                                fecha,
                                hora_entrada: horaEntrada,
                                id_horario: horario.id_horario
                            });
                            console.log('Respuesta de la API:', entradaRespuesta);
                            setIdRegistro(entradaRespuesta.id); 
                            alert('Hora de entrada registrada con éxito');
                            resetForm();
                            return;
                        } else {
                            alert(`No se permite marcar entrada antes de las ${horaInicioPermitida.format('HH:mm')} o después de las ${horaFinPermitida.format('HH:mm')}`);
                            return;
                        }
                    }
                }
                alert('Ya se han registrado entradas para todos los horarios disponibles hoy.');
            } else {
                alert('No se encontró el horario para este empleado o la hora de inicio no está definida.');
            }
        } catch (error) {
            console.error('Error al verificar horario o marcar entrada:', error);
            alert('Error al realizar la operación');
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
                const ahora = moment().tz('Europe/Madrid');
                const horaSalida = ahora.format('HH:mm:ss');
                const horasTrabajadas = calcularHorasTrabajadas(ultimoRegistro.fecha, ultimoRegistro.hora_entrada, ahora.format('YYYY-MM-DD'), horaSalida);
                
                console.log('Fecha de entrada:', ultimoRegistro.fecha);
                console.log('Hora de entrada:', ultimoRegistro.hora_entrada);
                console.log('Hora de salida:', horaSalida);
                console.log('Horas trabajadas:', horasTrabajadas);
    
                const salidaRespuesta = await marcarSalida({
                    id_empleado: employeeId,
                    id_registro: ultimoRegistro.id_registro,  // Agregar el id_registro
                    id_horario: ultimoRegistro.id_horario, // Agregar el id_horario si está disponible
                    hora_salida: horaSalida,
                    horas_trabajadas: horasTrabajadas
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
                    <h2>Hola, {employeeName}! =)</h2>
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
