/**
 * SISTEMA DE IMPORTACIÓN/EXPORTACIÓN DE DATOS
 * Funciones para importar y exportar el histórico de cálculos
 * Este archivo maneja el respaldo y restauración de datos
 */

/**
 * ABRIR MODAL DE IMPORTAR/EXPORTAR
 */
function abrirModalImportExport() {
    const modal = getElementById('modal_import_export');
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
        const timestamp = generateExportTimestamp();
        
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
    const fileInput = getElementById('file_import');
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
            const sobreescribirCheckbox = getElementById('sobreescribir_historial');
            const sobreescribir = sobreescribirCheckbox ? sobreescribirCheckbox.checked : true;
            
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
            saveArrayToStorage('historial_cuentas', historialFinal);
            
            // Actualizar visualización
            mostrarHistorial();
            
            // Cerrar modal
            const modal = getElementById('modal_import_export');
            closeModal(modal);
            
            alert(`Importación exitosa!\n${historicoImportado.length} cálculos importados.`);
            
        } catch (error) {
            console.error('Error al importar datos:', error);
            alert('Error al procesar el archivo. Verifique que sea un respaldo válido.');
        }
    };
    
    reader.readAsText(file);
}