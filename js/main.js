/**
 * Main JavaScript file for the documentation site
 * Handles all interactive functionality and animations
 */

// Variables globales
let isMenuOpen = false;
let currentTheme = 'light';
let searchTimeout = null;

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicación...');
    initializeApp();
});

// Función principal de inicialización
function initializeApp() {
    setupEventListeners();
    setupAnimations();
    setupScrollEffects();
    setupSearch();
    setupSmoothScrolling();
    setupTheme();
    setupProgressBar();
    setupInfiniteScroll();
    setupTooltips();
    setupKeyboardShortcuts();
    
    console.log('✅ Aplicación inicializada correctamente');
}

// =============================================================================
// NAVEGACIÓN Y MENÚ
// =============================================================================

// Toggle del sidebar con animaciones mejoradas
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;
    const menuButton = document.querySelector('.menu-toggle');
    
    if (!sidebar) return;
    
    isMenuOpen = !isMenuOpen;
    
    sidebar.classList.toggle('active', isMenuOpen);
    
    // Crear overlay si no existe
    if (!overlay && isMenuOpen) {
        createSidebarOverlay();
    }
    
    // Manejar overflow del body
    if (isMenuOpen) {
        body.style.overflow = 'hidden';
        menuButton.innerHTML = '<i class="fas fa-times"></i>';
        
        // Enfocar el primer elemento del menú para accesibilidad
        const firstMenuItem = sidebar.querySelector('a, button, input');
        if (firstMenuItem) {
            setTimeout(() => firstMenuItem.focus(), 300);
        }
    } else {
        body.style.overflow = 'auto';
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    }
    
    // Animación del botón
    menuButton.style.transform = isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)';
    
    // Dispatch custom event
    const event = new CustomEvent('sidebarToggle', { detail: { isOpen: isMenuOpen } });
    document.dispatchEvent(event);
}

// Crear overlay para cerrar el sidebar
function createSidebarOverlay() {
    const existingOverlay = document.querySelector('.sidebar-overlay');
    if (existingOverlay) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', closeSidebar);
    document.body.appendChild(overlay);
    
    // Forzar reflow para la animación
    overlay.offsetHeight;
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
}

// Cerrar sidebar
function closeSidebar() {
    if (isMenuOpen) {
        toggleSidebar();
    }
}

// =============================================================================
// BÚSQUEDA AVANZADA
// =============================================================================

// Función de búsqueda con debounce y filtros avanzados
function searchContent() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase().trim();
    
    // Limpiar timeout anterior
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Debounce para mejorar performance
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

function performSearch(query) {
    const cards = document.querySelectorAll('.chapter-card');
    const container = document.querySelector('.chapters-grid');
    let visibleCount = 0;
    
    // Remover mensaje anterior
    removeNoResultsMessage();
    
    if (query === '') {
        // Mostrar todas las tarjetas
        cards.forEach((card, index) => {
            showCard(card, index);
            visibleCount++;
        });
        updateSearchStats(visibleCount, cards.length);
        return;
    }
    
    // Buscar en múltiples campos
    cards.forEach((card, index) => {
        const title = card.querySelector('.chapter-title')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.chapter-description')?.textContent.toLowerCase() || '';
        const difficulty = card.querySelector('.difficulty')?.textContent.toLowerCase() || '';
        const tags = card.dataset.tags?.toLowerCase() || '';
        
        const matches = [
            title.includes(query),
            description.includes(query),
            difficulty.includes(query),
            tags.includes(query),
            // Búsqueda fuzzy simple
            fuzzyMatch(title, query),
            fuzzyMatch(description, query)
        ].some(Boolean);
        
        if (matches) {
            showCard(card, visibleCount);
            highlightSearchTerms(card, query);
            visibleCount++;
        } else {
            hideCard(card);
        }
    });
    
    // Mostrar mensaje si no hay resultados
    if (visibleCount === 0) {
        showNoResultsMessage(query, container);
    }
    
    updateSearchStats(visibleCount, cards.length);
    
    // Analytics de búsqueda
    trackSearchEvent(query, visibleCount);
}

// Búsqueda fuzzy simple
function fuzzyMatch(text, query) {
    if (query.length < 3) return false;
    
    let queryIndex = 0;
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
        if (text[i] === query[queryIndex]) {
            queryIndex++;
        }
    }
    return queryIndex === query.length;
}

// Mostrar tarjeta con animación
function showCard(card, delay = 0) {
    card.style.display = 'block';
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    }, delay * 50);
}

// Ocultar tarjeta con animación
function hideCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(-20px) scale(0.95)';
    
    setTimeout(() => {
        card.style.display = 'none';
    }, 300);
}

// Resaltar términos de búsqueda
function highlightSearchTerms(card, query) {
    const elements = card.querySelectorAll('.chapter-title, .chapter-description');
    
    elements.forEach(element => {
        const text = element.textContent;
        const highlightedText = text.replace(
            new RegExp(`(${escapeRegex(query)})`, 'gi'),
            '<mark class="search-highlight">$1</mark>'
        );
        
        if (highlightedText !== text) {
            element.innerHTML = highlightedText;
        }
    });
}

// Limpiar highlights
function clearHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

// Escapar caracteres especiales para regex
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Mensaje de sin resultados
function showNoResultsMessage(query, container) {
    const message = document.createElement('div');
    message.className = 'no-results-message';
    message.innerHTML = `
        <div class="no-results-content">
            <div class="no-results-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3>No se encontraron resultados</h3>
            <p>No hay capítulos que coincidan con <strong>"${escapeHtml(query)}"</strong></p>
            <div class="search-suggestions">
                <p>Sugerencias:</p>
                <ul>
                    <li>Verifica la ortografía</li>
                    <li>Usa términos más generales</li>
                    <li>Prueba con sinónimos</li>
                </ul>
            </div>
            <button class="btn btn-primary" onclick="clearSearch()">
                <i class="fas fa-times"></i> Limpiar búsqueda
            </button>
        </div>
    `;
    
    container.appendChild(message);
    
    // Animación de entrada
    setTimeout(() => {
        message.classList.add('active');
    }, 100);
}

function removeNoResultsMessage() {
    const message = document.querySelector('.no-results-message');
    if (message) {
        message.remove();
    }
}

// Limpiar búsqueda
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchContent();
        clearHighlights();
        searchInput.focus();
    }
}

// Actualizar estadísticas de búsqueda
function updateSearchStats(visible, total) {
    let statsElement = document.querySelector('.search-stats');
    
    if (!statsElement) {
        statsElement = document.createElement('div');
        statsElement.className = 'search-stats';
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            searchBox.appendChild(statsElement);
        }
    }
    
    if (visible < total) {
        statsElement.textContent = `Mostrando ${visible} de ${total} capítulos`;
        statsElement.style.display = 'block';
    } else {
        statsElement.style.display = 'none';
    }
}

// Escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =============================================================================
// ANIMACIONES Y EFECTOS VISUALES
// =============================================================================

// Configurar animaciones de scroll
function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateElement(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos que se van a animar
    const animatedElements = document.querySelectorAll(
        '.chapter-card, .resource-card, .section-header, .hero-content'
    );
    
    animatedElements.forEach((element, index) => {
        // Configurar estado inicial
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        observer.observe(element);
    });
}

// Animar elemento individual
function animateElement(element) {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    
    // Añadir clase para animaciones CSS adicionales
    element.classList.add('animated');
    
    // Efecto de ondas para las tarjetas
    if (element.classList.contains('chapter-card')) {
        addRippleEffect(element);
    }
}

// Efecto de ondas
function addRippleEffect(element) {
    element.addEventListener('mouseenter', function(e) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    });
}

// =============================================================================
// EFECTOS DE SCROLL
// =============================================================================

function setupScrollEffects() {
    let ticking = false;
    let lastScrollTop = 0;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const scrollDirection = scrolled > lastScrollTop ? 'down' : 'up';
        
        // Parallax en las formas flotantes
        updateParallaxElements(scrolled);
        
        // Actualizar barra de navegación
        updateNavigationBar(scrolled, scrollDirection);
        
        // Actualizar barra de progreso
        updateProgressBar(scrolled);
        
        // Lazy loading de imágenes
        lazyLoadImages();
        
        lastScrollTop = scrolled;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    // Throttled scroll listener
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Initial call
    updateScrollEffects();
}

// Actualizar elementos parallax
function updateParallaxElements(scrolled) {
    const shapes = document.querySelectorAll('.shape');
    const heroSection = document.querySelector('.hero-section');
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.3;
        const yPos = scrolled * speed;
        shape.style.transform = `translateY(${yPos}px)`;
    });
    
    // Parallax del hero
    if (heroSection) {
        const heroContent = heroSection.querySelector('.hero-content');
        if (heroContent) {
            const yPos = scrolled * 0.5;
            heroContent.style.transform = `translateY(${yPos}px)`;
        }
    }
}

// Actualizar barra de navegación
function updateNavigationBar(scrolled, direction) {
    const nav = document.querySelector('.chapter-nav, .main-nav');
    if (!nav) return;
    
    if (scrolled > 100) {
        nav.classList.add('scrolled');
        
        if (direction === 'down' && scrolled > 300) {
            nav.classList.add('hidden');
        } else if (direction === 'up') {
            nav.classList.remove('hidden');
        }
    } else {
        nav.classList.remove('scrolled', 'hidden');
    }
}

// =============================================================================
// BARRA DE PROGRESO
// =============================================================================

function setupProgressBar() {
    // Crear barra de progreso si no existe
    if (!document.querySelector('.reading-progress')) {
        createReadingProgressBar();
    }
}

function createReadingProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
    
    document.body.appendChild(progressBar);
}

function updateProgressBar(scrolled) {
    const progressFill = document.querySelector('.reading-progress-fill');
    if (!progressFill) return;
    
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrolled / documentHeight) * 100;
    
    progressFill.style.width = Math.min(progress, 100) + '%';
}

// =============================================================================
// SMOOTH SCROLLING
// =============================================================================

function setupSmoothScrolling() {
    // Smooth scroll para enlaces internos
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            smoothScrollTo(targetElement);
        }
    });
}

function smoothScrollTo(element, offset = 100) {
    const targetPosition = element.offsetTop - offset;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
    
    // Actualizar URL sin saltar
    if (element.id) {
        history.pushState(null, null, `#${element.id}`);
    }
}

// =============================================================================
// SISTEMA DE TEMAS
// =============================================================================

function setupTheme() {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Detectar preferencia del sistema
    if (!localStorage.getItem('theme')) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Escuchar cambios en preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Animación de transición
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Actualizar iconos de tema
    const themeButtons = document.querySelectorAll('.theme-toggle');
    themeButtons.forEach(button => {
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

// =============================================================================
// LAZY LOADING
// =============================================================================

function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// =============================================================================
// INFINITE SCROLL
// =============================================================================

function setupInfiniteScroll() {
    const loadMoreTrigger = document.querySelector('.load-more-trigger');
    if (!loadMoreTrigger) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMoreContent();
            }
        });
    });
    
    observer.observe(loadMoreTrigger);
}

function loadMoreContent() {
    // Implementar carga de más contenido
    console.log('Cargando más contenido...');
}

// =============================================================================
// TOOLTIPS
// =============================================================================

function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('blur', hideTooltip);
    });
}

function showTooltip(e) {
    const element = e.target;
    const text = element.getAttribute('data-tooltip');
    if (!text) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    setTimeout(() => tooltip.classList.add('visible'), 10);
    
    element._tooltip = tooltip;
}

function hideTooltip(e) {
    const tooltip = e.target._tooltip;
    if (tooltip) {
        tooltip.classList.remove('visible');
        setTimeout(() => tooltip.remove(), 200);
        delete e.target._tooltip;
    }
}

// =============================================================================
// ATAJOS DE TECLADO
// =============================================================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Solo activar si no estamos en un input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case '/':
                e.preventDefault();
                focusSearch();
                break;
            case 'Escape':
                handleEscape();
                break;
            case 'm':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    toggleSidebar();
                }
                break;
            case 't':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    toggleTheme();
                }
                break;
        }
    });
}

function focusSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

function handleEscape() {
    // Cerrar sidebar si está abierto
    if (isMenuOpen) {
        closeSidebar();
    }
    
    // Limpiar búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        clearSearch();
    }
    
    // Cerrar modales
    const modals = document.querySelectorAll('.modal.active, .image-modal.active');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function setupEventListeners() {
    // Redimensionar ventana
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Clicks fuera del sidebar
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.querySelector('.menu-toggle');
        
        if (isMenuOpen && sidebar && !sidebar.contains(e.target) && !menuButton.contains(e.target)) {
            closeSidebar();
        }
    });
    
    // Prevenir scroll cuando el menú está abierto
    document.addEventListener('touchmove', function(e) {
        if (isMenuOpen) {
            e.preventDefault();
        }
    }, { passive: false });
}

function handleResize() {
    // Cerrar sidebar en pantallas grandes
    if (window.innerWidth > 768 && isMenuOpen) {
        closeSidebar();
    }
    
    // Recalcular posiciones de tooltips
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

// =============================================================================
// UTILIDADES
// =============================================================================

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle utility
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Analytics tracking
function trackSearchEvent(query, resultsCount) {
    // Implementar tracking de analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'search', {
            search_term: query,
            results_count: resultsCount
        });
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // Enviar a servicio de logging si está configurado
});

// =============================================================================
// EXPORTAR FUNCIONES GLOBALES
// =============================================================================

// Hacer funciones disponibles globalmente
window.toggleSidebar = toggleSidebar;
window.searchContent = searchContent;
window.clearSearch = clearSearch;
window.toggleTheme = toggleTheme;

// Custom events
document.addEventListener('sidebarToggle', function(e) {
    console.log('Sidebar toggled:', e.detail.isOpen);
});

console.log('📱 main.js cargado completamente');