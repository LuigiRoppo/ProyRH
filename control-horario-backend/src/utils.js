// src/utils.js

const moment = require('moment-timezone');

const calcularHorasTrabajadas = (fechaEntrada, horaEntrada, fechaSalida, horaSalida) => {
    const entrada = moment.tz(`${fechaEntrada}T${horaEntrada}`, 'Europe/Madrid');
    const salida = moment.tz(`${fechaSalida}T${horaSalida}`, 'Europe/Madrid');

    if (salida.isBefore(entrada)) {
        salida.add(1, 'day');
    }

    const duracion = moment.duration(salida.diff(entrada));
    const horas = duracion.asHours();

    return parseFloat(horas.toFixed(2));
};

module.exports = { calcularHorasTrabajadas };
// src/utils.js

const moment = require('moment-timezone');

