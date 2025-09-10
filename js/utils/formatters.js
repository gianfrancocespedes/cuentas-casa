/**
 * UTILIDADES DE FORMATEO GENÉRICAS
 * Funciones reutilizables para formateo de fechas, números y texto
 * Este archivo puede ser trasladado a cualquier otro proyecto
 */

/**
 * Convierte el número de mes a su nombre en español
 * @param {string|number} mes - Número del mes (1-12)
 * @returns {string} Nombre del mes en español
 */
function getMonthName(mes) {
    const nombreMeses = {
        1: "Enero",    2: "Febrero",  3: "Marzo",     4: "Abril",
        5: "Mayo",     6: "Junio",    7: "Julio",     8: "Agosto",
        9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
    };
    return nombreMeses[mes] || "Mes inválido";
}

/**
 * Formatea un número como moneda peruana
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada como moneda
 */
function formatCurrency(amount) {
    return `S/${parseFloat(amount).toFixed(2)}`;
}

/**
 * Genera un timestamp único para nombres de archivos
 * @returns {string} Timestamp en formato YYYYMMDDHHMMSS
 */
function generateTimestamp() {
    const now = new Date();
    return `${now.getSeconds()}${now.getMinutes()}${now.getHours()}${now.getDate()}${now.getMonth()}${now.getFullYear()}`;
}

/**
 * Genera un timestamp para exportación de datos
 * @returns {string} Timestamp en formato YYYY-MM-DD-HH-mm-ss
 */
function generateExportTimestamp() {
    const fechaActual = new Date();
    return fechaActual.toISOString()
        .replace('T', '-')
        .replace(/:/g, '-')
        .split('.')[0];
}

/**
 * Formatea una fecha a string con formato de 2 dígitos y AM/PM
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada DD/MM/YYYY HH:MM:SS AM/PM
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // la hora '0' debe ser '12'
    const hoursStr = String(hours).padStart(2, '0');
    
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Valida si un número es válido y no negativo
 * @param {any} value - Valor a validar
 * @returns {boolean} true si es un número válido no negativo
 */
function isValidNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
}

/**
 * Parsea un número de forma segura
 * @param {any} value - Valor a parsear
 * @param {number} defaultValue - Valor por defecto si el parseo falla
 * @returns {number} Número parseado o valor por defecto
 */
function safeParseFloat(value, defaultValue = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Parsea un entero de forma segura
 * @param {any} value - Valor a parsear
 * @param {number} defaultValue - Valor por defecto si el parseo falla
 * @returns {number} Entero parseado o valor por defecto
 */
function safeParseInt(value, defaultValue = 0) {
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : num;
}