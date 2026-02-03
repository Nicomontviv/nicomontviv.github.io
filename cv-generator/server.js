const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Asegurar que la carpeta temp exista al arrancar
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

app.post('/generate-cv', (req, res) => {
    const userData = req.body;
    const id = uuidv4(); // ID único para evitar colisiones entre usuarios
    
    const jsonFileName = `data-${id}.json`;
    const pdfFileName = `${userData.filename || 'curriculum'}-${id}.pdf`;
    
    const jsonPath = path.join(tempDir, jsonFileName);
    const pdfPath = path.join(tempDir, pdfFileName);

    // 1. Guardar el JSON temporalmente
    fs.writeFile(jsonPath, JSON.stringify(userData, null, 2), (err) => {
        if (err) {
            console.error("Error al escribir JSON:", err);
            return res.status(500).send("Error interno en el servidor");
        }

        // 2. Ejecutar el script de Puppeteer
        // Pasamos los nombres de los archivos como argumentos
        exec(`node generate-pdf.js ${jsonFileName} ${pdfFileName}`, (execErr, stdout, stderr) => {
            if (execErr) {
                console.error("Error al generar PDF:", execErr);
                // Limpiamos el JSON aunque falle
                if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
                return res.status(500).send("Error al procesar el PDF");
            }

            console.log(`Puppeteer dice: ${stdout}`);

            // 3. Enviar el archivo para descarga
            res.download(pdfPath, `${userData.filename || 'curriculum'}.pdf`, (downloadErr) => {
                // 4. Limpieza absoluta (Borrar JSON y PDF)
                try {
                    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
                    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
                    console.log(`Archivos temporales de la sesión ${id} eliminados.`);
                } catch (cleanupErr) {
                    console.error("Error durante la limpieza:", cleanupErr);
                }

                if (downloadErr) {
                    console.error("Error durante la descarga:", downloadErr);
                }
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 SaaS CV Generator listo en: http://localhost:${PORT}`);
    console.log(`=========================================`);
});