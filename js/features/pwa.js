// PWA (Progressive Web App) functionality
// Maneja la instalación y características específicas de PWA

// Variable global para almacenar el evento de instalación
let deferredPrompt;
const linkInstalar = document.getElementById('link_instalar_pwa');

// Escucha el evento beforeinstallprompt
// Este evento se dispara cuando el navegador determina que la app es instalable
window.addEventListener('beforeinstallprompt', (evento) => {
    console.log('[PWA] Evento beforeinstallprompt detectado');
    
    // Previene que Chrome 67 y versiones anteriores muestren automáticamente el prompt
    evento.preventDefault();
    
    // Guarda el evento para poder usarlo después
    deferredPrompt = evento;
    
    // Muestra el link de instalación personalizado
    if (linkInstalar) {
        linkInstalar.style.display = 'inline';
        console.log('[PWA] Link de instalación mostrado');
    }
});

// Maneja el clic en el link de instalación personalizado
if (linkInstalar) {
    linkInstalar.addEventListener('click', async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del enlace
        console.log('[PWA] Usuario hizo clic en instalar');
        
        if (!deferredPrompt) {
            console.log('[PWA] No hay evento de instalación disponible');
            return;
        }
        
        // Oculta el link ya que se está procesando la instalación
        linkInstalar.style.display = 'none';
        
        // Muestra el prompt de instalación del navegador
        deferredPrompt.prompt();
        
        // Espera la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('[PWA] Respuesta del usuario:', outcome);
        
        if (outcome === 'accepted') {
            console.log('[PWA] Usuario aceptó la instalación');
            // Aquí podrías mostrar un mensaje de éxito
        } else {
            console.log('[PWA] Usuario rechazó la instalación');
            // Vuelve a mostrar el link si el usuario canceló
            linkInstalar.style.display = 'inline';
        }
        
        // Limpia la variable ya que solo se puede usar una vez
        deferredPrompt = null;
    });
}

// Escucha cuando la app se instala correctamente
window.addEventListener('appinstalled', (evento) => {
    console.log('[PWA] Aplicación instalada correctamente');
    
    // Oculta el link de instalación
    if (linkInstalar) {
        linkInstalar.style.display = 'none';
    }
    
    // Limpia el evento diferido
    deferredPrompt = null;
    
    // Aquí podrías mostrar un mensaje de bienvenida o tutorial
    mostrarMensajeInstalacion();
});

// Función para mostrar mensaje después de la instalación
function mostrarMensajeInstalacion() {
    // Crear un mensaje temporal de confirmación
    const mensaje = document.createElement('div');
    mensaje.innerHTML = `
        <article style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            z-index: 1000; 
            max-width: 300px;
            background: var(--pico-background-color, #fff); 
            border: 1px solid var(--pico-color-green-500);
            border-left: 4px solid var(--pico-color-green-500);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
        ">
            <div style="padding: var(--pico-spacing);">
                <h6 style="color: var(--pico-color-green-700); margin: 0 0 0.5rem 0;">
                    <i class="fa-solid fa-check-circle"></i> ¡App Instalada!
                </h6>
                <small style="color: var(--pico-color);">Ahora puedes usar Cuentas Casa desde tu escritorio o pantalla de inicio.</small>
            </div>
        </article>
    `;
    
    // Añade estilos CSS para la animación
    if (!document.getElementById('pwa-styles')) {
        const style = document.createElement('style');
        style.id = 'pwa-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(mensaje);
    
    // Remueve el mensaje después de 5 segundos
    setTimeout(() => {
        if (mensaje.parentNode) {
            mensaje.remove();
        }
    }, 5000);
}

// Detecta si la app está ejecutándose como PWA instalada
function esAppInstalada() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
    );
}

// Ejecuta acciones específicas si la app está instalada
if (esAppInstalada()) {
    console.log('[PWA] Aplicación ejecutándose como PWA instalada');
    
    // Oculta el link de instalación si ya está instalada
    if (linkInstalar) {
        linkInstalar.style.display = 'none';
    }
    
    // Aquí podrías añadir funcionalidades específicas para la app instalada
    // Por ejemplo: ocultar la barra de navegación del navegador visualmente
}

// SERVICE WORKER REGISTRATION
// Registro del Service Worker para PWA (con protección contra registros múltiples)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Verificar si ya hay un Service Worker registrado para evitar registros duplicados
        navigator.serviceWorker.getRegistration('./sw.js').then((existingRegistration) => {
            if (existingRegistration) {
                console.log('[App] Service Worker ya está registrado:', existingRegistration.scope);
                return existingRegistration;
            } else {
                // Solo registrar si no existe uno previo
                return navigator.serviceWorker.register('./sw.js');
            }
        }).then((registration) => {
            console.log('[App] Service Worker registrado correctamente:', registration.scope);
            
            // Escucha actualizaciones del SW
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Hay una nueva versión disponible
                        console.log('[App] Nueva versión de la aplicación disponible');
                        // Aquí podrías mostrar un mensaje al usuario
                    }
                });
            });
        }).catch((error) => {
            console.log('[App] Error al registrar Service Worker:', error);
        });
    });
} else {
    console.log('[App] Service Worker no es compatible con este navegador');
}

// Maneja la conectividad de red para apps PWA
window.addEventListener('online', () => {
    console.log('[PWA] Conexión a internet restaurada');
    // Aquí podrías sincronizar datos o mostrar un mensaje de conectividad
});

window.addEventListener('offline', () => {
    console.log('[PWA] Sin conexión a internet - funcionando offline');
    // Aquí podrías mostrar un mensaje indicando que la app funciona offline
    mostrarMensajeOffline();
});

// Función para mostrar mensaje de modo offline
function mostrarMensajeOffline() {
    // Solo muestra el mensaje si no existe ya
    if (document.getElementById('offline-message')) {
        return;
    }
    
    const mensaje = document.createElement('div');
    mensaje.id = 'offline-message';
    mensaje.innerHTML = `
        <article style="
            position: fixed; 
            bottom: 20px; 
            left: 20px; 
            right: 20px; 
            z-index: 1000;
            background: var(--pico-background-color, #fff); 
            border: 1px solid var(--pico-color-amber-500);
            border-left: 4px solid var(--pico-color-amber-500);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        ">
            <div style="padding: var(--pico-spacing);">
                <h6 style="color: var(--pico-color-amber-700); margin: 0 0 0.5rem 0;">
                    <i class="fa-solid fa-wifi" style="text-decoration: line-through;"></i> Modo Offline
                </h6>
                <small style="color: var(--pico-color);">Sin conexión a internet. La aplicación sigue funcionando con los datos guardados localmente.</small>
            </div>
        </article>
    `;
    
    document.body.appendChild(mensaje);
    
    // Remueve el mensaje cuando se restaure la conexión
    window.addEventListener('online', () => {
        if (mensaje.parentNode) {
            mensaje.remove();
        }
    }, { once: true });
}