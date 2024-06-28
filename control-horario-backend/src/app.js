require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const allowedOrigins = [
    'https://proyrh-production.up.railway.app',
    'https://intuitive-solace-production.up.railway.app',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect(err => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        client.query('SELECT NOW()', (err, result) => {
            if (err) {
                console.error('Error executing query', err.stack);
            } else {
                console.log(result.rows);
            }
        });
    }
});

const calcularHorasTrabajadas = (horaEntrada, horaSalida) => {
    const entrada = moment(horaEntrada, 'HH:mm:ss').tz('Europe/Madrid');
    const salida = moment(horaSalida, 'HH:mm:ss').tz('Europe/Madrid');

    if (salida.isBefore(entrada)) {
        salida.add(1, 'day');
    }

    const duracion = moment.duration(salida.diff(entrada));
    const horas = duracion.asHours();

    return horas;
};

app.get('/ultimo-registro/:id_empleado', async (req, res) => {
    const idEmpleado = req.params.id_empleado;
    const sql = `
        SELECT id_registro, id_empleado, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, hora_entrada 
        FROM registros_horarios 
        WHERE id_empleado = $1
        AND hora_salida IS NULL
        ORDER BY id_registro DESC
        LIMIT 1
    `;

    try {
        const result = await client.query(sql, [idEmpleado]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/registros/:id_empleado', async (req, res) => {
    const { id_empleado } = req.params;

    try {
        const result = await client.query('SELECT id_registro, id_empleado, TO_CHAR(fecha, \'YYYY-MM-DD\') as fecha, hora_entrada, hora_salida FROM registros_horarios WHERE id_empleado = $1', [id_empleado]);
        res.send(result.rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

const verificarYActualizarRegistrosPendientes = async () => {
    try {
        console.log("Iniciando verificación de registros pendientes...");

        const registros = await client.query(`
            SELECT id_registro, id_empleado, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, hora_entrada 
            FROM registros_horarios 
            WHERE hora_salida IS NULL
        `);
        console.log("Registros pendientes obtenidos:", registros.rows);

        for (const registro of registros.rows) {
            const { id_registro, id_empleado, fecha, hora_entrada } = registro;
            const diaIndices = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
            const diaSemana = new Date(fecha).getDay();
            const diaNombreOriginal = diaIndices[diaSemana];
            const diaNombre = diaNombreOriginal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const horarios = await client.query('SELECT hora_fin FROM horarios WHERE id_empleado = $1 AND dia_semana = $2', [id_empleado, diaNombre]);
            console.log(`Horarios obtenidos para empleado ${id_empleado} en día ${diaNombre}:`, horarios.rows);

            if (horarios.rows.length > 0) {
                const ahora = moment().tz('Europe/Madrid');
                console.log("Hora actual:", ahora.format('YYYY-MM-DD HH:mm:ss'));

                const fechaHoraFin = moment.tz(`${fecha}T${horarios.rows[0].hora_fin}`, 'Europe/Madrid');
                const horaFinPermitida = fechaHoraFin.add(5, 'minutes');
                console.log("Hora fin permitida después de agregar 5 minutos:", horaFinPermitida.format('YYYY-MM-DD HH:mm:ss'));

                if (ahora.isAfter(horaFinPermitida)) {
                    const horaSalida = moment(fechaHoraFin).add(1, 'minutes').format('HH:mm:ss');
                    const horasTrabajadas = calcularHorasTrabajadas(hora_entrada, horaSalida);
                    await client.query('UPDATE registros_horarios SET hora_salida = $1, horas_trabajadas = $2 WHERE id_registro = $3', [horaSalida, horasTrabajadas, id_registro]);
                    console.log(`Hora de salida actualizada automáticamente para el registro ${id_registro}`);
                } else {
                    console.log(`Todavía no es hora de marcar salida automática para el registro ${id_registro}`);
                }
            } else {
                console.log(`No se encontraron horarios para el empleado ${id_empleado} en el día ${diaNombre}`);
            }
        }
    } catch (err) {
        console.error("Error en la consulta de registros pendientes:", err.message);
    }
};

setInterval(verificarYActualizarRegistrosPendientes, 5 * 60 * 1000);

app.get('/empleados', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM empleados');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching empleados:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/empleados/:id_empleado', async (req, res) => {
    const { id_empleado } = req.params;
    try {
        const result = await client.query('SELECT * FROM empleados WHERE id_empleado = $1', [id_empleado]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Empleado no encontrado' });
        }
    } catch (error) {
        console.error('Error fetching empleado:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/marcar-entrada', async (req, res) => {
    const { id_empleado, fecha, hora_entrada } = req.body;
    console.log(`Datos recibidos para marcar entrada: ${JSON.stringify(req.body)}`);

    const diaIndices = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const diaSemana = new Date(fecha).getDay();
    const diaNombre = diaIndices[diaSemana];

    try {
        const registrosPendientes = await client.query('SELECT * FROM registros_horarios WHERE id_empleado = $1 AND hora_salida IS NULL', [id_empleado]);
        if (registrosPendientes.rows.length > 0) {
            return res.status(403).send({ message: 'No se puede registrar una nueva entrada mientras exista una entrada sin salida registrada.' });
        }

        const horarios = await client.query('SELECT hora_inicio FROM horarios WHERE id_empleado = $1 AND dia_semana = $2', [id_empleado, diaNombre]);
        console.log('Horarios obtenidos de la DB:', horarios.rows);

        if (horarios.rows.length > 0) {
            const horario = horarios.rows[0];
            const ahora = moment(hora_entrada, 'HH:mm:ss').tz('Europe/Madrid');
            const horaInicioPermitida = moment(`${fecha}T${horario.hora_inicio}`).subtract(30, 'minutes').tz('Europe/Madrid');

            console.log(`Horario seleccionado desde la DB: inicio=${horario.hora_inicio}`);
            console.log(`Hora actual: ${ahora.format('HH:mm:ss')}`);
            console.log(`Hora de inicio permitida: ${horaInicioPermitida.format('HH:mm:ss')}`);

            if (ahora.isSameOrAfter(horaInicioPermitida)) {
                const result = await client.query(
                    'INSERT INTO registros_horarios (id_empleado, fecha, hora_entrada) VALUES ($1, $2, $3) RETURNING id_registro',
                    [id_empleado, fecha, hora_entrada]
                );
                console.log('Entrada marcada con éxito para el empleado', id_empleado);
                res.send({ message: 'Entrada marcada con éxito', id_registro: result.rows[0].id_registro });
            } else {
                console.log('No se permite marcar entrada antes de los 30 minutos permitidos');
                res.status(403).send({ message: 'No se permite marcar entrada antes de los 30 minutos permitidos' });
            }
        } else {
            console.log('Horario no encontrado para el empleado', id_empleado);
            res.status(404).send({ message: 'Horario no encontrado para el empleado' });
        }
    } catch (err) {
        console.log('Error al marcar entrada:', err.message);
        res.status(500).send({ error: err.message });
    }
});

app.post('/marcar-salida', async (req, res) => {
    const { id_empleado } = req.body;
    console.log(`Intentando marcar salida para el empleado con ID: ${id_empleado}`);

    try {
        const registro = await client.query(`
            SELECT id_registro, fecha, hora_entrada 
            FROM registros_horarios 
            WHERE id_empleado = $1 AND hora_salida IS NULL 
            ORDER BY id_registro DESC 
            LIMIT 1
        `, [id_empleado]);

        if (registro.rows.length === 0) {
            console.log("No se encontró un registro de entrada sin salida para el empleado:", id_empleado);
            return res.status(404).send({ message: 'No se encontró un registro de entrada sin salida para el empleado' });
        }

        console.log(`Registro encontrado: ${JSON.stringify(registro.rows[0])}`);

        const { id_registro, fecha, hora_entrada } = registro.rows[0];
        const diaIndices = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
        const diaSemana = new Date(fecha).getDay();
        const diaNombre = diaIndices[diaSemana];

        const horarios = await client.query('SELECT hora_fin FROM horarios WHERE id_empleado = $1 AND dia_semana = $2', [id_empleado, diaNombre]);
        if (horarios.rows.length === 0) {
            console.log("No se encontró horario para el empleado", id_empleado, "el día", diaNombre);
            return res.status(404).send({ message: 'Horario no encontrado para el empleado' });
        }

        console.log(`Horario encontrado: ${JSON.stringify(horarios.rows[0])}`);

        const ahora = moment().tz('Europe/Madrid');
        const fechaHoraFin = moment.tz(`${fecha}T${horarios.rows[0].hora_fin}`, 'Europe/Madrid');
        const horaFinPermitida = fechaHoraFin.add(30, 'minutes');

        console.log(`Hora fin permitida: ${horaFinPermitida.format('HH:mm:ss')}`);
        console.log(`Hora actual: ${ahora.format('HH:mm:ss')}`);

        if (ahora.isSameOrBefore(horaFinPermitida)) {
            const horaSalida = ahora.format('HH:mm:ss');
            const horasTrabajadas = calcularHorasTrabajadas(hora_entrada, horaSalida);
            await client.query('UPDATE registros_horarios SET hora_salida = $1, horas_trabajadas = $2 WHERE id_registro = $3', [horaSalida, horasTrabajadas, id_registro]);
            res.send({ message: 'Salida marcada con éxito' });
        } else {
            console.log(`No se permite marcar salida después de las ${horaFinPermitida.format('HH:mm')}`);
            res.status(403).send({ message: `No se permite marcar salida después de las ${horaFinPermitida.format('HH:mm')}` });
        }
    } catch (err) {
        console.error("Error en la consulta del registro:", err.message);
        res.status(500).send({ error: err.message });
    }
});

app.post('/horarios', async (req, res) => {
    const { idEmpleado, horarios } = req.body;
    const sql = 'INSERT INTO horarios (id_empleado, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4)';

    try {
        for (const horario of horarios) {
            await client.query(sql, [idEmpleado, horario.dia, horario.inicio, horario.fin]);
        }
        res.json({ message: 'Horarios creados con éxito' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/empleados', async (req, res) => {
    const { nombre, ubicacion } = req.body;

    try {
        const id_empleado = await generateUniqueId();
        const result = await client.query('INSERT INTO empleados (id_empleado, nombre, ubicacion) VALUES ($1, $2, $3) RETURNING id_empleado', [id_empleado, nombre, ubicacion]);
        res.send({ message: 'Empleado creado con éxito', id_empleado: result.rows[0].id_empleado });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put('/horarios/:id_horario', async (req, res) => {
    const { id_horario } = req.params;
    const { dia_semana, hora_inicio, hora_fin } = req.body;

    console.log(`Actualizando horario con ID: ${id_horario}, Día: ${dia_semana}, Inicio: ${hora_inicio}, Fin: ${hora_fin}`);

    const sql = `UPDATE horarios SET dia_semana = $1, hora_inicio = $2, hora_fin = $3 WHERE id_horario = $4`;

    try {
        await client.query(sql, [dia_semana, hora_inicio, hora_fin, id_horario]);
        console.log('Horario actualizado con éxito');
        res.send({ message: 'Horario actualizado con éxito' });
    } catch (err) {
        console.error('Error al actualizar el horario:', err);
        res.status(500).send({ error: err.message });
    }
});

app.delete('/horarios/:id_horario', async (req, res) => {
    const { id_horario } = req.params;
    const sql = 'DELETE FROM horarios WHERE id_horario = $1';

    try {
        await client.query(sql, [id_horario]);
        res.send({ message: 'Horario eliminado con éxito' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/empleados/:id_empleado', async (req, res) => {
    const id_empleado = req.params.id_empleado;

    try {
        await client.query('BEGIN');

        const sql = 'DELETE FROM empleados WHERE id_empleado = $1';
        await client.query(sql, [id_empleado]);

        await client.query('COMMIT');

        res.json({ message: `Empleado con id_empleado ${id_empleado} eliminado` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar empleado:', err.message);
        res.status(500).json({ error: 'Error al eliminar empleado', details: err.message });
    }
});

async function generateUniqueId() {
    let id_empleado;
    let isUnique = false;
    while (!isUnique) {
        id_empleado = Math.floor(1000 + Math.random() * 9000);
        const result = await client.query('SELECT id_empleado FROM empleados WHERE id_empleado = $1', [id_empleado]);
        if (result.rows.length === 0) isUnique = true;
    }
    return id_empleado;
}
