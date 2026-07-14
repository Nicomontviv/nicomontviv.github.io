// ============================================
// CV GENERATOR - VERSIÓN BILINGÜE
// ============================================

// 1. Helper: Formateo de Fechas con Traducción
function formatDate(dateString, lang = 'es') {
    if (!dateString || dateString.trim() === '') return lang === 'es' ? 'Presente' : 'Present';
    
    try {
        const parts = dateString.split('-');
        const year = parts[0];
        const month = parts[1];
        
        const months = {
            es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        };
        
        const monthIndex = parseInt(month) - 1;
        if (monthIndex >= 0 && monthIndex < 12 && year) {
            return `${months[lang][monthIndex]} ${year}`;
        }
        return lang === 'es' ? 'Presente' : 'Present';
    } catch (error) {
        return lang === 'es' ? 'Presente' : 'Present';
    }
}

// 2. Funciones para crear botones de eliminar 
function createRemoveBtn(el) {
    const btn = document.createElement('button');
    btn.className = 'btn-remove';
    btn.innerText = 'Eliminar';
    btn.type = 'button';
    btn.onclick = () => el.remove();
    return btn;
}

// 3. Funciones para agregar secciones (Work, Education, Award) 
function addWork() {
    const container = document.getElementById('work-list');
    const div = document.createElement('div');
    div.className = 'item-group';
    div.innerHTML = `
        <input type="text" placeholder="Empresa" class="w-name" required>
        <input type="text" placeholder="Puesto" class="w-pos" required>
        <div class="grid">
            <div><label>Desde:</label><input type="date" class="w-start" required></div>
            <div><label>Hasta:</label><input type="date" class="w-end"></div>
        </div>
        <textarea placeholder="Descripción..." class="w-sum"></textarea>
    `;
    div.appendChild(createRemoveBtn(div));
    container.appendChild(div);
}

function addEducation() {
    const container = document.getElementById('education-list');
    const div = document.createElement('div');
    div.className = 'item-group';
    div.innerHTML = `
        <input type="text" placeholder="Institución" class="e-inst" required>
        <input type="text" placeholder="Título" class="e-area" required>
        <div class="grid">
            <div><label>Desde:</label><input type="date" class="e-start" required></div>
            <div><label>Hasta:</label><input type="date" class="e-end"></div>
        </div>
        <select class="e-status" style="width:100%; margin-top:5px; padding:5px;">
            <option value="Finalizado">Finalizado / Completed</option>
            <option value="En curso">En curso / In progress</option>
        </select>
    `;
    div.appendChild(createRemoveBtn(div));
    container.appendChild(div);
}

function addAward() {
    const container = document.getElementById('awards-list');
    const div = document.createElement('div');
    div.className = 'item-group';
    div.innerHTML = `
        <input type="text" placeholder="Premio/Torneo" class="a-title" required>
        <input type="text" placeholder="Organización" class="a-awarder">
        <input type="date" class="a-date">
    `;
    div.appendChild(createRemoveBtn(div));
    container.appendChild(div);
}

function sanitizeHTML(text) {
    return text ? text.trim() : '';
}

// ============================================
// GENERACIÓN DE PDF - LÓGICA CORREGIDA
// Estrategia: render off-screen con posición absoluta
// fuera del viewport, captura con html2canvas a alta
// resolución, luego divide en páginas A4 exactas.
// ============================================

document.getElementById('cv-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerText;
    btn.innerText = 'Generando...';
    btn.disabled = true;

    const lang = document.getElementById('cv-language').value;
    const labels = {
        es: {
            summary: "RESUMEN",
            experience: "EXPERIENCIA LABORAL",
            education: "EDUCACIÓN",
            awards: "PREMIOS Y RECONOCIMIENTOS",
            skills_lang: "HABILIDADES E IDIOMAS",
            skills: "Habilidades",
            languages: "Idiomas",
            present: "Presente",
            inProgress: "(en curso)"
        },
        en: {
            summary: "SUMMARY",
            experience: "WORK EXPERIENCE",
            education: "EDUCATION",
            awards: "AWARDS",
            skills_lang: "SKILLS & LANGUAGES",
            skills: "Skills",
            languages: "Languages",
            present: "Present",
            inProgress: "(in progress)"
        }
    };
    const t = labels[lang];

    // Contenedor off-screen que usaremos para renderizar
    let wrapper = null;

    try {
        const data = {
            basics: {
                name: sanitizeHTML(document.getElementById('name').value),
                label: sanitizeHTML(document.getElementById('label').value),
                email: sanitizeHTML(document.getElementById('email').value),
                location: {
                    city: sanitizeHTML(document.getElementById('city').value),
                    region: sanitizeHTML(document.getElementById('region').value)
                },
                summary: sanitizeHTML(document.getElementById('summary').value)
            },
            work: Array.from(document.querySelectorAll('#work-list .item-group')).map(i => ({
                name: sanitizeHTML(i.querySelector('.w-name').value),
                position: sanitizeHTML(i.querySelector('.w-pos').value),
                displayDate: `${formatDate(i.querySelector('.w-start').value, lang)} — ${formatDate(i.querySelector('.w-end').value, lang)}`,
                summary: sanitizeHTML(i.querySelector('.w-sum').value)
            })),
            education: Array.from(document.querySelectorAll('#education-list .item-group')).map(i => {
                const status = i.querySelector('.e-status').value;
                const start = i.querySelector('.e-start').value;
                const end = i.querySelector('.e-end').value;
                return {
                    institution: sanitizeHTML(i.querySelector('.e-inst').value),
                    area: sanitizeHTML(i.querySelector('.e-area').value),
                    displayDate: (status === 'En curso') 
                        ? `${formatDate(start, lang)} — ${t.present}` 
                        : `${formatDate(start, lang)} — ${formatDate(end, lang)}`,
                    statusLabel: (status === 'En curso') ? t.inProgress : ''
                };
            }),
            awards: Array.from(document.querySelectorAll('#awards-list .item-group')).map(i => ({
                title: sanitizeHTML(i.querySelector('.a-title').value),
                awarder: sanitizeHTML(i.querySelector('.a-awarder').value),
                date: formatDate(i.querySelector('.a-date').value, lang)
            })),
            skills: sanitizeHTML(document.getElementById('skills').value),
            languages: sanitizeHTML(document.getElementById('languages').value),
            filename: document.getElementById('pdf-name').value.trim() || 'CV'
        };

        // Dimensiones A4: 794px × 1123px a 96dpi
        // Usamos 210mm en px con escala 2x para calidad
        const PAGE_W_PX = 794;   // ancho A4 a 96dpi
        const PAGE_H_PX = 1123;  // alto A4 a 96dpi
        const SCALE    = 2;       // factor de escala para nitidez
        const PADDING  = '15mm';  // margen interior del CV

        const cvHTML = `
            <div id="cv-render" style="
                width: ${PAGE_W_PX}px;
                background: #ffffff;
                padding: ${PADDING};
                box-sizing: border-box;
                font-family: Arial, Helvetica, sans-serif;
                color: #000;
                font-size: 12px;
                line-height: 1.5;
            ">
                <!-- ENCABEZADO -->
                <div style="border-bottom: 3px solid #000; padding-bottom: 12px; margin-bottom: 18px;">
                    <h1 style="font-size: 30px; margin: 0 0 6px 0; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">${data.basics.name}</h1>
                    <div style="font-size: 15px; font-weight: bold; color: #333; margin-bottom: 4px;">${data.basics.label}</div>
                    <div style="font-size: 12px; color: #555;">${data.basics.email} | ${data.basics.location.city}, ${data.basics.location.region}</div>
                </div>

                <!-- RESUMEN -->
                ${data.basics.summary ? `
                <div style="margin-bottom: 18px;">
                    <h2 style="font-size: 14px; border-bottom: 1.5px solid #000; text-transform: uppercase; margin: 0 0 8px 0; padding-bottom: 3px; font-weight: bold; letter-spacing: 0.5px;">${t.summary}</h2>
                    <p style="font-size: 12px; margin: 0; line-height: 1.6; text-align: justify;">${data.basics.summary}</p>
                </div>` : ''}

                <!-- EXPERIENCIA -->
                ${data.work.length > 0 ? `
                <div style="margin-bottom: 18px;">
                    <h2 style="font-size: 14px; border-bottom: 1.5px solid #000; text-transform: uppercase; margin: 0 0 8px 0; padding-bottom: 3px; font-weight: bold; letter-spacing: 0.5px;">${t.experience}</h2>
                    ${data.work.map(job => `
                    <div style="margin-bottom: 14px;">
                        <table style="width:100%; border-collapse:collapse; margin-bottom:3px;">
                            <tr>
                                <td style="font-size:13px; font-weight:bold; padding:0;">${job.position} — ${job.name}</td>
                                <td style="font-size:12px; color:#555; text-align:right; white-space:nowrap; padding:0; padding-left:8px;">${job.displayDate}</td>
                            </tr>
                        </table>
                        <p style="font-size:12px; margin:0; line-height:1.55; text-align:justify;">${job.summary}</p>
                    </div>`).join('')}
                </div>` : ''}

                <!-- EDUCACIÓN -->
                ${data.education.length > 0 ? `
                <div style="margin-bottom: 18px;">
                    <h2 style="font-size: 14px; border-bottom: 1.5px solid #000; text-transform: uppercase; margin: 0 0 8px 0; padding-bottom: 3px; font-weight: bold; letter-spacing: 0.5px;">${t.education}</h2>
                    ${data.education.map(edu => `
                    <div style="margin-bottom: 12px;">
                        <table style="width:100%; border-collapse:collapse; margin-bottom:2px;">
                            <tr>
                                <td style="font-size:13px; font-weight:bold; padding:0;">${edu.institution}</td>
                                <td style="font-size:12px; color:#555; text-align:right; white-space:nowrap; padding:0; padding-left:8px;">${edu.displayDate}</td>
                            </tr>
                        </table>
                        <div style="font-size:12px; font-style:italic; color:#333;">${edu.area}${edu.statusLabel ? ' <span style="color:#666;">'+edu.statusLabel+'</span>' : ''}</div>
                    </div>`).join('')}
                </div>` : ''}

                <!-- PREMIOS -->
                ${data.awards.length > 0 ? `
                <div style="margin-bottom: 18px;">
                    <h2 style="font-size: 14px; border-bottom: 1.5px solid #000; text-transform: uppercase; margin: 0 0 8px 0; padding-bottom: 3px; font-weight: bold; letter-spacing: 0.5px;">${t.awards}</h2>
                    ${data.awards.map(a => `
                    <div style="margin-bottom: 8px;">
                        <table style="width:100%; border-collapse:collapse;">
                            <tr>
                                <td style="font-size:12px; padding:0;"><strong>${a.title}</strong>${a.awarder ? ' — ' + a.awarder : ''}</td>
                                <td style="font-size:12px; color:#555; text-align:right; white-space:nowrap; padding:0; padding-left:8px;">${a.date}</td>
                            </tr>
                        </table>
                    </div>`).join('')}
                </div>` : ''}

                <!-- HABILIDADES E IDIOMAS -->
                ${(data.skills || data.languages) ? `
                <div>
                    <h2 style="font-size: 14px; border-bottom: 1.5px solid #000; text-transform: uppercase; margin: 0 0 8px 0; padding-bottom: 3px; font-weight: bold; letter-spacing: 0.5px;">${t.skills_lang}</h2>
                    ${data.skills ? `<p style="font-size:12px; margin:0 0 6px 0;"><strong>${t.skills}:</strong> ${data.skills}</p>` : ''}
                    ${data.languages ? `<p style="font-size:12px; margin:0;"><strong>${t.languages}:</strong> ${data.languages}</p>` : ''}
                </div>` : ''}
            </div>
        `;

        // ---- Render off-screen ----
        // Colocamos el wrapper FUERA del viewport (arriba) para que
        // html2canvas lo capture sin interferir con la página visible.
        wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: absolute;
            top: -9999px;
            left: 0;
            width: ${PAGE_W_PX}px;
            background: white;
            z-index: -1;
        `;
        wrapper.innerHTML = cvHTML;
        document.body.appendChild(wrapper);

        // Esperamos a que el DOM termine de renderizar
        await new Promise(r => setTimeout(r, 600));

        const element = wrapper.querySelector('#cv-render');

        // Capturamos con html2canvas
        const canvas = await html2canvas(element, {
            scale: SCALE,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            // Importante: le decimos el ancho exacto para evitar
            // que tome el ancho del viewport
            width: PAGE_W_PX,
            windowWidth: PAGE_W_PX
        });

        // ---- Dividir canvas en páginas A4 ----
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const PDF_W_MM  = 210;
        const PDF_H_MM  = 297;

        // Relación: cuántos px del canvas equivalen a una página
        const canvasPageH = Math.floor((PAGE_H_PX * SCALE * PAGE_W_PX) / PAGE_W_PX);
        // Más simple: calculamos cuántos píxeles de canvas corresponden a 297mm
        const scaledPageH = Math.floor((PAGE_H_PX * SCALE));
        const scaledTotalH = canvas.height;
        const scaledW = canvas.width; // = PAGE_W_PX * SCALE

        let pageTop = 0;
        let pageNum = 0;

        while (pageTop < scaledTotalH) {
            if (pageNum > 0) pdf.addPage();

            // Creamos un canvas temporal para esta página
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width  = scaledW;
            pageCanvas.height = Math.min(scaledPageH, scaledTotalH - pageTop);

            const ctx = pageCanvas.getContext('2d');
            ctx.drawImage(
                canvas,
                0, pageTop,          // fuente: origen
                scaledW, pageCanvas.height,  // fuente: tamaño
                0, 0,                // destino: origen
                scaledW, pageCanvas.height   // destino: tamaño
            );

            const imgData = pageCanvas.toDataURL('image/jpeg', 0.98);

            // Altura real de este trozo en mm (proporcional)
            const sliceH_mm = (pageCanvas.height / scaledPageH) * PDF_H_MM;

            pdf.addImage(imgData, 'JPEG', 0, 0, PDF_W_MM, sliceH_mm);

            pageTop += scaledPageH;
            pageNum++;
        }

        pdf.save(`${data.filename}.pdf`);
        alert('✓ PDF generado correctamente!');

    } catch (err) {
        console.error(err);
        alert('✗ Error al generar el PDF: ' + err.message);
    } finally {
        if (wrapper && wrapper.parentNode) {
            document.body.removeChild(wrapper);
        }
        btn.innerText = originalText;
        btn.disabled = false;
    }
};