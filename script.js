/**
 * SISTEMA DE GUARDADO AUTOMÁTICO
 * Guarda cada valor del formulario en localStorage cuando el usuario escribe o cambia selecciones
 * Esto permite que los datos persistan entre sesiones del navegador
 */
document.getElementById("form_principal").addEventListener('keyup', e => {
    const nameField = String(e.target.name);   // Nombre del campo del formulario
    const valueField = String(e.target.value); // Valor actual del campo
    
    // Guardar inmediatamente en localStorage para persistencia
    localStorage.setItem(nameField, valueField);
});

// Evento adicional para selects (dropdowns)
document.getElementById("form_principal").addEventListener('change', e => {
    const nameField = String(e.target.name);   // Nombre del campo del formulario
    const valueField = String(e.target.value); // Valor actual del campo
    
    // Guardar inmediatamente en localStorage para persistencia
    localStorage.setItem(nameField, valueField);
});

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
 * SISTEMA DE CAMBIO DE TEMA (MODO OSCURO/CLARO)
 * Alterna entre tema claro y oscuro, actualiza el icono del botón
 * y aplica el cambio inmediatamente a toda la página
 */
function cambiarTema() {
    const pagina = document.getElementById('webPage');
    
    // Determinar el tema opuesto al actual
    const targetTheme = pagina.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    
    // Aplicar el nuevo tema
    aplicarTema(targetTheme);
    
    // Guardar la preferencia del usuario
    localStorage.setItem('casa_calculator_theme', targetTheme);
}

/**
 * Aplica un tema específico a la página y actualiza el botón
 * @param {string} tema - 'light' o 'dark'
 */
function aplicarTema(tema) {
    const pagina = document.getElementById('webPage');
    const botonTema = document.getElementById("boton_tema");
    
    // Aplicar el tema al elemento HTML principal
    pagina.setAttribute('data-theme', tema);
    
    // Actualizar el icono y texto del botón según el tema
    if (tema === 'light') {
        // Si es tema claro, mostrar icono de luna para cambiar a oscuro
        botonTema.innerHTML = "<i class='fa-solid fa-moon'></i>&nbsp;&nbsp;Cambiar Tema";
    } else {
        // Si es tema oscuro, mostrar icono de brillo para cambiar a claro
        botonTema.innerHTML = "<i class='fa-solid fa-brightness'></i>&nbsp;&nbsp;Cambiar Tema";
    }
}

/**
 * Carga el tema guardado del usuario al iniciar la página
 */
function cargarTemaGuardado() {
    // Recuperar tema guardado o usar 'dark' por defecto
    const temaGuardado = localStorage.getItem('casa_calculator_theme') || 'dark';
    aplicarTema(temaGuardado);
}


/**
 * MANEJO DEL ENVÍO DEL FORMULARIO
 * Captura todos los datos del formulario y ejecuta los cálculos
 * Previene el envío normal del formulario para manejo con JavaScript
 */
document.getElementById("form_principal").addEventListener('submit', e => {
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

/**
 * FUNCIÓN PRINCIPAL DE CÁLCULO DE CUENTAS
 * Valida que todos los campos estén completos y procesa los cálculos
 * Si todo está correcto, muestra la sección de resultados y genera los PDFs
 */
function calcularCuentas() {
    // Mostrar loader en el botón
    const botonCalcular = document.getElementById('boton_calcular');
    const textoOriginal = botonCalcular.innerHTML;
    botonCalcular.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp;&nbsp;Calculando...';
    botonCalcular.disabled = true;
    
    // Limpiar mensajes de error anteriores
    limpiarMensajesError();
    
    // VALIDACIÓN COMPLETA DE DATOS
    if (!validarFormulario()) {
        // Restaurar botón si hay errores
        botonCalcular.innerHTML = textoOriginal;
        botonCalcular.disabled = false;
        return; // No continuar si hay errores
    }

    // MOSTRAR SECCIÓN DE RESULTADOS
    const fechaHoraCalculo = new Date();
    
    // Si es la primera vez que se calculan las cuentas, mostrar la sección de descargas
    if (!visible) {
        document.getElementById("descargas").style.visibility = "visible";  
        document.getElementById("linea").style.visibility = "visible";
        visible = true;
    }
    
    // Mostrar la fecha y hora del cálculo al usuario
    document.getElementById("fecha_hora_calculo").innerHTML = 
        "Resultado calculado el: " + fechaHoraCalculo.toLocaleString();
    
    // GENERAR TODOS LOS PDFs (con un pequeño delay para mostrar el loader)
    setTimeout(() => {
        gestionarPDFs();
        
        // GUARDAR EN HISTÓRICO después del cálculo exitoso
        const resultadosCalculados = {
            total_luz_piso1: (parseFloat(datos.total_luz) - getTotalLuzDep()).toFixed(2),
            agua_piso1: ((parseFloat(datos.total_agua) / getTotalPersonas()) * datos.personas_piso1).toFixed(2),
            gas_piso1: datos.gas_piso1,
            cabInt_piso1: datos.cabInt_piso1,
            totales_luz_departamentos: { ...totalesLuz }
        };
        
        guardarEnHistorial(datos, resultadosCalculados);
        
        // Restaurar botón después del cálculo
        botonCalcular.innerHTML = textoOriginal;
        botonCalcular.disabled = false;
    }, 500);
}

/**
 * VALIDADOR COMPLETO DEL FORMULARIO
 * Verifica que todos los campos estén llenos y tengan valores válidos
 * @returns {boolean} true si todos los datos son válidos, false si hay errores
 */
function validarFormulario() {
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
    const errorContainer = document.getElementById('error_messages');
    const errorList = document.getElementById('error_list');
    
    if (errores.length === 0) {
        errorContainer.style.display = 'none';
        return;
    }
    
    // Limpiar errores anteriores
    errorList.innerHTML = '';
    
    // Crear lista de errores
    if (errores.length === 1) {
        errorList.innerHTML = `<p style="margin: 0.5rem 0;"><strong>${errores[0]}</strong></p>`;
    } else {
        let listaHTML = '<ol style="margin: 0.5rem 0; padding-left: 1.5rem;">';
        errores.forEach(error => {
            listaHTML += `<li style="margin: 0.25rem 0;">${error}</li>`;
        });
        listaHTML += '</ol>';
        listaHTML += '<p style="margin: 0.5rem 0; font-style: italic;"><i class="fa-solid fa-info-circle"></i> Por favor, corrija estos errores antes de continuar.</p>';
        errorList.innerHTML = listaHTML;
    }
    
    // Mostrar el contenedor de errores
    errorContainer.style.display = 'block';
    
    // Hacer scroll hacia el área de errores para que sea visible
    errorContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

/**
 * Limpia los mensajes de error anteriores
 */
function limpiarMensajesError() {
    const errorContainer = document.getElementById('error_messages');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}



/**
 * GENERADOR DE PDF POR DEPARTAMENTO/PISO
 * Crea un PDF detallado con los cálculos de servicios para un apartamento específico
 * @param {string} piso - Identificador del piso/departamento ('1', '2A', '2B', '3A', '3B')
 * @returns {jsPDF} Objeto PDF generado
 */
function generarPDF(piso) {
    // CONFIGURACIÓN DEL DOCUMENTO PDF
    const tamañoLetra = 15;
    const doc = new jsPDF({
        format: [350, 400]  // Tamaño personalizado para mejor lectura
    });
    doc.setFontSize(tamañoLetra);
    doc.setFont("courier", "normal");  // Fuente monoespaciada para alineación
    
    // GENERACIÓN DE PDF PARA PISO 1 (CASO ESPECIAL)
    if (piso === '1') {
        let num;
        
        // ENCABEZADO DEL DOCUMENTO
        doc.text("Piso 1", 63, 10, 'center');
        doc.text(`${getNombreMes(datos.calculo_mes)}/${datos.calculo_anio}`, 63, 15, 'center');
        
        // CÁLCULO DE LUZ PARA PISO 1
        // El Piso 1 paga la diferencia entre el total de la factura y lo que pagan los departamentos
        num = (parseFloat(datos.total_luz) - getTotalLuzDep()).toFixed(2);
        doc.text(`Luz: ${datos.total_luz} - ${getTotalLuzDep()} = S/${num}`, 20, 25);
        
        // CÁLCULO DE AGUA PARA PISO 1
        // El agua se divide proporcionalmente según el número de personas
        doc.text(`Agua:`, 20, 35);
        num = (parseFloat(datos.total_agua) / getTotalPersonas()).toFixed(2);
        doc.text(`${datos.total_agua} ${String.fromCharCode(247)} ${getTotalPersonas()} = S/${num}`, 30, 40);
        doc.text(`${num} x ${datos.personas_piso1} = S/${(num * datos.personas_piso1).toFixed(2)}`, 30, 45);
        
        // GAS PARA PISO 1 (VALOR DIRECTO)
        doc.text(`Gas:`, 20, 55);
        doc.text(`S/${datos.gas_piso1}`, 30, 60);
        
        // CABLE E INTERNET PARA PISO 1 (VALOR DIRECTO)
        doc.text(`Cable e internet:`, 20, 70);
        doc.text(`S/${datos.cabInt_piso1}`, 30, 75);

    // GENERACIÓN DE PDF PARA DEPARTAMENTOS (2A, 2B, 3A, 3B)
    } else {
        let accJSON, luz, agua, gas, totalPiso;
        
        // ENCABEZADO DEL DOCUMENTO
        doc.text(`Departamento ${piso}`, 63, 10, 'center');
        doc.text(`${getNombreMes(datos.calculo_mes)}/${datos.calculo_anio}`, 63, 15, 'center');
        
        // CÁLCULO DETALLADO DE LUZ
        doc.text(`Luz:`, 20, 25);
        
        // Obtener lectura del medidor del mes anterior
        accJSON = "medidor_pasado_departamento" + piso;
        let num1 = datos[accJSON];
        doc.text(`${num1} -> Mes anterior`, 30, 30);
        
        // Obtener lectura del medidor del mes actual
        accJSON = "medidor_actual_departamento" + piso;
        let num2 = datos[accJSON];
        doc.text(`${num2} -> Mes actual`, 30, 35);
        
        // Calcular consumo (diferencia entre lecturas)
        doc.line(29, 36, 53, 36);   // Línea de resta
        num1 = (parseFloat(num2) - parseFloat(num1)).toFixed(2);
        doc.text(`${num1}`, 35, 40);
        
        // Multiplicar por el valor del KW
        num2 = datos.valor_kw;
        doc.text(`x ${num2} -> KW`, 25, 45);
        doc.line(29, 46, 53, 46);   // Línea de multiplicación
        num1 = (num1 * parseFloat(num2)).toFixed(2);
        doc.text(`${num1}`, 35, 50);
        
        // Calcular IGV (18%)
        num2 = (0.18 * num1).toFixed(2);
        doc.text(`${num2} -> 18%`, 38, 55);
        doc.line(29, 56, 53, 56);   // Línea de suma
        num1 = (num1 * 1.0 + num2 * 1.0).toFixed(2);
        doc.text(`${num1}`, 35, 60);
        
        // Agregar alumbrado público
        num2 = datos.alumbrado_publico;
        doc.text(`${num2} -> A. público`, 38, 65);
        doc.line(29, 66, 53, 66);   // Línea de suma final
        num1 = (num1 * 1.0 + num2 * 1.0).toFixed(2);
        doc.text(`${num1} -> Total Luz`, 35, 70);
        
        // Guardar total de luz para este departamento
        luz = num1;
        accJSON = "departamento" + piso;
        totalesLuz[accJSON] = luz;
        
        // CÁLCULO DE AGUA
        // El agua se divide proporcionalmente según el número de personas
        doc.text(`Agua:`, 10, 80);
        num1 = datos.total_agua;
        num2 = (num1 / getTotalPersonas()).toFixed(2);
        doc.text(`${num1} ${String.fromCharCode(247)} ${getTotalPersonas()} = S/${num2}`, 20, 85);
        
        accJSON = "personas_departamento" + piso;
        num1 = (num2 * datos[accJSON]).toFixed(2);
        doc.text(`${num2} x ${datos[accJSON]} = S/${num1} -> T. Agua`, 20, 90);
        agua = num1;
        
        // GAS (VALOR DIRECTO POR DEPARTAMENTO)
        accJSON = "gas_departamento" + piso;
        gas = datos[accJSON];
        
        // CÁLCULO DEL TOTAL A PAGAR
        totalPiso = agua * 1 + gas * 1 + luz * 1;
        
        // RESUMEN FINAL EN RECUADRO
        doc.text(`Resumen`, 63, 100, 'center');
        doc.rect(10, 101, 105, 20);  // Rectángulo para el resumen
        doc.text(`Agua + Luz + Gas`, 63, 105, 'center');
        doc.text(`${agua} + ${luz} + ${gas}`, 63, 110, 'center');
        doc.setFontType("bold");
        doc.text(`S/${Math.round(totalPiso)}.00`, 63, 115, 'center');



    }

    return doc;
}

/**
 * GENERADOR Y GESTOR DE TODOS LOS PDFs
 * Crea los 5 PDFs (4 departamentos + 1 piso) y los asigna a sus respectivos iframes
 * para previsualización en los modales
 */
function gestionarPDFs() {
    // Generar PDF para Departamento 2A y asignarlo a su iframe
    let pdf = generarPDF("2A");
    document.getElementById('iframe_departamento2A').setAttribute('src', pdf.output('bloburl'));
    
    // Generar PDF para Departamento 2B y asignarlo a su iframe
    pdf = generarPDF("2B");
    document.getElementById('iframe_departamento2B').setAttribute('src', pdf.output('bloburl'));
    
    // Generar PDF para Departamento 3A y asignarlo a su iframe
    pdf = generarPDF("3A");
    document.getElementById('iframe_departamento3A').setAttribute('src', pdf.output('bloburl'));
    
    // Generar PDF para Departamento 3B y asignarlo a su iframe
    pdf = generarPDF("3B");
    document.getElementById('iframe_departamento3B').setAttribute('src', pdf.output('bloburl'));
    
    // Generar PDF para Piso 1 y asignarlo a su iframe
    pdf = generarPDF("1");
    document.getElementById('iframe_piso1').setAttribute('src', pdf.output('bloburl'));
}

/**
 * FUNCIÓN DE DESCARGA DE PDF INDIVIDUAL
 * Genera un PDF específico y lo descarga con un nombre único basado en timestamp
 * @param {string} piso - Identificador del piso/departamento a descargar
 */
function descargarPDF(piso) {
    // Generar el PDF específico solicitado
    const doc = generarPDF(piso);
    
    // Crear timestamp único para el nombre del archivo
    const now = new Date();
    const timestamp = `${now.getSeconds()}${now.getMinutes()}${now.getHours()}${now.getDate()}${now.getMonth()}${now.getFullYear()}`;
    
    // Descargar con nombre específico según el tipo
    if (piso === '1') {
        doc.save(`Piso ${piso}_${timestamp}.pdf`);
    } else {
        doc.save(`Departamento ${piso}_${timestamp}.pdf`);
    }
}


/**
 * =====================================
 * FUNCIONES DE APOYO Y UTILIDADES
 * =====================================
 */

/**
 * Convierte el número de mes a su nombre en español
 * @param {string|number} mes - Número del mes (1-12)
 * @returns {string} Nombre del mes en español
 */
function getNombreMes(mes) {
    const nombreMeses = {
        1: "Enero",    2: "Febrero",  3: "Marzo",     4: "Abril",
        5: "Mayo",     6: "Junio",    7: "Julio",     8: "Agosto",
        9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
    };
    return nombreMeses[mes] || "Mes inválido";
}

/**
 * Calcula el total de personas en toda la casa
 * Suma todas las personas de todos los pisos y departamentos
 * @returns {number} Total de personas en la casa
 */
function getTotalPersonas() {
    return parseInt(datos.personas_piso1) + 
           parseInt(datos.personas_departamento2A) + 
           parseInt(datos.personas_departamento2B) +
           parseInt(datos.personas_departamento3A) + 
           parseInt(datos.personas_departamento3B);
}

/**
 * Calcula el total de luz que pagan todos los departamentos
 * No incluye el Piso 1, que paga la diferencia del total de la factura
 * @returns {number} Total de luz de los departamentos
 */
function getTotalLuzDep() {
    return parseFloat(totalesLuz.departamento2A) + 
           parseFloat(totalesLuz.departamento2B) + 
           parseFloat(totalesLuz.departamento3A) +
           parseFloat(totalesLuz.departamento3B);
}

/**
 * RECUPERA Y RESTAURA VALORES GUARDADOS DEL FORMULARIO
 * Al cargar la página, restaura todos los valores previamente guardados en localStorage
 * Esto permite que el usuario no pierda su trabajo entre sesiones
 */
function getCacheValues() {
    // Obtener todos los elementos input y select del formulario principal
    const arrInputs = Array.from(document.forms["form_principal"].getElementsByTagName("input"));
    const arrSelects = Array.from(document.forms["form_principal"].getElementsByTagName("select"));
    const arrFieldNames = [...arrInputs, ...arrSelects];
    
    // Para cada campo del formulario
    for (const fieldName of arrFieldNames) {
        // Buscar si existe un valor guardado para este campo
        const cacheValue = localStorage.getItem(fieldName.name);
        
        // Si existe un valor guardado, restaurarlo al campo
        if (cacheValue) {
            document.getElementById(fieldName.name).value = cacheValue;
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
    const formFields = document.forms["form_principal"].elements;
    for (let field of formFields) {
        if (field.name) {
            localStorage.removeItem(field.name);
        }
    }
    // NOTA: NO limpiamos 'historial_cuentas' ni 'casa_calculator_theme'
    
    // PASO 2: Establecer los valores deseados en los campos del formulario
    // Resetear campos con valores por defecto (mes y año actuales)
    document.getElementById('calculo_mes').value = mesActual;
    document.getElementById('calculo_anio').value = añoActual;
    
    // Resetear personas a 0
    document.getElementById('personas_piso1').value = '0';
    document.getElementById('personas_departamento2A').value = '0';
    document.getElementById('personas_departamento2B').value = '0';
    document.getElementById('personas_departamento3A').value = '0';
    document.getElementById('personas_departamento3B').value = '0';
    
    // Resetear medidores a 0
    document.getElementById('medidor_pasado_departamento2A').value = '0';
    document.getElementById('medidor_pasado_departamento2B').value = '0';
    document.getElementById('medidor_pasado_departamento3A').value = '0';
    document.getElementById('medidor_pasado_departamento3B').value = '0';
    document.getElementById('medidor_actual_departamento2A').value = '0';
    document.getElementById('medidor_actual_departamento2B').value = '0';
    document.getElementById('medidor_actual_departamento3A').value = '0';
    document.getElementById('medidor_actual_departamento3B').value = '0';
    
    // Resetear valores de servicios a 0
    document.getElementById('valor_kw').value = '0';
    document.getElementById('alumbrado_publico').value = '0';
    document.getElementById('total_luz').value = '0';
    document.getElementById('total_agua').value = '0';
    
    // Resetear gas a 0
    document.getElementById('gas_piso1').value = '0';
    document.getElementById('gas_departamento2A').value = '0';
    document.getElementById('gas_departamento2B').value = '0';
    document.getElementById('gas_departamento3A').value = '0';
    document.getElementById('gas_departamento3B').value = '0';
    
    // Resetear cable e internet a 0
    document.getElementById('cabInt_piso1').value = '0';
    document.getElementById('cabInt_departamento2A').value = '0';
    document.getElementById('cabInt_departamento2B').value = '0';
    document.getElementById('cabInt_departamento3A').value = '0';
    document.getElementById('cabInt_departamento3B').value = '0';
    
    // PASO 3: Guardar los nuevos valores en localStorage
    // Guardar valores por defecto para mes y año
    localStorage.setItem('calculo_mes', mesActual);
    localStorage.setItem('calculo_anio', añoActual);
    
    // Guardar todos los campos de 0 en localStorage
    localStorage.setItem('personas_piso1', '0');
    localStorage.setItem('personas_departamento2A', '0');
    localStorage.setItem('personas_departamento2B', '0');
    localStorage.setItem('personas_departamento3A', '0');
    localStorage.setItem('personas_departamento3B', '0');
    
    localStorage.setItem('medidor_pasado_departamento2A', '0');
    localStorage.setItem('medidor_pasado_departamento2B', '0');
    localStorage.setItem('medidor_pasado_departamento3A', '0');
    localStorage.setItem('medidor_pasado_departamento3B', '0');
    localStorage.setItem('medidor_actual_departamento2A', '0');
    localStorage.setItem('medidor_actual_departamento2B', '0');
    localStorage.setItem('medidor_actual_departamento3A', '0');
    localStorage.setItem('medidor_actual_departamento3B', '0');
    
    localStorage.setItem('valor_kw', '0');
    localStorage.setItem('alumbrado_publico', '0');
    localStorage.setItem('total_luz', '0');
    localStorage.setItem('total_agua', '0');
    
    localStorage.setItem('gas_piso1', '0');
    localStorage.setItem('gas_departamento2A', '0');
    localStorage.setItem('gas_departamento2B', '0');
    localStorage.setItem('gas_departamento3A', '0');
    localStorage.setItem('gas_departamento3B', '0');
    
    localStorage.setItem('cabInt_piso1', '0');
    localStorage.setItem('cabInt_departamento2A', '0');
    localStorage.setItem('cabInt_departamento2B', '0');
    localStorage.setItem('cabInt_departamento3A', '0');
    localStorage.setItem('cabInt_departamento3B', '0');
    
    // Ocultar sección de resultados si estaba visible
    if (visible) {
        document.getElementById("descargas").style.visibility = "hidden";  
        document.getElementById("linea").style.visibility = "hidden";
        visible = false;
    }
    
    // Limpiar mensajes de error
    limpiarMensajesError();
    
    // Mostrar confirmación
    alert('Formulario limpiado exitosamente.');
}

/**
 * =====================================
 * SISTEMA DE HISTÓRICO DE CÁLCULOS
 * =====================================
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
        let historial = JSON.parse(localStorage.getItem('historial_cuentas') || '[]');
        
        // Crear nueva entrada
        const nuevaEntrada = {
            id: Date.now(), // Timestamp único
            mes: parseInt(datosFormulario.calculo_mes),
            año: parseInt(datosFormulario.calculo_anio),
            fecha_calculo: new Date().toLocaleString(),
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
        localStorage.setItem('historial_cuentas', JSON.stringify(historial));
        
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
    try {
        return JSON.parse(localStorage.getItem('historial_cuentas') || '[]');
    } catch (error) {
        console.error('Error al cargar histórico:', error);
        return [];
    }
}

/**
 * MOSTRAR HISTÓRICO EN LA INTERFAZ
 * Actualiza la tabla del histórico con los datos guardados
 */
function mostrarHistorial() {
    const historial = cargarHistorial();
    const seccionHistorial = document.getElementById('seccion_historial');
    const tablaHistorial = document.getElementById('tabla_historial_body');
    
    if (historial.length === 0) {
        // Ocultar sección si no hay histórico
        seccionHistorial.style.display = 'none';
        return;
    }
    
    // Mostrar sección
    seccionHistorial.style.display = 'block';
    
    // Limpiar tabla
    tablaHistorial.innerHTML = '';
    
    // Llenar tabla con datos del histórico
    historial.forEach(entrada => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${getNombreMes(entrada.mes)} ${entrada.año}</td>
            <td>${entrada.fecha_calculo}</td>
            <td>
                <button onclick="verDetallesCalculo(${entrada.id})" style="margin-right: 0.5rem;" title="Ver detalles">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button onclick="cargarCalculoAnterior(${entrada.id})" style="margin-right: 0.5rem;" title="Cargar al formulario">
                    <i class="fa-solid fa-upload"></i>
                </button>
                <button onclick="eliminarDelHistorial(${entrada.id})" class="secondary" title="Eliminar">
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
    
    if (!confirm(`¿Cargar los datos del cálculo de ${getNombreMes(entrada.mes)} ${entrada.año}? Los datos actuales se sobrescribirán.`)) {
        return;
    }
    
    // Cargar datos al formulario
    const datos = entrada.datos_formulario;
    
    // Mes y año
    document.getElementById('calculo_mes').value = datos.calculo_mes;
    document.getElementById('calculo_anio').value = datos.calculo_anio;
    
    // Personas
    document.getElementById('personas_piso1').value = datos.personas_piso1 || '';
    document.getElementById('personas_departamento2A').value = datos.personas_departamento2A || '';
    document.getElementById('personas_departamento2B').value = datos.personas_departamento2B || '';
    document.getElementById('personas_departamento3A').value = datos.personas_departamento3A || '';
    document.getElementById('personas_departamento3B').value = datos.personas_departamento3B || '';
    
    // Medidores anteriores
    document.getElementById('medidor_pasado_departamento2A').value = datos.medidor_pasado_departamento2A || '';
    document.getElementById('medidor_pasado_departamento2B').value = datos.medidor_pasado_departamento2B || '';
    document.getElementById('medidor_pasado_departamento3A').value = datos.medidor_pasado_departamento3A || '';
    document.getElementById('medidor_pasado_departamento3B').value = datos.medidor_pasado_departamento3B || '';
    
    // Medidores actuales
    document.getElementById('medidor_actual_departamento2A').value = datos.medidor_actual_departamento2A || '';
    document.getElementById('medidor_actual_departamento2B').value = datos.medidor_actual_departamento2B || '';
    document.getElementById('medidor_actual_departamento3A').value = datos.medidor_actual_departamento3A || '';
    document.getElementById('medidor_actual_departamento3B').value = datos.medidor_actual_departamento3B || '';
    
    // Parámetros de luz
    document.getElementById('valor_kw').value = datos.valor_kw || '';
    document.getElementById('alumbrado_publico').value = datos.alumbrado_publico || '';
    document.getElementById('total_luz').value = datos.total_luz || '';
    
    // Agua
    document.getElementById('total_agua').value = datos.total_agua || '';
    
    // Gas
    document.getElementById('gas_piso1').value = datos.gas_piso1 || '';
    document.getElementById('gas_departamento2A').value = datos.gas_departamento2A || '';
    document.getElementById('gas_departamento2B').value = datos.gas_departamento2B || '';
    document.getElementById('gas_departamento3A').value = datos.gas_departamento3A || '';
    document.getElementById('gas_departamento3B').value = datos.gas_departamento3B || '';
    
    // Cable e internet
    document.getElementById('cabInt_piso1').value = datos.cabInt_piso1 || '';
    document.getElementById('cabInt_departamento2A').value = datos.cabInt_departamento2A || '';
    document.getElementById('cabInt_departamento2B').value = datos.cabInt_departamento2B || '';
    document.getElementById('cabInt_departamento3A').value = datos.cabInt_departamento3A || '';
    document.getElementById('cabInt_departamento3B').value = datos.cabInt_departamento3B || '';
    
    // Actualizar localStorage con los nuevos valores
    const formFields = document.forms["form_principal"].elements;
    for (let field of formFields) {
        if (field.name && field.value) {
            localStorage.setItem(field.name, field.value);
        }
    }
    
    alert(`Datos de ${getNombreMes(entrada.mes)} ${entrada.año} cargados exitosamente.`);
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
    
    if (!confirm(`¿Eliminar el cálculo de ${getNombreMes(entrada.mes)} ${entrada.año} del histórico?`)) {
        return;
    }
    
    // Filtrar el histórico para remover la entrada
    const nuevoHistorial = historial.filter(item => item.id !== id);
    
    // Guardar el histórico actualizado
    localStorage.setItem('historial_cuentas', JSON.stringify(nuevoHistorial));
    
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
        parseFloat(entrada.datos_formulario.gas_piso1 || 0) +
        parseFloat(entrada.datos_formulario.gas_departamento2A || 0) +
        parseFloat(entrada.datos_formulario.gas_departamento2B || 0) +
        parseFloat(entrada.datos_formulario.gas_departamento3A || 0) +
        parseFloat(entrada.datos_formulario.gas_departamento3B || 0)
    ).toFixed(2);
    
    const totalCableInternet = (
        parseFloat(entrada.datos_formulario.cabInt_piso1 || 0) +
        parseFloat(entrada.datos_formulario.cabInt_departamento2A || 0) +
        parseFloat(entrada.datos_formulario.cabInt_departamento2B || 0) +
        parseFloat(entrada.datos_formulario.cabInt_departamento3A || 0) +
        parseFloat(entrada.datos_formulario.cabInt_departamento3B || 0)
    ).toFixed(2);
    
    // Preparar contenido del modal
    let contenido = `
        <h4>${getNombreMes(entrada.mes)} ${entrada.año}</h4>
        <p><strong>Calculado el:</strong> ${entrada.fecha_calculo}</p>
        
        <h5>Datos del Formulario:</h5>
        <table style="width: 100%; font-size: 0.9rem;">
            <tr><td><strong>Personas Piso 1:</strong></td><td>${entrada.datos_formulario.personas_piso1}</td></tr>
            <tr><td><strong>Personas Depto 2A:</strong></td><td>${entrada.datos_formulario.personas_departamento2A}</td></tr>
            <tr><td><strong>Personas Depto 2B:</strong></td><td>${entrada.datos_formulario.personas_departamento2B}</td></tr>
            <tr><td><strong>Personas Depto 3A:</strong></td><td>${entrada.datos_formulario.personas_departamento3A}</td></tr>
            <tr><td><strong>Personas Depto 3B:</strong></td><td>${entrada.datos_formulario.personas_departamento3B}</td></tr>
            <tr><td><strong>Total Luz:</strong></td><td>S/${parseFloat(entrada.datos_formulario.total_luz || 0).toFixed(2)}</td></tr>
            <tr><td><strong>Total Agua:</strong></td><td>S/${parseFloat(entrada.datos_formulario.total_agua || 0).toFixed(2)}</td></tr>
            <tr><td><strong>Total Gas:</strong></td><td>S/${totalGas}</td></tr>
            <tr><td><strong>Total Cable/Internet:</strong></td><td>S/${totalCableInternet}</td></tr>
        </table>
    `;
    
    // Mostrar en el modal de detalles
    document.getElementById('modal_detalles_content').innerHTML = contenido;
    
    // Abrir el modal directamente usando las funciones del modal.js
    const modal = document.getElementById('modal_detalles_historial');
    openModal(modal);
}

/**
 * =====================================
 * SISTEMA DE IMPORTACIÓN/EXPORTACIÓN DE DATOS
 * =====================================
 */

/**
 * ABRIR MODAL DE IMPORTAR/EXPORTAR
 */
function abrirModalImportExport() {
    const modal = document.getElementById('modal_import_export');
    openModal(modal);
}

/**
 * EXPORTAR DATOS DEL HISTÓRICO
 * Descarga un archivo JSON con todo el histórico de cálculos
 */
function exportarDatos() {
    try {
        const historial = cargarHistorial();
        
        if (historial.length === 0) {
            alert('No hay datos en el histórico para exportar.');
            return;
        }
        
        // Crear objeto con metadatos y datos
        const datosExportacion = {
            version: "1.0",
            fecha_exportacion: new Date().toISOString(),
            total_calculos: historial.length,
            aplicacion: "Cuentas de la Casa",
            datos: historial
        };
        
        // Convertir a JSON con formato legible
        const jsonString = JSON.stringify(datosExportacion, null, 2);
        
        // Crear archivo para descarga
        const blob = new Blob([jsonString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        const fechaActual = new Date();
        const timestamp = fechaActual.toISOString()
            .replace('T', '-')
            .replace(/:/g, '-')
            .split('.')[0]; // Formato: YYYY-MM-DD-HH-mm-ss
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `Respaldo-${timestamp}.txt`;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`Respaldo exportado exitosamente con ${historial.length} cálculos.`);
        
    } catch (error) {
        console.error('Error al exportar datos:', error);
        alert('Error al exportar los datos. Por favor, inténtelo nuevamente.');
    }
}

/**
 * IMPORTAR DATOS DESDE ARCHIVO
 * Lee un archivo JSON y restaura el histórico de cálculos
 */
function importarDatos() {
    const fileInput = document.getElementById('file_import');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, seleccione un archivo para importar.');
        return;
    }
    
    // Validar tipo de archivo
    if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
        alert('Por favor, seleccione un archivo .json o .txt válido.');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const contenido = e.target.result;
            let datosImportados;
            
            // Intentar parsear el JSON
            try {
                datosImportados = JSON.parse(contenido);
            } catch (parseError) {
                alert('El archivo no contiene un formato JSON válido.');
                return;
            }
            
            // Validar estructura del archivo
            let historicoImportado;
            if (datosImportados.datos && Array.isArray(datosImportados.datos)) {
                // Formato con metadatos (versión nueva)
                historicoImportado = datosImportados.datos;
            } else if (Array.isArray(datosImportados)) {
                // Formato directo del array (compatible con versiones anteriores)
                historicoImportado = datosImportados;
            } else {
                alert('El archivo no contiene un formato de datos válido.');
                return;
            }
            
            // Validar que cada entrada tenga la estructura correcta
            const esValido = historicoImportado.every(entrada => 
                entrada.id && 
                entrada.mes && 
                entrada.año && 
                entrada.datos_formulario
            );
            
            if (!esValido) {
                alert('El archivo contiene datos con formato incorrecto.');
                return;
            }
            
            // Verificar si se debe sobreescribir o añadir
            const sobreescribir = document.getElementById('sobreescribir_historial').checked;
            
            // Confirmar importación
            const accion = sobreescribir ? 'reemplazará completamente' : 'se combinará con';
            const mensaje = `¿Importar ${historicoImportado.length} cálculos?\n\n` +
                          `Esta acción ${accion} el histórico actual.`;
            
            if (!confirm(mensaje)) {
                return;
            }
            
            let historialFinal;
            
            if (sobreescribir) {
                // SOBREESCRIBIR: Usar solo los datos importados
                historialFinal = historicoImportado.slice(0, 50); // Mantener límite de 50
            } else {
                // AÑADIR: Combinar con histórico actual
                const historialActual = cargarHistorial();
                
                // Asignar nuevos IDs a los datos importados para evitar conflictos
                const historialConNuevosIds = historicoImportado.map(entrada => ({
                    ...entrada,
                    id: Date.now() + Math.random() // Generar ID único
                }));
                
                // Combinar historiales
                const historialCombinado = [...historialConNuevosIds, ...historialActual];
                
                // Mantener límite de 50 entradas
                historialFinal = historialCombinado.slice(0, 50);
            }
            
            // Guardar en localStorage
            localStorage.setItem('historial_cuentas', JSON.stringify(historialFinal));
            
            // Actualizar visualización
            mostrarHistorial();
            
            // Cerrar modal
            const modal = document.getElementById('modal_import_export');
            closeModal(modal);
            
            alert(`Importación exitosa!\n${historicoImportado.length} cálculos importados.`);
            
        } catch (error) {
            console.error('Error al importar datos:', error);
            alert('Error al procesar el archivo. Verifique que sea un respaldo válido.');
        }
    };
    
    reader.readAsText(file);
}

/**
 * INICIALIZACIÓN AL CARGAR LA PÁGINA
 * Restaura automáticamente todos los valores guardados del formulario
 * y aplica el tema guardado por el usuario
 */
getCacheValues();
cargarTemaGuardado();
mostrarHistorial(); // Cargar histórico al iniciar