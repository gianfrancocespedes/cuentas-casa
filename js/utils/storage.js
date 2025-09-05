/**
 * UTILIDADES GENÉRICAS PARA LOCALSTORAGE
 * Funciones reutilizables para manejo de localStorage
 * Este archivo puede ser trasladado a cualquier otro proyecto
 */

/**
 * Guarda un valor en localStorage
 * @param {string} key - Clave para almacenar
 * @param {any} value - Valor a almacenar (se convierte a string)
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, String(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * Obtiene un valor de localStorage
 * @param {string} key - Clave a buscar
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {string} Valor almacenado o valor por defecto
 */
function getFromStorage(key, defaultValue = '') {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Elimina un elemento de localStorage
 * @param {string} key - Clave a eliminar
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

/**
 * Verifica si existe una clave en localStorage
 * @param {string} key - Clave a verificar
 * @returns {boolean} true si existe, false si no
 */
function existsInStorage(key) {
    try {
        return localStorage.getItem(key) !== null;
    } catch (error) {
        console.error('Error checking localStorage:', error);
        return false;
    }
}

/**
 * Guarda un objeto JSON en localStorage
 * @param {string} key - Clave para almacenar
 * @param {object} obj - Objeto a almacenar
 */
function saveObjectToStorage(key, obj) {
    try {
        localStorage.setItem(key, JSON.stringify(obj));
    } catch (error) {
        console.error('Error saving object to localStorage:', error);
    }
}

/**
 * Obtiene un objeto JSON de localStorage
 * @param {string} key - Clave a buscar
 * @param {object} defaultValue - Valor por defecto si no existe
 * @returns {object} Objeto almacenado o valor por defecto
 */
function getObjectFromStorage(key, defaultValue = {}) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error('Error parsing object from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Guarda un array en localStorage
 * @param {string} key - Clave para almacenar
 * @param {Array} arr - Array a almacenar
 */
function saveArrayToStorage(key, arr) {
    try {
        localStorage.setItem(key, JSON.stringify(arr));
    } catch (error) {
        console.error('Error saving array to localStorage:', error);
    }
}

/**
 * Obtiene un array de localStorage
 * @param {string} key - Clave a buscar
 * @param {Array} defaultValue - Valor por defecto si no existe
 * @returns {Array} Array almacenado o valor por defecto
 */
function getArrayFromStorage(key, defaultValue = []) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error('Error parsing array from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Limpia todas las entradas de localStorage que coincidan con un prefijo
 * @param {string} prefix - Prefijo de las claves a eliminar
 */
function clearStorageByPrefix(prefix) {
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
        console.error('Error clearing localStorage by prefix:', error);
    }
}

/**
 * Obtiene todas las claves de localStorage que coincidan con un prefijo
 * @param {string} prefix - Prefijo a buscar
 * @returns {Array<string>} Array con las claves encontradas
 */
function getStorageKeysByPrefix(prefix) {
    try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key);
            }
        }
        return keys;
    } catch (error) {
        console.error('Error getting keys from localStorage:', error);
        return [];
    }
}

/**
 * Obtiene el tamaño aproximado del localStorage en KB
 * @returns {number} Tamaño en KB
 */
function getStorageSize() {
    try {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return Math.round(total / 1024 * 100) / 100; // KB con 2 decimales
    } catch (error) {
        console.error('Error calculating localStorage size:', error);
        return 0;
    }
}

/**
 * Verifica si localStorage está disponible
 * @returns {boolean} true si localStorage está disponible
 */
function isStorageAvailable() {
    try {
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}