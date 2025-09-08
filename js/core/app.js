/**
 * APLICACIÓN PRINCIPAL - INICIALIZACIÓN Y ESTADO GLOBAL
 * Variables globales, inicialización y manejo de eventos principales
 * Este archivo orquesta toda la aplicación
 */

/**
 * VARIABLES GLOBALES DEL SISTEMA
 */

// Controla si la sección de resultados ya está visible
let visible = false;

// Almacena todos los datos del formulario después del submit
let datos;

// Almacena los totales calculados de luz por departamento
// Estos valores se calculan dinámicamente en generarPDF()
let totalesLuz = {
    departamento2A: 0,  // Total luz Departamento 2A
    departamento2B: 0,  // Total luz Departamento 2B  
    departamento3A: 0,  // Total luz Departamento 3A
    departamento3B: 0   // Total luz Departamento 3B
};

/**
 * SISTEMA DE GUARDADO AUTOMÁTICO
 * Guarda cada valor del formulario en localStorage cuando el usuario escribe o cambia selecciones
 * Esto permite que los datos persistan entre sesiones del navegador
 */
function inicializarGuardadoAutomatico() {
    const formulario = getElementById("form_principal");
    
    if (!formulario) return;
    
    // Evento para inputs de texto y números (keyup)
    formulario.addEventListener('keyup', e => {
        const nameField = String(e.target.name);   // Nombre del campo del formulario
        const valueField = String(e.target.value); // Valor actual del campo
        
        // Guardar inmediatamente en localStorage para persistencia
        saveToStorage(nameField, valueField);
    });

    // Evento adicional para selects (dropdowns)
    formulario.addEventListener('change', e => {
        const nameField = String(e.target.name);   // Nombre del campo del formulario
        const valueField = String(e.target.value); // Valor actual del campo
        
        // Guardar inmediatamente en localStorage para persistencia
        saveToStorage(nameField, valueField);
    });
}

/**
 * MANEJO DEL ENVÍO DEL FORMULARIO
 * Captura todos los datos del formulario y ejecuta los cálculos
 * Previene el envío normal del formulario para manejo con JavaScript
 */
function inicializarFormulario() {
    const formulario = getElementById("form_principal");
    
    if (!formulario) return;
    
    formulario.addEventListener('submit', e => {
        // Prevenir que el formulario se envíe de forma tradicional
        e.preventDefault();
        
        // Convertir todos los campos del formulario a un objeto JavaScript
        // FormData extrae automáticamente todos los inputs por su atributo 'name'
        const data = Object.fromEntries(
            new FormData(e.target)
        );
        
        // Guardar los datos en la variable global para uso posterior
        datos = data;
        
        // Iniciar el proceso de cálculo de las cuentas
        calcularCuentas();
    });
}

/**
 * RECUPERA Y RESTAURA VALORES GUARDADOS DEL FORMULARIO
 * Al cargar la página, restaura todos los valores previamente guardados en localStorage
 * Esto permite que el usuario no pierda su trabajo entre sesiones
 */
function getCacheValues() {
    // Obtener todos los elementos input y select del formulario principal
    const formulario = document.forms["form_principal"];
    
    if (!formulario) return;
    
    const arrInputs = Array.from(formulario.getElementsByTagName("input"));
    const arrSelects = Array.from(formulario.getElementsByTagName("select"));
    const arrFieldNames = [...arrInputs, ...arrSelects];
    
    // Para cada campo del formulario
    for (const fieldName of arrFieldNames) {
        // Buscar si existe un valor guardado para este campo
        const cacheValue = getFromStorage(fieldName.name);
        
        // Si existe un valor guardado, restaurarlo al campo
        if (cacheValue) {
            setInputValue(fieldName.name, cacheValue);
        }
    }
}

/**
 * FUNCIÓN PARA LIMPIAR EL FORMULARIO
 * Resetea todos los campos a sus valores por defecto y limpia el localStorage
 */
function limpiarFormulario() {
    // Confirmar con el usuario antes de limpiar
    if (!confirm('¿Estás seguro de que deseas limpiar todos los datos? Esta acción no se puede deshacer.')) {
        return;
    }
    
    // Obtener fecha actual para valores por defecto
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1; // getMonth() devuelve 0-11
    const añoActual = fechaActual.getFullYear();
    
    // PASO 1: Limpiar localStorage de campos del formulario (preservar histórico)
    const formulario = document.forms["form_principal"];
    if (formulario) {
        const formFields = formulario.elements;
        for (let field of formFields) {
            if (field.name) {
                removeFromStorage(field.name);
            }
        }
    }
    // NOTA: NO limpiamos 'historial_cuentas' ni 'casa_calculator_theme'
    
    // PASO 2: Establecer los valores deseados en los campos del formulario
    // Resetear campos con valores por defecto (mes y año actuales)
    setInputValue('calculo_mes', mesActual);
    setInputValue('calculo_anio', añoActual);
    
    // Resetear personas a 0
    const camposPersonas = ['personas_piso1', 'personas_departamento2A', 'personas_departamento2B', 
                           'personas_departamento3A', 'personas_departamento3B'];
    camposPersonas.forEach(campo => setInputValue(campo, '0'));
    
    // Resetear medidores a 0
    const camposMedidores = ['medidor_pasado_departamento2A', 'medidor_pasado_departamento2B',
                            'medidor_pasado_departamento3A', 'medidor_pasado_departamento3B',
                            'medidor_actual_departamento2A', 'medidor_actual_departamento2B',
                            'medidor_actual_departamento3A', 'medidor_actual_departamento3B'];
    camposMedidores.forEach(campo => setInputValue(campo, '0'));
    
    // Resetear valores de servicios a 0
    const camposServicios = ['valor_kw', 'alumbrado_publico', 'total_luz', 'total_agua'];
    camposServicios.forEach(campo => setInputValue(campo, '0'));
    
    // Resetear gas a 0
    const camposGas = ['gas_piso1', 'gas_departamento2A', 'gas_departamento2B',
                       'gas_departamento3A', 'gas_departamento3B'];
    camposGas.forEach(campo => setInputValue(campo, '0'));
    
    // Resetear cable e internet a 0
    const camposCableInt = ['cabInt_piso1', 'cabInt_departamento2A', 'cabInt_departamento2B',
                           'cabInt_departamento3A', 'cabInt_departamento3B'];
    camposCableInt.forEach(campo => setInputValue(campo, '0'));
    
    // PASO 3: Guardar los nuevos valores en localStorage
    // Guardar valores por defecto para mes y año
    saveToStorage('calculo_mes', mesActual);
    saveToStorage('calculo_anio', añoActual);
    
    // Guardar todos los campos de 0 en localStorage
    [...camposPersonas, ...camposMedidores, ...camposServicios, ...camposGas, ...camposCableInt]
        .forEach(campo => saveToStorage(campo, '0'));
    
    // Ocultar sección de resultados si estaba visible
    if (visible) {
        setElementVisibility(getElementById("descargas"), false);  
        setElementVisibility(getElementById("linea"), false);
        visible = false;
    }
    
    // Limpiar mensajes de error
    limpiarMensajesError();
    
    // Mostrar confirmación
    alert('Formulario limpiado exitosamente.');
}

/**
 * Función para preparar un nuevo cálculo
 * Similar a limpiarFormulario pero toma los valores del mes actual como base para el mes pasado
 */
function nuevoCalculo() {
    if (!confirm('¿Estás seguro de que deseas preparar un nuevo cálculo? Los valores del medidor actual pasarán a ser los del mes pasado.')) {
        return;
    }
    
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const añoActual = fechaActual.getFullYear();
    
    // Obtener valores actuales de los medidores del mes actual y personas
    const valoresActuales = {
        departamento2A: getInputValue('medidor_actual_departamento2A'),
        departamento2B: getInputValue('medidor_actual_departamento2B'),
        departamento3A: getInputValue('medidor_actual_departamento3A'),
        departamento3B: getInputValue('medidor_actual_departamento3B')
    };
    
    const valoresPersonas = {
        piso1: getInputValue('personas_piso1'),
        departamento2A: getInputValue('personas_departamento2A'),
        departamento2B: getInputValue('personas_departamento2B'),
        departamento3A: getInputValue('personas_departamento3A'),
        departamento3B: getInputValue('personas_departamento3B')
    };
    
    // Limpiar localStorage de campos del formulario (preservar histórico)
    const formulario = document.forms["form_principal"];
    if (formulario) {
        const formFields = formulario.elements;
        for (let field of formFields) {
            if (field.name) {
                removeFromStorage(field.name);
            }
        }
    }
    
    // Establecer valores básicos
    setInputValue('calculo_mes', mesActual);
    setInputValue('calculo_anio', añoActual);
    
    // Mantener valores de personas
    setInputValue('personas_piso1', valoresPersonas.piso1);
    setInputValue('personas_departamento2A', valoresPersonas.departamento2A);
    setInputValue('personas_departamento2B', valoresPersonas.departamento2B);
    setInputValue('personas_departamento3A', valoresPersonas.departamento3A);
    setInputValue('personas_departamento3B', valoresPersonas.departamento3B);
    
    // Establecer medidores del mes pasado con los valores actuales anteriores
    setInputValue('medidor_pasado_departamento2A', valoresActuales.departamento2A);
    setInputValue('medidor_pasado_departamento2B', valoresActuales.departamento2B);
    setInputValue('medidor_pasado_departamento3A', valoresActuales.departamento3A);
    setInputValue('medidor_pasado_departamento3B', valoresActuales.departamento3B);
    
    // Resetear medidores actuales a 0
    const camposMedidoresActuales = ['medidor_actual_departamento2A', 'medidor_actual_departamento2B',
                                    'medidor_actual_departamento3A', 'medidor_actual_departamento3B'];
    camposMedidoresActuales.forEach(campo => setInputValue(campo, '0'));
    
    // Resetear valores de servicios a 0
    const camposServicios = ['valor_kw', 'alumbrado_publico', 'total_luz', 'total_agua'];
    camposServicios.forEach(campo => setInputValue(campo, '0'));
    
    // Resetear gas a 0
    const camposGas = ['gas_piso1', 'gas_departamento2A', 'gas_departamento2B',
                       'gas_departamento3A', 'gas_departamento3B'];
    camposGas.forEach(campo => setInputValue(campo, '0'));
    
    // Resetear cable e internet a 0
    const camposCableInt = ['cabInt_piso1', 'cabInt_departamento2A', 'cabInt_departamento2B',
                           'cabInt_departamento3A', 'cabInt_departamento3B'];
    camposCableInt.forEach(campo => setInputValue(campo, '0'));
    
    // Guardar en localStorage
    saveToStorage('calculo_mes', mesActual);
    saveToStorage('calculo_anio', añoActual);
    
    // Guardar medidores del mes pasado
    saveToStorage('medidor_pasado_departamento2A', valoresActuales.departamento2A);
    saveToStorage('medidor_pasado_departamento2B', valoresActuales.departamento2B);
    saveToStorage('medidor_pasado_departamento3A', valoresActuales.departamento3A);
    saveToStorage('medidor_pasado_departamento3B', valoresActuales.departamento3B);
    
    // Guardar valores de personas
    saveToStorage('personas_piso1', valoresPersonas.piso1);
    saveToStorage('personas_departamento2A', valoresPersonas.departamento2A);
    saveToStorage('personas_departamento2B', valoresPersonas.departamento2B);
    saveToStorage('personas_departamento3A', valoresPersonas.departamento3A);
    saveToStorage('personas_departamento3B', valoresPersonas.departamento3B);
    
    // Guardar campos en 0
    [...camposMedidoresActuales, ...camposServicios, ...camposGas, ...camposCableInt]
        .forEach(campo => saveToStorage(campo, '0'));
    
    // Ocultar sección de resultados si estaba visible
    if (visible) {
        setElementVisibility(getElementById("descargas"), false);  
        setElementVisibility(getElementById("linea"), false);
        visible = false;
    }
    
    limpiarMensajesError();
    
    alert('Nuevo cálculo preparado exitosamente. Los medidores del mes pasado se han actualizado con los valores anteriores.');
}

/**
 * INICIALIZACIÓN DE LA APLICACIÓN
 * Función principal que se ejecuta cuando se carga la página
 */
function inicializarApp() {
    // Restaurar valores guardados del formulario
    getCacheValues();
    
    // Cargar tema guardado del usuario
    cargarTemaGuardado();
    
    // Mostrar histórico si existe
    mostrarHistorial();
    
    // Inicializar eventos del formulario
    inicializarFormulario();
    
    // Inicializar guardado automático
    inicializarGuardadoAutomatico();
}

/**
 * INICIALIZAR CUANDO EL DOM ESTÉ LISTO
 * Ejecutar la inicialización cuando la página haya cargado completamente
 */
document.addEventListener('DOMContentLoaded', inicializarApp);