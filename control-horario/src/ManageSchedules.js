import React, { useState, useEffect } from 'react';
import { getEmpleados, getHorarios, deleteHorario, updateHorario } from './apiService'; // Importamos las funciones necesarias
import './ManageSchedules.css'; 

function ManageSchedules() {
    const [empleados, setEmpleados] = useState([]);
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState('');
    const [horarios, setHorarios] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [selectedUbicacion, setSelectedUbicacion] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const empleadosData = await getEmpleados();
                setEmpleados(empleadosData);
                const uniqueLocations = [...new Set(empleadosData.map(emp => emp.ubicacion).filter(Boolean))];
                setUbicaciones(uniqueLocations);

                const horariosData = await getHorarios();
                setHorarios(horariosData);
            } catch (error) {
                console.error('Error al cargar empleados o horarios:', error);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id_empleado) => {
        try {
            await deleteHorario(id_empleado);
            setHorarios(horarios.filter(horario => horario.id_horario !== id_empleado));
            alert('Horario eliminado con éxito');
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            alert('Error al eliminar horario');
        }
    };

    const handleUpdate = async (horario) => {
        const updatedDia = prompt("Ingrese el nuevo día", horario.dia_semana);
        const updatedInicio = prompt("Ingrese la nueva hora de inicio", horario.hora_inicio);
        const updatedFin = prompt("Ingrese la nueva hora de fin", horario.hora_fin);
    
        if (updatedDia && updatedInicio && updatedFin) {
            try {
                await updateHorario(horario.id_horario, {
                    dia_semana: updatedDia,
                    hora_inicio: updatedInicio,
                    hora_fin: updatedFin
                });
                alert('Horario actualizado con éxito');
                setHorarios(horarios.map(h => h.id_horario === horario.id_horario ? { ...h, dia_semana: updatedDia, hora_inicio: updatedInicio, hora_fin: updatedFin } : h));
            } catch (error) {
                console.error('Error al actualizar horarios:', error);
                alert('Error al actualizar horarios');
            }
        }
    };

    return (
        <div className="form-container">
            <h1 className="form-title">Gestión de Horarios</h1>
            <select
                value={selectedUbicacion}
                onChange={e => setSelectedUbicacion(e.target.value)}
                required
                className="form-element"
            >
                <option value="">Seleccione una Ubicación</option>
                {ubicaciones.map(ubicacion => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                ))}
            </select>
            <select
                value={selectedEmpleadoId}
                onChange={e => setSelectedEmpleadoId(e.target.value)}
                required
                className="form-element"
                disabled={!selectedUbicacion}
            >
                <option value="">Seleccione un Empleado</option>
                {empleados.filter(emp => emp.ubicacion === selectedUbicacion).map(empleado => (
                    <option key={empleado.id_empleado} value={empleado.id_empleado}>{empleado.nombre}</option>
                ))}
            </select>
            {selectedEmpleadoId && horarios.filter(horario => horario.id_empleado.toString() === selectedEmpleadoId).map(horario => (
                <div key={horario.id_horario} className="schedule-item">
                    <div>{horario.dia_semana} {horario.hora_inicio} - {horario.hora_fin}</div>
                    <div className="schedule-actions">
                        <button onClick={() => handleUpdate(horario)}>Editar</button>
                        <button onClick={() => handleDelete(horario.id_horario)}>Eliminar</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ManageSchedules;
