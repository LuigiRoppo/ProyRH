import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRegistrosByEmpleadoId } from './apiService';
import './EmployeeRecords.css';
import moment from 'moment';

const EmployeeRecords = () => {
    const { id_empleado } = useParams();
    const [registros, setRegistros] = useState([]);

    useEffect(() => {
        fetchRegistros();
    }, [id_empleado]);

    const fetchRegistros = async () => {
        try {
            const end = moment().format('YYYY-MM-DD');
            const start = moment().subtract(1, 'month').format('YYYY-MM-DD');
            const registrosData = await getRegistrosByEmpleadoId(id_empleado, start, end);
            console.log('Registros obtenidos:', registrosData);
            setRegistros(registrosData);
        } catch (error) {
            console.error('Error al cargar registros:', error);
        }
    };

    return (
        <div className="records-container">
            <h1>Registros de Empleado {id_empleado}</h1>
            <table className="records-table">
                <thead>
                    <tr>
                        <th>ID Registro</th>
                        <th>Fecha</th>
                        <th>Hora Entrada</th>
                        <th>Hora Salida</th>
                        <th>Horas Trabajadas</th>
                    </tr>
                </thead>
                <tbody>
                    {registros.map(registro => (
                        <tr key={registro.id_registro}>
                            <td>{registro.id_registro}</td>
                            <td>{registro.fecha}</td>
                            <td>{registro.hora_entrada}</td>
                            <td>{registro.hora_salida}</td>
                            <td>{registro.horas_trabajadas ? registro.horas_trabajadas.toFixed(2) : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeRecords;
