// Aplicación de Lectura de la Biblia Versión Recobro
class BibleApp {
    constructor() {
        this.currentBook = null;
        this.currentChapter = null;
        this.settings = this.loadSettings();
        this.searchIndex = null;
        this.isLoading = false;
        this.commentaries = this.getDefaultCommentaries();
        // TTS state
        this.synth = window.speechSynthesis || null;
        this.tts = {
            queue: [],
            meta: [],
            index: 0,
            playing: false,
            paused: false,
            voice: null,
        };
        
        this.init();
    }
    
    // ===== INICIALIZACIÓN =====
    init() {
        this.applySettings();
        this.bindEvents();
        this.populateBookLists();
        this.showWelcomeScreen();
    }
    
    bindEvents() {
        // Header buttons
        document.getElementById('menu-toggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('search-btn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettings());
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => this.showWelcomeScreen());
        }
        
        // Sidebar
        document.getElementById('close-sidebar').addEventListener('click', () => this.closeSidebar());
        
        // Overlay
        document.getElementById('overlay').addEventListener('click', () => this.closeAllPanels());
        
        // Welcome screen
        document.getElementById('get-started-btn').addEventListener('click', () => this.openSidebar());
        
        // Search
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearchInput(e));
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        document.getElementById('close-search').addEventListener('click', () => this.closeSearch());
        
        // Settings
        document.getElementById('close-settings').addEventListener('click', () => this.closeSettings());
        document.getElementById('font-size-slider').addEventListener('input', (e) => this.changeFontSize(e.target.value));
        document.getElementById('font-smaller').addEventListener('click', () => this.adjustFontSize(-1));
        document.getElementById('font-larger').addEventListener('click', () => this.adjustFontSize(1));
        
        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeTheme(e.target.dataset.theme));
        });
        
        // Navigation
        document.getElementById('prev-chapter').addEventListener('click', () => this.navigatePrevious());
        document.getElementById('next-chapter').addEventListener('click', () => this.navigateNext());
        document.getElementById('chapter-select').addEventListener('change', (e) => this.onChapterChange(e));
        
        // Bottom Navigation
        document.getElementById('bottom-prev-chapter').addEventListener('click', () => this.navigatePrevious());
        document.getElementById('bottom-next-chapter').addEventListener('click', () => this.navigateNext());
        
        // Close panels on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllPanels();
            }
        });

        // Plans: back button
        const plansBackBtn = document.getElementById('plans-back-btn');
        if (plansBackBtn) plansBackBtn.addEventListener('click', () => this.closePlansPanel());

        // Commentary: close button
        const closeCommentaryBtn = document.getElementById('close-commentary');
        if (closeCommentaryBtn) closeCommentaryBtn.addEventListener('click', () => this.closeCommentary());

        // TTS controls
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');
        if (playBtn) playBtn.addEventListener('click', () => this.ttsPlay());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.ttsPause());
        if (stopBtn) stopBtn.addEventListener('click', () => this.ttsStop());
        if (this.synth) {
            // Load voices async
            this.synth.onvoiceschanged = () => this.ttsInitVoice();
            this.ttsInitVoice();
        }
        // Bind TTS settings controls
        this.ttsBindSettingsControls();

        // Player UI bindings
        this.bindChapterPlayer();
    }

    // ===== NAVEGACIÓN DE CAPÍTULOS (UI) =====
    navigatePrevious() {
        const prev = this.getAdjacentChapter(-1);
        if (prev) this.loadChapter(prev.bookId, prev.chapter);
    }

    navigateNext() {
        const next = this.getAdjacentChapter(1);
        if (next) this.loadChapter(next.bookId, next.chapter);
    }

    onChapterChange(e) {
        const value = Number(e?.target?.value);
        if (!isFinite(value) || value < 1) return;
        const bookId = Number(this.currentBook);
        if (!isFinite(bookId)) return;
        this.loadChapter(bookId, value);
    }

    updateNavigation(bookId, chapter) {
        const bId = Number(bookId);
        const ch = Number(chapter);
        const total = Number(BIBLE_DATA.books[bId]?.chapters || 0);
        const select = document.getElementById('chapter-select');
        if (select) {
            // Rellenar opciones si no coinciden con el total
            if (select.options.length !== total) {
                select.innerHTML = '';
                for (let i = 1; i <= total; i++) {
                    const opt = document.createElement('option');
                    opt.value = String(i);
                    opt.textContent = String(i);
                    select.appendChild(opt);
                }
            }
            select.value = String(ch);
        }
        const disablePrev = ch <= 1 && (bId === Math.min(...Object.keys(BIBLE_DATA.books).map(n => Number(n))));
        const disableNext = ch >= total && (bId === Math.max(...Object.keys(BIBLE_DATA.books).map(n => Number(n))));
        const headerPrev = document.getElementById('prev-chapter');
        const headerNext = document.getElementById('next-chapter');
        const bottomPrev = document.getElementById('bottom-prev-chapter');
        const bottomNext = document.getElementById('bottom-next-chapter');
        if (headerPrev) headerPrev.disabled = !!disablePrev;
        if (bottomPrev) bottomPrev.disabled = !!disablePrev;
        if (headerNext) headerNext.disabled = !!disableNext;
        if (bottomNext) bottomNext.disabled = !!disableNext;
    }

    updateHeader(bookId, chapter) {
        // Ya actualizamos el título en displayChapter; también sincronizamos cabecera, bottom nav y document.title
        try {
            const bId = Number(bookId);
            const name = BIBLE_DATA.books[bId]?.name || '';
            if (name) document.title = `${name} ${chapter} · Biblia`;
            const headerBook = document.getElementById('current-book-header');
            const headerChap = document.getElementById('current-chapter-header');
            if (headerBook) headerBook.textContent = name || 'Biblia Versión Recobro';
            if (headerChap) headerChap.textContent = name ? ` ${chapter}` : '';
            const bottomBook = document.getElementById('bottom-current-book');
            const bottomChap = document.getElementById('bottom-current-chapter');
            if (bottomBook) bottomBook.textContent = name || '';
            if (bottomChap) bottomChap.textContent = String(chapter || '');
        } catch (_) { /* noop */ }
    }

    // ===== LIBROS: ORDEN Y POBLADO DE LISTAS =====
    getOrderedBookIdsByTestament(testament) {
        // Orden protestante tradicional ya coincide con los ids numéricos 01..39 (AT) y 40..66 (NT)
        const ids = Object.keys(BIBLE_DATA.books)
            .filter(id => BIBLE_DATA.books[id].testament === testament)
            .map(id => Number(id))
            .sort((a, b) => a - b)
            .map(n => String(n));
        return ids;
    }

    populateBookLists() {
        const otContainer = document.getElementById('old-testament-books');
        const ntContainer = document.getElementById('new-testament-books');
        if (!otContainer && !ntContainer) return;

        const buildItem = (bookId) => {
            const b = BIBLE_DATA.books[Number(bookId)];
            if (!b) return null;
            const btn = document.createElement('button');
            btn.className = 'book-item';
            btn.type = 'button';
            btn.setAttribute('data-book-id', String(Number(bookId)));
            btn.innerHTML = `
                <span class="book-name">${b.name}</span>
                <span class="book-abbr">${b.abbr}</span>
            `;
            btn.addEventListener('click', () => {
                // Ir al capítulo 1 del libro seleccionado
                this.loadChapter(Number(bookId), 1);
                this.closeSidebar();
            });
            return btn;
        };

        if (otContainer) {
            otContainer.innerHTML = '';
            const orderOT = this.getOrderedBookIdsByTestament('antiguo');
            orderOT.forEach(id => {
                const el = buildItem(id);
                if (el) otContainer.appendChild(el);
            });
        }

        if (ntContainer) {
            ntContainer.innerHTML = '';
            const orderNT = this.getOrderedBookIdsByTestament('nuevo');
            orderNT.forEach(id => {
                const el = buildItem(id);
                if (el) ntContainer.appendChild(el);
            });
        }
    }
    
    // ===== RESALTADO DE VERSÍCULOS =====
    createContextMenu() {
        // Crear el menú contextual si no existe
        if (!document.getElementById('verse-context-menu')) {
            const menu = document.createElement('div');
            menu.id = 'verse-context-menu';
            menu.className = 'verse-context-menu';
            menu.innerHTML = `
                <button id="copy-verse">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copiar versículo</span>
                </button>
                <div class="color-options">
                    <div class="color-option" data-color="yellow" style="background-color: #ffd700;"></div>
                    <div class="color-option" data-color="blue" style="background-color: #6495ed;"></div>
                    <div class="color-option" data-color="green" style="background-color: #90ee90;"></div>
                    <div class="color-option" data-color="pink" style="background-color: #ffb6c1;"></div>
                    <div class="color-option" data-color="purple" style="background-color: #dda0dd;"></div>
                </div>
                <button id="remove-highlight">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                    <span>Quitar resaltado</span>
                </button>
            `;
            document.body.appendChild(menu);
            
            // Manejar clics en el menú contextual
            document.getElementById('copy-verse').addEventListener('click', () => this.copyVerseToClipboard());
            document.getElementById('remove-highlight').addEventListener('click', () => this.removeHighlight());
            
            // Manejar selección de colores
            document.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.applyHighlight(e.target.dataset.color);
                });
            });
        }
        
        return document.getElementById('verse-context-menu');
    }
    
    showContextMenu(e, bookId, chapter, verseNumber) {
        e.preventDefault();
        this.closeContextMenu();
        
        this.selectedVerse = { bookId, chapter, verseNumber };
        const menu = this.createContextMenu();
        // Posicionar el menú junto al versículo (anclado al elemento)
        const anchor = e.currentTarget;
        const rect = anchor.getBoundingClientRect(); // coords relativos a viewport (position: fixed)
        // Mostrar temporalmente para medir tamaño
        menu.style.visibility = 'hidden';
        menu.classList.add('visible');
        const mw = menu.offsetWidth || 180;
        const mh = menu.offsetHeight || 180;
        // Calcular posición preferida: arriba-derecha del versículo
        let left = rect.right - mw; // alineado al borde derecho del verso
        let top = rect.top - 8;     // un poco por encima
        // Correcciones para mantener dentro del viewport
        const pad = 8;
        if (left < pad) left = pad;
        if (rect.right + pad < mw) left = pad; // por si el verso es muy estrecho
        if (top < pad) top = rect.bottom + 8; // si no cabe arriba, mostrar debajo
        if (top + mh > window.innerHeight - pad) top = Math.max(pad, window.innerHeight - mh - pad);
        if (left + mw > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - mw - pad);
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.visibility = 'visible';
        
        // Cerrar el menú al hacer clic fuera de él
        setTimeout(() => {
            document.addEventListener('click', this.closeContextMenu);
        }, 0);
    }
    
    closeContextMenu = () => {
        const menu = document.getElementById('verse-context-menu');
        if (menu) {
            menu.classList.remove('visible');
        }
        document.removeEventListener('click', this.closeContextMenu);
    }
    
    copyVerseToClipboard() {
        if (!this.selectedVerse) return;
        
        const { bookId, chapter, verseNumber } = this.selectedVerse;
        const bookName = BIBLE_DATA.books[bookId].name;
        const verseElement = document.querySelector(`.verse[data-verse="${verseNumber}"]`);
        const verseText = verseElement ? verseElement.textContent.trim() : '';
        
        const textToCopy = `${bookName} ${chapter}:${verseNumber} ${verseText}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showNotification('Versículo copiado al portapapeles', 'success');
            this.closeContextMenu();
        }).catch(err => {
            console.error('Error al copiar el versículo:', err);
            this.showNotification('Error al copiar el versículo', 'error');
        });
    }
    
    applyHighlight(color) {
        if (!this.selectedVerse) return;
        
        const { verseNumber } = this.selectedVerse;
        const verseElement = document.querySelector(`.verse[data-verse="${verseNumber}"]`);
        
        if (verseElement) {
            // Remover todas las clases de resaltado existentes
            verseElement.classList.remove(
                'highlight-yellow', 'highlight-blue', 'highlight-green', 
                'highlight-pink', 'highlight-purple'
            );
            
            // Aplicar el nuevo resaltado
            verseElement.classList.add(`highlight-${color}`);
            
            // Guardar el resaltado en el almacenamiento local
            this.saveHighlight(this.selectedVerse.bookId, this.selectedVerse.chapter, verseNumber, color);
            
            this.closeContextMenu();
        }
    }
    
    removeHighlight() {
        if (!this.selectedVerse) return;
        
        const { verseNumber } = this.selectedVerse;
        const verseElement = document.querySelector(`.verse[data-verse="${verseNumber}"]`);
        
        if (verseElement) {
            // Remover todas las clases de resaltado
            verseElement.classList.remove(
                'highlight-yellow', 'highlight-blue', 'highlight-green', 
                'highlight-pink', 'highlight-purple'
            );
            
            // Eliminar el resaltado del almacenamiento local
            this.removeHighlightFromStorage(this.selectedVerse.bookId, this.selectedVerse.chapter, verseNumber);
            
            this.closeContextMenu();
        }
    }
    
    saveHighlight(bookId, chapter, verseNumber, color) {
        const highlights = this.getHighlights();
        const key = `${bookId}-${chapter}-${verseNumber}`;
        
        if (color) {
            highlights[key] = color;
        } else {
            delete highlights[key];
        }
        
        localStorage.setItem('bibleHighlights', JSON.stringify(highlights));
    }
    
    removeHighlightFromStorage(bookId, chapter, verseNumber) {
        const highlights = this.getHighlights();
        const key = `${bookId}-${chapter}-${verseNumber}`;
        
        if (highlights[key]) {
            delete highlights[key];
            localStorage.setItem('bibleHighlights', JSON.stringify(highlights));
        }
    }
    
    getHighlights() {
        return JSON.parse(localStorage.getItem('bibleHighlights') || '{}');
    }
    
    loadHighlights(bookId, chapter) {
        const highlights = this.getHighlights();
        
        Object.entries(highlights).forEach(([key, color]) => {
            const [highlightBookId, highlightChapter, verseNumber] = key.split('-');
            
            if (highlightBookId === bookId && highlightChapter === chapter) {
                const verseElement = document.querySelector(`.verse[data-verse="${verseNumber}"]`);
                if (verseElement) {
                    verseElement.classList.add(`highlight-${color}`);
                }
            }
        });
    }
    
    // ===== UI MANAGEMENT =====
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        const isActive = sidebar.classList.contains('active');
        
        if (isActive) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        document.getElementById('sidebar').classList.add('active');
        document.getElementById('overlay').classList.add('active');
        this.closeSearch();
        this.closeSettings();
    }
    
    closeSidebar() {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }
    
    toggleSearch() {
        const searchPanel = document.getElementById('search-panel');
        const isHidden = searchPanel.classList.contains('hidden');
        
        if (isHidden) {
            this.openSearch();
        } else {
            this.closeSearch();
        }
    }
    
    openSearch() {
        document.getElementById('search-panel').classList.remove('hidden');
        document.getElementById('search-input').focus();
        this.closeSidebar();
        this.closeSettings();
    }
    
    closeSearch() {
        document.getElementById('search-panel').classList.add('hidden');
    }
    
    toggleSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        const isHidden = settingsPanel.classList.contains('hidden');
        
        if (isHidden) {
            this.openSettings();
        } else {
            this.closeSettings();
        }
    }
    
    openSettings() {
        document.getElementById('settings-panel').classList.remove('hidden');
        this.closeSidebar();
        this.closeSearch();
    }
    
    closeSettings() {
        document.getElementById('settings-panel').classList.add('hidden');
    }
    
    closeAllPanels() {
        this.closeSidebar();
        this.closeSearch();
        this.closeSettings();
        this.closePlansPanel && this.closePlansPanel();
        this.closeCommentary && this.closeCommentary();
    }
    
    showLoading() {
        document.getElementById('loading-screen').classList.remove('hidden');
        this.isLoading = true;
    }
    
    hideLoading() {
        document.getElementById('loading-screen').classList.add('hidden');
        this.isLoading = false;
    }
    
    showNotification(message, type = 'info') {
        // Simple notification system
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    // ===== CONTENT LOADING =====
    async loadChapter(bookId, chapter) {
        if (this.isLoading) return;
        
        try {
            // Cancel TTS when changing chapters
            this.ttsCancelIfSpeaking();
            this.showLoading();
            
            // Carga desde el JSON pre-procesado
            if (!window.BIBLE_CONTENT) {
                const response = await fetch('bible-content.json');
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                window.BIBLE_CONTENT = await response.json();
            }
            
            // Convertir bookId numérico a nombre de libro
            const bookName = BIBLE_DATA.books[bookId] ? BIBLE_DATA.books[bookId].name : null;
            if (!bookName) {
                throw new Error(`Libro no encontrado: ${bookId}`);
            }
            
            // Obtiene el contenido del capítulo desde el JSON
            const bookContent = window.BIBLE_CONTENT.books[bookName];
            if (!bookContent || !bookContent[chapter]) {
                throw new Error(`Capítulo no encontrado: ${bookName} ${chapter}`);
            }
            
            const chapterContent = bookContent[chapter];
            const content = {
                bookTitle: bookName.toUpperCase(),
                chapterTitle: `${bookName} ${chapter}`,
                verses: chapterContent.verses
            };
            
            this.displayChapter(content, bookId, chapter);
            this.updateNavigation(bookId, chapter);
            this.updateHeader(bookId, chapter);
            this.closeAllPanels();
            
        } catch (error) {
            console.error('Error loading chapter:', error);
            this.showNotification('Error al cargar el capítulo', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    displayChapter(content, bookId, chapter) {
        // Hide welcome screen and show content area
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('content-area').classList.remove('hidden');
        // Mostrar barra de capítulos y navegación inferior
        const chapterNav = document.querySelector('.chapter-nav');
        if (chapterNav) chapterNav.classList.remove('hidden');
        const bottomNav = document.getElementById('bottom-navigation');
        if (bottomNav) bottomNav.classList.remove('hidden');
        
        // Update chapter title
        document.getElementById('chapter-title').textContent = content.chapterTitle;
        
        // Build verses HTML
        const chapterContent = document.getElementById('chapter-content');
        let html = '';
        
        content.verses.forEach(verse => {
            html += `
                <div class="verse" data-verse="${verse.number}">
                    <span class="verse-number">${verse.number}</span>
                    <span class="verse-text">${verse.text}</span>
                    <button class="verse-comment-btn" title="Ver comentario" type="button">?</button>
                </div>
            `;
        });
        
        chapterContent.innerHTML = html;
        
        // Add click and contextmenu handlers for verses
        chapterContent.querySelectorAll('.verse').forEach(verseEl => {
            verseEl.addEventListener('click', (e) => {
                // actualizar verso actual y abrir menú
                const v = e.currentTarget?.dataset.verse;
                if (v) this.currentVerseNumber = Number(v);
                this.onVerseClick(e, bookId, chapter);
            });
            verseEl.addEventListener('contextmenu', (e) => this.onVerseClick(e, bookId, chapter));
        });
        // Botones de comentario por versículo
        chapterContent.querySelectorAll('.verse-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const parent = e.currentTarget.closest('.verse');
                const verseNumber = parent?.dataset.verse;
                if (!verseNumber) return;
                this.openCommentary(bookId, chapter, Number(verseNumber));
            });
        });
        
        // Cargar resaltados guardados
        this.loadHighlights(bookId, chapter);
        
        // Update current position
        this.currentBook = bookId;
        this.currentChapter = chapter;

        // Inicializar verso actual como el primero del capítulo
        this.currentVerseNumber = 1;

        // Enlazar botones fijos de navegación de capítulos
        const prevVerseBtn = document.getElementById('verse-nav-prev');
        const nextVerseBtn = document.getElementById('verse-nav-next');
        if (prevVerseBtn) prevVerseBtn.onclick = () => this.playerPrevChapter();
        if (nextVerseBtn) nextVerseBtn.onclick = () => this.playerNextChapter();

        // Prepare TTS controls
        this.ttsSetButtons({ canPlay: !!this.synth, playing: false, paused: false });
        this.ttsUpdateStatus('');
        // Clear any verse highlight
        this.ttsClearReadingHighlight();
        // Reset player UI
        this.playerResetUI();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Obtener el verso visible más cercano al centro de la pantalla
    getCenteredVerseNumber() {
        const verses = Array.from(document.querySelectorAll('.verse'));
        if (!verses.length) return 1;
        const centerY = window.scrollY + window.innerHeight / 2;
        let best = { el: verses[0], dist: Infinity };
        verses.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elCenter = window.scrollY + rect.top + rect.height / 2;
            const d = Math.abs(elCenter - centerY);
            if (d < best.dist) best = { el, dist: d };
        });
        const num = Number(best.el?.dataset.verse || 1);
        return isFinite(num) ? num : 1;
    }

    // Navegar al versículo anterior/siguiente dentro del capítulo
    navigateVerse(delta) {
        const verses = Array.from(document.querySelectorAll('.verse'));
        if (!verses.length) return;
        const max = verses.length;
        let cur = Number(this.currentVerseNumber || this.getCenteredVerseNumber() || 1);
        if (!isFinite(cur) || cur < 1) cur = 1;
        let target = cur + delta;
        if (target < 1) target = 1; // opcional: saltar de capítulo si se desea
        if (target > max) target = max;
        const targetEl = document.querySelector(`.verse[data-verse="${target}"]`);
        if (targetEl) {
            this.currentVerseNumber = target;
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // pequeño énfasis visual temporal
            targetEl.classList.add('verse-nav-flash');
            setTimeout(() => targetEl.classList.remove('verse-nav-flash'), 400);
        }
    }

    // ===== PLAYER (UI de reproducción rediseñada) =====
    bindChapterPlayer() {
        const play = document.getElementById('player-play');
        const rew = document.getElementById('player-rew');
        const fwd = document.getElementById('player-fwd');
        const prev = document.getElementById('player-prev');
        const next = document.getElementById('player-next');
        const speed = document.getElementById('player-speed');
        const progress = document.getElementById('player-progress');
        const audio = document.getElementById('audio-player');
        if (play) play.addEventListener('click', () => {
            // toggle play/pause
            const usingAudio = this.isAudioActive();
            if (usingAudio) {
                if (audio.paused) { audio.play(); } else { audio.pause(); }
            } else {
                if (this.synth && (this.synth.speaking || this.synth.paused)) {
                    if (this.synth.paused) this.ttsPlay(); else this.ttsPause();
                } else {
                    this.ttsPlay();
                }
            }
            this.playerUpdatePlayIcon();
        });
        if (rew) rew.addEventListener('click', () => this.playerSkip(-30));
        if (fwd) fwd.addEventListener('click', () => this.playerSkip(30));
        if (prev) prev.addEventListener('click', () => this.playerPrevChapter());
        if (next) next.addEventListener('click', () => this.playerNextChapter());
        if (speed) speed.addEventListener('click', () => this.playerCycleSpeed());
        if (progress) {
            progress.addEventListener('input', (e) => this.playerSeekPreview(e));
            progress.addEventListener('change', (e) => this.playerSeekCommit(e));
        }
        if (audio) {
            audio.addEventListener('timeupdate', () => this.playerSyncFromAudio());
            audio.addEventListener('loadedmetadata', () => this.playerSyncFromAudio(true));
            audio.addEventListener('play', () => this.playerUpdatePlayIcon());
            audio.addEventListener('pause', () => this.playerUpdatePlayIcon());
            // aplicar playbackRate desde settings
            audio.playbackRate = Number(this.settings.ttsRate || 1.0);
        }
        // Inicializar speed label
        this.playerUpdateSpeedLabel();
    }

    playerResetUI() {
        const progress = document.getElementById('player-progress');
        const cur = document.getElementById('player-current');
        const dur = document.getElementById('player-duration');
        if (progress) { progress.value = 0; progress.style.setProperty('--_pct', '0%'); }
        if (cur) cur.textContent = '0:00';
        if (dur) dur.textContent = '0:00';
        this.playerUpdatePlayIcon();
        this.playerUpdateSpeedLabel();
    }

    isAudioActive() {
        const audio = document.getElementById('audio-player');
        return !!(audio && !audio.classList.contains('hidden') && audio.src);
    }

    playerUpdatePlayIcon() {
        const play = document.getElementById('player-play');
        if (!play) return;
        const audio = document.getElementById('audio-player');
        const usingAudio = this.isAudioActive();
        let isPlaying = false;
        if (usingAudio) {
            isPlaying = audio && !audio.paused;
        } else {
            isPlaying = !!(this.synth && this.synth.speaking && !this.synth.paused);
        }
        play.textContent = isPlaying ? '❚❚' : '▶';
        play.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir');
    }

    playerCycleSpeed() {
        const speeds = [0.75, 1.0, 1.25, 1.5];
        const cur = Number(this.settings.ttsRate || 1.0);
        const idx = speeds.indexOf(cur);
        const next = speeds[(idx + 1) % speeds.length];
        this.settings.ttsRate = next;
        this.saveSettings();
        // aplicar a audio y TTS (solo en nuevas utterances)
        const audio = document.getElementById('audio-player');
        if (audio) audio.playbackRate = next;
        this.playerUpdateSpeedLabel();
    }

    playerUpdateSpeedLabel() {
        const btn = document.getElementById('player-speed');
        if (btn) btn.textContent = `${Number(this.settings.ttsRate || 1.0)}x`;
    }

    // Navegación de capítulo anterior/siguiente (incluye salto de libro)
    playerPrevChapter() {
        const nextRef = this.getAdjacentChapter(-1);
        if (nextRef) this.loadChapter(nextRef.bookId, nextRef.chapter);
    }

    playerNextChapter() {
        const nextRef = this.getAdjacentChapter(1);
        if (nextRef) this.loadChapter(nextRef.bookId, nextRef.chapter);
    }

    getAdjacentChapter(delta) {
        if (!this.currentBook || !this.currentChapter) return null;
        // Ensure numeric IDs and sorted ascending
        const books = Object.keys(BIBLE_DATA.books).map(n => Number(n)).filter(n => isFinite(n)).sort((a,b) => a - b);
        let bookId = Number(this.currentBook);
        let chapter = Number(this.currentChapter) + delta;
        const currentIndex = books.indexOf(bookId);
        if (currentIndex === -1) return null;
        const chaptersInBook = Number(BIBLE_DATA.books[bookId]?.chapters || 0);
        if (chapter < 1) {
            // ir al libro anterior
            const prevIndex = currentIndex - 1;
            if (prevIndex < 0) return null; // ya en el primer libro
            bookId = books[prevIndex];
            chapter = BIBLE_DATA.books[bookId].chapters; // último capítulo del libro anterior
        } else if (chapter > chaptersInBook) {
            // ir al libro siguiente
            const nextIndex = currentIndex + 1;
            if (nextIndex >= books.length) return null; // ya en el último libro
            bookId = books[nextIndex];
            chapter = 1; // primer capítulo del libro siguiente
        }
        return { bookId, chapter };
    }

    // Métodos usados por botones superior/inferior y selector de capítulo
    navigatePrevious() {
        const prev = this.getAdjacentChapter(-1);
        if (prev) this.loadChapter(prev.bookId, prev.chapter);
    }

    navigateNext() {
        const next = this.getAdjacentChapter(1);
        if (next) this.loadChapter(next.bookId, next.chapter);
    }

    onChapterChange(e) {
        const ch = Number(e?.target?.value);
        const b = Number(this.currentBook);
        if (isFinite(ch) && ch >= 1 && isFinite(b)) {
            this.loadChapter(b, ch);
        }
    }

    // Actualiza select y botones prev/next en header y bottom
    updateNavigation(bookId, chapter) {
        const bId = Number(bookId);
        const ch = Number(chapter);
        const total = Number(BIBLE_DATA.books[bId]?.chapters || 0);
        // Sync chapter select
        const select = document.getElementById('chapter-select');
        if (select) {
            if (select.options.length !== total) {
                select.innerHTML = '';
                for (let i = 1; i <= total; i++) {
                    const opt = document.createElement('option');
                    opt.value = String(i);
                    opt.textContent = String(i);
                    select.appendChild(opt);
                }
            }
            select.value = String(ch);
        }
        // Enable/disable prev/next at boundaries
        const bookIds = Object.keys(BIBLE_DATA.books).map(n => Number(n)).filter(n => isFinite(n));
        const minBook = Math.min(...bookIds);
        const maxBook = Math.max(...bookIds);
        const isAtFirst = ch <= 1 && bId === minBook;
        const isAtLast = ch >= total && bId === maxBook;
        ['prev-chapter','bottom-prev-chapter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = !!isAtFirst;
        });
        ['next-chapter','bottom-next-chapter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = !!isAtLast;
        });
    }

    updateHeader(bookId, chapter) {
        const name = BIBLE_DATA.books[Number(bookId)]?.name || '';
        const titleEl = document.getElementById('chapter-title');
        if (titleEl) titleEl.textContent = `${name} ${chapter}`.trim();
        try { document.title = `${name} ${chapter} · Biblia`; } catch(_) {}
    }

    formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    playerSyncFromAudio(init = false) {
        const audio = document.getElementById('audio-player');
        if (!audio) return;
        const cur = document.getElementById('player-current');
        const dur = document.getElementById('player-duration');
        const progress = document.getElementById('player-progress');
        if (dur && audio.duration) dur.textContent = this.formatTime(audio.duration);
        if (cur) cur.textContent = this.formatTime(audio.currentTime || 0);
        if (progress && audio.duration) {
            const pct = Math.max(0, Math.min(100, (audio.currentTime / audio.duration) * 100));
            progress.value = pct;
            progress.style.setProperty('--_pct', pct + '%');
        }
        if (init) this.playerUpdatePlayIcon();
    }

    playerSeekPreview(e) {
        const progress = e.target;
        const audio = document.getElementById('audio-player');
        if (this.isAudioActive() && audio && audio.duration) {
            const cur = document.getElementById('player-current');
            const sec = (Number(progress.value) / 100) * audio.duration;
            if (cur) cur.textContent = this.formatTime(sec);
            progress.style.setProperty('--_pct', progress.value + '%');
        }
    }

    playerSeekCommit(e) {
        const progress = e.target;
        if (this.isAudioActive()) {
            const audio = document.getElementById('audio-player');
            if (audio && audio.duration) {
                audio.currentTime = (Number(progress.value) / 100) * audio.duration;
            }
            return;
        }
        // TTS: buscar porcentaje aproximado al índice de verso
        const total = this.tts.meta.filter(m => m.type === 'verse').length;
        if (total > 0) {
            const versePos = Math.floor((Number(progress.value) / 100) * total);
            const targetIndex = this.tts.meta.findIndex((m, idx) => m.type === 'verse' && (idx >= versePos + 1));
            // Reiniciar TTS en ese índice
            this.synth && this.synth.cancel();
            this.tts.queue = this.ttsBuildQueueFromDOM();
            this.tts.index = Math.max(1, targetIndex); // 0 es el título
            this.tts.playing = true;
            this.tts.paused = false;
            this.ttsSpeakIndex(this.tts.index);
            this.playerUpdatePlayIcon();
        }
    }

    playerSkip(deltaSeconds) {
        if (this.isAudioActive()) {
            const audio = document.getElementById('audio-player');
            if (audio && isFinite(audio.currentTime)) {
                audio.currentTime = Math.max(0, audio.currentTime + deltaSeconds);
            }
            return;
        }
        // TTS: usar saltos por verso como aproximación a 30s
        if (!this.tts.queue || this.tts.queue.length === 0) return;
        if (!this.tts.playing && !this.synth?.speaking) this.ttsPlay();
        const step = deltaSeconds > 0 ? 1 : -1;
        let idx = (this.tts.index ?? 0) + step;
        idx = Math.max(1, Math.min(this.tts.queue.length - 1, idx));
        this.synth && this.synth.cancel();
        this.tts.index = idx;
        this.tts.playing = true;
        this.tts.paused = false;
        this.ttsSpeakIndex(idx);
        this.playerUpdatePlayIcon();
    }

    playerPrevChapter() {
        const prev = this.getAdjacentChapter(-1);
        if (prev) this.loadChapter(prev.bookId, prev.chapter);
    }

    playerNextChapter() {
        const next = this.getAdjacentChapter(1);
        if (next) this.loadChapter(next.bookId, next.chapter);
    }

    // ===== AUDIO: TEXTO A VOZ (TTS) =====
    ttsInitVoice() {
        if (!this.synth) return;
        const voices = this.synth.getVoices();
        // Preferir español (España o Latam); fallback a cualquier voz
        const prefer = [
            /es[-_](ES|es)/i,
            /es[-_](MX|mx|419)/i,
            /es/i
        ];
        let found = null;
        for (const regex of prefer) {
            found = voices.find(v => regex.test(v.lang));
            if (found) break;
        }
        // Si hay voz guardada en settings y existe, usarla
        const savedName = this.settings.ttsVoice || '';
        let byName = voices.find(v => v.name === savedName);
        this.tts.voice = byName || found || voices[0] || null;
        // Poblar selector de voces
        this.ttsPopulateVoices(voices);
    }

    ttsUpdateStatus(text) {
        const el = document.getElementById('audio-status');
        if (el) el.textContent = text || '';
    }

    ttsSetButtons({ canPlay, playing, paused }) {
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');
        if (!playBtn || !pauseBtn || !stopBtn) return;
        playBtn.disabled = !canPlay || playing; // cuando reproduce, deshabilitar play
        pauseBtn.disabled = !canPlay || !playing; // habilitar pausa solo si está reproduciendo
        stopBtn.disabled = !canPlay || (!playing && !paused);
    }

    ttsBuildQueueFromDOM() {
        const container = document.getElementById('chapter-content');
        if (!container) return [];
        const verses = Array.from(container.querySelectorAll('.verse'));
        const bookName = this.currentBook != null ? (BIBLE_DATA.books[this.currentBook]?.name || '') : '';
        const items = [];
        const meta = [];
        // Título del capítulo
        items.push(`${bookName} ${this.currentChapter}`.trim());
        meta.push({ type: 'title' });
        verses.forEach(v => {
            const num = v.getAttribute('data-verse');
            const text = v.querySelector('.verse-text')?.textContent?.trim() || '';
            if (text) {
                items.push(`${num}. ${text}`);
                meta.push({ type: 'verse', verse: Number(num) });
            }
        });
        this.tts.meta = meta;
        return items;
    }

    ttsSpeakIndex(i) {
        if (!this.synth) return;
        if (i < 0 || i >= this.tts.queue.length) {
            this.tts.playing = false;
            this.tts.paused = false;
            this.ttsUpdateStatus('');
            this.ttsSetButtons({ canPlay: true, playing: false, paused: false });
            this.ttsClearReadingHighlight();
            return;
        }
        const text = this.tts.queue[i];
        const utter = new SpeechSynthesisUtterance(text);
        if (this.tts.voice) utter.voice = this.tts.voice;
        utter.lang = this.tts.voice?.lang || 'es-ES';
        utter.rate = Number(this.settings.ttsRate || 1.0);  // velocidad
        utter.pitch = Number(this.settings.ttsPitch || 1.0); // tono
        utter.volume = Number(this.settings.ttsVolume ?? 1.0); // volumen 0..1
        // Preparar resaltado palabra a palabra
        utter.onstart = () => {
            const meta = this.tts.meta[i];
            if (meta?.type === 'verse') {
                this.ttsPrepareWordSpans(meta);
            } else {
                this.ttsClearWordHighlight();
            }
        };
        utter.onboundary = (e) => {
            // Solo si es un verso y el límite es de palabra/caracter
            const meta = this.tts.meta[i];
            if (!meta || meta.type !== 'verse') return;
            const prefix = `${meta.verse}. `;
            const verseCharIndex = Math.max(0, (e.charIndex || 0) - prefix.length);
            this.ttsHighlightWordAt(meta, verseCharIndex);
        };
        utter.onend = () => {
            this.tts.index = i + 1;
            // Si fue detenido, no continuar
            if (!this.tts.playing) return;
            this.ttsSpeakIndex(this.tts.index);
        };
        utter.onerror = () => {
            // intentar continuar
            this.tts.index = i + 1;
            if (this.tts.playing) this.ttsSpeakIndex(this.tts.index);
        };
        this.synth.speak(utter);
        this.ttsApplyReadingHighlight(i);
        const meta = this.tts.meta[i];
        if (meta?.type === 'verse') {
            this.ttsUpdateStatus(`Leyendo ${this.currentChapter}:${meta.verse}`);
        } else {
            this.ttsUpdateStatus(`Leyendo título`);
        }
    }

    ttsPlay() {
        // Reanudar audio nativo si estaba pausado
        const audio = document.getElementById('audio-player');
        if (audio && audio.src && audio.paused && !audio.ended) {
            audio.play();
            this.ttsSetButtons({ canPlay: true, playing: true, paused: false });
            this.ttsUpdateStatus('Reproduciendo audio');
            return;
        }
        // Intentar audio pregrabado si está configurado
        if (this.settings.ttsPrerecorded && this.settings.ttsAudioBase) {
            const ok = this.audioPlayPrerecorded();
            if (ok) return; // usando audio pregrabado
        }
        if (!this.synth) {
            this.showNotification('Tu navegador no soporta lectura en voz.', 'error');
            return;
        }
        // Reanudar si estaba en pausa
        if (this.tts.paused && this.synth.paused) {
            this.synth.resume();
            this.tts.paused = false;
            this.tts.playing = true;
            this.ttsSetButtons({ canPlay: true, playing: true, paused: false });
            return;
        }
        // Iniciar desde cero
        this.synth.cancel();
        this.tts.queue = this.ttsBuildQueueFromDOM();
        this.tts.index = 0;
        this.tts.playing = true;
        this.tts.paused = false;
        this.ttsSetButtons({ canPlay: true, playing: true, paused: false });
        this.ttsSpeakIndex(0);
    }

    ttsPause() {
        // Pausar audio nativo si estaba reproduciendo
        const audio = document.getElementById('audio-player');
        if (audio && !audio.paused) {
            audio.pause();
            this.ttsSetButtons({ canPlay: true, playing: false, paused: true });
            this.ttsUpdateStatus('Pausado');
            return;
        }
        if (!this.synth) return;
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
            this.tts.paused = true;
            this.tts.playing = false;
            this.ttsSetButtons({ canPlay: true, playing: false, paused: true });
            this.ttsUpdateStatus('Pausado');
        }
    }

    ttsStop() {
        if (!this.synth) return;
        this.synth.cancel();
        this.tts.playing = false;
        this.tts.paused = false;
        this.ttsSetButtons({ canPlay: true, playing: false, paused: false });
        this.ttsUpdateStatus('');
        this.ttsClearReadingHighlight();
        // Detener audio pregrabado si estaba en uso
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.classList.add('hidden');
        }
    }

    ttsCancelIfSpeaking() {
        if (this.synth && (this.synth.speaking || this.synth.pending)) {
            this.synth.cancel();
        }
        this.tts.playing = false;
        this.tts.paused = false;
        // detener audio nativo
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.classList.add('hidden');
        }
    }

    // ===== TTS settings & helpers =====
    ttsPopulateVoices(voices) {
        const select = document.getElementById('tts-voice');
        if (!select) return;
        const current = this.settings.ttsVoice || '';
        select.innerHTML = voices.map(v => `<option value="${v.name}">${v.name} (${v.lang})</option>`).join('');
        if (current) select.value = current;
    }

    ttsBindSettingsControls() {
        const voiceSel = document.getElementById('tts-voice');
        const rateInput = document.getElementById('tts-rate');
        const pitchInput = document.getElementById('tts-pitch');
        const volumeInput = document.getElementById('tts-volume');
        const preChk = document.getElementById('tts-prerecorded');
        const baseInput = document.getElementById('tts-audio-base');
        if (voiceSel) voiceSel.addEventListener('change', (e) => {
            const name = e.target.value;
            this.settings.ttsVoice = name;
            // actualizar voz activa
            if (this.synth) {
                const v = this.synth.getVoices().find(x => x.name === name);
                if (v) this.tts.voice = v;
            }
            this.saveSettings();
        });
        if (rateInput) rateInput.addEventListener('input', (e) => {
            this.settings.ttsRate = Number(e.target.value);
            this.saveSettings();
        });
        if (pitchInput) pitchInput.addEventListener('input', (e) => {
            this.settings.ttsPitch = Number(e.target.value);
            this.saveSettings();
        });
        if (volumeInput) volumeInput.addEventListener('input', (e) => {
            this.settings.ttsVolume = Number(e.target.value);
            this.saveSettings();
        });
        if (preChk) preChk.addEventListener('change', (e) => {
            this.settings.ttsPrerecorded = !!e.target.checked;
            this.saveSettings();
        });
        if (baseInput) baseInput.addEventListener('change', (e) => {
            this.settings.ttsAudioBase = e.target.value.trim();
            this.saveSettings();
        });
    }

    // ===== Word-by-word highlighting helpers =====
    ttsPrepareWordSpans(meta) {
        // meta: {type:'verse', verse:n}
        const verseEl = document.querySelector(`.verse[data-verse="${meta.verse}"]`);
        if (!verseEl) return;
        const textEl = verseEl.querySelector('.verse-text');
        if (!textEl) return;
        if (textEl.dataset.tokenized === '1') return;
        const original = textEl.textContent || '';
        textEl.textContent = '';
        // Tokenizar en palabras y espacios preservando offsets
        const tokens = original.match(/\S+|\s+/g) || [];
        let offset = 0;
        tokens.forEach(tok => {
            if (/\s+/.test(tok)) {
                textEl.appendChild(document.createTextNode(tok));
                offset += tok.length;
            } else {
                const span = document.createElement('span');
                span.className = 'verse-word';
                span.textContent = tok;
                span.dataset.start = String(offset);
                span.dataset.end = String(offset + tok.length);
                textEl.appendChild(span);
                offset += tok.length;
            }
        });
        textEl.dataset.tokenized = '1';
    }

    ttsHighlightWordAt(meta, verseCharIndex) {
        const verseEl = document.querySelector(`.verse[data-verse="${meta.verse}"]`);
        if (!verseEl) return;
        const textEl = verseEl.querySelector('.verse-text');
        if (!textEl) return;
        if (textEl.dataset.tokenized !== '1') this.ttsPrepareWordSpans(meta);
        let target = null;
        const words = textEl.querySelectorAll('.verse-word');
        for (const w of words) {
            const s = Number(w.dataset.start || 0);
            const e = Number(w.dataset.end || 0);
            if (verseCharIndex >= s && verseCharIndex < e) { target = w; break; }
        }
        // Aplicar estilos
        this.ttsClearWordHighlight();
        if (target) target.classList.add('reading-word');
    }

    ttsClearWordHighlight() {
        document.querySelectorAll('.verse-word.reading-word').forEach(el => el.classList.remove('reading-word'));
    }

    ttsApplyReadingHighlight(i) {
        const meta = this.tts.meta[i];
        if (!meta || meta.type !== 'verse') return this.ttsClearReadingHighlight();
        // limpiar anterior
        this.ttsClearReadingHighlight();
        const verseEl = document.querySelector(`.verse[data-verse="${meta.verse}"]`);
        if (verseEl) {
            verseEl.classList.add('reading');
            // Opcional: centrar en pantalla si se aleja del viewport
            const rect = verseEl.getBoundingClientRect();
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            if (rect.top < 80 || rect.bottom > vh - 80) {
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    ttsClearReadingHighlight() {
        document.querySelectorAll('.verse.reading').forEach(el => el.classList.remove('reading'));
    }

    // ===== Audio pregrabado =====
    audioPlayPrerecorded() {
        try {
            const base = (this.settings.ttsAudioBase || '').replace(/\/$/, '');
            if (!base) return false;
            const bookName = this.currentBook != null ? (BIBLE_DATA.books[this.currentBook]?.name || '') : '';
            if (!bookName || !this.currentChapter) return false;
            // Construir URL: {base}/{Libro}/{capitulo}.mp3 (ejemplo simple)
            const pathBook = encodeURIComponent(bookName);
            const url = `${base}/${pathBook}/${this.currentChapter}.mp3`;
            const audio = document.getElementById('audio-player');
            if (!audio) return false;
            audio.src = url;
            audio.classList.remove('hidden');
            audio.play().then(() => {
                this.ttsUpdateStatus('Reproduciendo audio');
                this.ttsSetButtons({ canPlay: true, playing: true, paused: false });
                // gestionar botones con audio nativo
                audio.onended = () => {
                    this.ttsSetButtons({ canPlay: true, playing: false, paused: false });
                    this.ttsUpdateStatus('');
                    audio.classList.add('hidden');
                };
                return true;
            }).catch(() => {
                // Fallback a TTS
                audio.classList.add('hidden');
                this.ttsUpdateStatus('');
                this.ttsPlay();
            });
            return true;
        } catch {
            return false;
        }
    }

    // ===== COMENTARIOS BÍBLICOS =====
    getDefaultCommentaries() {
        return {
            'Génesis': {
                1: {
                    1: 'En el principio: Dios es el origen de todo. Este versículo establece la soberanía de Dios sobre la creación y prepara el terreno para toda la revelación bíblica.'
                }
            },
            'Salmos': {
                23: {
                    1: 'Jehová es mi Pastor: Imagen íntima del cuidado y provisión de Dios. La figura del pastor comunica guía, protección y sustento.'
                }
            },
            'Juan': {
                3: {
                    16: 'Porque de tal manera amó Dios al mundo: El corazón del evangelio. El amor de Dios Se expresa en dar a Su Hijo para vida eterna a todo el que cree.'
                }
            }
        };
    }

    getCommentary(bookId, chapter, verseNumber) {
        try {
            const bookName = BIBLE_DATA.books[bookId]?.name;
            if (!bookName) return null;
            return this.commentaries?.[bookName]?.[chapter]?.[verseNumber] || null;
        } catch {
            return null;
        }
    }

    openCommentary(bookId, chapter, verseNumber) {
        const panel = document.getElementById('commentary-panel');
        if (!panel) return;
        const bookName = BIBLE_DATA.books[bookId]?.name || '';
        const ref = `${bookName} ${chapter}:${verseNumber}`;
        const text = this.getCommentary(bookId, chapter, verseNumber) || 'No hay comentario disponible para este versículo.';
        const titleEl = document.getElementById('commentary-title');
        const refEl = document.getElementById('commentary-ref');
        const textEl = document.getElementById('commentary-text');
        if (titleEl) titleEl.textContent = 'Comentario';
        if (refEl) refEl.textContent = ref;
        if (textEl) textEl.textContent = text;
        panel.classList.remove('hidden');
        // Cerrar otros paneles para foco
        this.closeSidebar();
        this.closeSearch();
    }

    closeCommentary() {
        const panel = document.getElementById('commentary-panel');
        if (panel) panel.classList.add('hidden');
    }
    
    onVerseClick(e, bookId, chapter) {
        const verseEl = e.currentTarget;
        const verseNumber = verseEl.dataset.verse;
        // Mostrar menú de colores tanto con clic izquierdo como con clic derecho
        if (e.type === 'click' || e.type === 'contextmenu') {
            e.preventDefault();
            this.showContextMenu(e, bookId, chapter, verseNumber);
            return;
        }
    }
    
    updateHeader(bookId, chapter) {
        const book = BIBLE_DATA.books[bookId];
        if (!book) return;
        
        document.getElementById('current-book-header').textContent = book.name;
        document.getElementById('current-chapter-header').textContent = chapter;
        
        // Update bottom navigation
        this.updateBottomNavigation(bookId, chapter);
    }
    
    updateBottomNavigation(bookId, chapter) {
        const book = BIBLE_DATA.books[bookId];
        if (!book) return;
        
        const navigation = BIBLE_DATA.getNavigation(bookId, parseInt(chapter));
        
        // Update bottom navigation content
        document.getElementById('bottom-current-book').textContent = book.name;
        document.getElementById('bottom-current-chapter').textContent = chapter;
        
        // Update bottom navigation buttons
        const bottomPrevBtn = document.getElementById('bottom-prev-chapter');
        const bottomNextBtn = document.getElementById('bottom-next-chapter');
        
        if (navigation.prev) {
            bottomPrevBtn.disabled = false;
            bottomPrevBtn.title = `${navigation.prev.bookName} ${navigation.prev.chapter}`;
        } else {
            bottomPrevBtn.disabled = true;
            bottomPrevBtn.title = 'No hay capítulo anterior';
        }
        
        if (navigation.next) {
            bottomNextBtn.disabled = false;
            bottomNextBtn.title = `${navigation.next.bookName} ${navigation.next.chapter}`;
        } else {
            bottomNextBtn.disabled = true;
            bottomNextBtn.title = 'No hay capítulo siguiente';
        }
        
        // Show bottom navigation when reading
        this.showBottomNavigation();
    }
    
    showBottomNavigation() {
        document.getElementById('bottom-navigation').classList.remove('hidden');
    }
    
    hideBottomNavigation() {
        document.getElementById('bottom-navigation').classList.add('hidden');
    }
    
    updateNavigation(bookId, chapter) {
        const navigation = BIBLE_DATA.getNavigation(bookId, parseInt(chapter));
        const book = BIBLE_DATA.books[bookId];
        
        // Update chapter selector
        this.populateChapterSelector(bookId, parseInt(chapter));
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prev-chapter');
        const nextBtn = document.getElementById('next-chapter');
        const chapterSelect = document.getElementById('chapter-select');
        
        // Enable chapter select
        chapterSelect.disabled = false;
        
        if (navigation.prev) {
            prevBtn.disabled = false;
            prevBtn.title = `${navigation.prev.bookName} ${navigation.prev.chapter}`;
        } else {
            prevBtn.disabled = true;
            prevBtn.title = 'No hay capítulo anterior';
        }
        
        if (navigation.next) {
            nextBtn.disabled = false;
            nextBtn.title = `${navigation.next.bookName} ${navigation.next.chapter}`;
        } else {
            nextBtn.disabled = true;
            nextBtn.title = 'No hay capítulo siguiente';
        }
    }
    
    // ===== NAVIGATION =====
    navigatePrevious() {
        if (!this.currentBook || !this.currentChapter) return;
        
        const navigation = BIBLE_DATA.getNavigation(this.currentBook, this.currentChapter);
        if (navigation.prev) {
            this.loadChapter(navigation.prev.bookId, navigation.prev.chapter);
        }
    }
    
    navigateNext() {
        if (!this.currentBook || !this.currentChapter) return;
        
        const navigation = BIBLE_DATA.getNavigation(this.currentBook, this.currentChapter);
        if (navigation.next) {
            this.loadChapter(navigation.next.bookId, navigation.next.chapter);
        }
    }
    
    onChapterChange(e) {
        const chapter = parseInt(e.target.value);
        if (this.currentBook && chapter) {
            this.loadChapter(this.currentBook, chapter);
        }
    }
    
    // ===== SEARCH =====
    handleSearchInput(e) {
        const query = e.target.value.trim();
        if (query.length >= 3) {
            this.performSearch(query);
        } else {
            document.getElementById('search-results-content').innerHTML = '';
        }
    }
    
    async performSearch(query = null) {
        if (!query) {
            query = document.getElementById('search-input').value.trim();
        }
        
        if (query.length < 3) {
            document.getElementById('search-results-content').innerHTML = '<p>Ingresa al menos 3 caracteres para buscar</p>';
            return;
        }
        
        try {
            const results = await this.searchBible(query);
            this.displaySearchResults(results, query);
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('Error en la búsqueda', 'error');
        }
    }
    
    async searchBible(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        if (!window.BIBLE_CONTENT) {
            const response = await fetch('bible-content.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            window.BIBLE_CONTENT = await response.json();
        }
        
        // Search in all books using the correct JSON structure
        const books = window.BIBLE_CONTENT.books;
        
        for (const bookName in books) {
            const book = books[bookName];
            
            // Find the corresponding bookId from BIBLE_DATA
            let bookId = null;
            for (const id in BIBLE_DATA.books) {
                if (BIBLE_DATA.books[id].name === bookName) {
                    bookId = id;
                    break;
                }
            }
            
            if (!bookId) continue;
            
            for (const chapterNum in book) {
                const chapter = book[chapterNum];
                
                if (chapter.verses) {
                    for (const verse of chapter.verses) {
                        const text = verse.text.toLowerCase();
                        
                        if (text.includes(queryLower)) {
                            results.push({
                                bookId,
                                bookName: bookName,
                                chapter: parseInt(chapterNum),
                                verse: verse.number,
                                text: verse.text,
                                reference: `${bookName} ${chapterNum}:${verse.number}`
                            });
                            
                            // Limit results for better performance
                            if (results.length >= 100) {
                                return results;
                            }
                        }
                    }
                }
            }
        }
        
        return results;
    }
    
    displaySearchResults(results, query) {
        const container = document.getElementById('search-results-content');
        
        if (results.length === 0) {
            container.innerHTML = '<p class="no-results">No se encontraron resultados</p>';
            return;
        }
        
        let html = `<div class="search-results-header">
            <p>${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"</p>
        </div>`;
        
        results.forEach(result => {
            const highlightedText = this.highlightSearchTerm(result.text, query);
            
            html += `
                <div class="search-result-item" data-book="${result.bookId}" data-chapter="${result.chapter}">
                    <div class="search-result-reference">${result.reference}</div>
                    <div class="search-result-text">${highlightedText}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Add click handlers
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const bookId = e.currentTarget.dataset.book;
                const chapter = parseInt(e.currentTarget.dataset.chapter);
                this.loadChapter(bookId, chapter);
                this.closeSearch(); // Close search panel after clicking a result
            });
        });
    }
    
    highlightSearchTerm(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    // ===== SETTINGS =====
    changeFontSize(size) {
        this.settings.fontSize = parseInt(size);
        this.saveSettings();
        this.applyFontSize();
    }
    
    adjustFontSize(delta) {
        const slider = document.getElementById('font-size-slider');
        const currentValue = parseInt(slider.value);
        const newValue = Math.max(12, Math.min(24, currentValue + delta));
        
        slider.value = newValue;
        this.changeFontSize(newValue);
    }
    
    changeTheme(theme) {
        this.settings.theme = theme;
        this.saveSettings();
        this.applyTheme();
        this.updateThemeButtons();
    }
    
    applySettings() {
        this.applyTheme();
        this.applyFontSize();
        this.updateSettingsUI();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }
    
    applyFontSize() {
        const chapterContent = document.getElementById('chapter-content');
        if (chapterContent) {
            chapterContent.style.fontSize = `${this.settings.fontSize}px`;
        }
    }
    
    updateThemeButtons() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.settings.theme);
        });
    }
    
    updateSettingsUI() {
        document.getElementById('font-size-slider').value = this.settings.fontSize;
        this.updateThemeButtons();
        const rate = document.getElementById('tts-rate');
        if (rate) rate.value = this.settings.ttsRate ?? 1.0;
        const pitch = document.getElementById('tts-pitch');
        if (pitch) pitch.value = this.settings.ttsPitch ?? 1.0;
        const volume = document.getElementById('tts-volume');
        if (volume) volume.value = this.settings.ttsVolume ?? 1.0;
        const chk = document.getElementById('tts-prerecorded');
        if (chk) chk.checked = !!this.settings.ttsPrerecorded;
        const base = document.getElementById('tts-audio-base');
        if (base) base.value = this.settings.ttsAudioBase || '';
        // voice select is populated async in ttsInitVoice; set selection if available
        const sel = document.getElementById('tts-voice');
        if (sel && this.settings.ttsVoice) sel.value = this.settings.ttsVoice;
    }
    
    // ===== DATA MANAGEMENT =====
    populateBookLists() {
        const oldTestamentContainer = document.getElementById('old-testament-books');
        const newTestamentContainer = document.getElementById('new-testament-books');
        
        const oldTestamentBooks = BIBLE_DATA.getBooksByTestament('antiguo');
        const newTestamentBooks = BIBLE_DATA.getBooksByTestament('nuevo');
        
        oldTestamentContainer.innerHTML = oldTestamentBooks.map(book => 
            `<button class="book-item" data-book="${book.id}">${book.name}</button>`
        ).join('');
        
        newTestamentContainer.innerHTML = newTestamentBooks.map(book => 
            `<button class="book-item" data-book="${book.id}">${book.name}</button>`
        ).join('');
        
        // Add click handlers
        [oldTestamentContainer, newTestamentContainer].forEach(container => {
            container.querySelectorAll('.book-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const bookId = e.target.dataset.book;
                    this.loadChapter(bookId, 1);
                    
                    // Update active book
                    document.querySelectorAll('.book-item').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                });
            });
        });
    }
    
    populateChapterSelector(bookId, selectedChapter = 1) {
        const chapterSelector = document.getElementById('chapter-select');
        const book = BIBLE_DATA.books[bookId];
        
        if (!book) return;
        
        let html = '';
        for (let i = 1; i <= book.chapters; i++) {
            html += `<option value="${i}"${i === selectedChapter ? ' selected' : ''}>Capítulo ${i}</option>`;
        }
        
        chapterSelector.innerHTML = html;
    }
    
    // ===== HOME: Libros recomendados =====
    getRecommendedBooks() {
        // Definición de algunos libros destacados con capítulo sugerido
        return [
            { bookId: '43', chapter: 1, cover: 'cover-blue',  tag: 'Evangelio', desc: 'Comienza con el testimonio de la vida divina de Cristo.' },  // Juan
            { bookId: '19', chapter: 23, cover: 'cover-green', tag: 'Salmo',     desc: 'El Señor es mi Pastor: reposo, guía y cuidado.' },          // Salmos
            { bookId: '40', chapter: 5, cover: 'cover-yellow', tag: 'Enseñanza', desc: 'El Sermón del Monte: vida del reino en la tierra.' },     // Mateo
            { bookId: '01', chapter: 1, cover: 'cover-purple', tag: 'Comienzos', desc: 'En el principio: creación, caída y promesa de redención.' }, // Génesis
            { bookId: '45', chapter: 8, cover: 'cover-pink',   tag: 'Vida en el Espíritu', desc: 'Ninguna condenación: andar conforme al Espíritu.' }, // Romanos
            { bookId: '58', chapter: 11, cover: 'cover-blue',  tag: 'Fe',       desc: 'La galería de la fe: testigos que agradaron a Dios.' },     // Hebreos
        ];
    }
    
    renderRecommended() {
        const container = document.getElementById('recommended-list');
        if (!container) return;
        
        const items = this.getRecommendedBooks();
        const cards = items.map(item => {
            const book = BIBLE_DATA.books[item.bookId];
            if (!book) return '';
            const initials = book.abbr || (book.name ? book.name.slice(0,2) : 'LB');
            const chaptersText = `${book.chapters} cap.`;
            return `
                <article class="recommended-card" data-book-id="${item.bookId}" data-chapter="${item.chapter}" title="Leer ${book.name} ${item.chapter}">
                    <div class="recommended-cover ${item.cover}">${initials}</div>
                    <div class="recommended-info">
                        <h3 class="recommended-title">${book.name}</h3>
                        <div class="recommended-meta">
                            <span>${item.tag}</span>
                            <span>•</span>
                            <span>${chaptersText}</span>
                        </div>
                        <p class="recommended-desc">${item.desc}</p>
                    </div>
                </article>
            `;
        }).join('');
        
        container.innerHTML = cards;
        
        // Eventos de navegación
        container.querySelectorAll('.recommended-card').forEach(card => {
            card.addEventListener('click', () => {
                const bookId = card.getAttribute('data-book-id');
                const chapter = parseInt(card.getAttribute('data-chapter'), 10) || 1;
                this.loadChapter(bookId, chapter);
                this.closeSidebar();
            });
        });
    }
    
    showWelcomeScreen() {
        // Mostrar pantalla de bienvenida y ocultar contenido
        const welcome = document.getElementById('welcome-screen');
        const content = document.getElementById('content-area');
        if (welcome) {
            // Quitar posibles estilos previos e inline styles
            welcome.classList.remove('hidden');
            welcome.style.removeProperty('display'); // respeta el display del CSS (flex)
        }
        if (content) content.classList.add('hidden');
        // Ocultar barra de capítulos y navegación inferior en home
        const chapterNav = document.querySelector('.chapter-nav');
        if (chapterNav) chapterNav.classList.add('hidden');
        const bottomNav = document.getElementById('bottom-navigation');
        if (bottomNav) bottomNav.classList.add('hidden');
        // Resetear header principal
        const headerBook = document.getElementById('current-book-header');
        const headerChapter = document.getElementById('current-chapter-header');
        if (headerBook) headerBook.textContent = 'Biblia Versión Recobro';
        if (headerChapter) headerChapter.textContent = '';
        // Deshabilitar selector y botones de capítulo en home
        const chapterSelect = document.getElementById('chapter-select');
        const prevBtn = document.getElementById('prev-chapter');
        const nextBtn = document.getElementById('next-chapter');
        if (chapterSelect) chapterSelect.setAttribute('disabled', '');
        if (prevBtn) prevBtn.setAttribute('disabled', '');
        if (nextBtn) nextBtn.setAttribute('disabled', '');
        // Cerrar cualquier panel/overlay abierto
        this.closeAllPanels && this.closeAllPanels();
        // Renderizar contenido de la home
        this.renderVerseOfDay();
        this.renderRecommended();
        this.renderPlansHome();
        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== HOME: Versículo del día =====
    pickDailyIndex(total) {
        // Índice determinístico basado en la fecha (YYYY-MM-DD)
        const today = new Date();
        const key = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = ((hash << 5) - hash) + key.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % Math.max(total, 1);
    }

    getVerseOfDayCandidates() {
        // Referencias populares; usar bookId del BIBLE_DATA
        return [
            { bookId: '43', chapter: 3, verse: 16 }, // Juan 3:16
            { bookId: '19', chapter: 23, verse: 1 }, // Salmo 23:1
            { bookId: '40', chapter: 5, verse: 9 },  // Mateo 5:9
            { bookId: '45', chapter: 8, verse: 28 }, // Romanos 8:28
            { bookId: '20', chapter: 3, verse: 5 },  // Proverbios 3:5
            { bookId: '50', chapter: 4, verse: 6 },  // Filipenses 4:6
            { bookId: '58', chapter: 11, verse: 1 }, // Hebreos 11:1
            { bookId: '01', chapter: 1, verse: 1 },  // Génesis 1:1
        ].filter(c => BIBLE_DATA.books[c.bookId]);
    }

    async getVerseOfDay() {
        const candidates = this.getVerseOfDayCandidates();
        const idx = this.pickDailyIndex(candidates.length);
        const ref = candidates[idx];
        const book = BIBLE_DATA.books[ref.bookId];
        const bookName = book ? book.name : '';

        // Intentar obtener el texto desde BIBLE_CONTENT si está o cargarlo ligero
        try {
            if (!window.BIBLE_CONTENT) {
                const response = await fetch('bible-content.json');
                if (response.ok) {
                    window.BIBLE_CONTENT = await response.json();
                }
            }
            if (window.BIBLE_CONTENT && window.BIBLE_CONTENT.books[bookName] && window.BIBLE_CONTENT.books[bookName][ref.chapter]) {
                const verses = window.BIBLE_CONTENT.books[bookName][ref.chapter].verses || [];
                const verseObj = verses.find(v => Number(v.number) === Number(ref.verse));
                return {
                    ...ref,
                    bookName,
                    text: verseObj ? verseObj.text : ''
                };
            }
        } catch (_) {
            // Si falla, seguimos con texto vacío
        }
        return { ...ref, bookName, text: '' };
    }

    formatVodDate(date = new Date()) {
        try {
            return new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);
        } catch {
            return date.toLocaleDateString();
        }
    }

    async renderVerseOfDay() {
        const refEl = document.getElementById('vod-ref');
        const textEl = document.getElementById('vod-text');
        const dateEl = document.getElementById('vod-date');
        const cardEl = document.getElementById('vod-card');
        const btnEl = document.getElementById('vod-read-btn');
        if (!refEl || !textEl || !cardEl) return;

        // Fecha
        if (dateEl) dateEl.textContent = this.formatVodDate();

        // Carga de referencia
        const vod = await this.getVerseOfDay();
        const refText = `${vod.bookName} ${vod.chapter}:${vod.verse}`;
        refEl.textContent = refText;
        textEl.textContent = vod.text && vod.text.trim().length > 0 ? `“${vod.text}”` : '—';

        const goToVerse = () => {
            this.loadChapter(vod.bookId, vod.chapter);
            // Después de cargar, podemos hacer scroll al verso si se desea con un pequeño timeout
            setTimeout(() => {
                const verseEl = document.querySelector(`.verse[data-verse="${vod.verse}"]`);
                if (verseEl) verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 600);
        };

        cardEl.addEventListener('click', goToVerse);
        cardEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') goToVerse(); });
        if (btnEl) btnEl.addEventListener('click', goToVerse);
    }

    // ===== HOME: Planes de Lectura =====
    getReadingPlans() {
        // Plan 1: Evangelio de Juan en 21 días (1 capítulo por día)
        const planJuan = {
            id: 'plan-juan-21',
            title: 'Evangelio de Juan (21 días)',
            days: 21,
            description: 'Lee un capítulo de Juan por día y contempla la vida divina de Cristo.',
            buildReadings() {
                const arr = [];
                for (let d = 1; d <= 21; d++) arr.push([{ bookId: '43', chapter: d }]);
                return arr; // array de días, cada día es lista de lecturas
            }
        };

        // Plan 2: Salmos selectos en 30 días (muestra)
        const salmosDias = [1, 8, 16, 19, 23, 27, 32, 34, 37, 40, 42, 46, 51, 62, 63, 73, 84, 90, 91, 95, 96, 100, 103, 116, 119, 121, 127, 130, 139, 150];
        const planSalmos = {
            id: 'plan-salmos-30',
            title: 'Salmos selectos (30 días)',
            days: 30,
            description: 'Pasajes devocionales clave de los Salmos para un mes.',
            buildReadings() {
                return salmosDias.map(ch => [{ bookId: '19', chapter: ch }]);
            }
        };

        return [planJuan, planSalmos];
    }

    loadPlansProgress() {
        try {
            return JSON.parse(localStorage.getItem('bible-reading-plans') || '{}');
        } catch { return {}; }
    }

    savePlansProgress(data) {
        localStorage.setItem('bible-reading-plans', JSON.stringify(data));
    }

    getPlanProgress(planId) {
        const all = this.loadPlansProgress();
        return all[planId] || { startedAt: null, currentDay: 0, completedDays: {} };
    }

    setPlanProgress(planId, progress) {
        const all = this.loadPlansProgress();
        all[planId] = progress;
        this.savePlansProgress(all);
    }

    renderPlansHome() {
        const container = document.getElementById('plans-home-list');
        if (!container) return;
        const plans = this.getReadingPlans();

        const cards = plans.map(p => {
            const readings = p.buildReadings();
            const prog = this.getPlanProgress(p.id);
            const completedCount = Object.keys(prog.completedDays || {}).length;
            const total = p.days;
            const percent = Math.min(100, Math.round((completedCount / total) * 100));
            return `
                <article class="plan-card" data-plan-id="${p.id}" title="${p.title}">
                    <h3>${p.title}</h3>
                    <div class="plan-meta">${p.description}</div>
                    <div class="plan-meta">Días: ${total} · Progreso: ${completedCount}/${total} (${percent}%)</div>
                    <div class="plan-progress"><span style="width:${percent}%;"></span></div>
                </article>
            `;
        }).join('');

        container.innerHTML = cards;
        container.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => {
                const planId = card.getAttribute('data-plan-id');
                this.openPlanPanel(planId);
            });
        });
    }

    openPlanPanel(planId) {
        const plans = this.getReadingPlans();
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;
        this.currentPlanId = planId;

        const panel = document.getElementById('plans-panel');
        const titleEl = document.getElementById('plans-panel-title');
        const dateEl = document.getElementById('plans-panel-date');
        const statusEl = document.getElementById('plans-panel-status');
        const listEl = document.getElementById('plans-reading-list');
        const startBtn = document.getElementById('plan-start-btn');
        const completeBtn = document.getElementById('plan-complete-btn');
        if (!panel) return;

        titleEl.textContent = plan.title;
        dateEl.textContent = this.formatVodDate();

        const readings = plan.buildReadings();
        const progress = this.getPlanProgress(planId);
        let day = progress.currentDay;
        if (!progress.startedAt) {
            statusEl.textContent = 'Aún no has iniciado este plan.';
            day = 1;
            startBtn.classList.remove('hidden');
            completeBtn.classList.add('hidden');
        } else {
            // Si currentDay es 0, empezar en 1
            if (!day || day < 1) day = 1;
            if (day > plan.days) day = plan.days;
            const done = !!(progress.completedDays && progress.completedDays[day]);
            const completedCount = Object.keys(progress.completedDays || {}).length;
            statusEl.textContent = `Día ${day} de ${plan.days} · Completados: ${completedCount}`;
            startBtn.classList.add('hidden');
            completeBtn.classList.remove('hidden');
            completeBtn.disabled = done;
        }

        // Render lecturas del día
        const todayReadings = readings[day - 1] || [];
        listEl.innerHTML = todayReadings.map(r => {
            const book = BIBLE_DATA.books[r.bookId];
            const refText = `${book ? book.name : 'Libro'} ${r.chapter}`;
            return `
                <li>
                    <span class="reading-ref">${refText}</span>
                    <span class="reading-actions">
                        <button class="secondary-btn read-btn" data-book-id="${r.bookId}" data-chapter="${r.chapter}" type="button">Leer</button>
                    </span>
                </li>
            `;
        }).join('');

        // Eventos de lectura
        listEl.querySelectorAll('.read-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const b = btn.getAttribute('data-book-id');
                const c = parseInt(btn.getAttribute('data-chapter'), 10) || 1;
                this.loadChapter(b, c);
            });
        });

        // Botones de plan
        startBtn.onclick = () => {
            const now = new Date().toISOString();
            const prog = { startedAt: now, currentDay: 1, completedDays: {} };
            this.setPlanProgress(planId, prog);
            this.openPlanPanel(planId); // recargar vista
        };
        completeBtn.onclick = () => {
            const prog = this.getPlanProgress(planId);
            let d = prog.currentDay || 1;
            if (!prog.completedDays) prog.completedDays = {};
            prog.completedDays[d] = true;
            // avanzar al siguiente día si existe
            if (d < plan.days) {
                prog.currentDay = d + 1;
            } else {
                prog.currentDay = plan.days;
            }
            this.setPlanProgress(planId, prog);
            this.openPlanPanel(planId);
            // actualizar tarjetas de home
            this.renderPlansHome();
        };

        panel.classList.remove('hidden');
    }

    closePlansPanel() {
        const panel = document.getElementById('plans-panel');
        if (panel) panel.classList.add('hidden');
        this.currentPlanId = null;
    }
    
    // ===== STORAGE =====
    loadSettings() {
        try {
            const saved = localStorage.getItem('bible-app-settings');
            const defaults = {
                theme: 'light',
                fontSize: 16,
                ttsVoice: '',
                ttsRate: 1.0,
                ttsPitch: 1.0,
                ttsVolume: 1.0,
                ttsPrerecorded: false,
                ttsAudioBase: ''
            };
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                theme: 'light',
                fontSize: 16,
                ttsVoice: '',
                ttsRate: 1.0,
                ttsPitch: 1.0,
                ttsVolume: 1.0,
                ttsPrerecorded: false,
                ttsAudioBase: ''
            };
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('bible-app-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BibleApp();
});
