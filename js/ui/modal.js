/**
 * SISTEMA DE MODALES PERSONALIZADO
 * Sistema de modales usando Tailwind CSS con animaciones y gestión de estado
 * Compatible con el sistema de temas y funcionalidades de la aplicación
 */

// Custom Modal System
document.addEventListener('DOMContentLoaded', function() {
    
    // Modal Management System
    window.toggleModal = function(event) {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('data-target');
        const modal = document.getElementById(targetId);
        
        if (!modal) return;
        
        if (modal.classList.contains('hidden')) {
            openModal(modal);
        } else {
            closeModal(modal);
        }
    };
    
    // Open Modal Function - Much simpler with always-visible scrollbar
    function openModal(modal) {
        document.body.classList.add('modal-open');
        modal.classList.remove('hidden');
        
        // Add fade-in animation
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }
    
    // Close Modal Function
    function closeModal(modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }, 200);
    }
    
    // Close modal when clicking backdrop
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('fixed') && 
            e.target.classList.contains('inset-0') && 
            e.target.classList.contains('bg-black/50')) {
            closeModal(e.target);
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.fixed.inset-0:not(.hidden)');
            openModals.forEach(modal => {
                closeModal(modal);
            });
        }
    });
    
    // Theme Management
    window.cambiarTema = function() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;

    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
    
    // Import/Export Modal Function
    window.abrirModalImportExport = function() {
        const modal = document.getElementById('modal_import_export');
        if (modal) {
            openModal(modal);
        }
    };
    
    // Make openModal and closeModal globally available for compatibility with history.js
    window.openModal = openModal;
    window.closeModal = closeModal;
    
    // Override the toggleModal function in history.js context for modal_detalles_historial
    const originalToggleModal = window.toggleModal;
    window.toggleModal = function(event) {
        // Check if this is specifically for the history details modal
        const targetId = event.currentTarget.getAttribute('data-target');
        if (targetId === 'modal_detalles_historial') {
            const modal = document.getElementById(targetId);
            if (modal) {
                if (modal.classList.contains('hidden')) {
                    openModal(modal);
                } else {
                    closeModal(modal);
                }
            }
        } else {
            // Use the original function for other modals
            originalToggleModal(event);
        }
    };
    
});