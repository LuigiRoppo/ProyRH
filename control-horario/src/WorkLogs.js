import React, { useState, useEffect } from 'react';
import { getRegistrosByEmpleadoId } from './apiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './WorkLogs.css';
import moment from 'moment';

function WorkLogs({ employeeId }) {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState(moment().subtract(1, 'month').toDate());
  const [endDate, setEndDate] = useState(new Date());
  const [weeklyHours, setWeeklyHours] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getRegistrosByEmpleadoId(employeeId, startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10));
        const formattedData = data.map(log => ({
          ...log,
          fecha: formatDate(log.fecha)
        }));
        setLogs(formattedData.slice(0, 5)); // Mostrar solo los primeros 5 registros
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
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

      const horasTrabajadas = parseFloat(log.horas_trabajadas);
      acc[key].hoursOrd += horasTrabajadas;
      acc[key].records.push(log);

      return acc;
    }, {});

    const weeklyHoursArray = Object.entries(hoursPerWeek).map(([key, value]) => {
      const [year, week] = key.split('-');
      return { year, week, ...value };
    });

    setWeeklyHours(weeklyHoursArray.slice(0, 5)); // Mostrar solo las primeras 5 semanas
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
          {logs.map((log) => (
            <tr key={log.id_registro}>
              <td>{log.fecha}</td>
              <td>{log.hora_entrada}</td>
              <td>{log.hora_salida}</td>
              <td>{log.horas_trabajadas}</td>
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
          {weeklyHours.map((week, index) => (
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
