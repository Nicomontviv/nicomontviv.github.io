// generate-pdf.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// 1. CAPTURA DE PARÁMETROS
// El primer argumento [2] es el nombre del JSON, el segundo [3] es el nombre del PDF
const jsonFileName = process.argv[2];
const pdfFileName = process.argv[3];

if (!jsonFileName || !pdfFileName) {
    console.error("Faltan argumentos: node generate-pdf.js <jsonFile> <pdfFile>");
    process.exit(1);
}

// Rutas absolutas hacia la carpeta temp
const jsonPath = path.join(__dirname, 'temp', jsonFileName);
const pdfPath = path.join(__dirname, 'temp', pdfFileName);

// 2. LEER DATOS
if (!fs.existsSync(jsonPath)) {
    console.error(`Error: No se encontró el archivo ${jsonPath}`);
    process.exit(1);
}

const resume = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 3. PLANTILLA HTML (Tu diseño original)
const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.5; }
        h1 { font-size: 26px; margin-bottom: 5px; color: #000; }
        h2 { font-size: 20px; border-bottom: 2px solid #444; padding-bottom: 4px; margin-top: 25px; text-transform: uppercase; }
        h3 { font-size: 16px; margin-bottom: 2px; }
        p { margin: 4px 0; }
        ul { margin: 0 0 10px 20px; padding: 0; }
        .label { color: #666; font-size: 14px; font-weight: bold; }
        .section { margin-bottom: 15px; }
        .profile-links a { color: #0366d6; text-decoration: none; margin-right: 10px; font-size: 13px; }
        .date { font-style: italic; color: #555; font-size: 13px; }
    </style>
</head>
<body>

    <h1>${resume.basics.name}</h1>
    <div class="label">${resume.basics.label}</div>
    <p>Email: ${resume.basics.email}</p>
    <p>Ubicación: ${resume.basics.location.city}, ${resume.basics.location.region}</p>
    
    <div class="profile-links">
        ${resume.basics.profiles ? resume.basics.profiles.map(p => `<a href="${p.url}">${p.network}</a>`).join('') : ''}
    </div>

    <div class="section">
        <h2>Perfil Profesional</h2>
        <p>${resume.basics.summary}</p>
    </div>

    <div class="section">
        <h2>Experiencia Laboral</h2>
        ${resume.work.map(job => `
            <div>
                <h3>${job.position} - ${job.name}</h3>
                <p class="date">${job.startDate} a ${job.endDate || 'Actualidad'}</p>
                <p>${job.summary}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Educación</h2>
        ${resume.education.map(edu => `
            <div>
                <h3>${edu.institution}</h3>
                <p>${edu.studyType} en ${edu.area}</p>
                <p class="date">${edu.startDate} ${edu.endDate ? '- ' + edu.endDate : ''}</p>
                ${edu.courses && edu.courses.length ? `<p>Cursos: ${edu.courses.join(', ')}</p>` : ''}
            </div>
        `).join('')}
    </div>

    ${resume.awards && resume.awards.length ? `
    <div class="section">
        <h2>Premios y Reconocimientos</h2>
        ${resume.awards.map(a => `
            <h3>${a.title} - ${a.awarder}</h3>
            <p class="date">${a.date}</p>
            <p>${a.summary}</p>
        `).join('')}
    </div>` : ''}

    <div class="section">
        <h2>Habilidades</h2>
        ${resume.skills.map(s => `
            <p><strong>${s.name}:</strong> ${s.keywords.join(', ')}</p>
        `).join('')}
    </div>

    <div class="section">
        <h2>Idiomas</h2>
        <ul>
            ${resume.languages.map(l => `<li>${l.language} - ${l.fluency}</li>`).join('')}
        </ul>
    </div>

    ${resume.projects && resume.projects.length ? `
    <div class="section">
        <h2>Proyectos</h2>
        ${resume.projects.map(p => `
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p><em>Tecnologías: ${p.keywords.join(', ')}</em></p>
        `).join('')}
    </div>` : ''}

</body>
</html>
`;

// 4. GENERACIÓN DEL PDF
(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Importante para servidores
        });
        const page = await browser.newPage();
        
        // Cargar el HTML
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Crear el PDF en la ruta especificada
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();
        console.log(`Éxito: ${pdfFileName}`); 
    } catch (err) {
        console.error("Error en Puppeteer:", err);
        process.exit(1);
    }
})();