// Datos de la Biblia Versión Recobro
const BIBLE_DATA = {
    books: {
        // Antiguo Testamento
        "01": { name: "Génesis", abbr: "Gn", chapters: 50, testament: "antiguo" },
        "02": { name: "Éxodo", abbr: "Éx", chapters: 40, testament: "antiguo" },
        "03": { name: "Levítico", abbr: "Lv", chapters: 27, testament: "antiguo" },
        "04": { name: "Números", abbr: "Nm", chapters: 36, testament: "antiguo" },
        "05": { name: "Deuteronomio", abbr: "Dt", chapters: 34, testament: "antiguo" },
        "06": { name: "Josué", abbr: "Jos", chapters: 24, testament: "antiguo" },
        "07": { name: "Jueces", abbr: "Jue", chapters: 21, testament: "antiguo" },
        "08": { name: "Rut", abbr: "Rt", chapters: 4, testament: "antiguo" },
        "09": { name: "1 Samuel", abbr: "1 S", chapters: 31, testament: "antiguo" },
        "10": { name: "2 Samuel", abbr: "2 S", chapters: 24, testament: "antiguo" },
        "11": { name: "1 Reyes", abbr: "1 R", chapters: 22, testament: "antiguo" },
        "12": { name: "2 Reyes", abbr: "2 R", chapters: 25, testament: "antiguo" },
        "13": { name: "1 Crónicas", abbr: "1 Cr", chapters: 29, testament: "antiguo" },
        "14": { name: "2 Crónicas", abbr: "2 Cr", chapters: 36, testament: "antiguo" },
        "15": { name: "Esdras", abbr: "Esd", chapters: 10, testament: "antiguo" },
        "16": { name: "Nehemías", abbr: "Neh", chapters: 13, testament: "antiguo" },
        "17": { name: "Ester", abbr: "Est", chapters: 10, testament: "antiguo" },
        "18": { name: "Job", abbr: "Job", chapters: 42, testament: "antiguo" },
        "19": { name: "Salmos", abbr: "Sal", chapters: 150, testament: "antiguo" },
        "20": { name: "Proverbios", abbr: "Pr", chapters: 31, testament: "antiguo" },
        "21": { name: "Eclesiastés", abbr: "Ec", chapters: 12, testament: "antiguo" },
        "22": { name: "Cantares", abbr: "Cnt", chapters: 8, testament: "antiguo" },
        "23": { name: "Isaías", abbr: "Is", chapters: 66, testament: "antiguo" },
        "24": { name: "Jeremías", abbr: "Jer", chapters: 52, testament: "antiguo" },
        "25": { name: "Lamentaciones", abbr: "Lm", chapters: 5, testament: "antiguo" },
        "26": { name: "Ezequiel", abbr: "Ez", chapters: 48, testament: "antiguo" },
        "27": { name: "Daniel", abbr: "Dn", chapters: 12, testament: "antiguo" },
        "28": { name: "Oseas", abbr: "Os", chapters: 14, testament: "antiguo" },
        "29": { name: "Joel", abbr: "Jl", chapters: 3, testament: "antiguo" },
        "30": { name: "Amós", abbr: "Am", chapters: 9, testament: "antiguo" },
        "31": { name: "Abdías", abbr: "Abd", chapters: 1, testament: "antiguo" },
        "32": { name: "Jonás", abbr: "Jon", chapters: 4, testament: "antiguo" },
        "33": { name: "Miqueas", abbr: "Mi", chapters: 7, testament: "antiguo" },
        "34": { name: "Nahúm", abbr: "Nah", chapters: 3, testament: "antiguo" },
        "35": { name: "Habacuc", abbr: "Hab", chapters: 3, testament: "antiguo" },
        "36": { name: "Sofonías", abbr: "Sof", chapters: 3, testament: "antiguo" },
        "37": { name: "Hageo", abbr: "Hag", chapters: 2, testament: "antiguo" },
        "38": { name: "Zacarías", abbr: "Zac", chapters: 14, testament: "antiguo" },
        "39": { name: "Malaquías", abbr: "Mal", chapters: 4, testament: "antiguo" },
        
        // Nuevo Testamento
        "40": { name: "Mateo", abbr: "Mt", chapters: 28, testament: "nuevo" },
        "41": { name: "Marcos", abbr: "Mr", chapters: 16, testament: "nuevo" },
        "42": { name: "Lucas", abbr: "Lc", chapters: 24, testament: "nuevo" },
        "43": { name: "Juan", abbr: "Jn", chapters: 21, testament: "nuevo" },
        "44": { name: "Hechos", abbr: "Hch", chapters: 28, testament: "nuevo" },
        "45": { name: "Romanos", abbr: "Ro", chapters: 16, testament: "nuevo" },
        "46": { name: "1 Corintios", abbr: "1 Co", chapters: 16, testament: "nuevo" },
        "47": { name: "2 Corintios", abbr: "2 Co", chapters: 13, testament: "nuevo" },
        "48": { name: "Gálatas", abbr: "Gá", chapters: 6, testament: "nuevo" },
        "49": { name: "Efesios", abbr: "Ef", chapters: 6, testament: "nuevo" },
        "50": { name: "Filipenses", abbr: "Fil", chapters: 4, testament: "nuevo" },
        "51": { name: "Colosenses", abbr: "Col", chapters: 4, testament: "nuevo" },
        "52": { name: "1 Tesalonicenses", abbr: "1 Ts", chapters: 5, testament: "nuevo" },
        "53": { name: "2 Tesalonicenses", abbr: "2 Ts", chapters: 3, testament: "nuevo" },
        "54": { name: "1 Timoteo", abbr: "1 Ti", chapters: 6, testament: "nuevo" },
        "55": { name: "2 Timoteo", abbr: "2 Ti", chapters: 4, testament: "nuevo" },
        "56": { name: "Tito", abbr: "Tit", chapters: 3, testament: "nuevo" },
        "57": { name: "Filemón", abbr: "Flm", chapters: 1, testament: "nuevo" },
        "58": { name: "Hebreos", abbr: "He", chapters: 13, testament: "nuevo" },
        "59": { name: "Santiago", abbr: "Jac", chapters: 5, testament: "nuevo" },
        "60": { name: "1 Pedro", abbr: "1 P", chapters: 5, testament: "nuevo" },
        "61": { name: "2 Pedro", abbr: "2 P", chapters: 3, testament: "nuevo" },
        "62": { name: "1 Juan", abbr: "1 Jn", chapters: 5, testament: "nuevo" },
        "63": { name: "2 Juan", abbr: "2 Jn", chapters: 1, testament: "nuevo" },
        "64": { name: "3 Juan", abbr: "3 Jn", chapters: 1, testament: "nuevo" },
        "65": { name: "Judas", abbr: "Jud", chapters: 1, testament: "nuevo" },
        "66": { name: "Apocalipsis", abbr: "Ap", chapters: 22, testament: "nuevo" }
    },
    
    // Mapeo de nombres de archivo según la estructura existente
    getFileName: function(bookNumber, chapter) {
        const bookNames = {
            "01": "Genesis",
            "02": "Exodus", 
            "03": "Leviticus",
            "04": "Numbers",
            "05": "Deuteronomy",
            "06": "Joshua",
            "07": "Judges",
            "08": "Ruth",
            "09": "1Samuel",
            "10": "2Samuel",
            "11": "1Kings",
            "12": "2Kings",
            "13": "1Chronicles",
            "14": "2Chronicles",
            "15": "Ezra",
            "16": "Nehemiah",
            "17": "Esther",
            "18": "Job",
            "19": "Psalms",
            "20": "Proverbs",
            "21": "Ecclesiastes",
            "22": "SongofSongs",
            "23": "Isaiah",
            "24": "Jeremiah",
            "25": "Lamentations",
            "26": "Ezekiel",
            "27": "Daniel",
            "28": "Hosea",
            "29": "Joel",
            "30": "Amos",
            "31": "Obadiah",
            "32": "Jonah",
            "33": "Micah",
            "34": "Nahum",
            "35": "Habakkuk",
            "36": "Zephaniah",
            "37": "Haggai",
            "38": "Zechariah",
            "39": "Malachi",
            "40": "Matthew",
            "41": "Mark",
            "42": "Luke",
            "43": "John",
            "44": "Acts",
            "45": "Romans",
            "46": "1Corinthians",
            "47": "2Corinthians",
            "48": "Galatians",
            "49": "Ephesians",
            "50": "Philippians",
            "51": "Colossians",
            "52": "1Thessalonians",
            "53": "2Thessalonians",
            "54": "1Timothy",
            "55": "2Timothy",
            "56": "Titus",
            "57": "Philemon",
            "58": "Hebrews",
            "59": "James",
            "60": "1Peter",
            "61": "2Peter",
            "62": "1John",
            "63": "2John",
            "64": "3John",
            "65": "Jude",
            "66": "Revelation"
        };
        
        return `${bookNumber}_${bookNames[bookNumber]}_${chapter}.html`;
    },
    
    // Obtener libros por testamento
    getBooksByTestament: function(testament) {
        return Object.keys(this.books).filter(bookId => 
            this.books[bookId].testament === testament
        ).map(bookId => ({
            id: bookId,
            ...this.books[bookId]
        }));
    },
    
    // Buscar libro por nombre o abreviación
    findBook: function(query) {
        query = query.toLowerCase();
        return Object.keys(this.books).find(bookId => {
            const book = this.books[bookId];
            return book.name.toLowerCase().includes(query) || 
                   book.abbr.toLowerCase().includes(query);
        });
    },
    
    // Obtener navegación anterior/siguiente
    getNavigation: function(currentBookId, currentChapter) {
        const bookIds = Object.keys(this.books);
        const currentIndex = bookIds.indexOf(currentBookId);
        const book = this.books[currentBookId];
        
        let prev = null;
        let next = null;
        
        // Capítulo anterior
        if (currentChapter > 1) {
            prev = {
                bookId: currentBookId,
                chapter: currentChapter - 1,
                bookName: book.name
            };
        } else if (currentIndex > 0) {
            const prevBookId = bookIds[currentIndex - 1];
            const prevBook = this.books[prevBookId];
            prev = {
                bookId: prevBookId,
                chapter: prevBook.chapters,
                bookName: prevBook.name
            };
        }
        
        // Siguiente capítulo
        if (currentChapter < book.chapters) {
            next = {
                bookId: currentBookId,
                chapter: currentChapter + 1,
                bookName: book.name
            };
        } else if (currentIndex < bookIds.length - 1) {
            const nextBookId = bookIds[currentIndex + 1];
            const nextBook = this.books[nextBookId];
            next = {
                bookId: nextBookId,
                chapter: 1,
                bookName: nextBook.name
            };
        }
        
        return { prev, next };
    }
};

// Configuración de la aplicación
const APP_CONFIG = {
    // Ruta del archivo JSON con el contenido de la Biblia
    bibleJsonPath: 'bible-content.json',
    
    // Configuración de búsqueda
    search: {
        minQueryLength: 3,
        maxResults: 50,
        highlightLength: 100
    },
    
    // Configuración de localStorage
    storage: {
        settingsKey: 'bible-app-settings',
        bookmarksKey: 'bible-app-bookmarks',
        historyKey: 'bible-app-history'
    },
    
    // Configuración por defecto
    defaults: {
        fontSize: 'medium',
        lineHeight: 'normal',
        fontFamily: 'serif',
        theme: 'light',
        showVerseNumbers: true
    }
};

// Textos de la aplicación
const APP_TEXTS = {
    loading: 'Cargando...',
    searchPlaceholder: 'Buscar en la Biblia...',
    noResults: 'No se encontraron resultados',
    bookmarkAdded: 'Marcador agregado',
    bookmarkRemoved: 'Marcador eliminado',
    error: 'Error al cargar el contenido',
    networkError: 'Error de conexión. Verifica tu conexión a internet.'
};
