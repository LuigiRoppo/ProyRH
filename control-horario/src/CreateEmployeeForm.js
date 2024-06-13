import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmpleado } from './apiService'; // Importar la función desde apiService.js
import './CreateEmployeeForm.css';

function CreateEmployeeForm() {
    const [nombre, setNombre] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await createEmpleado({ nombre, ubicacion }); // Usar la función de apiService
            alert('Empleado creado con éxito');
            setNombre('');
            setUbicacion('');
        } catch (error) {
            console.error('Error al crear empleado:', error);
            alert('Error al crear empleado');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1 className="form-title">Crear un Nuevo Empleado</h1>
            <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Nombre del Empleado"
                required
                className="form-element"
            />
            <select
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
                required
                className="form-element"
            >
                <option value="">Seleccione una Ubicación</option>
                <option value="Ubicación 1">Ubicación 1</option>
                <option value="Ubicación 2">Ubicación 2</option>
                <option value="Ubicación 3">Ubicación 3</option>
                <option value="Ubicación 4">Ubicación 4</option>
            </select>
            <div className="button-group">
                <button type="submit" className="button">Crear Empleado</button>
                <button type="button" className="button" onClick={() => navigate('/admin/dashboard')}>Volver al Panel</button>
            </div>
        </form>
    );
}

export default CreateEmployeeForm;
