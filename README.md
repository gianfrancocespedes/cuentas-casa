# 🏠 Cuentas de la Casa

<div align="center">

**📊 Sistema de Gestión de Servicios Domiciliarios**

*Aplicación web para calcular y distribuir automáticamente los costos de servicios públicos entre apartamentos/pisos de un edificio residencial*

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![PicoCSS](https://img.shields.io/badge/PicoCSS-FF6B6B?style=for-the-badge&logo=css3&logoColor=white)](https://picocss.com)

</div>

---

## 🎯 Características Principales

### ⚡ **Cálculo Automático de Servicios**
- **💡 Electricidad**: Lecturas individuales por medidor con cálculos de KW, IGV (18%) y alumbrado público
- **💧 Agua**: Distribución proporcional basada en número de residentes por departamento
- **🔥 Gas**: Entrada directa del consumo por apartamento
- **📡 Cable/Internet**: Costos individuales por departamento

### 📋 **Gestión Inteligente**
- **💾 Guardado Automático**: Persiste datos del formulario en tiempo real
- **🌙 Modo Oscuro/Claro**: Interfaz adaptable con preferencias guardadas
- **📈 Historial**: Almacena hasta 50 cálculos anteriores con opciones de restauración
- **📤 Exportar/Importar**: Respaldo completo de datos en formato JSON

### 📄 **Generación de PDFs**
- **🖨️ Recibos Detallados**: PDF individual por departamento con desglose completo
- **👁️ Vista Previa**: Modales integrados para revisar antes de descargar
- **⏰ Archivos Únicos**: Nombres con timestamp para evitar sobreescrituras

---

## 🚀 Instalación y Uso

### **Requisitos**
- 🌐 Navegador web moderno (Chrome, Firefox, Safari, Edge)
- ✅ No requiere servidor ni instalación adicional

### **Ejecutar la Aplicación**
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

**💡 O simplemente haz doble clic en `index.html`**

---

## 🏗️ Arquitectura del Proyecto

```
📁 cuentas-casa/
├── 📄 index.html                      # Página principal
├── 📁 js/
│   ├── 🔧 utils/                      # Utilidades reutilizables
│   │   ├── formatters.js             # Formateo de fechas/números
│   │   ├── dom.js                    # Manipulación del DOM
│   │   ├── storage.js                # Gestión localStorage
│   │   └── pdf.js                    # Utilidades jsPDF
│   ├── ⚙️ core/                       # Lógica principal
│   │   ├── app.js                    # Inicialización y estado
│   │   ├── calculator.js             # Motor de cálculos
│   │   └── validation.js             # Validación de formularios
│   ├── 🎨 features/                   # Funcionalidades específicas
│   │   ├── theme.js                  # Sistema de temas
│   │   ├── history.js                # Gestión de historial
│   │   └── import-export.js          # Importar/Exportar datos
│   └── 🎭 ui/
│       └── modal.js                  # Sistema de modales
├── 📋 requerimientos.txt             # Especificaciones del proyecto
├── 📚 CLAUDE.md                      # Documentación técnica
└── 📖 README.md                      # Este archivo
```

---

## 💻 Tecnologías Utilizadas

<table>
<tr>
<td align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="JavaScript" width="50"/>
  <br><strong>JavaScript</strong><br>
  <sub>Lógica de aplicación</sub>
</td>
<td align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="HTML5" width="50"/>
  <br><strong>HTML5</strong><br>
  <sub>Estructura semántica</sub>
</td>
<td align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" alt="CSS3" width="50"/>
  <br><strong>CSS3</strong><br>
  <sub>Estilos modernos</sub>
</td>
</tr>
<tr>
<td align="center">
  <img src="https://picocss.com/img/logo.svg" alt="PicoCSS" width="50"/>
  <br><strong>Pico CSS</strong><br>
  <sub>Framework UI minimalista</sub>
</td>
<td align="center">
  <img src="https://fontawesome.com/assets/favicon/favicon-32x32.png" alt="Font Awesome" width="50"/>
  <br><strong>Font Awesome</strong><br>
  <sub>Iconografía</sub>
</td>
<td align="center">
  <img src="https://raw.githubusercontent.com/MrRio/jsPDF/master/docs/jspdf-logo.png" alt="jsPDF" width="50"/>
  <br><strong>jsPDF</strong><br>
  <sub>Generación de PDFs</sub>
</td>
</tr>
</table>

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

## 🌟 Beneficios

| Característica | Beneficio |
|---|---|
| **🚀 Sin Instalación** | Funciona directamente en el navegador |
| **💾 Datos Persistentes** | No pierdes tu trabajo entre sesiones |
| **📊 Cálculos Precisos** | Reduce errores manuales en distribución de costos |
| **⏰ Ahorro de Tiempo** | Automatiza cálculos que tomaban horas |
| **📱 Responsive** | Funciona en desktop, tablet y móvil |
| **🌙 Interfaz Adaptable** | Modo oscuro para uso nocturno |
| **📋 Historial Completo** | Consulta cálculos anteriores fácilmente |

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

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License - Puedes usar, modificar y distribuir libremente
```

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

**⭐ ¡Si este proyecto te ayuda, no olvides darle una estrella! ⭐**

*Hecho con ❤️ para simplificar la vida en comunidad*

</div>
