/**
 * SISTEMA DE HISTÓRICO DE CÁLCULOS
 * Funciones para guardar, cargar y gestionar el histórico de cálculos
 * Este archivo maneja la persistencia y visualización del histórico
 */

/**
 * GUARDAR CÁLCULO EN HISTÓRICO
 * Guarda un cálculo exitoso en el localStorage para consulta posterior
 * @param {Object} datosFormulario - Datos completos del formulario
 * @param {Object} resultados - Resultados calculados por departamento
 */
function guardarEnHistorial(datosFormulario, resultados) {
    try {
        // Obtener histórico actual
        let historial = getArrayFromStorage('historial_cuentas');
        
        // Crear nueva entrada
        const nuevaEntrada = {
            id: Date.now(), // Timestamp único
            mes: parseInt(datosFormulario.calculo_mes),
            año: parseInt(datosFormulario.calculo_anio),
            fecha_calculo: formatDate(new Date()),
            datos_formulario: { ...datosFormulario },
            resultados: { ...resultados }
        };
        
        // Agregar al inicio del array (más reciente primero)
        historial.unshift(nuevaEntrada);
        
        // Mantener solo los últimos 50 cálculos
        if (historial.length > 50) {
            historial = historial.slice(0, 50);
        }
        
        // Guardar en localStorage
        saveArrayToStorage('historial_cuentas', historial);
        
        // Actualizar la visualización del histórico si está visible
        mostrarHistorial();
        
    } catch (error) {
        console.error('Error al guardar en histórico:', error);
    }
}

/**
 * CARGAR HISTÓRICO DESDE LOCALSTORAGE
 * @returns {Array} Array con el histórico de cálculos
 */
function cargarHistorial() {
    return getArrayFromStorage('historial_cuentas');
}

/**
 * MOSTRAR HISTÓRICO EN LA INTERFAZ
 * Actualiza la tabla del histórico con los datos guardados
 */
function mostrarHistorial() {
    const historial = cargarHistorial();
    const seccionHistorial = getElementById('seccion_historial');
    const tablaHistorial = getElementById('tabla_historial_body');
    
    if (historial.length === 0) {
        // Ocultar sección si no hay histórico
        hideElement(seccionHistorial);
        return;
    }
    
    // Mostrar sección
    showElement(seccionHistorial);
    
    // Limpiar tabla
    clearElementContent(tablaHistorial);
    
    // Llenar tabla con datos del histórico
    historial.forEach(entrada => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="py-4 px-2 text-sm text-slate-900 dark:text-slate-100">${getMonthName(entrada.mes)} ${entrada.año}</td>
            <td class="py-4 px-2 text-sm text-slate-900 dark:text-slate-100">${entrada.fecha_calculo}</td>
            <td class="py-4 px-2">
                <button onclick="verDetallesCalculo(${entrada.id})" class="inline-flex items-center justify-center w-8 h-8 mr-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="Ver detalles">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button onclick="cargarCalculoAnterior(${entrada.id})" class="inline-flex items-center justify-center w-8 h-8 mr-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="Cargar al formulario">
                    <i class="fa-solid fa-upload"></i>
                </button>
                <button onclick="eliminarDelHistorial(${entrada.id})" class="inline-flex items-center justify-center w-8 h-8 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tablaHistorial.appendChild(fila);
    });
}

/**
 * CARGAR CÁLCULO ANTERIOR AL FORMULARIO
 * Restaura todos los campos del formulario con datos de un cálculo previo
 * @param {number} id - ID del cálculo a cargar
 */
function cargarCalculoAnterior(id) {
    const historial = cargarHistorial();
    const entrada = historial.find(item => item.id === id);
    
    if (!entrada) {
        alert('Error: No se pudo encontrar el cálculo seleccionado.');
        return;
    }
    
    if (!confirm(`¿Cargar los datos del cálculo de ${getMonthName(entrada.mes)} ${entrada.año}? Los datos actuales se sobrescribirán.`)) {
        return;
    }
    
    // Cargar datos al formulario
    const datosEntrada = entrada.datos_formulario;
    
    // Mes y año
    setInputValue('calculo_mes', datosEntrada.calculo_mes);
    setInputValue('calculo_anio', datosEntrada.calculo_anio);
    
    // Personas
    setInputValue('personas_piso1', datosEntrada.personas_piso1 || '');
    setInputValue('personas_departamento2A', datosEntrada.personas_departamento2A || '');
    setInputValue('personas_departamento2B', datosEntrada.personas_departamento2B || '');
    setInputValue('personas_departamento3A', datosEntrada.personas_departamento3A || '');
    setInputValue('personas_departamento3B', datosEntrada.personas_departamento3B || '');
    
    // Medidores anteriores
    setInputValue('medidor_pasado_departamento2A', datosEntrada.medidor_pasado_departamento2A || '');
    setInputValue('medidor_pasado_departamento2B', datosEntrada.medidor_pasado_departamento2B || '');
    setInputValue('medidor_pasado_departamento3A', datosEntrada.medidor_pasado_departamento3A || '');
    setInputValue('medidor_pasado_departamento3B', datosEntrada.medidor_pasado_departamento3B || '');
    
    // Medidores actuales
    setInputValue('medidor_actual_departamento2A', datosEntrada.medidor_actual_departamento2A || '');
    setInputValue('medidor_actual_departamento2B', datosEntrada.medidor_actual_departamento2B || '');
    setInputValue('medidor_actual_departamento3A', datosEntrada.medidor_actual_departamento3A || '');
    setInputValue('medidor_actual_departamento3B', datosEntrada.medidor_actual_departamento3B || '');
    
    // Parámetros de luz
    setInputValue('valor_kw', datosEntrada.valor_kw || '');
    setInputValue('alumbrado_publico', datosEntrada.alumbrado_publico || '');
    setInputValue('total_luz', datosEntrada.total_luz || '');
    
    // Agua
    setInputValue('total_agua', datosEntrada.total_agua || '');
    
    // Gas
    setInputValue('gas_piso1', datosEntrada.gas_piso1 || '');
    setInputValue('gas_departamento2A', datosEntrada.gas_departamento2A || '');
    setInputValue('gas_departamento2B', datosEntrada.gas_departamento2B || '');
    setInputValue('gas_departamento3A', datosEntrada.gas_departamento3A || '');
    setInputValue('gas_departamento3B', datosEntrada.gas_departamento3B || '');
    
    // Cable e internet
    setInputValue('cabInt_piso1', datosEntrada.cabInt_piso1 || '');
    setInputValue('cabInt_departamento2A', datosEntrada.cabInt_departamento2A || '');
    setInputValue('cabInt_departamento2B', datosEntrada.cabInt_departamento2B || '');
    setInputValue('cabInt_departamento3A', datosEntrada.cabInt_departamento3A || '');
    setInputValue('cabInt_departamento3B', datosEntrada.cabInt_departamento3B || '');
    
    // Actualizar localStorage con los nuevos valores
    const formFields = document.forms["form_principal"].elements;
    for (let field of formFields) {
        if (field.name && field.value) {
            saveToStorage(field.name, field.value);
        }
    }
    
    alert(`Datos de ${getMonthName(entrada.mes)} ${entrada.año} cargados exitosamente.`);
}

/**
 * ELIMINAR ENTRADA DEL HISTÓRICO
 * @param {number} id - ID del cálculo a eliminar
 */
function eliminarDelHistorial(id) {
    const historial = cargarHistorial();
    const entrada = historial.find(item => item.id === id);
    
    if (!entrada) {
        alert('Error: No se pudo encontrar el cálculo seleccionado.');
        return;
    }
    
    if (!confirm(`¿Eliminar el cálculo de ${getMonthName(entrada.mes)} ${entrada.año} del histórico?`)) {
        return;
    }
    
    // Filtrar el histórico para remover la entrada
    const nuevoHistorial = historial.filter(item => item.id !== id);
    
    // Guardar el histórico actualizado
    saveArrayToStorage('historial_cuentas', nuevoHistorial);
    
    // Actualizar la visualización
    mostrarHistorial();
    
    alert('Cálculo eliminado del histórico.');
}

/**
 * VER DETALLES DE UN CÁLCULO ANTERIOR
 * Muestra un modal con toda la información de un cálculo previo
 * @param {number} id - ID del cálculo a mostrar
 */
function verDetallesCalculo(id) {
    const historial = cargarHistorial();
    const entrada = historial.find(item => item.id === id);
    
    if (!entrada) {
        alert('Error: No se pudo encontrar el cálculo seleccionado.');
        return;
    }
    
    // Calcular totales
    const totalGas = (
        safeParseFloat(entrada.datos_formulario.gas_piso1) +
        safeParseFloat(entrada.datos_formulario.gas_departamento2A) +
        safeParseFloat(entrada.datos_formulario.gas_departamento2B) +
        safeParseFloat(entrada.datos_formulario.gas_departamento3A) +
        safeParseFloat(entrada.datos_formulario.gas_departamento3B)
    ).toFixed(2);
    
    const totalCableInternet = (
        safeParseFloat(entrada.datos_formulario.cabInt_piso1) +
        safeParseFloat(entrada.datos_formulario.cabInt_departamento2A) +
        safeParseFloat(entrada.datos_formulario.cabInt_departamento2B) +
        safeParseFloat(entrada.datos_formulario.cabInt_departamento3A) +
        safeParseFloat(entrada.datos_formulario.cabInt_departamento3B)
    ).toFixed(2);
    
    // Preparar contenido del modal
    let contenido = `
        <h4>${getMonthName(entrada.mes)} ${entrada.año}</h4>
        <p><strong>Calculado el:</strong> ${entrada.fecha_calculo}</p>
        
        <h5>Datos del Formulario:</h5>
        <table style="width: 100%; font-size: 0.9rem;">
            <tr><td><strong>Personas Piso 1:</strong></td><td>${entrada.datos_formulario.personas_piso1}</td></tr>
            <tr><td><strong>Personas Depto 2A:</strong></td><td>${entrada.datos_formulario.personas_departamento2A}</td></tr>
            <tr><td><strong>Personas Depto 2B:</strong></td><td>${entrada.datos_formulario.personas_departamento2B}</td></tr>
            <tr><td><strong>Personas Depto 3A:</strong></td><td>${entrada.datos_formulario.personas_departamento3A}</td></tr>
            <tr><td><strong>Personas Depto 3B:</strong></td><td>${entrada.datos_formulario.personas_departamento3B}</td></tr>
            <tr><td><strong>Total Luz:</strong></td><td>S/${safeParseFloat(entrada.datos_formulario.total_luz).toFixed(2)}</td></tr>
            <tr><td><strong>Total Agua:</strong></td><td>S/${safeParseFloat(entrada.datos_formulario.total_agua).toFixed(2)}</td></tr>
            <tr><td><strong>Total Gas:</strong></td><td>S/${totalGas}</td></tr>
            <tr><td><strong>Total Cable/Internet:</strong></td><td>S/${totalCableInternet}</td></tr>
        </table>
    `;
    
    // Mostrar en el modal de detalles
    setElementContent(getElementById('modal_detalles_content'), contenido);
    
    // Abrir el modal directamente usando las funciones del modal.js
    const modal = getElementById('modal_detalles_historial');
    openModal(modal);
}