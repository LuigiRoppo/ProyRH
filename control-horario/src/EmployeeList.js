import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmpleados, deleteEmpleado } from './apiService'; 
import './EmployeeList.css'; 

function EmployeeList() {
    const [empleados, setEmpleados] = useState([]);
    const navigate = useNavigate();

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
                fetchEmployees(); 
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
                        <th>id_empleado</th>
                        <th>Nombre</th>
                        <th>Ubicación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map(empleado => (
                        <tr key={empleado.id_empleado}>
                            <td>{empleado.id_empleado}</td>
                            <td>{empleado.nombre}</td>
                            <td>{empleado.ubicacion}</td>
                            <td>
                                <button onClick={() => handleDelete(empleado.id_empleado)} className="delete-button">Eliminar</button>
                                <button onClick={() => navigate(`/employee-records/${empleado.id_empleado}`)} className="view-records-button">Ver Registros</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default EmployeeList;
