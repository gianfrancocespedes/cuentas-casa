# 📱 Cuentas Casa - Progressive Web App

<div align="center">

**💰 Sistema Inteligente de Gestión de Servicios Domiciliarios**

*Progressive Web App para calcular y distribuir automáticamente los costos de servicios públicos entre apartamentos/pisos de un edificio residencial*

[![PWA](https://img.shields.io/badge/PWA-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Offline Ready](https://img.shields.io/badge/Offline-Ready-green?style=for-the-badge&logo=wifi&logoColor=white)](#)
[![Mobile First](https://img.shields.io/badge/Mobile-First-blueviolet?style=for-the-badge&logo=mobile&logoColor=white)](#)

</div>

---

## 🚀 Características Principales

### 📱 **Progressive Web App**
- **⚡ Instalable**: Se instala como app nativa en cualquier dispositivo
- **🔄 Offline First**: Funciona sin conexión después de la primera carga
- **📱 Mobile Ready**: Experiencia optimizada para móviles y tablets
- **🚀 Carga Instantánea**: Cache inteligente para acceso inmediato

### ⚡ **Motor de Cálculos Avanzado**
- **💡 Electricidad**: Lecturas individuales por medidor con KW, IGV (18%) y alumbrado público
- **💧 Agua**: Distribución proporcional basada en ocupantes por departamento
- **🔥 Gas**: Entrada directa del consumo por apartamento
- **📡 Cable/Internet**: Costos individuales por departamento

### 🧠 **Gestión Inteligente de Datos**
- **💾 Persistencia Automática**: Guarda datos en tiempo real sin perder información
- **🌙 Temas Adaptativos**: Modo oscuro/claro con detección de preferencias del sistema
- **📊 Historial Completo**: Almacena hasta 50 cálculos con búsqueda y restauración
- **📤 Backup & Restore**: Exportación/importación completa en formato JSON

### 📄 **Sistema de Documentos**
- **🖨️ PDFs Profesionales**: Recibos detallados por departamento con branding
- **👁️ Vista Previa Integrada**: Modales para revisar documentos antes de descargar
- **📅 Archivos Organizados**: Nombres automáticos con timestamp y metadatos

---

## 📱 Instalación y Uso

### **📋 Requisitos Mínimos**
- 🌐 Navegador moderno con soporte PWA (Chrome 67+, Firefox 58+, Safari 11.1+, Edge 17+)
- 📱 **Recomendado**: HTTPS para funcionalidad PWA completa
- ✅ **Cero dependencias** - funciona offline después de primera carga

### **🚀 Instalación como PWA**

#### **🖥️ En Desktop**
1. Visita la aplicación en tu navegador
2. Busca el icono de "Instalar" en la barra de direcciones
3. O haz clic en el botón **"Instalar App"** dentro de la aplicación
4. ¡Listo! Ahora tienes la app en tu escritorio

#### **📱 En Móvil (Android)**
1. Abre en Chrome o Samsung Internet
2. Aparecerá un banner "Agregar a pantalla de inicio"
3. O ve a Menú → "Instalar aplicación"
4. La app se instalará como cualquier app nativa

#### **🍎 En iPhone/iPad**
1. Abre en Safari
2. Toca el botón "Compartir" 
3. Selecciona "Agregar a pantalla de inicio"
4. ¡Ya tienes la app en tu iPhone!

### **💻 Uso Tradicional (Navegador)**
```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/cuentas-casa.git

# Navegar al directorio
cd cuentas-casa

# Abrir en navegador
open index.html  # macOS
start index.html # Windows  
xdg-open index.html # Linux
```

### **🌐 Para desarrollo con HTTPS**
```bash
# Con Python (recomendado)
python -m http.server 8000
# Luego visita: https://localhost:8000

# Con Node.js
npx serve
# O npx http-server
```

---

## 🏗️ Arquitectura del Proyecto

```
📁 cuentas-casa/
├── 📄 index.html                      # Página principal con PWA meta tags
├── 📱 manifest.json                   # Manifiesto PWA con iconos y configuración
├── ⚡ sw.js                          # Service Worker para cache offline
├── 🖼️ icons/                          # Iconos PWA para diferentes dispositivos
│   ├── icon-192.png                  # Icono Android principal
│   ├── icon-512.png                  # Icono Android alta resolución  
│   ├── icon-apple-touch.png          # Icono iOS/iPadOS
│   └── favicon.ico                   # Icono navegador
├── 📁 js/
│   ├── 🔧 utils/                      # Utilidades 100% reutilizables
│   │   ├── formatters.js             # Formateo de fechas/números/monedas
│   │   ├── dom.js                    # Manipulación segura del DOM
│   │   ├── storage.js                # Wrapper localStorage con validación
│   │   └── pdf.js                    # Utilidades jsPDF optimizadas
│   ├── ⚙️ core/                       # Lógica de negocio principal
│   │   ├── app.js                    # Inicialización y estado global
│   │   ├── calculator.js             # Motor de cálculos con validaciones
│   │   └── validation.js             # Validación de formularios y datos
│   ├── 🎨 features/                   # Funcionalidades modulares
│   │   ├── theme.js                  # Sistema de temas claro/oscuro
│   │   ├── history.js                # Gestión de historial de cálculos
│   │   ├── import-export.js          # Backup/restore de datos
│   │   └── pwa.js                    # Funcionalidad de instalación PWA
│   └── 🎭 ui/
│       └── modal.js                  # Sistema de modales con Pico CSS
├── ⚖️ LICENSE                         # Licencia dual (no comercial/comercial)
└── 📖 README.md                      # Este archivo
```

---

## 💻 Tecnologías Utilizadas

### **🔧 Stack Tecnológico**

| Tecnología | Propósito | Versión |
|------------|-----------|---------|
| ![PWA](https://img.shields.io/badge/PWA-4285F4?style=flat-square&logo=googlechrome&logoColor=white) | **Progressive Web App** | Service Worker API |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | **Lógica de aplicación** | ES6+ Vanilla |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | **Estructura semántica** | HTML5 + Web APIs |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | **Estilos responsivos** | CSS3 + Variables |

### **📚 Bibliotecas Externas (CDN)**

| Librería | Uso | URL |
|----------|-----|-----|
| **[Pico CSS](https://picocss.com)** | Framework UI minimalista | `@picocss/pico@2.0.6` |
| **[Font Awesome](https://fontawesome.com)** | Iconos vectoriales | `@fortawesome/fontawesome-free@6.6.0` |
| **[jsPDF](https://github.com/MrRio/jsPDF)** | Generación de PDFs | `jspdf@2.5.1` |

### **⚡ Características Técnicas PWA**

- ✅ **Service Worker**: Cache offline inteligente
- ✅ **Web App Manifest**: Instalación nativa
- ✅ **Responsive Design**: Mobile-first approach  
- ✅ **Local Storage**: Persistencia de datos
- ✅ **Cache API**: Estrategia Cache First
- ✅ **Background Sync**: Sincronización diferida

---

## 📱 Capturas de Pantalla

### 🌅 Interfaz Principal - Modo Claro
<div align="center">
<img src="https://via.placeholder.com/800x500/f8f9fa/333333?text=Interfaz+Principal+Modo+Claro" alt="Modo Claro" width="80%">
</div>

### 🌙 Interfaz Principal - Modo Oscuro  
<div align="center">
<img src="https://via.placeholder.com/800x500/212529/ffffff?text=Interfaz+Principal+Modo+Oscuro" alt="Modo Oscuro" width="80%">
</div>

### 📊 Vista de Resultados y PDFs
<div align="center">
<img src="https://via.placeholder.com/800x400/28a745/ffffff?text=Resultados+y+Generación+de+PDFs" alt="Resultados" width="80%">
</div>

---

## 🔧 Funcionalidades Detalladas

### 📋 **Formulario Principal**
- ✅ Validación en tiempo real
- 💾 Guardado automático de datos  
- 📅 Selección de mes/año
- 👥 Gestión de ocupantes por departamento

### ⚡ **Sistema de Cálculos**
- 🔢 Cálculo automático de diferencias de medidores
- 💰 Aplicación de tarifas y impuestos
- 📊 Distribución proporcional de costos comunes
- 🎯 Generación de totales por departamento

### 📄 **Generación de Documentos**
- 🖨️ PDFs individuales por departamento
- 📋 Desglose detallado de cálculos
- 🏷️ Nombres de archivo con timestamp
- 👀 Vista previa antes de descarga

### 💾 **Gestión de Datos**
- 📚 Historial de hasta 50 cálculos
- 🔄 Carga de datos de cálculos anteriores
- 📤 Exportación de respaldos
- 📥 Importación de datos guardados

---

## 🌟 Beneficios y Ventajas

### **📱 Experiencia de App Nativa**
| Característica PWA | Beneficio |
|-------------------|-----------|
| **📲 Instalación Nativa** | Se instala como cualquier app del Play Store/App Store |
| **⚡ Carga Instantánea** | Acceso inmediato tras primera visita |
| **🔄 Funciona Offline** | Operación completa sin conexión a internet |
| **💾 Datos Sincronizados** | Información persistente entre dispositivos |
| **🔔 Notificaciones Push** | Recordatorios de fechas de corte *(próximamente)* |

### **💰 Valor para Administradores**
| Funcionalidad | Impacto |
|---------------|---------|
| **⏱️ Ahorro de Tiempo** | De 3 horas manuales a 5 minutos automatizados |
| **🎯 Precisión 100%** | Elimina errores humanos en cálculos complejos |
| **📊 Transparencia Total** | PDFs detallados con desglose completo |
| **📋 Auditoría Completa** | Historial de 50 cálculos con trazabilidad |
| **🔄 Backup Automático** | Protección de datos con exportación JSON |

### **👥 Experiencia de Usuario**
- **🎨 Interfaz Intuitiva**: Diseño limpio con Pico CSS
- **🌓 Temas Adaptativos**: Modo claro/oscuro automático  
- **📱 Mobile First**: Optimizado para uso en smartphones
- **♿ Accesibilidad**: Compatible con lectores de pantalla
- **🌍 Multiplataforma**: Funciona en cualquier dispositivo

---

## 🤝 Contribuciones

¿Quieres mejorar el proyecto? ¡Las contribuciones son bienvenidas!

### **📝 Cómo Contribuir**
1. 🍴 Fork el repositorio
2. 🌿 Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. 💍 Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push a la rama (`git push origin feature/AmazingFeature`)
5. 🔄 Abre un Pull Request

### **🐛 Reportar Problemas**
Si encuentras un bug o tienes una sugerencia:
1. 🔍 Revisa si ya existe un issue similar
2. 📝 Crea un nuevo issue con descripción detallada
3. 🏷️ Usa las etiquetas apropiadas (bug, enhancement, etc.)

---

## ⚖️ Licencia

Este proyecto utiliza una **Licencia Dual** que permite diferentes usos:

### 🆓 **Uso No Comercial** 
- ✅ **Libre**: Uso personal, educativo y no comercial
- ✅ **Modificaciones**: Permitidas con notificación al autor
- ✅ **Distribución**: Libre para fines no comerciales

### 💼 **Uso Comercial**
- 🔒 **Requiere licencia**: Contactar para uso comercial
- 💰 **Opciones**: Tarifa única o revenue sharing
- 📞 **Contacto**: Ver información del autor más abajo

Ver el archivo [LICENSE](LICENSE) para términos completos.

---

## 👨‍💻 Autor

**Gianfranco Cespedes**
- 📧 Email: [gianmcf2@gmail.com](mailto:gianmcf2@gmail.com)  
- 🐙 GitHub: [@gianfrancocespedes](https://github.com/gianfrancocespedes)
- 💼 LinkedIn: [gianfrancocespedes](https://linkedin.com/in/gianfrancocespedes)

---

## 🙏 Agradecimientos

- 🎨 **[Pico CSS](https://picocss.com)** - Por el framework CSS minimalista y elegante
- 📄 **[jsPDF](https://github.com/MrRio/jsPDF)** - Por hacer posible la generación de PDFs en el navegador
- 🎭 **[Font Awesome](https://fontawesome.com)** - Por los iconos hermosos y consistentes
- 🏠 **Comunidad de Residentes** - Por las ideas y feedback que hicieron este proyecto posible

---

<div align="center">

---

### 🚀 **¿Listo para simplificar la gestión de servicios?**

**[📱 Probar la PWA](.)** | **[⭐ Dar Estrella](https://github.com/gianfrancocespedes/cuentas-casa)** | **[💬 Reportar Issue](https://github.com/gianfrancocespedes/cuentas-casa/issues)**

---

*Hecho con ❤️ y ☕ para transformar la administración de edificios residenciales*

**¡Convierte 3 horas de cálculos manuales en 5 minutos automatizados!**

</div>
