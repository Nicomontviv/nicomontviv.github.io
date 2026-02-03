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

// 4. Lógica de Generación
document.getElementById('cv-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerText;
    btn.innerText = 'Generando...';
    btn.disabled = true;

    // --- CONFIGURACIÓN DE IDIOMA ---
    const lang = document.getElementById('cv-language').value; // Asegúrate de tener este ID en tu HTML
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

    try {
        // Recopilar datos 
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
            filename: document.getElementById('pdf-name').value.trim() || 'CV_Nicolas_Montanari'
        };

        // --- VARIABLE DEL TEMPLATE ---
        const cvTemplate = `
            <div id="cv-render" style="width: 210mm; min-height: 297mm; background: #ffffff; padding: 20mm; box-sizing: border-box; font-family: Arial, sans-serif; color: #000; font-size: 12px;">
                <div style="border-bottom: 3px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
                    <h1 style="font-size: 32px; margin: 0 0 8px 0; text-transform: uppercase; font-weight: bold;">${data.basics.name}</h1>
                    <div style="font-size: 16px; font-weight: bold; color: #444; margin: 6px 0;">${data.basics.label}</div>
                    <div style="font-size: 13px; color: #555;">${data.basics.email} | ${data.basics.location.city}, ${data.basics.location.region}</div>
                </div>

                ${data.basics.summary ? `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold;">${t.summary}</h2>
                    <p style="font-size: 12px; margin: 0; line-height: 1.6; text-align: justify;">${data.basics.summary}</p>
                </div>` : ''}

                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold;">${t.experience}</h2>
                    ${data.work.map(job => `
                    <div style="margin-bottom: 16px; page-break-inside: avoid;">
                        <div style="margin-bottom: 4px;">
                            <strong style="font-size: 13px;">${job.position} - ${job.name}</strong>
                            <span style="float: right; font-size: 12px; color: #666;">${job.displayDate}</span>
                            <div style="clear: both;"></div>
                        </div>
                        <p style="font-size: 12px; margin: 4px 0 0 0; line-height: 1.5; text-align: justify;">${job.summary}</p>
                    </div>`).join('')}
                </div>

                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold;">${t.education}</h2>
                    ${data.education.map(edu => `
                    <div style="margin-bottom: 14px; page-break-inside: avoid;">
                        <div style="margin-bottom: 3px;">
                            <strong style="font-size: 13px;">${edu.institution}</strong>
                            <span style="float: right; font-size: 12px; color: #666;">${edu.displayDate}</span>
                            <div style="clear: both;"></div>
                        </div>
                        <div style="font-size: 12px; font-style: italic; color: #444;">${edu.area} ${edu.statusLabel}</div>
                    </div>`).join('')}
                </div>

                ${data.awards.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold;">${t.awards}</h2>
                    ${data.awards.map(a => `
                    <div style="margin-bottom: 10px;">
                        <strong>${a.title}</strong> ${a.awarder ? `- ${a.awarder}` : ''}
                        <span style="float: right; color: #666;">${a.date}</span>
                        <div style="clear: both;"></div>
                    </div>`).join('')}
                </div>` : ''}

                <div>
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold;">${t.skills_lang}</h2>
                    <p style="font-size: 12px; margin: 0 0 8px 0;"><strong>${t.skills}:</strong> ${data.skills}</p>
                    <p style="font-size: 12px; margin: 0;"><strong>${t.languages}:</strong> ${data.languages}</p>
                </div>
            </div>
        `;

        // Generación con html2canvas + jsPDF 
        const container = document.createElement('div');
        container.style.cssText = "position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 210mm; background: white; z-index: 10000;";
        container.innerHTML = cvTemplate;
        document.body.appendChild(container);

        await new Promise(r => setTimeout(r, 500));
        const element = document.getElementById('cv-render');
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);
        pdf.save(`${data.filename}.pdf`);

        document.body.removeChild(container);
        alert('✓ PDF generado!');
    } catch (err) {
        console.error(err);
        alert('✗ Error: ' + err.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

// ============================================
// IMPORTANTE: Incluir estas librerías en HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// ============================================