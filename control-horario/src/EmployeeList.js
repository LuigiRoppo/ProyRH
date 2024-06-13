import React, { useState, useEffect } from 'react';
import { getEmpleados, deleteEmpleado } from './apiService'; // Importamos las funciones necesarias
import './EmployeeList.css'; 

function EmployeeList() {
    const [empleados, setEmpleados] = useState([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const empleadosData = await getEmpleados();
            setEmpleados(empleadosData);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('¿Está seguro de que desea eliminar este empleado?');
        if (confirmDelete) {
            try {
                await deleteEmpleado(id);
                alert('Empleado eliminado con éxito');
                fetchEmployees(); // Volver a cargar la lista de empleados
            } catch (error) {
                console.error('Error al eliminar empleado:', error);
                alert('Error al eliminar empleado');
            }
        }
    };

    return (
        <div className="list-container">
            <h1 className="list-title">Lista de Empleados</h1>
            <table className="employee-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Ubicación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map(empleado => (
                        <tr key={empleado.id}>
                            <td>{empleado.id}</td>
                            <td>{empleado.nombre}</td>
                            <td>{empleado.ubicacion}</td>
                            <td>
                                <button onClick={() => handleDelete(empleado.id)} className="delete-button">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default EmployeeList;
