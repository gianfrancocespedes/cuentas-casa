/**
 * UTILIDADES GENÉRICAS PARA jsPDF
 * Funciones reutilizables para creación y manejo de PDFs
 * Este archivo puede ser trasladado a cualquier otro proyecto
 */

/**
 * Crea un nuevo documento PDF con configuración básica
 * @param {object} config - Configuración del PDF
 * @param {Array} config.format - Tamaño del documento [ancho, alto]
 * @param {number} config.fontSize - Tamaño de fuente
 * @param {string} config.font - Tipo de fuente
 * @param {string} config.fontType - Estilo de fuente (normal, bold, etc.)
 * @returns {jsPDF} Documento PDF configurado
 */
function createPDF(config = {}) {
    const defaultConfig = {
        format: [350, 400],
        fontSize: 15,
        font: "courier",
        fontType: "normal"
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    const doc = new jsPDF({
        format: finalConfig.format
    });
    
    doc.setFontSize(finalConfig.fontSize);
    doc.setFont(finalConfig.font, finalConfig.fontType);
    
    return doc;
}

/**
 * Agrega texto a un documento PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {string} text - Texto a agregar
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {object} options - Opciones adicionales
 * @param {string} options.align - Alineación del texto ('left', 'center', 'right')
 */
function addTextToPDF(doc, text, x, y, options = {}) {
    if (!doc || !text) return;
    
    const align = options.align || 'left';
    doc.text(text, x, y, align);
}

/**
 * Agrega una línea horizontal a un documento PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {number} x1 - Posición X inicial
 * @param {number} y1 - Posición Y inicial
 * @param {number} x2 - Posición X final
 * @param {number} y2 - Posición Y final
 */
function addLineToPDF(doc, x1, y1, x2, y2) {
    if (!doc) return;
    doc.line(x1, y1, x2, y2);
}

/**
 * Agrega un rectángulo a un documento PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} width - Ancho del rectángulo
 * @param {number} height - Alto del rectángulo
 * @param {string} style - Estilo del rectángulo ('S', 'F', 'DF')
 */
function addRectangleToPDF(doc, x, y, width, height, style = 'S') {
    if (!doc) return;
    doc.rect(x, y, width, height, style);
}

/**
 * Establece el tipo de fuente en un documento PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {string} fontType - Tipo de fuente ('normal', 'bold', 'italic', etc.)
 */
function setPDFFontType(doc, fontType) {
    if (!doc) return;
    doc.setFontType(fontType);
}

/**
 * Establece el tamaño de fuente en un documento PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {number} fontSize - Tamaño de fuente
 */
function setPDFFontSize(doc, fontSize) {
    if (!doc) return;
    doc.setFontSize(fontSize);
}

/**
 * Genera un nombre de archivo único para PDF
 * @param {string} baseName - Nombre base del archivo
 * @param {string} extension - Extensión del archivo (sin punto)
 * @returns {string} Nombre de archivo con timestamp
 */
function generatePDFFilename(baseName, extension = 'pdf') {
    const now = new Date();
    const timestamp = `${now.getSeconds()}${now.getMinutes()}${now.getHours()}${now.getDate()}${now.getMonth()}${now.getFullYear()}`;
    return `${baseName}_${timestamp}.${extension}`;
}

/**
 * Descarga un documento PDF
 * @param {jsPDF} doc - Documento PDF a descargar
 * @param {string} filename - Nombre del archivo
 */
function downloadPDF(doc, filename) {
    if (!doc || !filename) return;
    doc.save(filename);
}

/**
 * Convierte un documento PDF a blob URL
 * @param {jsPDF} doc - Documento PDF
 * @returns {string} Blob URL del documento
 */
function getPDFBlobURL(doc) {
    if (!doc) return null;
    return doc.output('bloburl');
}

/**
 * Obtiene las dimensiones de la página del PDF
 * @param {jsPDF} doc - Documento PDF
 * @returns {object} Objeto con width y height de la página
 */
function getPDFPageSize(doc) {
    if (!doc) return { width: 0, height: 0 };
    
    const pageSize = doc.internal.pageSize;
    return {
        width: pageSize.getWidth(),
        height: pageSize.getHeight()
    };
}

/**
 * Centra texto horizontalmente en la página
 * @param {jsPDF} doc - Documento PDF
 * @param {string} text - Texto a centrar
 * @param {number} y - Posición Y
 */
function addCenteredTextToPDF(doc, text, y) {
    if (!doc || !text) return;
    
    const pageSize = getPDFPageSize(doc);
    const x = pageSize.width / 2;
    
    addTextToPDF(doc, text, x, y, { align: 'center' });
}

/**
 * Agrega múltiples líneas de texto con espaciado automático
 * @param {jsPDF} doc - Documento PDF
 * @param {Array<string>} lines - Array de líneas de texto
 * @param {number} startX - Posición X inicial
 * @param {number} startY - Posición Y inicial
 * @param {number} lineHeight - Altura entre líneas
 */
function addMultilineTextToPDF(doc, lines, startX, startY, lineHeight = 5) {
    if (!doc || !Array.isArray(lines)) return;
    
    lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        addTextToPDF(doc, line, startX, y);
    });
}