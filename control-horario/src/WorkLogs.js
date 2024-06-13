import React, { useState, useEffect } from 'react';
import { getRegistrosByEmpleadoId } from './apiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './WorkLogs.css';
import moment from 'moment'; // Importamos moment.js

function WorkLogs({ employeeId }) {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [weeklyHours, setWeeklyHours] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getRegistrosByEmpleadoId(employeeId, startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10));
        const formattedData = data.map(log => ({
          ...log,
          fecha: formatDate(log.fecha),
          horasTrabajadas: calculateHours(log.hora_entrada, log.hora_salida)
        }));
        setLogs(formattedData);
        calculateWeeklyHours(formattedData);
      } catch (error) {
        console.error('Error fetching work logs:', error);
      }
    };

    fetchLogs();
  }, [startDate, endDate, employeeId]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son base 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const calculateHours = (horaEntrada, horaSalida) => {
    if (!horaSalida) return 0;
    const entrada = moment(horaEntrada, 'HH:mm:ss');
    const salida = moment(horaSalida, 'HH:mm:ss');
    const diff = salida.diff(entrada, 'hours', true); // Diferencia en horas (decimal)
    return diff.toFixed(2);
  };
  const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - startOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return weekNumber;
  };
  const calculateWeeklyHours = (logs) => {
    const hoursPerWeek = logs.reduce((acc, log) => {
      const date = new Date(log.fecha.split('/').reverse().join('-'));
      const week = getWeekNumber(date);
      const year = date.getFullYear();

      const key = `${year}-${week}`;
      if (!acc[key]) acc[key] = { hoursOrd: 0, records: [] };

      const horasTrabajadas = parseFloat(log.horasTrabajadas);
      acc[key].hoursOrd += horasTrabajadas;
      acc[key].records.push(log);

      return acc;
    }, {});

    const weeklyHoursArray = Object.entries(hoursPerWeek).map(([key, value]) => {
      const [year, week] = key.split('-');
      return { year, week, ...value };
    });

    setWeeklyHours(weeklyHoursArray);
  };

  return (
    <div className="work-logs">
      <h2>Mis Jornadas</h2>
      <div className="date-picker-container">
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" />
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora Entrada</th>
            <th>Hora Salida</th>
            <th>Horas Trabajadas</th>
          </tr>
        </thead>
        <tbody>
          {logs.slice(-5).map((log) => (  // Mostrar solo las últimas 5 jornadas
            <tr key={log.id_registro}>
              <td>{log.fecha}</td>
              <td>{log.hora_entrada}</td>
              <td>{log.hora_salida}</td>
              <td>{log.horasTrabajadas}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Horas semanales</h3>
      <table className="table">
        <thead>
          <tr>
            <th>RID</th>
            <th>Año</th>
            <th>Semana</th>
            <th>Horas Ordinarias</th>
          </tr>
        </thead>
        <tbody>
          {weeklyHours.slice(-10).map((week, index) => (  // Mostrar solo las últimas 10 semanas
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{week.year}</td>
              <td>{week.week}</td>
              <td>{week.hoursOrd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WorkLogs;
