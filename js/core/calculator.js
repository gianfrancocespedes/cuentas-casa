/**
 * LÓGICA DE CÁLCULOS DEL PROYECTO
 * Funciones específicas para calcular cuentas de servicios
 * Este archivo contiene la lógica de negocio específica del proyecto
 */

/**
 * FUNCIÓN PRINCIPAL DE CÁLCULO DE CUENTAS
 * Valida que todos los campos estén completos y procesa los cálculos
 * Si todo está correcto, muestra la sección de resultados y genera los PDFs
 */
function calcularCuentas() {
    // Mostrar loader en el botón
    const botonCalcular = getElementById('boton_calcular');
    const textoOriginal = botonCalcular.innerHTML;
    botonCalcular.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp;&nbsp;Calculando...';
    setElementEnabled(botonCalcular, false);
    
    // Limpiar mensajes de error anteriores
    limpiarMensajesError();
    
    // VALIDACIÓN COMPLETA DE DATOS
    if (!validarFormulario(datos)) {
        // Restaurar botón si hay errores
        botonCalcular.innerHTML = textoOriginal;
        setElementEnabled(botonCalcular, true);
        return; // No continuar si hay errores
    }

    // MOSTRAR SECCIÓN DE RESULTADOS
    const fechaHoraCalculo = new Date();
    
    // Si es la primera vez que se calculan las cuentas, mostrar la sección de descargas
    if (!visible) {
        setElementVisibility(getElementById("descargas"), true);  
        setElementVisibility(getElementById("linea"), true);
        visible = true;
    }
    
    // Mostrar la fecha y hora del cálculo al usuario
    setElementText(getElementById("fecha_hora_calculo"), 
        "Resultado calculado el: " + formatDate(fechaHoraCalculo));
    
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
        setElementEnabled(botonCalcular, true);
    }, 500);
}

/**
 * Calcula el total de personas en toda la casa
 * Suma todas las personas de todos los pisos y departamentos
 * @returns {number} Total de personas en la casa
 */
function getTotalPersonas() {
    return safeParseInt(datos.personas_piso1) + 
           safeParseInt(datos.personas_departamento2A) + 
           safeParseInt(datos.personas_departamento2B) +
           safeParseInt(datos.personas_departamento3A) + 
           safeParseInt(datos.personas_departamento3B);
}

/**
 * Calcula el total de luz que pagan todos los departamentos
 * No incluye el Piso 1, que paga la diferencia del total de la factura
 * @returns {number} Total de luz de los departamentos
 */
function getTotalLuzDep() {
    return safeParseFloat(totalesLuz.departamento2A) + 
           safeParseFloat(totalesLuz.departamento2B) + 
           safeParseFloat(totalesLuz.departamento3A) +
           safeParseFloat(totalesLuz.departamento3B);
}

/**
 * GENERADOR DE PDF POR DEPARTAMENTO/PISO
 * Crea un PDF detallado con los cálculos de servicios para un apartamento específico
 * @param {string} piso - Identificador del piso/departamento ('1', '2A', '2B', '3A', '3B')
 * @returns {jsPDF} Objeto PDF generado
 */
function generarPDF(piso) {
    // CONFIGURACIÓN DEL DOCUMENTO PDF
    const doc = createPDF({
        format: [350, 400],
        fontSize: 15,
        font: "courier",
        fontType: "normal"
    });
    
    // GENERACIÓN DE PDF PARA PISO 1 (CASO ESPECIAL)
    if (piso === '1') {
        let num;
        
        // ENCABEZADO DEL DOCUMENTO
        addCenteredTextToPDF(doc, "Piso 1", 10);
        addCenteredTextToPDF(doc, `${getMonthName(datos.calculo_mes)}/${datos.calculo_anio}`, 15);
        
        // CÁLCULO DE LUZ PARA PISO 1
        // El Piso 1 paga la diferencia entre el total de la factura y lo que pagan los departamentos
        num = (parseFloat(datos.total_luz) - getTotalLuzDep()).toFixed(2);
        addTextToPDF(doc, `Luz: ${datos.total_luz} - ${getTotalLuzDep()} = S/${num}`, 20, 25);
        
        // CÁLCULO DE AGUA PARA PISO 1
        // El agua se divide proporcionalmente según el número de personas
        addTextToPDF(doc, `Agua:`, 20, 35);
        num = (parseFloat(datos.total_agua) / getTotalPersonas()).toFixed(2);
        addTextToPDF(doc, `${datos.total_agua} ${String.fromCharCode(247)} ${getTotalPersonas()} = S/${num}`, 30, 40);
        addTextToPDF(doc, `${num} x ${datos.personas_piso1} = S/${(num * datos.personas_piso1).toFixed(2)}`, 30, 45);
        
        // GAS PARA PISO 1 (VALOR DIRECTO)
        addTextToPDF(doc, `Gas:`, 20, 55);
        addTextToPDF(doc, `S/${datos.gas_piso1}`, 30, 60);
        
        // CABLE E INTERNET PARA PISO 1 (VALOR DIRECTO)
        addTextToPDF(doc, `Cable e internet:`, 20, 70);
        addTextToPDF(doc, `S/${datos.cabInt_piso1}`, 30, 75);

    // GENERACIÓN DE PDF PARA DEPARTAMENTOS (2A, 2B, 3A, 3B)
    } else {
        let accJSON, luz, agua, gas, totalPiso;
        
        // ENCABEZADO DEL DOCUMENTO
        addCenteredTextToPDF(doc, `Departamento ${piso}`, 10);
        addCenteredTextToPDF(doc, `${getMonthName(datos.calculo_mes)}/${datos.calculo_anio}`, 15);
        
        // CÁLCULO DETALLADO DE LUZ
        addTextToPDF(doc, `Luz:`, 20, 25);
        
        // Obtener lectura del medidor del mes anterior
        accJSON = "medidor_pasado_departamento" + piso;
        let num1 = datos[accJSON];
        addTextToPDF(doc, `${num1} -> Mes anterior`, 30, 30);
        
        // Obtener lectura del medidor del mes actual
        accJSON = "medidor_actual_departamento" + piso;
        let num2 = datos[accJSON];
        addTextToPDF(doc, `${num2} -> Mes actual`, 30, 35);
        
        // Calcular consumo (diferencia entre lecturas)
        addLineToPDF(doc, 29, 36, 53, 36);   // Línea de resta
        num1 = (parseFloat(num2) - parseFloat(num1)).toFixed(2);
        addTextToPDF(doc, `${num1}`, 35, 40);
        
        // Multiplicar por el valor del KW
        num2 = datos.valor_kw;
        addTextToPDF(doc, `x ${num2} -> KW`, 25, 45);
        addLineToPDF(doc, 29, 46, 53, 46);   // Línea de multiplicación
        num1 = (num1 * parseFloat(num2)).toFixed(2);
        addTextToPDF(doc, `${num1}`, 35, 50);
        
        // Calcular IGV (18%)
        num2 = (0.18 * num1).toFixed(2);
        addTextToPDF(doc, `${num2} -> 18%`, 38, 55);
        addLineToPDF(doc, 29, 56, 53, 56);   // Línea de suma
        num1 = (num1 * 1.0 + num2 * 1.0).toFixed(2);
        addTextToPDF(doc, `${num1}`, 35, 60);
        
        // Agregar alumbrado público
        num2 = datos.alumbrado_publico;
        addTextToPDF(doc, `${num2} -> A. público`, 38, 65);
        addLineToPDF(doc, 29, 66, 53, 66);   // Línea de suma final
        num1 = (num1 * 1.0 + num2 * 1.0).toFixed(2);
        addTextToPDF(doc, `${num1} -> Total Luz`, 35, 70);
        
        // Guardar total de luz para este departamento
        luz = num1;
        accJSON = "departamento" + piso;
        totalesLuz[accJSON] = luz;
        
        // CÁLCULO DE AGUA
        // El agua se divide proporcionalmente según el número de personas
        addTextToPDF(doc, `Agua:`, 10, 80);
        num1 = datos.total_agua;
        num2 = (num1 / getTotalPersonas()).toFixed(2);
        addTextToPDF(doc, `${num1} ${String.fromCharCode(247)} ${getTotalPersonas()} = S/${num2}`, 20, 85);
        
        accJSON = "personas_departamento" + piso;
        num1 = (num2 * datos[accJSON]).toFixed(2);
        addTextToPDF(doc, `${num2} x ${datos[accJSON]} = S/${num1} -> T. Agua`, 20, 90);
        agua = num1;
        
        // GAS (VALOR DIRECTO POR DEPARTAMENTO)
        accJSON = "gas_departamento" + piso;
        gas = datos[accJSON];
        
        // CÁLCULO DEL TOTAL A PAGAR
        totalPiso = agua * 1 + gas * 1 + luz * 1;
        
        // RESUMEN FINAL EN RECUADRO
        addCenteredTextToPDF(doc, `Resumen`, 100);
        addRectangleToPDF(doc, 10, 101, 105, 20);  // Rectángulo para el resumen
        addCenteredTextToPDF(doc, `Agua + Luz + Gas`, 105);
        addCenteredTextToPDF(doc, `${agua} + ${luz} + ${gas}`, 110);
        setPDFFontType(doc, "bold");
        addCenteredTextToPDF(doc, `S/${Math.round(totalPiso)}.00`, 115);
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
    getElementById('iframe_departamento2A').setAttribute('src', getPDFBlobURL(pdf));
    
    // Generar PDF para Departamento 2B y asignarlo a su iframe
    pdf = generarPDF("2B");
    getElementById('iframe_departamento2B').setAttribute('src', getPDFBlobURL(pdf));
    
    // Generar PDF para Departamento 3A y asignarlo a su iframe
    pdf = generarPDF("3A");
    getElementById('iframe_departamento3A').setAttribute('src', getPDFBlobURL(pdf));
    
    // Generar PDF para Departamento 3B y asignarlo a su iframe
    pdf = generarPDF("3B");
    getElementById('iframe_departamento3B').setAttribute('src', getPDFBlobURL(pdf));
    
    // Generar PDF para Piso 1 y asignarlo a su iframe
    pdf = generarPDF("1");
    getElementById('iframe_piso1').setAttribute('src', getPDFBlobURL(pdf));
}

/**
 * FUNCIÓN DE DESCARGA DE PDF INDIVIDUAL
 * Genera un PDF específico y lo descarga con un nombre único basado en timestamp
 * @param {string} piso - Identificador del piso/departamento a descargar
 */
function descargarPDF(piso) {
    // Generar el PDF específico solicitado
    const doc = generarPDF(piso);
    
    // Crear nombre de archivo con timestamp
    const baseName = piso === '1' ? `Piso ${piso}` : `Departamento ${piso}`;
    const filename = generatePDFFilename(baseName);
    
    // Descargar el PDF
    downloadPDF(doc, filename);
}