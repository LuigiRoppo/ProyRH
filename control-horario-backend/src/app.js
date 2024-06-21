require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { Client } = require('pg'); 
const bodyParser = require('body-parser');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT || 3001;

// Log para verificar la ruta de DATABASE_URL
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Configuración de CORS
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

// Configurar conexión a PostgreSQL
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Probar conexión a la base de datos
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

// Rutas
app.get('/empleados', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM empleados');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching empleados:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/empleados/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM empleados WHERE id = $1', [id]);
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

// Verificar y actualizar registros pendientes
// Verificar y actualizar registros pendientes
const verificarYActualizarRegistrosPendientes = async () => {
    try {
        const registros = await client.query('SELECT id_registro, id_empleado, fecha, hora_entrada FROM registros_horarios WHERE hora_salida IS NULL');
        for (const registro of registros.rows) {
            const { id_registro, id_empleado, fecha, hora_entrada } = registro;
            const diaIndices = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
            const diaSemana = new Date(fecha).getDay();
            const diaNombreOriginal = diaIndices[diaSemana];
            const diaNombre = diaNombreOriginal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const horarios = await client.query('SELECT hora_fin FROM horarios WHERE id_empleado = $1 AND dia_semana = $2', [id_empleado, diaNombre]);

            if (horarios.rows.length > 0) {
                const ahora = moment().tz('Europe/Madrid');

                // Encuentra la hora de fin más cercana después de la hora de entrada
                const horaFinPermitida = horarios.rows
                    .map(h => moment(`${fecha}T${h.hora_fin}`).tz('Europe/Madrid'))
                    .filter(horaFin => horaFin.isAfter(moment(`${fecha}T${hora_entrada}`).tz('Europe/Madrid')))
                    .reduce((earliest, current) => {
                        return current.isBefore(earliest) ? current : earliest;
                    }, moment('9999-12-31T23:59:59').tz('Europe/Madrid'));

                if (ahora.isAfter(horaFinPermitida)) {
                    const horaSalida = horaFinPermitida.format('HH:mm:ss');
                    await client.query('UPDATE registros_horarios SET hora_salida = $1 WHERE id_registro = $2', [horaSalida, id_registro]);
                    console.log(`Hora de salida actualizada automáticamente para el registro ${id_registro}`);
                }
            }
        }
    } catch (err) {
        console.error("Error en la consulta de registros pendientes:", err.message);
    }
};

// Ejecutar la función cada minuto para pruebas
setInterval(verificarYActualizarRegistrosPendientes, 1 * 60 * 1000);


// Ejecutar la función cada minuto para pruebas
setInterval(verificarYActualizarRegistrosPendientes, 1 * 60 * 1000);

// Otras rutas y lógica de la aplicación...
app.get('/horarios', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM horarios");
        res.send(result.rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get('/horario/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM horarios WHERE id_empleado = $1', [id]);
        res.send(result.rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get('/obtener-horario', async (req, res) => {
    const { dia_semana, id_empleado } = req.query;
    console.log("Consultando horario para empleado", id_empleado, "en día", dia_semana);

    if (!dia_semana || !id_empleado) {
        console.log("Consulta fallida por falta de parámetros.");
        return res.status(400).send({ message: "Falta información para completar la consulta" });
    }

    try {
        const result = await client.query('SELECT hora_inicio, hora_fin FROM horarios WHERE id_empleado = $1 AND dia_semana = $2', [id_empleado, dia_semana]);
        if (result.rows.length > 0) {
            console.log("Horario encontrado:", result.rows[0]);
            res.json(result.rows[0]);
        } else {
            console.log("No se encontró horario para el empleado", id_empleado, "en el día", dia_semana);
            res.status(404).send({ message: "Horario no encontrado para el empleado en el día especificado" });
        }
    } catch (err) {
        console.error("Error en la consulta de horarios:", err.message);
        res.status(500).send({ error: err.message });
    }
});

app.get('/ultimo-registro/:id_empleado', async (req, res) => {
    const idEmpleado = req.params.id_empleado;
    const sql = `
        SELECT * FROM registros_horarios
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

app.get('/registros/:id', async (req, res) => {
    const { id } = req.params;
    const { start, end } = req.query;

    try {
        const result = await client.query('SELECT * FROM registros_horarios WHERE id_empleado = $1 AND fecha BETWEEN $2 AND $3', [id, start, end]);
        res.send(result.rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get('/overtime/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM horas_extras WHERE id_empleado = $1', [id]);
        res.send(result.rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/marcar-entrada', async (req, res) => {
    const { id_empleado, fecha } = req.body;
    console.log(`Datos recibidos para marcar entrada: ${JSON.stringify(req.body)}`);
    const diaIndices = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const diaSemana = new Date(fecha).getDay();
    const diaNombre = diaIndices[diaSemana];

    console.log(`Intentando marcar ENTRADA para empleado ${id_empleado} en día ${diaNombre} (${fecha})`);

    try {
        const horarios = await client.query('SELECT hora_inicio, hora_fin FROM horarios WHERE id_empleado = $1 AND dia_semana = $2', [id_empleado, diaNombre]);
        console.log('Horarios obtenidos de la DB:', horarios.rows);

        if (horarios.rows.length > 0) {
            const horario = horarios.rows.reduce((earliest, current) => {
                return moment(current.hora_inicio, 'HH:mm').isBefore(moment(earliest.hora_inicio, 'HH:mm')) ? current : earliest;
            });

            const ahora = moment().tz('Europe/Madrid');
            const horaInicioPermitida = moment(`${fecha}T${horario.hora_inicio}`).subtract(30, 'minutes').tz('Europe/Madrid');

            console.log(`Horario seleccionado desde la DB: inicio=${horario.hora_inicio}, fin=${horario.hora_fin}`);
            console.log(`Hora actual: ${ahora.format('HH:mm:ss')}`);
            console.log(`Hora de inicio permitida: ${horaInicioPermitida.format('HH:mm:ss')}`);

            if (ahora.isSameOrAfter(horaInicioPermitida) && ahora.isBefore(moment(`${fecha}T${horario.hora_fin}`).tz('Europe/Madrid'))) {
                const horaEntrada = ahora.format('HH:mm:ss');
                const result = await client.query('INSERT INTO registros_horarios (id_empleado, fecha, hora_entrada) VALUES ($1, $2, $3) RETURNING id_registro', [id_empleado, fecha, horaEntrada]);
                console.log('Entrada marcada con éxito para el empleado', id_empleado);
                res.send({ message: 'Entrada marcada con éxito', id_registro: result.rows[0].id_registro });
            } else {
                console.log('No se permite marcar entrada antes de las', horario.hora_inicio, 'o después de las', horario.hora_fin);
                res.status(403).send({ message: 'No se permite marcar entrada antes de las ' + horario.hora_inicio + ' o después de las ' + horario.hora_fin });
            }
        } else {
            console.log('Horario no encontrado para el empleado', id_empleado);
            res.status(404).send({ message: 'Horario no encontrado para el empleado' });
        }
    } catch (err) {
        console.log('Error al buscar horarios en la base de datos:', err.message);
        res.status(500).send({ error: err.message });
    }
});


app.post('/marcar-salida', async (req, res) => {
    const { id_empleado } = req.body;  // Cambiado a id_empleado para recibir el ID del empleado

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

        const { id_registro, fecha } = registro.rows[0];
        const diaIndices = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
        const diaSemana = new Date(fecha).getDay();
        const diaNombre = diaIndices[diaSemana];

        const horario = await client.query('SELECT hora_fin FROM horarios WHERE id_empleado = $1 AND dia_semana = $2', [id_empleado, diaNombre]);

        if (horario.rows.length === 0) {
            console.log("No se encontró horario para el empleado", id_empleado, "el día", diaNombre);
            return res.status(404).send({ message: 'Horario no encontrado para el empleado' });
        }

        console.log(`Horario encontrado: ${JSON.stringify(horario.rows[0])}`);

        const ahora = moment().tz('Europe/Madrid');
        const horaFinPermitida = horario.rows[0].hora_fin === "00:00"
            ? moment(`${fecha}T23:59:59`).add(1, 'minutes').tz('Europe/Madrid')
            : moment(`${fecha}T${horario.rows[0].hora_fin}`).add(1, 'minutes').tz('Europe/Madrid');

        console.log(`Hora fin permitida: ${horaFinPermitida.format('HH:mm:ss')}`);
        console.log(`Hora actual: ${ahora.format('HH:mm:ss')}`);

        if (ahora.isSameOrBefore(horaFinPermitida)) {
            const horaSalida = ahora.format('HH:mm:ss');
            console.log(`Marcando salida con hora: ${horaSalida}`);
            await client.query('UPDATE registros_horarios SET hora_salida = $1 WHERE id_registro = $2', [horaSalida, id_registro]);
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
        const id = await generateUniqueId();
        const result = await client.query('INSERT INTO empleados (id, nombre, ubicacion) VALUES ($1, $2, $3) RETURNING id', [id, nombre, ubicacion]);
        res.send({ message: 'Empleado creado con éxito', id: result.rows[0].id });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});


app.post('/registros-horarios', async (req, res) => {
    const { id_empleado, fecha, hora_entrada, hora_salida } = req.body;

    // Log para verificar los datos recibidos
    console.log('Datos recibidos para inserción:', { id_empleado, fecha, hora_entrada, hora_salida });

    const sql = 'INSERT INTO registros_horarios (id_empleado, fecha, hora_entrada, hora_salida) VALUES ($1, $2, $3, $4) RETURNING id';

    try {
        // Log antes de realizar la inserción
        console.log('Realizando inserción en registros_horarios con la consulta:', sql);
        const result = await client.query(sql, [id_empleado, fecha, hora_entrada, hora_salida]);
        // Log después de una inserción exitosa
        console.log('Inserción exitosa, id del registro creado:', result.rows[0].id);
        res.send({ message: 'Registro horario creado con éxito', id: result.rows[0].id });
    } catch (err) {
        // Log en caso de error
        console.error('Error al insertar en registros_horarios:', err.message);
        res.status(500).send({ error: err.message });
    }
});


app.put('/horarios/:id', async (req, res) => {
    const { id } = req.params;
    const { dia_semana, hora_inicio, hora_fin } = req.body;

    console.log(`Actualizando horario con ID: ${id}, Día: ${dia_semana}, Inicio: ${hora_inicio}, Fin: ${hora_fin}`);

    const sql = `UPDATE horarios SET dia_semana = $1, hora_inicio = $2, hora_fin = $3 WHERE id_horario = $4`;

    try {
        await client.query(sql, [dia_semana, hora_inicio, hora_fin, id]);
        console.log('Horario actualizado con éxito');
        res.send({ message: 'Horario actualizado con éxito' });
    } catch (err) {
        console.error('Error al actualizar el horario:', err);
        res.status(500).send({ error: err.message });
    }
});

app.delete('/horarios/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM horarios WHERE id_horario = $1';

    try {
        await client.query(sql, [id]);
        res.send({ message: 'Horario eliminado con éxito' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete('/empleados/:id', async (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM empleados WHERE id = $1';
    
    try {
        const result = await client.query(sql, [id]);
        res.json({ message: `Empleado con ID ${id} eliminado` });
    } catch (err) {
        console.error('Error al eliminar empleado:', err.message);
        res.status(500).json({ error: err.message });
    }
});


async function generateUniqueId() {
    let id;
    let isUnique = false;
    while (!isUnique) {
        id = Math.floor(1000 + Math.random() * 9000);
        const result = await client.query('SELECT id FROM empleados WHERE id = $1', [id]);
        if (result.rows.length === 0) isUnique = true;
    }
    return id;
}
