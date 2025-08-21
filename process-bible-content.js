const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuración actualizada para usar la carpeta 'bible'
const BIBLE_FOLDER = '/Users/lemon-miguel/Desktop/lemon/bible-app/bible';
const OUTPUT_FILE = '/Users/lemon-miguel/Desktop/lemon/bible-app/bible-content.json';

// Mapeo de nombres de archivos a IDs de libros y información
const BOOK_MAPPING = {
    '01_Genesis': { id: 'genesis', name: 'Génesis', testament: 'antiguo' },
    '02_Exodus': { id: 'exodus', name: 'Éxodo', testament: 'antiguo' },
    '03_Leviticus': { id: 'leviticus', name: 'Levítico', testament: 'antiguo' },
    '04_Numbers': { id: 'numbers', name: 'Números', testament: 'antiguo' },
    '05_Deuteronomy': { id: 'deuteronomy', name: 'Deuteronomio', testament: 'antiguo' },
    '06_Joshua': { id: 'joshua', name: 'Josué', testament: 'antiguo' },
    '07_Judges': { id: 'judges', name: 'Jueces', testament: 'antiguo' },
    '08_Ruth': { id: 'ruth', name: 'Rut', testament: 'antiguo' },
    '09_1Samuel': { id: '1samuel', name: '1 Samuel', testament: 'antiguo' },
    '10_2Samuel': { id: '2samuel', name: '2 Samuel', testament: 'antiguo' },
    '11_1Kings': { id: '1kings', name: '1 Reyes', testament: 'antiguo' },
    '12_2Kings': { id: '2kings', name: '2 Reyes', testament: 'antiguo' },
    '13_1Chronicles': { id: '1chronicles', name: '1 Crónicas', testament: 'antiguo' },
    '14_2Chronicles': { id: '2chronicles', name: '2 Crónicas', testament: 'antiguo' },
    '15_Ezra': { id: 'ezra', name: 'Esdras', testament: 'antiguo' },
    '16_Nehemiah': { id: 'nehemiah', name: 'Nehemías', testament: 'antiguo' },
    '17_Esther': { id: 'esther', name: 'Ester', testament: 'antiguo' },
    '18_Job': { id: 'job', name: 'Job', testament: 'antiguo' },
    '19_Psalms': { id: 'psalms', name: 'Salmos', testament: 'antiguo' },
    '20_Proverbs': { id: 'proverbs', name: 'Proverbios', testament: 'antiguo' },
    '21_Ecclesiastes': { id: 'ecclesiastes', name: 'Eclesiastés', testament: 'antiguo' },
    '22_SongofSongs': { id: 'songofsolomon', name: 'Cantares', testament: 'antiguo' },
    '23_Isaiah': { id: 'isaiah', name: 'Isaías', testament: 'antiguo' },
    '24_Jeremiah': { id: 'jeremiah', name: 'Jeremías', testament: 'antiguo' },
    '25_Lamentations': { id: 'lamentations', name: 'Lamentaciones', testament: 'antiguo' },
    '26_Ezekiel': { id: 'ezekiel', name: 'Ezequiel', testament: 'antiguo' },
    '27_Daniel': { id: 'daniel', name: 'Daniel', testament: 'antiguo' },
    '28_Hosea': { id: 'hosea', name: 'Oseas', testament: 'antiguo' },
    '29_Joel': { id: 'joel', name: 'Joel', testament: 'antiguo' },
    '30_Amos': { id: 'amos', name: 'Amós', testament: 'antiguo' },
    '31_Obadiah': { id: 'obadiah', name: 'Abdías', testament: 'antiguo' },
    '32_Jonah': { id: 'jonah', name: 'Jonás', testament: 'antiguo' },
    '33_Micah': { id: 'micah', name: 'Miqueas', testament: 'antiguo' },
    '34_Nahum': { id: 'nahum', name: 'Nahúm', testament: 'antiguo' },
    '35_Habakkuk': { id: 'habakkuk', name: 'Habacuc', testament: 'antiguo' },
    '36_Zephaniah': { id: 'zephaniah', name: 'Sofonías', testament: 'antiguo' },
    '37_Haggai': { id: 'haggai', name: 'Hageo', testament: 'antiguo' },
    '38_Zechariah': { id: 'zechariah', name: 'Zacarías', testament: 'antiguo' },
    '39_Malachi': { id: 'malachi', name: 'Malaquías', testament: 'antiguo' },
    // Nuevo Testamento
    '40_Matthew': { id: 'matthew', name: 'Mateo', testament: 'nuevo' },
    '41_Mark': { id: 'mark', name: 'Marcos', testament: 'nuevo' },
    '42_Luke': { id: 'luke', name: 'Lucas', testament: 'nuevo' },
    '43_John': { id: 'john', name: 'Juan', testament: 'nuevo' },
    '44_Acts': { id: 'acts', name: 'Hechos', testament: 'nuevo' },
    '45_Romans': { id: 'romans', name: 'Romanos', testament: 'nuevo' },
    '46_1Corinthians': { id: '1corinthians', name: '1 Corintios', testament: 'nuevo' },
    '47_2Corinthians': { id: '2corinthians', name: '2 Corintios', testament: 'nuevo' },
    '48_Galatians': { id: 'galatians', name: 'Gálatas', testament: 'nuevo' },
    '49_Ephesians': { id: 'ephesians', name: 'Efesios', testament: 'nuevo' },
    '50_Philippians': { id: 'philippians', name: 'Filipenses', testament: 'nuevo' },
    '51_Colossians': { id: 'colossians', name: 'Colosenses', testament: 'nuevo' },
    '52_1Thessalonians': { id: '1thessalonians', name: '1 Tesalonicenses', testament: 'nuevo' },
    '53_2Thessalonians': { id: '2thessalonians', name: '2 Tesalonicenses', testament: 'nuevo' },
    '54_1Timothy': { id: '1timothy', name: '1 Timoteo', testament: 'nuevo' },
    '55_2Timothy': { id: '2timothy', name: '2 Timoteo', testament: 'nuevo' },
    '56_Titus': { id: 'titus', name: 'Tito', testament: 'nuevo' },
    '57_Philemon': { id: 'philemon', name: 'Filemón', testament: 'nuevo' },
    '58_Hebrews': { id: 'hebrews', name: 'Hebreos', testament: 'nuevo' },
    '59_James': { id: 'james', name: 'Santiago', testament: 'nuevo' },
    '60_1Peter': { id: '1peter', name: '1 Pedro', testament: 'nuevo' },
    '61_2Peter': { id: '2peter', name: '2 Pedro', testament: 'nuevo' },
    '62_1John': { id: '1john', name: '1 Juan', testament: 'nuevo' },
    '63_2John': { id: '2john', name: '2 Juan', testament: 'nuevo' },
    '64_3John': { id: '3john', name: '3 Juan', testament: 'nuevo' },
    '65_Jude': { id: 'jude', name: 'Judas', testament: 'nuevo' },
    '66_Revelation': { id: 'revelation', name: 'Apocalipsis', testament: 'nuevo' }
};

// Función para extraer número de versículo del texto
function extractVerseNumber(verseText) {
    // El formato es "Gn 1:1 Texto del versículo" - buscar patrón de referencia bíblica
    const match = verseText.match(/^.+?(\d+):(\d+)\s+(.*)$/);
    if (match) {
        return {
            number: parseInt(match[2]),
            text: match[3].trim()
        };
    }
    return null;
}

// Función para limpiar texto HTML
function cleanText(htmlText) {
    if (!htmlText) return '';
    
    // Crear un DOM temporal para limpiar el HTML
    const tempDOM = new JSDOM(`<div>${htmlText}</div>`);
    const textContent = tempDOM.window.document.querySelector('div').textContent;
    
    // Limpiar espacios extra y entidades HTML
    return textContent
        .replace(/\s+/g, ' ')
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&lsquo;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&bull;/g, '•')
        .replace(/&rsaquo;/g, '›')
        .replace(/&laquo;/g, '‹')
        .trim();
}

// Función para procesar un archivo HTML
function processHtmlFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(content);
        const document = dom.window.document;
        
        // Extraer información del archivo
        const fileName = path.basename(filePath, '.html');
        
        // Los archivos tienen formato: 01_Genesis_1.html
        const parts = fileName.split('_');
        if (parts.length < 3) {
            console.log(`Formato de archivo no reconocido: ${fileName}`);
            return null;
        }
        
        const bookPrefix = parts[0] + '_' + parts[1];
        const chapterNumber = parseInt(parts[2]);
        
        if (isNaN(chapterNumber)) {
            console.log(`No se pudo extraer el número de capítulo de: ${fileName}`);
            return null;
        }
        
        const bookInfo = BOOK_MAPPING[bookPrefix];
        
        if (!bookInfo) {
            console.log(`No se encontró información del libro para: ${bookPrefix}`);
            return null;
        }
        
        // Extraer versículos
        const verses = [];
        const verseElements = document.querySelectorAll('p.verse');
        
        verseElements.forEach(verseEl => {
            const verseId = verseEl.getAttribute('id');
            if (!verseId) return;
            
            // Obtener el texto completo del versículo, pero limpiar las etiquetas HTML primero
            const fullText = verseEl.textContent || verseEl.innerText;
            
            // El texto viene en formato "Gn 1:1 En el principio creó Dios los cielos y la tierra."
            const verseData = extractVerseNumber(fullText);
            
            if (verseData) {
                verses.push({
                    number: verseData.number,
                    text: cleanText(verseData.text)
                });
            } else {
                // Si no se puede extraer con la regex, intentar extraer el número del id
                const idMatch = verseId.match(/-(\d+)$/);
                if (idMatch) {
                    const verseNumber = parseInt(idMatch[1]);
                    // Limpiar el texto eliminando las referencias bíblicas al inicio
                    const cleanedText = fullText.replace(/^.*?\d+:\d+\s*/, '').trim();
                    if (cleanedText) {
                        verses.push({
                            number: verseNumber,
                            text: cleanText(cleanedText)
                        });
                    }
                }
            }
        });
        
        if (verses.length === 0) {
            console.log(`No se encontraron versículos en: ${fileName}`);
            return null;
        }
        
        // Ordenar versículos por número
        verses.sort((a, b) => a.number - b.number);
        
        return {
            bookId: bookInfo.id,
            bookName: bookInfo.name,
            testament: bookInfo.testament,
            chapter: chapterNumber,
            verses: verses
        };
        
    } catch (error) {
        console.error(`Error procesando ${filePath}:`, error.message);
        return null;
    }
}

// Función principal
async function processBibleContent() {
    console.log('🚀 Iniciando procesamiento de contenido bíblico...');
    console.log(`📁 Carpeta fuente: ${BIBLE_FOLDER}`);
    console.log(`📄 Archivo destino: ${OUTPUT_FILE}`);
    
    if (!fs.existsSync(BIBLE_FOLDER)) {
        console.error(`❌ La carpeta ${BIBLE_FOLDER} no existe`);
        process.exit(1);
    }
    
    // Leer todos los archivos HTML y filtrar solo los que tienen el formato correcto
    const allFiles = fs.readdirSync(BIBLE_FOLDER).filter(file => file.endsWith('.html'));
    const files = allFiles.filter(file => {
        const parts = file.replace('.html', '').split('_');
        return parts.length >= 3 && !isNaN(parseInt(parts[2]));
    });
    
    console.log(`📚 Se encontraron ${files.length} archivos HTML válidos de ${allFiles.length} archivos totales`);
    
    const bibleData = {
        metadata: {
            version: 'Versión Recobro',
            processed_at: new Date().toISOString(),
            total_files: files.length
        },
        books: {}
    };
    
    let processedCount = 0;
    let errorCount = 0;
    
    // Procesar archivos en lotes más pequeños para conservar memoria
    const batchSize = 50;
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        for (const file of batch) {
            const filePath = path.join(BIBLE_FOLDER, file);
            const chapterData = processHtmlFile(filePath);
            
            if (chapterData) {
                const bookId = chapterData.bookId;
                
                // Inicializar libro si no existe
                if (!bibleData.books[bookId]) {
                    bibleData.books[bookId] = {
                        id: bookId,
                        name: chapterData.bookName,
                        testament: chapterData.testament,
                        chapters: {}
                    };
                }
                
                // Agregar capítulo
                bibleData.books[bookId].chapters[chapterData.chapter] = {
                    number: chapterData.chapter,
                    verses: chapterData.verses
                };
                
                processedCount++;
                
                if (processedCount % 50 === 0) {
                    console.log(`⏳ Procesados ${processedCount}/${files.length} archivos...`);
                }
            } else {
                errorCount++;
            }
        }
        
        // Forzar recolección de basura después de cada lote
        if (global.gc) {
            global.gc();
        }
    }
    
    // Escribir archivo JSON
    console.log('💾 Escribiendo archivo JSON...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bibleData, null, 2), 'utf8');
    
    // Estadísticas finales
    const fileSize = fs.statSync(OUTPUT_FILE).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    
    console.log('\n✅ ¡Procesamiento completado!');
    console.log(`📊 Estadísticas:`);
    console.log(`   • Archivos procesados exitosamente: ${processedCount}`);
    console.log(`   • Archivos con errores: ${errorCount}`);
    console.log(`   • Libros generados: ${Object.keys(bibleData.books).length}`);
    console.log(`   • Tamaño del archivo JSON: ${fileSizeMB} MB`);
    console.log(`📁 Archivo guardado en: ${OUTPUT_FILE}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    processBibleContent().catch(console.error);
}

module.exports = { processBibleContent };
