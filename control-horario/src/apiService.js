import axios from 'axios';

// URL base del backend
const BASE_URL = process.env.REACT_APP_API_URL || 'https://control-horario-backend-production.up.railway.app';

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

export const getEmpleadoById = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/empleados/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener empleado con ID ${id}:`, error);
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

export const deleteEmpleado = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/empleados/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar empleado con ID ${id}:`, error);
        throw error;
    }
};

// Funciones de Horarios
export const getHorarios = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/horarios`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        throw error;
    }
};

export const getHorarioByEmpleadoId = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/horario/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener horario para empleado con ID ${id}:`, error);
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

export const updateHorario = async (id, horario) => {
    try {
        const response = await axios.put(`${BASE_URL}/horarios/${id}`, horario);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar horario con ID ${id}:`, error);
        throw error;
    }
};

export const deleteHorario = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/horarios/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar horario con ID ${id}:`, error);
        throw error;
    }
};

// Funciones de Registros
export const getUltimoRegistroByEmpleadoId = async (idEmpleado) => {
    try {
        const response = await axios.get(`${BASE_URL}/ultimo-registro/${idEmpleado}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el último registro del empleado con ID ${idEmpleado}:`, error);
        throw error;
    }
};

export const getRegistrosByEmpleadoId = async (id, start, end) => {
    try {
        const response = await axios.get(`${BASE_URL}/registros/${id}`, {
            params: { start, end },
        });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener registros para el empleado con ID ${id}:`, error);
        throw error;
    }
};

export const marcarEntrada = async (registro) => {
    try {
        const response = await axios.post(`${BASE_URL}/marcar-entrada`, registro);
        return response.data;
    } catch (error) {
        console.error('Error al marcar entrada:', error);
        throw error;
    }
};

export const marcarSalida = async (registro) => {
    try {
        const response = await axios.post(`${BASE_URL}/marcar-salida`, registro);
        return response.data;
    } catch (error) {
        console.error('Error al marcar salida:', error);
        throw error;
    }
};
