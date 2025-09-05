/**
 * SISTEMA DE CAMBIO DE TEMA
 * Funciones para alternar entre modo claro y oscuro
 * Este archivo maneja la preferencia de tema del usuario
 */

/**
 * SISTEMA DE CAMBIO DE TEMA (MODO OSCURO/CLARO)
 * Alterna entre tema claro y oscuro, actualiza el icono del botón
 * y aplica el cambio inmediatamente a toda la página
 */
function cambiarTema() {
    const pagina = getElementById('webPage');
    
    // Determinar el tema opuesto al actual
    const targetTheme = pagina.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    
    // Aplicar el nuevo tema
    aplicarTema(targetTheme);
    
    // Guardar la preferencia del usuario
    saveToStorage('casa_calculator_theme', targetTheme);
}

/**
 * Aplica un tema específico a la página y actualiza el botón
 * @param {string} tema - 'light' o 'dark'
 */
function aplicarTema(tema) {
    const pagina = getElementById('webPage');
    const botonTema = getElementById("boton_tema");
    
    // Aplicar el tema al elemento HTML principal
    if (pagina) {
        pagina.setAttribute('data-theme', tema);
    }
    
    // Actualizar el icono y texto del botón según el tema
    if (botonTema) {
        if (tema === 'light') {
            // Si es tema claro, mostrar icono de luna para cambiar a oscuro
            botonTema.innerHTML = "<i class='fa-solid fa-moon'></i>&nbsp;&nbsp;Cambiar Tema";
        } else {
            // Si es tema oscuro, mostrar icono de brillo para cambiar a claro
            botonTema.innerHTML = "<i class='fa-solid fa-brightness'></i>&nbsp;&nbsp;Cambiar Tema";
        }
    }
}

/**
 * Carga el tema guardado del usuario al iniciar la página
 */
function cargarTemaGuardado() {
    // Recuperar tema guardado o usar 'dark' por defecto
    const temaGuardado = getFromStorage('casa_calculator_theme', 'dark');
    aplicarTema(temaGuardado);
}