import React, { useState, useEffect } from 'react';
import { getEmpleados, createHorarios } from './apiService'; // Importamos las funciones necesarias
import './HorarioForm.css'; // Asegúrate de importar tu archivo CSS

function HorarioForm() {
    const [empleados, setEmpleados] = useState([]);
    const [idEmpleado, setIdEmpleado] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [horarios, setHorarios] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [showAddScheduleForm, setShowAddScheduleForm] = useState(false); // Nuevo estado para controlar la visibilidad del formulario de agregar turno

    const DIAS_DE_LA_SEMANA = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const empleadosData = await getEmpleados();
                setEmpleados(empleadosData);

                const uniqueLocations = [...new Set(empleadosData.map(emp => emp.ubicacion).filter(Boolean))];
                setUbicaciones(uniqueLocations);
            } catch (error) {
                console.error('Error al cargar empleados y ubicaciones:', error);
            }
        };

        fetchData();
    }, []);

    const handleAddSchedule = () => {
        setHorarios([...horarios, { dia: '', inicio: '', fin: '' }]);
        setShowAddScheduleForm(true); // Muestra el formulario de agregar turno
    };

    const handleCancelAddSchedule = () => {
        setHorarios(horarios.slice(0, -1)); // Elimina el último horario agregado
        setShowAddScheduleForm(false); // Oculta el formulario de agregar turno
    };

    const handleChangeSchedule = (index, field, value) => {
        const newHorarios = [...horarios];
        newHorarios[index][field] = value;
        setHorarios(newHorarios);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createHorarios(idEmpleado, horarios);
            alert('Horario creado con éxito');
            setIdEmpleado('');
            setUbicacion('');
            setHorarios([]);
            setShowAddScheduleForm(false); // Oculta el formulario de agregar turno después de enviar
        } catch (error) {
            console.error('Error al crear horarios:', error);
            alert('Error al crear horarios');
        }
    };

    const empleadosFiltrados = empleados.filter(empleado => empleado.ubicacion === ubicacion);

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1 className="form-title">Crear Horarios</h1>
            <select
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
                required
                className="form-element"
            >
                <option value="">Seleccione una Ubicación</option>
                {ubicaciones.map(ubicacion => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                ))}
            </select>
            <select
                value={idEmpleado}
                onChange={e => setIdEmpleado(e.target.value)}
                required
                className="form-element"
                disabled={!ubicacion}
            >
                <option value="">Seleccione un Empleado</option>
                {empleadosFiltrados.map(empleado => (
                    <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>
                ))}
            </select>
            {horarios.map((horario, index) => (
                <div key={index} className="schedule-item">
                    <select
                        value={horario.dia}
                        onChange={e => handleChangeSchedule(index, 'dia', e.target.value)}
                        required
                        className="form-element"
                    >
                        <option value="">Seleccione el Día</option>
                        {DIAS_DE_LA_SEMANA.map(dia => (
                            <option key={dia} value={dia}>{dia}</option>
                        ))}
                    </select>
                    <input
                        type="time"
                        value={horario.inicio}
                        onChange={e => handleChangeSchedule(index, 'inicio', e.target.value)}
                        required
                        className="form-element"
                    />
                    <input
                        type="time"
                        value={horario.fin}
                        onChange={e => handleChangeSchedule(index, 'fin', e.target.value)}
                        required
                        className="form-element"
                    />
                    {showAddScheduleForm && index === horarios.length - 1 && (
                        <button type="button" onClick={handleCancelAddSchedule} className="cancel-button">
                            Cancelar
                        </button>
                    )}
                </div>
            ))}
            <button type="button" onClick={handleAddSchedule} className="submit-button">Agregar Turno</button>
            <button type="submit" className="submit-button">Asignar Horario</button>
        </form>
    );
}

export default HorarioForm;
