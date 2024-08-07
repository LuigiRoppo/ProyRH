import axios from 'axios';

// URL base del backend
const BASE_URL = process.env.REACT_APP_API_URL || 'https://proyrh-production.up.railway.app';

// Funciones de Empleados
export const getEmpleados = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/empleados`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        throw error;
    }
};
export const getEmpleadoById = async (id_empleado) => {
    try {
        const response = await axios.get(`${BASE_URL}/empleados/${id_empleado}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener empleado con ID ${id_empleado}:`, error);
        throw error;
    }
};
export const createEmpleado = async (empleado) => {
    try {
        const response = await axios.post(`${BASE_URL}/empleados`, empleado);
        return response.data;
    } catch (error) {
        console.error('Error al crear empleado:', error);
        throw error;
    }
};
export const deleteEmpleado = async (id_empleado) => {
    try {
        const response = await axios.delete(`${BASE_URL}/empleados/${id_empleado}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar empleado con ID ${id_empleado}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al eliminar empleado');
    }
};
export const getHorarios = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/horarios`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        throw error;
    }
};
export const getHorarioByEmpleadoId = async (id_empleado) => {
    try {
        const response = await axios.get(`${BASE_URL}/horario/${id_empleado}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener horario para empleado con ID ${id_empleado}:`, error);
        throw error;
    }
};
export const createHorarios = async (idEmpleado, horarios) => {
    try {
        const response = await axios.post(`${BASE_URL}/horarios`, { idEmpleado, horarios });
        return response.data;
    } catch (error) {
        console.error('Error al crear horarios:', error);
        throw error;
    }
};
export const updateHorario = async (id_horario, horario) => {
    try {
        const response = await axios.put(`${BASE_URL}/horarios/${id_horario}`, horario);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar horario con ID ${id_horario}:`, error);
        throw error;
    }
};
export const deleteHorario = async (id_horario) => {
    try {
        const response = await axios.delete(`${BASE_URL}/horarios/${id_horario}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar horario con ID ${id_horario}:`, error);
        throw error;
    }
};
export const getUltimoRegistroByEmpleadoId = async (idEmpleado) => {
    try {
        const response = await axios.get(`${BASE_URL}/ultimo-registro/${idEmpleado}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el último registro del empleado con ID ${idEmpleado}:`, error);
        throw error;
    }
};
export const getRegistrosByEmpleadoId = async (id_empleado, startDate, endDate) => {
    try {
        console.log(`Obteniendo registros para el empleado con ID: ${id_empleado} entre ${startDate} y ${endDate}`);
        const response = await axios.get(`${BASE_URL}/registros/${id_empleado}`, {
            params: { startDate, endDate }
        });
        console.log('Registros obtenidos:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al obtener registros para el empleado con ID:', id_empleado, error);
        throw error;
    }
};
export const marcarEntrada = async (registro) => {
    try {
        console.log('Enviando datos a marcarEntrada:', registro);
        const response = await axios.post(`${BASE_URL}/marcar-entrada`, registro);
        console.log('Respuesta recibida de marcarEntrada:', response);
        return response.data;
    } catch (error) {
        console.error('Error al marcar entrada:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const marcarSalida = async (registro) => {
    console.log('Enviando datos a marcarSalida:', registro);
    try {
        const response = await axios.post(`${BASE_URL}/marcar-salida`, registro);
        console.log('Respuesta del servidor:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al marcar salida:', error);
        if (error.response) {
            console.error('Respuesta del servidor con error:', error.response.data);
        } else if (error.request) {
            console.error('No hubo respuesta del servidor:', error.request);
        } else {
            console.error('Error durante la configuración de la solicitud:', error.message);
        }
        throw error;
    }
};
export const verificarRegistroExistente = async (id_empleado, fecha, id_horario) => {
    try {
        const response = await axios.get(`${BASE_URL}/verificar-registro`, {
            params: { id_empleado, fecha, id_horario }
        });
        return response.data;
    } catch (error) {
        console.error('Error al verificar registro existente:', error);
        return [];
    }
};