/**
 * VALIDACIONES ESPECÍFICAS DEL PROYECTO
 * Funciones de validación para el formulario de cuentas de la casa
 * Este archivo contiene lógica específica del proyecto
 */

/**
 * VALIDADOR COMPLETO DEL FORMULARIO
 * Verifica que todos los campos estén llenos y tengan valores válidos
 * @param {object} datos - Datos del formulario a validar
 * @returns {boolean} true si todos los datos son válidos, false si hay errores
 */
function validarFormulario(datos) {
    let esValido = true;
    const errores = [];
    
    // CAMPOS REALMENTE OBLIGATORIOS (no pueden estar vacíos)
    const camposObligatorios = [
        'calculo_mes', 'calculo_anio',
        'medidor_pasado_departamento2A', 'medidor_pasado_departamento2B', 
        'medidor_pasado_departamento3A', 'medidor_pasado_departamento3B',
        'medidor_actual_departamento2A', 'medidor_actual_departamento2B',
        'medidor_actual_departamento3A', 'medidor_actual_departamento3B',
        'valor_kw', 'alumbrado_publico', 'total_luz', 'total_agua'
    ];
    
    // Validar que los campos obligatorios no estén vacíos
    camposObligatorios.forEach(campo => {
        if (!datos[campo] || datos[campo] === "") {
            esValido = false;
        }
    });
    
    // Si faltan datos obligatorios, mostrar mensaje
    if (!esValido) {
        errores.push("Por favor, complete todos los campos obligatorios marcados con *");
    }
    
    // VALIDAR TIPOS NUMÉRICOS Y RANGOS (solo si los campos básicos están completos)
    if (esValido) {
        if (datos.calculo_mes) {
            const mes = parseInt(datos.calculo_mes);
            if (isNaN(mes) || mes < 1 || mes > 12) {
                errores.push("El mes debe ser un número entre 1 y 12");
                esValido = false;
            }
        }
        
        if (datos.calculo_anio) {
            const anio = parseInt(datos.calculo_anio);
            const anioActual = new Date().getFullYear();
            if (isNaN(anio) || anio < 2020 || anio > anioActual + 1) {
                errores.push(`El año debe estar entre 2020 y ${anioActual + 1}`);
                esValido = false;
            }
        }
        
        // VALIDAR NÚMEROS NO NEGATIVOS (todos los campos numéricos)
        const todosLosCamposNumericos = [
            // Personas (pueden ser 0)
            'personas_piso1', 'personas_departamento2A', 'personas_departamento2B',
            'personas_departamento3A', 'personas_departamento3B',
            // Medidores (deben ser >= 0)
            'medidor_pasado_departamento2A', 'medidor_pasado_departamento2B',
            'medidor_pasado_departamento3A', 'medidor_pasado_departamento3B',
            'medidor_actual_departamento2A', 'medidor_actual_departamento2B',
            'medidor_actual_departamento3A', 'medidor_actual_departamento3B',
            // Costos de servicios (deben ser >= 0)
            'total_luz', 'total_agua', 'valor_kw', 'alumbrado_publico',
            // Gas por departamento (pueden ser 0)
            'gas_piso1', 'gas_departamento2A', 'gas_departamento2B',
            'gas_departamento3A', 'gas_departamento3B',
            // Cable e Internet por departamento (pueden ser 0)
            'cabInt_piso1', 'cabInt_departamento2A', 'cabInt_departamento2B',
            'cabInt_departamento3A', 'cabInt_departamento3B'
        ];
        
        todosLosCamposNumericos.forEach(campo => {
            if (datos[campo] !== undefined && datos[campo] !== "") {
                const valor = parseFloat(datos[campo]);
                if (isNaN(valor)) {
                    errores.push(`${obtenerNombreCampo(campo)} debe ser un número válido`);
                    esValido = false;
                } else if (valor < 0) {
                    errores.push(`${obtenerNombreCampo(campo)} no puede ser un número negativo`);
                    esValido = false;
                }
            }
        });
        
        // VALIDACIONES ESPECÍFICAS ADICIONALES
        // Validar que medidores actuales sean mayor o igual que los anteriores
        const departamentos = ['2A', '2B', '3A', '3B'];
        departamentos.forEach(depto => {
            const medidorAnterior = parseFloat(datos[`medidor_pasado_departamento${depto}`]);
            const medidorActual = parseFloat(datos[`medidor_actual_departamento${depto}`]);
            
            if (!isNaN(medidorAnterior) && !isNaN(medidorActual) && medidorActual < medidorAnterior) {
                errores.push(`El medidor actual del Departamento ${depto} debe ser mayor o igual al anterior`);
                esValido = false;
            }
        });
    }
    
    // MOSTRAR ERRORES SI EXISTEN
    if (!esValido) {
        mostrarMensajesError(errores);
    }
    
    return esValido;
}

/**
 * Convierte el nombre técnico del campo a un nombre legible
 * @param {string} campo - Nombre técnico del campo
 * @returns {string} Nombre legible del campo
 */
function obtenerNombreCampo(campo) {
    const nombres = {
        // Fechas
        'calculo_mes': 'Mes',
        'calculo_anio': 'Año',
        // Personas
        'personas_piso1': 'Personas en Piso 1',
        'personas_departamento2A': 'Personas en Departamento 2A',
        'personas_departamento2B': 'Personas en Departamento 2B',
        'personas_departamento3A': 'Personas en Departamento 3A',
        'personas_departamento3B': 'Personas en Departamento 3B',
        // Medidores anteriores
        'medidor_pasado_departamento2A': 'Medidor anterior Depto 2A',
        'medidor_pasado_departamento2B': 'Medidor anterior Depto 2B',
        'medidor_pasado_departamento3A': 'Medidor anterior Depto 3A',
        'medidor_pasado_departamento3B': 'Medidor anterior Depto 3B',
        // Medidores actuales
        'medidor_actual_departamento2A': 'Medidor actual Depto 2A',
        'medidor_actual_departamento2B': 'Medidor actual Depto 2B',
        'medidor_actual_departamento3A': 'Medidor actual Depto 3A',
        'medidor_actual_departamento3B': 'Medidor actual Depto 3B',
        // Luz
        'valor_kw': 'Valor del KW',
        'alumbrado_publico': 'Alumbrado Público',
        'total_luz': 'Total de Luz',
        // Agua
        'total_agua': 'Total de Agua',
        // Gas
        'gas_piso1': 'Gas Piso 1',
        'gas_departamento2A': 'Gas Departamento 2A',
        'gas_departamento2B': 'Gas Departamento 2B',
        'gas_departamento3A': 'Gas Departamento 3A',
        'gas_departamento3B': 'Gas Departamento 3B',
        // Cable e Internet
        'cabInt_piso1': 'Cable/Internet Piso 1',
        'cabInt_departamento2A': 'Cable/Internet Depto 2A',
        'cabInt_departamento2B': 'Cable/Internet Depto 2B',
        'cabInt_departamento3A': 'Cable/Internet Depto 3A',
        'cabInt_departamento3B': 'Cable/Internet Depto 3B'
    };
    return nombres[campo] || campo;
}

/**
 * Muestra mensajes de error en la interfaz usando el área visual de errores
 * @param {Array} errores - Array de mensajes de error
 */
function mostrarMensajesError(errores) {
    const errorContainer = getElementById('error_messages');
    const errorList = getElementById('error_list');
    
    if (errores.length === 0) {
        hideElement(errorContainer);
        return;
    }
    
    // Limpiar errores anteriores
    clearElementContent(errorList);
    
    // Crear lista de errores
    if (errores.length === 1) {
        setElementContent(errorList, `<p style="margin: 0.5rem 0;"><strong>${errores[0]}</strong></p>`);
    } else {
        let listaHTML = '<ol style="margin: 0.5rem 0; padding-left: 1.5rem;">';
        errores.forEach(error => {
            listaHTML += `<li style="margin: 0.25rem 0;">${error}</li>`;
        });
        listaHTML += '</ol>';
        listaHTML += '<p style="margin: 0.5rem 0; font-style: italic;"><i class="fa-solid fa-info-circle"></i> Por favor, corrija estos errores antes de continuar.</p>';
        setElementContent(errorList, listaHTML);
    }
    
    // Mostrar el contenedor de errores
    showElement(errorContainer);
    
    // Hacer scroll hacia el área de errores para que sea visible
    scrollToElement(errorContainer);
}

/**
 * Limpia los mensajes de error anteriores
 */
function limpiarMensajesError() {
    const errorContainer = getElementById('error_messages');
    if (errorContainer) {
        hideElement(errorContainer);
    }
}