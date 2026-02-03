📄 SaaS CV Generator
Un generador de Currículum Vitae bilingüe y de alto rendimiento diseñado para profesionales que buscan un diseño sobrio y efectivo. Esta herramienta permite a los usuarios transformar sus datos en un documento PDF profesional directamente desde el navegador, priorizando la privacidad y la velocidad.

🚀 Características Principales
Generación Local (Privacy-First): A diferencia de otros servicios, los datos no se envían a un servidor externo. El PDF se construye íntegramente en el cliente usando el navegador del usuario.

Soporte Bilingüe (i18n): Selector dinámico para generar el CV en Inglés o Español, ajustando automáticamente encabezados, formatos de fecha y etiquetas de estado.

Diseño Optimizado para Reclutadores: Estructura basada en estándares de la industria, con jerarquía visual clara y alineación inteligente de fechas.


Gestión de Estados Académicos: Lógica específica para perfiles de estudiantes, permitiendo marcar estudios como "En curso" o "(in progress)", ideal para alumnos de grado.

Formato de Fecha Inteligente: Convierte inputs estándar de calendario a formatos legibles (Mes Año).

🛠️ Tecnologías Utilizadas
Frontend: HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+).

Librerías de Renderizado:

html2canvas: Para capturar el DOM con alta precisión.

jsPDF: Para la estructuración y descarga del archivo final en formato A4.

Arquitectura: Aplicación Web Estática (compatible con GitHub Pages y Hostinger).

📂 Estructura del Proyecto

/cv-generator
├── /public
│   ├── index.html     # Interfaz de usuario y estructura del formulario
│   ├── style.css      # Estilos modernos y responsivos
│   └── main.js       # Lógica de mapeo JSON, traducción y generación de PDF
├── /temp              # (Opcional) Carpeta para procesos temporales
└── README.md          # Documentación técnica

👨‍💻 Sobre el Desarrollador
Este proyecto fue desarrollado por Nicolás Montanari , estudiante avanzado de la Licenciatura en Informática en la Universidad Nacional de La Plata (UNLP). Con experiencia en desarrollo Full Stack y participación en competencias de programación como la ICPC (International Collegiate Programming Contest)