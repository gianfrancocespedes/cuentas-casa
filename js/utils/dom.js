/**
 * UTILIDADES GENÉRICAS PARA MANIPULACIÓN DEL DOM
 * Funciones reutilizables para interactuar con el DOM
 * Este archivo puede ser trasladado a cualquier otro proyecto
 */

/**
 * Obtiene un elemento por su ID de forma segura
 * @param {string} id - ID del elemento
 * @returns {HTMLElement|null} Elemento encontrado o null
 */
function getElementById(id) {
    return document.getElementById(id);
}

/**
 * Obtiene elementos por su clase
 * @param {string} className - Nombre de la clase
 * @returns {NodeList} Lista de elementos encontrados
 */
function getElementsByClassName(className) {
    return document.getElementsByClassName(className);
}

/**
 * Muestra un elemento cambiando su display o visibility
 * @param {HTMLElement} element - Elemento a mostrar
 * @param {string} displayType - Tipo de display (block, flex, inline, etc.)
 */
function showElement(element, displayType = 'block') {
    if (element) {
        element.style.display = displayType;
    }
}

/**
 * Oculta un elemento cambiando su display
 * @param {HTMLElement} element - Elemento a ocultar
 */
function hideElement(element) {
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Alterna la visibilidad de un elemento
 * @param {HTMLElement} element - Elemento a alternar
 * @param {string} displayType - Tipo de display cuando se muestra
 */
function toggleElementVisibility(element, displayType = 'block') {
    if (element) {
        if (element.style.display === 'none') {
            showElement(element, displayType);
        } else {
            hideElement(element);
        }
    }
}

/**
 * Establece la visibilidad de un elemento usando la propiedad visibility
 * @param {HTMLElement} element - Elemento a modificar
 * @param {boolean} visible - true para visible, false para hidden
 */
function setElementVisibility(element, visible) {
    if (element) {
        element.style.visibility = visible ? 'visible' : 'hidden';
    }
}

/**
 * Limpia el contenido HTML de un elemento
 * @param {HTMLElement} element - Elemento a limpiar
 */
function clearElementContent(element) {
    if (element) {
        element.innerHTML = '';
    }
}

/**
 * Establece el contenido HTML de un elemento de forma segura
 * @param {HTMLElement} element - Elemento a modificar
 * @param {string} content - Contenido HTML a establecer
 */
function setElementContent(element, content) {
    if (element) {
        element.innerHTML = content;
    }
}

/**
 * Establece el contenido de texto de un elemento de forma segura
 * @param {HTMLElement} element - Elemento a modificar
 * @param {string} text - Texto a establecer
 */
function setElementText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * Obtiene el valor de un input de forma segura
 * @param {string} id - ID del input
 * @returns {string} Valor del input o string vacío
 */
function getInputValue(id) {
    const element = getElementById(id);
    return element ? element.value : '';
}

/**
 * Establece el valor de un input de forma segura
 * @param {string} id - ID del input
 * @param {string} value - Valor a establecer
 */
function setInputValue(id, value) {
    const element = getElementById(id);
    if (element) {
        element.value = value;
    }
}

/**
 * Habilita o deshabilita un elemento del formulario
 * @param {HTMLElement} element - Elemento a modificar
 * @param {boolean} enabled - true para habilitar, false para deshabilitar
 */
function setElementEnabled(element, enabled) {
    if (element) {
        element.disabled = !enabled;
    }
}

/**
 * Agrega una clase CSS a un elemento
 * @param {HTMLElement} element - Elemento a modificar
 * @param {string} className - Nombre de la clase
 */
function addClass(element, className) {
    if (element) {
        element.classList.add(className);
    }
}

/**
 * Elimina una clase CSS de un elemento
 * @param {HTMLElement} element - Elemento a modificar
 * @param {string} className - Nombre de la clase
 */
function removeClass(element, className) {
    if (element) {
        element.classList.remove(className);
    }
}

/**
 * Alterna una clase CSS en un elemento
 * @param {HTMLElement} element - Elemento a modificar
 * @param {string} className - Nombre de la clase
 */
function toggleClass(element, className) {
    if (element) {
        element.classList.toggle(className);
    }
}

/**
 * Hace scroll suave hacia un elemento
 * @param {HTMLElement} element - Elemento destino
 * @param {string} block - Posición de scroll ('start', 'center', 'end', 'nearest')
 */
function scrollToElement(element, block = 'start') {
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: block 
        });
    }
}