// Funciones específicas para páginas de capítulos

document.addEventListener('DOMContentLoaded', function() {
    generateTableOfContents();
    setupScrollSpy();
    setupCopyCodeButtons();
    setupImageZoom();
});

// Generar tabla de contenidos automáticamente
function generateTableOfContents() {
    const tocContent = document.querySelector('.toc-content');
    const headings = document.querySelectorAll('.chapter-content h2, .chapter-content h3, .chapter-content h4');
    
    if (!tocContent || headings.length === 0) return;
    
    let tocHTML = '<ul>';
    
    headings.forEach((heading, index) => {
        const level = heading.tagName.toLowerCase();
        const text = heading.textContent;
        const id = `heading-${index}`;
        
        // Añadir ID al heading si no lo tiene
        if (!heading.id) {
            heading.id = id;
        }
        
        const levelClass = `toc-level-${level.slice(1)}`;
        tocHTML += `<li class="${levelClass}"><a href="#${heading.id}">${text}</a></li>`;
    });
    
    tocHTML += '</ul>';
    tocContent.innerHTML = tocHTML;
}

// Toggle tabla de contenidos
function toggleTableOfContents() {
    const toc = document.getElementById('tableOfContents');
    toc.classList.toggle('active');
}

// Scroll spy para resaltar sección actual en TOC
function setupScrollSpy() {
    const tocLinks = document.querySelectorAll('.toc-content a');
    const headings = document.querySelectorAll('.chapter-content h2, .chapter-content h3, .chapter-content h4');
    
    if (tocLinks.length === 0 || headings.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remover clase activa de todos los enlaces
                tocLinks.forEach(link => link.classList.remove('active'));
                
                // Añadir clase activa al enlace correspondiente
                const activeLink = document.querySelector(`.toc-content a[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0.1
    });
    
    headings.forEach(heading => {
        observer.observe(heading);
    });
}

// Añadir botones de copiar código
function setupCopyCodeButtons() {
    const codeBlocks = document.querySelectorAll('pre');
    
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.innerHTML = '<i class="fas fa-copy"></i>';
        button.title = 'Copiar código';
        
        button.addEventListener('click', () => {
            const code = block.textContent;
            navigator.clipboard.writeText(code).then(() => {
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.style.color = 'var(--success-color)';
                
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                    button.style.color = '';
                }, 2000);
            });
        });
        
        block.style.position = 'relative';
        block.appendChild(button);
    });
}

// Zoom para imágenes
function setupImageZoom() {
    const images = document.querySelectorAll('.chapter-content img');
    
    images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            openImageModal(img.src, img.alt);
        });
    });
}

function openImageModal(src, alt) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeImageModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <img src="${src}" alt="${alt}">
                <button class="modal-close" onclick="closeImageModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Animación de entrada
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Toggle theme (modo oscuro)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDark);
    
    const themeBtn = document.querySelector('.nav-btn i.fa-moon, .nav-btn i.fa-sun');
    if (themeBtn) {
        themeBtn.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Cargar tema guardado
document.addEventListener('DOMContentLoaded', function() {
    const isDark = localStorage.getItem('darkTheme') === 'true';
    if (isDark) {
        document.body.classList.add('dark-theme');
        const themeBtn = document.querySelector('.nav-btn i.fa-moon');
        if (themeBtn) {
            themeBtn.className = 'fas fa-sun';
        }
    }
});