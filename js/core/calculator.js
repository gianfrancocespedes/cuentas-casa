/**
 * ============================================================================
 * LÓGICA DE CÁLCULOS Y GENERACIÓN DE PDFs
 * ============================================================================
 *
 * PROPÓSITO DE ESTE ARCHIVO:
 * Contiene toda la lógica de negocio para calcular los costos de servicios
 * públicos (luz, agua, gas, cable/internet, vigilancia) y generar recibos en PDF
 * para cada apartamento del edificio.
 *
 * FLUJO COMPLETO DE TRABAJO:
 *
 * 1. calcularCuentas()
 *    └─> Valida el formulario
 *    └─> Muestra sección de resultados
 *    └─> Llama a gestionarPDFs()
 *    └─> Guarda en histórico
 *
 * 2. gestionarPDFs()
 *    └─> Genera 5 PDFs (uno por apartamento)
 *    └─> Asigna cada PDF a su iframe para previsualización
 *
 * 3. generarPDF(piso)
 *    └─> Crea documento PDF vacío
 *    └─> Si es Piso 1: Formato simple
 *    └─> Si es Departamento: Formato detallado con medidores
 *    └─> Retorna documento PDF completo
 *
 * 4. descargarPDF(piso)
 *    └─> Regenera el PDF
 *    └─> Crea nombre con timestamp
 *    └─> Descarga al dispositivo
 *
 * ESTRUCTURA DE DATOS CLAVE:
 *
 * - datos (global): Objeto con todos los campos del formulario
 *   {
 *     calculo_mes: "1",
 *     calculo_anio: "2025",
 *     personas_piso1: "4",
 *     medidor_actual_departamento2A: "1500",
 *     total_luz: "500.00",
 *     ...
 *   }
 *
 * - totalesLuz (global): Totales de luz calculados por departamento
 *   {
 *     departamento2A: 120.50,
 *     departamento2B: 95.30,
 *     departamento3A: 110.20,
 *     departamento3B: 88.40
 *   }
 *
 * REGLAS DE NEGOCIO:
 *
 * - ELECTRICIDAD (Luz):
 *   • Departamentos: Medidor individual con cálculo detallado
 *     (consumo × tarifa) × 1.18 (IGV) + alumbrado público
 *   • Piso 1: Paga diferencia = Total factura - Suma departamentos
 *
 * - AGUA:
 *   • Distribución proporcional por número de ocupantes
 *   • Cada apartamento paga: (Total ÷ Personas totales) × Personas del apto
 *
 * - GAS, CABLE/INTERNET y VIGILANCIA:
 *   • Valores directos ingresados por el usuario
 *   • No hay cálculo automático
 *
 * DEPENDENCIAS:
 * - jsPDF (CDN): Librería para generación de PDFs
 * - pdf.js (utils): Funciones wrapper para jsPDF
 * - formatters.js (utils): Formateo de fechas y monedas
 * - validation.js (core): Validación de formularios
 *
 * ============================================================================
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
            vigilancia_piso1: datos.vigilancia_piso1,
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
 * ============================================================================
 * GENERADOR DE PDF POR DEPARTAMENTO/PISO
 * ============================================================================
 *
 * PROPÓSITO:
 * Crea un documento PDF tipo "recibo" con el desglose detallado de los costos
 * de servicios públicos para un apartamento específico.
 *
 * ESTRUCTURA VISUAL DEL PDF (DEPARTAMENTOS):
 * ┌─────────────────────────────────────┐
 * │      Departamento 2A                │ ← Y=10  (centrado)
 * │      Enero/2025                     │ ← Y=15  (centrado)
 * │                                     │
 * │ Luz:                                │ ← Y=25
 * │    1500 -> Mes anterior             │ ← Y=30
 * │    1700 -> Mes actual               │ ← Y=35
 * │    ─────                            │ ← Y=36  (línea de resta)
 * │       200                           │ ← Y=40  (consumo)
 * │    x 0.50 -> KW                     │ ← Y=45
 * │    ─────                            │ ← Y=46  (línea de multiplicación)
 * │       100.00                        │ ← Y=50
 * │          18.00 -> 18%               │ ← Y=55  (IGV)
 * │    ─────                            │ ← Y=56  (línea de suma)
 * │       118.00                        │ ← Y=60
 * │          5.00 -> A. público         │ ← Y=65
 * │    ─────                            │ ← Y=66  (línea de suma)
 * │       123.00 -> Total Luz           │ ← Y=70
 * │                                     │
 * │ Agua:                               │ ← Y=80
 * │    150 ÷ 15 = S/10.00               │ ← Y=85
 * │    10.00 x 4 = S/40.00 -> T. Agua   │ ← Y=90
 * │                                     │
 * │        Resumen                      │ ← Y=100 (centrado)
 * │ ┌─────────────────────────────────┐ │ ← Y=101 (rectángulo)
 * │ │   Agua + Luz + Gas              │ │ ← Y=105
 * │ │   40.00 + 123.00 + 25.00        │ │ ← Y=110
 * │ │   S/188.00                      │ │ ← Y=115 (bold)
 * │ └─────────────────────────────────┘ │
 * └─────────────────────────────────────┘
 *
 * ESTRUCTURA VISUAL DEL PDF (PISO 1):
 * ┌─────────────────────────────────────┐
 * │      Piso 1                         │ ← Y=10  (centrado)
 * │      Enero/2025                     │ ← Y=15  (centrado)
 * │                                     │
 * │ Luz: 500 - 414.40 = S/85.60         │ ← Y=25
 * │                                     │
 * │ Agua:                               │ ← Y=35
 * │    150 ÷ 15 = S/10.00               │ ← Y=40
 * │    10.00 x 3 = S/30.00              │ ← Y=45
 * │                                     │
 * │ Gas:                                │ ← Y=55
 * │    S/20.00                          │ ← Y=60
 * │                                     │
 * │ Cable e internet:                   │ ← Y=70
 * │    S/50.00                          │ ← Y=75
 * │                                     │
 * │ Vigilancia: (condicional)           │ ← Y=85
 * │    S/30.00                          │ ← Y=90
 * └─────────────────────────────────────┘
 *
 * DIFERENCIAS ENTRE PISO 1 Y DEPARTAMENTOS:
 * - Piso 1: Paga la diferencia de luz (total - suma departamentos), formato simple
 * - Departamentos: Cálculo detallado con medidores individuales y resumen final
 *
 * COORDENADAS:
 * - El sistema de coordenadas de jsPDF usa puntos (1 punto ≈ 0.35mm)
 * - Origen (0,0) en esquina superior izquierda
 * - Y aumenta hacia abajo
 * - Documento: 350 puntos ancho × 450 puntos alto (aumentado para incluir Vigilancia)
 *
 * @param {string} piso - Identificador del piso/departamento ('1', '2A', '2B', '3A', '3B')
 * @returns {jsPDF} Objeto PDF generado listo para descargar o previsualizar
 */
function generarPDF(piso) {
    // ========================================================================
    // CONFIGURACIÓN DEL DOCUMENTO PDF
    // ========================================================================
    // Crea un documento de 350x450 puntos (pequeño, tipo recibo)
    // Tamaño aumentado a 450 para acomodar la sección de Vigilancia
    // Fuente Courier para apariencia de documento impreso tradicional
    const doc = createPDF({
        format: [350, 450],      // Tamaño personalizado [ancho, alto] en puntos (aumentado por Vigilancia)
        fontSize: 15,            // Tamaño de fuente por defecto
        font: "courier",         // Fuente monoespaciada tipo máquina de escribir
        fontType: "normal"       // Peso normal (no bold)
    });
    
    // ========================================================================
    // GENERACIÓN DE PDF PARA PISO 1 (CASO ESPECIAL)
    // ========================================================================
    //
    // DIFERENCIA CLAVE: El Piso 1 NO tiene medidor individual de luz.
    // Por eso paga la diferencia entre el total de la factura eléctrica
    // y la suma de lo que pagan los 4 departamentos con sus medidores.
    //
    // FORMATO: Más simple que los departamentos, sin cálculos paso a paso
    // ========================================================================
    if (piso === '1') {
        let num;  // Variable temporal para almacenar resultados de cálculos

        // --------------------------------------------------------------------
        // ENCABEZADO DEL DOCUMENTO
        // --------------------------------------------------------------------
        addCenteredTextToPDF(doc, "Piso 1", 48.0);  // Título centrado en Y=10
        addCenteredTextToPDF(doc, `${getMonthName(datos.calculo_mes)}/${datos.calculo_anio}`, 66.0);  // Período

        // --------------------------------------------------------------------
        // CÁLCULO DE LUZ PARA PISO 1
        // --------------------------------------------------------------------
        // LÓGICA: Piso 1 paga = Total Factura Luz - (Suma de todos los departamentos)
        // Ejemplo: Si factura total = 500 y departamentos pagan 350, Piso 1 = 150
        num = (parseFloat(datos.total_luz) - getTotalLuzDep()).toFixed(2);
        addTextToPDF(doc, `Luz: ${parseFloat(datos.total_luz).toFixed(2)} - ${getTotalLuzDep().toFixed(2)} = S/${num}`, 30.0, 102.0);

        // --------------------------------------------------------------------
        // CÁLCULO DE AGUA PARA PISO 1
        // --------------------------------------------------------------------
        // LÓGICA: Distribución proporcional por número de personas
        // PASO 1: Calcular costo por persona = Total Agua / Total de personas en la casa
        // PASO 2: Multiplicar por personas del Piso 1
        addTextToPDF(doc, `Agua:`, 30.0, 138.0);
        num = (parseFloat(datos.total_agua) / getTotalPersonas()).toFixed(2);
        // String.fromCharCode(247) = símbolo de división ÷
        addTextToPDF(doc, `${datos.total_agua} ${String.fromCharCode(247)} ${getTotalPersonas()} = S/${num}`, 62.0, 156.0);
        addTextToPDF(doc, `${num} x ${datos.personas_piso1} = S/${(num * datos.personas_piso1).toFixed(2)}`, 62.0, 174.0);

        // --------------------------------------------------------------------
        // GAS PARA PISO 1 (VALOR DIRECTO)
        // --------------------------------------------------------------------
        // El gas se ingresa directamente por el usuario, no hay cálculo automático
        // NOTA: Actualmente se muestra SIEMPRE, incluso si el valor es 0 o nulo.
        // Si se desea hacerlo condicional (solo mostrar cuando > 0), seguir el
        // mismo patrón usado en Vigilancia (líneas 234-242) y en el resumen
        // de departamentos (líneas 386-397).
        addTextToPDF(doc, `Gas:`, 30.0, 210.0);
        addTextToPDF(doc, `S/${datos.gas_piso1}`, 62.0, 228.0);

        // --------------------------------------------------------------------
        // CABLE E INTERNET PARA PISO 1 (VALOR DIRECTO)
        // --------------------------------------------------------------------
        // También es un valor directo ingresado por el usuario
        // NOTA: Actualmente se muestra SIEMPRE, incluso si el valor es 0 o nulo.
        // Si se desea hacerlo condicional (solo mostrar cuando > 0), seguir el
        // mismo patrón usado en Vigilancia (líneas 234-242) y en el resumen
        // de departamentos (líneas 386-397).
        addTextToPDF(doc, `Cable e internet:`, 30.0, 264.0);
        addTextToPDF(doc, `S/${datos.cabInt_piso1}`, 62.0, 282.0);

        // --------------------------------------------------------------------
        // VIGILANCIA PARA PISO 1 (VALOR DIRECTO - CONDICIONAL)
        // --------------------------------------------------------------------
        // Mostrar solo si el valor es mayor a 0
        // A diferencia de Gas y Cable/Internet, Vigilancia SÍ es condicional
        const vigilanciaPiso1Value = parseFloat(datos.vigilancia_piso1) || 0;
        if (vigilanciaPiso1Value > 0) {
            addTextToPDF(doc, `Vigilancia:`, 30.0, 318.0);
            addTextToPDF(doc, `S/${datos.vigilancia_piso1}`, 62.0, 336.0);
        }

    // ========================================================================
    // GENERACIÓN DE PDF PARA DEPARTAMENTOS (2A, 2B, 3A, 3B)
    // ========================================================================
    //
    // DIFERENCIA CLAVE: Los departamentos TIENEN medidores individuales
    // Por eso el cálculo de luz es más detallado y se muestra paso a paso
    // como en una factura real.
    //
    // FORMATO: Cálculo detallado tipo "recibo" con cada operación matemática
    // ========================================================================
    } else {
        let accJSON;      // Nombre de campo en el objeto datos (construido dinámicamente)
        let luz;          // Total de luz calculado para este departamento
        let agua;         // Total de agua calculado para este departamento
        let gas;          // Total de gas (valor directo)
        let vigilancia;   // Total de vigilancia (valor directo)
        let totalPiso;    // Total final a pagar (suma de todos los servicios)

        // --------------------------------------------------------------------
        // ENCABEZADO DEL DOCUMENTO
        // --------------------------------------------------------------------
        addCenteredTextToPDF(doc, `Departamento ${piso}`, 48.0);
        addCenteredTextToPDF(doc, `${getMonthName(datos.calculo_mes)}/${datos.calculo_anio}`, 66.0);

        // ====================================================================
        // CÁLCULO DETALLADO DE LUZ (PASO A PASO)
        // ====================================================================
        // Este es el cálculo más complejo y se muestra como una operación
        // matemática vertical, similar a cómo se hace en papel:
        //
        //   Medidor anterior:  1500
        //   Medidor actual:    1700
        //   ___________________
        //   Consumo KW:        200
        //   × Tarifa KW:       0.50
        //   ___________________
        //   Subtotal:          100.00
        //   + IGV (18%):       18.00
        //   ___________________
        //   Subtotal:          118.00
        //   + Alumbrado:       5.00
        //   ___________________
        //   TOTAL LUZ:         123.00
        // ====================================================================
        // Columnas de la operacion vertical de luz:
        // los numeros se alinean a la derecha en COL_NUM (borde derecho de las
        // lineas de operacion) para que sus decimales queden en columna,
        // y las etiquetas "-> ..." arrancan en COL_ETIQUETA.
        const COL_NUM = 198.8;
        const COL_ETIQUETA = 209.6;

        addTextToPDF(doc, `Luz:`, 80.0, 102.0);

        // PASO 1: Obtener lectura del medidor del mes anterior
        // Construye el nombre del campo dinámicamente: "medidor_pasado_departamento2A"
        accJSON = "medidor_pasado_departamento" + piso;
        let num1 = datos[accJSON];
        addTextToPDF(doc, `${num1}`, COL_NUM, 120.0, { align: 'right' });
        addTextToPDF(doc, `-> Mes anterior`, COL_ETIQUETA, 120.0);

        // PASO 2: Obtener lectura del medidor del mes actual
        accJSON = "medidor_actual_departamento" + piso;
        let num2 = datos[accJSON];
        addTextToPDF(doc, `${num2}`, COL_NUM, 138.0, { align: 'right' });
        addTextToPDF(doc, `-> Mes actual`, COL_ETIQUETA, 138.0);

        // PASO 3: Calcular consumo en KW (diferencia entre lecturas)
        addLineToPDF(doc, 112.4, 141.6, 198.8, 141.6);   // Línea horizontal de resta
        num1 = (parseFloat(num2) - parseFloat(num1)).toFixed(2);
        addTextToPDF(doc, `${num1}`, COL_NUM, 156.0, { align: 'right' });  // Resultado del consumo

        // PASO 4: Multiplicar consumo por tarifa del KW
        num2 = datos.valor_kw;
        addTextToPDF(doc, `x ${num2}`, COL_NUM, 174.0, { align: 'right' });
        addTextToPDF(doc, `-> KW`, COL_ETIQUETA, 174.0);
        addLineToPDF(doc, 112.4, 177.6, 198.8, 177.6);   // Línea horizontal de multiplicación
        num1 = (num1 * parseFloat(num2)).toFixed(2);
        addTextToPDF(doc, `${num1}`, COL_NUM, 192.0, { align: 'right' });  // Subtotal antes de impuestos

        // PASO 5: Calcular y agregar IGV (Impuesto General a las Ventas = 18%)
        num2 = (0.18 * num1).toFixed(2);
        addTextToPDF(doc, `${num2}`, COL_NUM, 210.0, { align: 'right' });
        addTextToPDF(doc, `-> 18%`, COL_ETIQUETA, 210.0);
        addLineToPDF(doc, 112.4, 213.6, 198.8, 213.6);   // Línea horizontal de suma
        num1 = (num1 * 1.0 + num2 * 1.0).toFixed(2);  // Multiplicar por 1.0 para asegurar suma numérica
        addTextToPDF(doc, `${num1}`, COL_NUM, 228.0, { align: 'right' });

        // PASO 6: Agregar cargo fijo de alumbrado público
        num2 = datos.alumbrado_publico;
        addTextToPDF(doc, `${num2}`, COL_NUM, 246.0, { align: 'right' });
        addTextToPDF(doc, `-> A. público`, COL_ETIQUETA, 246.0);
        addLineToPDF(doc, 112.4, 249.6, 198.8, 249.6);   // Línea horizontal de suma final
        num1 = (num1 * 1.0 + num2 * 1.0).toFixed(2);
        addTextToPDF(doc, `${num1}`, COL_NUM, 264.0, { align: 'right' });
        addTextToPDF(doc, `-> Total Luz`, COL_ETIQUETA, 264.0);

        // PASO 7: Guardar el total de luz calculado para este departamento
        // Este valor se usa después para calcular cuánto paga el Piso 1
        luz = num1;
        accJSON = "departamento" + piso;
        totalesLuz[accJSON] = luz;  // Almacenar en el objeto global totalesLuz
        
        // ====================================================================
        // CÁLCULO DE AGUA
        // ====================================================================
        // LÓGICA: Distribución proporcional basada en el número de ocupantes
        // PASO 1: Costo por persona = Total Agua / Total personas de la casa
        // PASO 2: Costo del departamento = Costo por persona × Personas del depto
        // ====================================================================
        addTextToPDF(doc, `Agua:`, 44.0, 300.0);
        num1 = datos.total_agua;  // Total de la factura de agua
        num2 = (num1 / getTotalPersonas()).toFixed(2);  // Costo por persona
        // String.fromCharCode(247) = símbolo ÷
        addTextToPDF(doc, `${num1} ${String.fromCharCode(247)} ${getTotalPersonas()} = S/${num2}`, 62.0, 318.0);

        // Multiplicar por el número de personas en este departamento
        accJSON = "personas_departamento" + piso;
        num1 = (num2 * datos[accJSON]).toFixed(2);
        addTextToPDF(doc, `${num2} x ${datos[accJSON]} = S/${num1} -> T. Agua`, 62.0, 336.0);
        agua = num1;  // Guardar total de agua para el resumen final

        // ====================================================================
        // GAS (VALOR DIRECTO POR DEPARTAMENTO)
        // ====================================================================
        // El gas no tiene cálculo automático, es un valor ingresado directamente
        // por el usuario para cada departamento
        accJSON = "gas_departamento" + piso;
        gas = datos[accJSON];

        // ====================================================================
        // VIGILANCIA (VALOR DIRECTO POR DEPARTAMENTO)
        // ====================================================================
        accJSON = "vigilancia_departamento" + piso;
        vigilancia = datos[accJSON];

        // ====================================================================
        // CÁLCULO DEL TOTAL A PAGAR
        // ====================================================================
        // Suma de todos los servicios (multiplicar por 1 asegura conversión numérica)
        totalPiso = agua * 1 + gas * 1 + luz * 1 + (vigilancia * 1);

        // ====================================================================
        // RESUMEN FINAL EN RECUADRO
        // ====================================================================
        // Se presenta en un rectángulo visual para destacar el total final
        // Este resumen aparece en la parte inferior del PDF
        addCenteredTextToPDF(doc, `Resumen`, 372.0);

        // Recuadro del resumen: centrado respecto al ancho real de la pagina
        // y dimensionado para envolver las tres lineas (etiquetas, valores y total)
        const anchoPagina = getPDFPageSize(doc).width;
        const cajaAncho = anchoPagina - 44.0 * 2;
        addRectangleToPDF(doc, 44.0, 375.6, cajaAncho, 72.0);

        // Construir etiquetas y valores de forma condicional
        let summaryLabel = "Agua + Luz";
        let summaryValues = `${agua} + ${luz}`;

        // Solo agregar gas si es un valor válido mayor a 0
        const gasValue = parseFloat(gas) || 0;
        if (gasValue > 0) {
            summaryLabel += " + Gas";
            summaryValues += ` + ${gas}`;
        }

        // Solo agregar vigilancia si es un valor válido mayor a 0
        const vigilanciaValue = parseFloat(vigilancia) || 0;
        if (vigilanciaValue > 0) {
            summaryLabel += " + Vigilancia";
            summaryValues += ` + ${vigilancia}`;
        }

        // Contenido del resumen (fuente algo menor para que quepa dentro del recuadro)
        setPDFFontSize(doc, 13);
        addCenteredTextToPDF(doc, summaryLabel, 390.0);
        addCenteredTextToPDF(doc, summaryValues, 408.0);

        // Total final en negrita y con tamaño aumentado para destacar
        setPDFFontType(doc, "bold");
        setPDFFontSize(doc, 20);  // Aumentar tamaño de fuente de 15 a 20
        addCenteredTextToPDF(doc, `S/${Math.round(totalPiso)}.00`, 436.8);  // Y=118 para mayor separación
    }

    // ========================================================================
    // RETORNAR EL DOCUMENTO PDF COMPLETO
    // ========================================================================
    // El documento está listo para ser descargado o convertido a blob URL
    // para previsualización en un iframe
    return doc;
}

/**
 * ============================================================================
 * GENERADOR Y GESTOR DE TODOS LOS PDFs
 * ============================================================================
 *
 * PROPÓSITO:
 * Después de validar el formulario, esta función genera los 5 PDFs
 * (uno por cada apartamento) y los prepara para previsualización.
 *
 * FLUJO DE TRABAJO:
 * 1. Genera cada PDF llamando a generarPDF() con el ID del apartamento
 * 2. Convierte el PDF a blob URL (URL temporal en memoria del navegador)
 * 3. Asigna el blob URL al atributo 'src' de un <iframe> en el HTML
 * 4. El usuario puede ver el PDF en el modal antes de descargarlo
 *
 * NOTA IMPORTANTE:
 * - Los PDFs se regeneran cada vez que se hace clic en "Calcular Cuentas"
 * - No se guardan en disco, solo en memoria para previsualización
 * - La descarga real ocurre cuando el usuario hace clic en "Descargar PDF"
 *
 * UBICACIÓN DE LOS IFRAMES:
 * Los iframes están en index.html dentro de cada modal de previsualización
 */
function gestionarPDFs() {
    // ------------------------------------------------------------------------
    // GENERAR PDF PARA DEPARTAMENTO 2A
    // ------------------------------------------------------------------------
    let pdf = generarPDF("2A");
    // Convertir el PDF a blob URL y asignarlo al iframe correspondiente
    getElementById('iframe_departamento2A').setAttribute('src', getPDFBlobURL(pdf));

    // ------------------------------------------------------------------------
    // GENERAR PDF PARA DEPARTAMENTO 2B
    // ------------------------------------------------------------------------
    pdf = generarPDF("2B");
    getElementById('iframe_departamento2B').setAttribute('src', getPDFBlobURL(pdf));

    // ------------------------------------------------------------------------
    // GENERAR PDF PARA DEPARTAMENTO 3A
    // ------------------------------------------------------------------------
    pdf = generarPDF("3A");
    getElementById('iframe_departamento3A').setAttribute('src', getPDFBlobURL(pdf));

    // ------------------------------------------------------------------------
    // GENERAR PDF PARA DEPARTAMENTO 3B
    // ------------------------------------------------------------------------
    pdf = generarPDF("3B");
    getElementById('iframe_departamento3B').setAttribute('src', getPDFBlobURL(pdf));

    // ------------------------------------------------------------------------
    // GENERAR PDF PARA PISO 1
    // ------------------------------------------------------------------------
    pdf = generarPDF("1");
    getElementById('iframe_piso1').setAttribute('src', getPDFBlobURL(pdf));
}

/**
 * ============================================================================
 * FUNCIÓN DE DESCARGA DE PDF INDIVIDUAL
 * ============================================================================
 *
 * PROPÓSITO:
 * Descarga un PDF específico al disco del usuario con un nombre único.
 *
 * CUÁNDO SE EJECUTA:
 * Esta función se llama cuando el usuario hace clic en el botón
 * "Descargar PDF" en cualquiera de los modales de previsualización.
 *
 * PROCESO:
 * 1. Regenera el PDF (no reutiliza el del iframe, lo crea de nuevo)
 * 2. Construye un nombre de archivo único con timestamp
 * 3. Descarga el archivo al dispositivo del usuario
 *
 * FORMATO DEL NOMBRE:
 * - Piso 1: "Piso 1_5021201162025.pdf"
 * - Departamento 2A: "Departamento 2A_5021201162025.pdf"
 * El timestamp es: segundos+minutos+horas+día+mes+año
 *
 * @param {string} piso - Identificador del piso/departamento a descargar ('1', '2A', '2B', '3A', '3B')
 */
function descargarPDF(piso) {
    // ------------------------------------------------------------------------
    // REGENERAR EL PDF
    // ------------------------------------------------------------------------
    // Nota: No reutilizamos el PDF del iframe porque podría haber sido modificado
    // o el usuario podría haber cambiado datos. Regenerar asegura consistencia.
    const doc = generarPDF(piso);

    // ------------------------------------------------------------------------
    // CREAR NOMBRE DE ARCHIVO CON TIMESTAMP ÚNICO
    // ------------------------------------------------------------------------
    const baseName = piso === '1' ? `Piso ${piso}` : `Departamento ${piso}`;
    const filename = generatePDFFilename(baseName);  // Agrega timestamp automáticamente

    // ------------------------------------------------------------------------
    // DESCARGAR EL PDF
    // ------------------------------------------------------------------------
    // Usa la API de jsPDF para iniciar la descarga del archivo
    downloadPDF(doc, filename);
}