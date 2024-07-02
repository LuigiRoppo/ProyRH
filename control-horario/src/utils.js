// control-horario-frontend/src/utils/utils.js

import moment from 'moment-timezone';

export const calcularHorasTrabajadas = (fechaEntrada, horaEntrada, fechaSalida, horaSalida) => {
    const entrada = moment.tz(`${fechaEntrada}T${horaEntrada}`, 'Europe/Madrid');
    const salida = moment.tz(`${fechaSalida}T${horaSalida}`, 'Europe/Madrid');

    // Manejar cruces de medianoche
    if (salida.isBefore(entrada)) {
        salida.add(1, 'day');
    }

    const duracion = moment.duration(salida.diff(entrada));
    const horas = duracion.asHours();

    return parseFloat(horas.toFixed(2));  // Limitar a 2 decimales
};
