// ============================================
// CV GENERATOR - VERSIÓN CON jsPDF DIRECTO
// ============================================

// 1. Helper: Formateo de Fechas
function formatDate(dateString) {
    if (!dateString || dateString.trim() === '') return 'Presente';
    
    try {
        const [year, month] = dateString.split('-');
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthIndex = parseInt(month) - 1;
        
        if (monthIndex >= 0 && monthIndex < 12 && year) {
            return `${months[monthIndex]} ${year}`;
        }
        return 'Presente';
    } catch (error) {
        return 'Presente';
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

// 3. Función para agregar experiencia laboral
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

// 4. Función para agregar educación
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
            <option value="Finalizado">Finalizado</option>
            <option value="En curso">En curso / In progress</option>
        </select>
    `;
    div.appendChild(createRemoveBtn(div));
    container.appendChild(div);
}

// 5. Función para agregar premios/awards
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

// 6. Función auxiliar para sanitizar texto
function sanitizeHTML(text) {
    if (!text) return '';
    return text.trim();
}

// 7. NUEVA FUNCIÓN: Generar PDF con jsPDF + html2canvas
document.getElementById('cv-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerText;
    btn.innerText = 'Generando...';
    btn.disabled = true;

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
                displayDate: `${formatDate(i.querySelector('.w-start').value)} — ${formatDate(i.querySelector('.w-end').value)}`,
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
                        ? `${formatDate(start)} — Presente` 
                        : `${formatDate(start)} — ${formatDate(end)}`,
                    statusLabel: (status === 'En curso') ? '(in progress)' : ''
                };
            }),
            awards: Array.from(document.querySelectorAll('#awards-list .item-group')).map(i => ({
                title: sanitizeHTML(i.querySelector('.a-title').value),
                awarder: sanitizeHTML(i.querySelector('.a-awarder').value),
                date: formatDate(i.querySelector('.a-date').value)
            })),
            skills: sanitizeHTML(document.getElementById('skills').value),
            languages: sanitizeHTML(document.getElementById('languages').value),
            filename: document.getElementById('pdf-name').value.trim() || 'CV_Nicolas_Montanari'
        };

        console.log('Datos recopilados:', data);

        // Crear contenedor temporal VISIBLE
        const container = document.createElement('div');
        container.id = 'pdf-container';
        container.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 210mm;
            background: white;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
        `;
        
        container.innerHTML = `
            <div id="cv-render" style="
                width: 210mm;
                min-height: 297mm;
                background: #ffffff;
                padding: 20mm;
                box-sizing: border-box;
                font-family: Arial, Helvetica, sans-serif;
                color: #000;
                font-size: 12px;
            ">
                <!-- HEADER -->
                <div style="border-bottom: 3px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
                    <h1 style="font-size: 32px; margin: 0 0 8px 0; text-transform: uppercase; font-weight: bold; color: #000; letter-spacing: 1px;">
                        ${data.basics.name}
                    </h1>
                    <div style="font-size: 16px; font-weight: bold; color: #444; margin: 6px 0;">
                        ${data.basics.label}
                    </div>
                    <div style="font-size: 13px; color: #555;">
                        ${data.basics.email} | ${data.basics.location.city}, ${data.basics.location.region}
                    </div>
                </div>

                <!-- SUMMARY -->
                ${data.basics.summary ? `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold; color: #000;">
                        SUMMARY
                    </h2>
                    <p style="font-size: 12px; margin: 0; line-height: 1.6; color: #000; text-align: justify;">
                        ${data.basics.summary}
                    </p>
                </div>
                ` : ''}

                <!-- EXPERIENCE -->
                ${data.work.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold; color: #000;">
                        EXPERIENCE
                    </h2>
                    ${data.work.map(job => `
                    <div style="margin-bottom: 16px; page-break-inside: avoid;">
                        <div style="margin-bottom: 4px;">
                            <strong style="font-size: 13px; color: #000;">
                                ${job.position} - ${job.name}
                            </strong>
                            <span style="float: right; font-size: 12px; color: #666;">
                                ${job.displayDate}
                            </span>
                            <div style="clear: both;"></div>
                        </div>
                        ${job.summary ? `
                        <p style="font-size: 12px; margin: 4px 0 0 0; line-height: 1.5; color: #000; text-align: justify;">
                            ${job.summary}
                        </p>
                        ` : ''}
                    </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- EDUCATION -->
                ${data.education.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold; color: #000;">
                        EDUCATION
                    </h2>
                    ${data.education.map(edu => `
                    <div style="margin-bottom: 14px; page-break-inside: avoid;">
                        <div style="margin-bottom: 3px;">
                            <strong style="font-size: 13px; color: #000;">
                                ${edu.institution}
                            </strong>
                            <span style="float: right; font-size: 12px; color: #666;">
                                ${edu.displayDate}
                            </span>
                            <div style="clear: both;"></div>
                        </div>
                        <div style="font-size: 12px; font-style: italic; color: #444;">
                            ${edu.area} ${edu.statusLabel}
                        </div>
                    </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- AWARDS -->
                ${data.awards.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold; color: #000;">
                        AWARDS
                    </h2>
                    ${data.awards.map(a => `
                    <div style="margin-bottom: 10px; page-break-inside: avoid;">
                        <strong style="font-size: 12px; color: #000;">
                            ${a.title}
                        </strong>
                        ${a.awarder ? `<span style="font-size: 12px; color: #000;"> - ${a.awarder}</span>` : ''}
                        <span style="float: right; font-size: 12px; color: #666;">
                            ${a.date}
                        </span>
                        <div style="clear: both;"></div>
                    </div>
                    `).join('')}
                </div>
                ` : ''}

                <!-- SKILLS & LANGUAGES -->
                <div>
                    <h2 style="font-size: 16px; border-bottom: 2px solid #000; text-transform: uppercase; margin: 0 0 10px 0; padding-bottom: 4px; font-weight: bold; color: #000;">
                        SKILLS & LANGUAGES
                    </h2>
                    ${data.skills ? `
                    <p style="font-size: 12px; margin: 0 0 8px 0; line-height: 1.5; color: #000;">
                        <strong>Skills:</strong> ${data.skills}
                    </p>
                    ` : ''}
                    ${data.languages ? `
                    <p style="font-size: 12px; margin: 0; line-height: 1.5; color: #000;">
                        <strong>Languages:</strong> ${data.languages}
                    </p>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(container);
        console.log('Contenedor agregado al DOM');

        // Esperar renderizado
        await new Promise(resolve => setTimeout(resolve, 500));

        const element = document.getElementById('cv-render');
        console.log('Elemento a capturar:', element);

        // Capturar con html2canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: true,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        console.log('Canvas creado:', canvas.width, 'x', canvas.height);

        // Crear PDF con jsPDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // jsPDF desde CDN UMD está en window.jspdf.jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${data.filename}.pdf`);

        console.log('PDF generado y descargado');

        // Limpiar
        await new Promise(resolve => setTimeout(resolve, 1000));
        document.body.removeChild(container);

        alert('✓ PDF generado exitosamente!');

    } catch (err) {
        console.error('Error completo:', err);
        alert('✗ Error al generar PDF: ' + err.message);
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