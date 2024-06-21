// src/Overtime.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Overtime = ({ employeeId }) => {
  const [overtime, setOvertime] = useState([]);

  useEffect(() => {
    const fetchOvertime = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/horas_extras/${employeeId}`);
        setOvertime(response.data);
      } catch (error) {
        console.error('Error fetching overtime:', error);
      }
    };

    fetchOvertime();
  }, [employeeId]);

  if (!overtime.length) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Mis Horas Extras</h2>
      <table>
        <thead>
          <tr>
            {/* <th>Fecha</th>
            <th>Horas Extras</th> */}
          </tr>
        </thead>
        <tbody>
          {overtime.map((entry) => (
            <tr key={entry.fecha}>
              <td>{entry.fecha}</td>
              <td>{entry.horas_extras}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Overtime;
