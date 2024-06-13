import React, { useState, useEffect } from 'react';
import { getHorarioByEmpleadoId } from './apiService'; // Importar la función desde apiService
import './Schedule.css';

const Schedule = ({ employeeId }) => {
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await getHorarioByEmpleadoId(employeeId); // Usar la función importada
        console.log('Horario obtenido del servidor:', data);
        setSchedule(data);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    fetchSchedule();
  }, [employeeId]);

  if (!schedule) {
    return <div>Loading...</div>;
  }

  const hours = [
    "12:00", "13:00", "14:00", "15:00", "16:00", 
    "18:00", "19:00", "20:00", "21:00", "22:00", 
    "23:00", "00:00"
  ];

  const daysOfWeek = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

  const renderSchedule = () => {
    return hours.map(hour => (
      <tr key={hour}>
        <td>{hour}</td>
        {daysOfWeek.map(day => {
          const daySchedule = schedule.find(s => {
            if (s.dia_semana === day) {
              if (s.hora_fin === "00:00") {
                // Manejar el caso donde la hora fin es 00:00
                const isWithinHour = (s.hora_inicio <= hour && hour !== "00:00") || (hour === "00:00" && s.hora_fin === "00:00");
                console.log(`Revisando ${hour} para ${day}: ${isWithinHour}`);
                return isWithinHour;
              } else {
                const isWithinHour = s.hora_inicio <= hour && s.hora_fin >= hour;
                console.log(`Revisando ${hour} para ${day}: ${isWithinHour}`);
                return isWithinHour;
              }
            }
            return false;
          });
          return <td key={day}>{daySchedule ? '✓' : ''}</td>;
        })}
      </tr>
    ));
  };

  return (
    <div>
      <h2>Mi Horario</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Hora</th>
            {daysOfWeek.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {renderSchedule()}
        </tbody>
      </table>
    </div>
  );
};

export default Schedule;
