const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuración de rutas
const BIBLE_DIR = './bible';
const OUTPUT_FILE = './bible-content.json';

// Mapeo de nombres de libros en español
const BOOK_NAMES = {
    '01_Genesis': 'Génesis',
    '02_Exodus': 'Éxodo',
    '03_Leviticus': 'Levítico',
    '04_Numbers': 'Números',
    '05_Deuteronomy': 'Deuteronomio',
    '06_Joshua': 'Josué',
    '07_Judges': 'Jueces',
    '08_Ruth': 'Rut',
    '09_1Samuel': '1 Samuel',
    '10_2Samuel': '2 Samuel',
    '11_1Kings': '1 Reyes',
    '12_2Kings': '2 Reyes',
    '13_1Chronicles': '1 Crónicas',
    '14_2Chronicles': '2 Crónicas',
    '15_Ezra': 'Esdras',
    '16_Nehemiah': 'Nehemías',
    '17_Esther': 'Ester',
    '18_Job': 'Job',
    '19_Psalms': 'Salmos',
    '20_Proverbs': 'Proverbios',
    '21_Ecclesiastes': 'Eclesiastés',
    '22_Song_of_Solomon': 'Cantares',
    '23_Isaiah': 'Isaías',
    '24_Jeremiah': 'Jeremías',
    '25_Lamentations': 'Lamentaciones',
    '26_Ezekiel': 'Ezequiel',
    '27_Daniel': 'Daniel',
    '28_Hosea': 'Oseas',
    '29_Joel': 'Joel',
    '30_Amos': 'Amós',
    '31_Obadiah': 'Abdías',
    '32_Jonah': 'Jonás',
    '33_Micah': 'Miqueas',
    '34_Nahum': 'Nahúm',
    '35_Habakkuk': 'Habacuc',
    '36_Zephaniah': 'Sofonías',
    '37_Haggai': 'Hageo',
    '38_Zechariah': 'Zacarías',
    '39_Malachi': 'Malaquías',
    '40_Matthew': 'Mateo',
    '41_Mark': 'Marcos',
    '42_Luke': 'Lucas',
    '43_John': 'Juan',
    '44_Acts': 'Hechos',
    '45_Romans': 'Romanos',
    '46_1Corinthians': '1 Corintios',
    '47_2Corinthians': '2 Corintios',
    '48_Galatians': 'Gálatas',
    '49_Ephesians': 'Efesios',
    '50_Philippians': 'Filipenses',
    '51_Colossians': 'Colosenses',
    '52_1Thessalonians': '1 Tesalonicenses',
    '53_2Thessalonians': '2 Tesalonicenses',
    '54_1Timothy': '1 Timoteo',
    '55_2Timothy': '2 Timoteo',
    '56_Titus': 'Tito',
    '57_Philemon': 'Filemón',
    '58_Hebrews': 'Hebreos',
    '59_James': 'Santiago',
    '60_1Peter': '1 Pedro',
    '61_2Peter': '2 Pedro',
    '62_1John': '1 Juan',
    '63_2John': '2 Juan',
    '64_3John': '3 Juan',
    '65_Jude': 'Judas',
    '66_Revelation': 'Apocalipsis'
};

// Función para extraer información del archivo
function parseFileName(fileName) {
    const match = fileName.match(/^(\d{2}_[^_]+(?:_\d)?[^_]*)_(\d+)\.html$/);
    if (!match) return null;
    
    return {
        bookKey: match[1],
        chapter: parseInt(match[2])
    };
}

// Función para extraer versículos de un archivo HTML
function extractVerses(htmlContent) {
    try {
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;
        const verseParagraphs = document.querySelectorAll('p.verse');
        
        const verses = [];
        
        verseParagraphs.forEach(p => {
            // Extraer el ID del párrafo que contiene el número del versículo
            const id = p.id;
            if (!id) return;
            
            // El ID tiene formato "Gen1-1", "Gen1-2", etc.
            const idMatch = id.match(/-(\d+)$/);
            if (!idMatch) return;
            
            const verseNumber = parseInt(idMatch[1]);
            
            // Obtener el texto completo del párrafo
            let fullText = p.textContent.trim();
            if (!fullText) return;
            
            // Remover la referencia bíblica del inicio (ej: "Gn 1:1")
            // Buscar el patrón de referencia bíblica y removerlo
            const refMatch = fullText.match(/^[^\s]+\s+\d+:\d+\s*(.*)$/);
            if (refMatch) {
                fullText = refMatch[1].trim();
            }
            
            if (fullText) {
                verses.push({
                    number: verseNumber,
                    text: fullText
                });
            }
        });
        
        return verses.sort((a, b) => a.number - b.number);
    } catch (error) {
        console.error('Error procesando HTML:', error.message);
        return [];
    }
}

// Función principal de procesamiento streaming
async function processBibleContent() {
    console.log('🚀 Iniciando procesamiento streaming de contenido bíblico...');
    console.log(`📁 Carpeta fuente: ${path.resolve(BIBLE_DIR)}`);
    console.log(`📄 Archivo destino: ${path.resolve(OUTPUT_FILE)}`);
    
    try {
        // Leer archivos del directorio
        const files = fs.readdirSync(BIBLE_DIR);
        const htmlFiles = files.filter(file => file.endsWith('.html'));
        console.log(`📚 Se encontraron ${htmlFiles.length} archivos HTML de ${files.length} archivos totales`);
        
        // Organizar archivos por libro
        const bookStructure = {};
        let processedFiles = 0;
        let validFiles = 0;
        
        // Primera pasada: organizar archivos
        for (const file of htmlFiles) {
            const fileInfo = parseFileName(file);
            if (!fileInfo) continue;
            
            const bookName = BOOK_NAMES[fileInfo.bookKey];
            if (!bookName) continue;
            
            if (!bookStructure[bookName]) {
                bookStructure[bookName] = {};
            }
            
            bookStructure[bookName][fileInfo.chapter] = file;
            validFiles++;
        }
        
        console.log(`✅ ${validFiles} archivos válidos organizados`);
        
        // Crear el archivo JSON de manera streaming
        const writeStream = fs.createWriteStream(OUTPUT_FILE);
        writeStream.write('{\n  "books": {\n');
        
        const bookKeys = Object.keys(bookStructure);
        let bookCount = 0;
        
        for (const bookName of bookKeys) {
            const chapters = bookStructure[bookName];
            const chapterNumbers = Object.keys(chapters).map(Number).sort((a, b) => a - b);
            
            writeStream.write(`    "${bookName}": {\n`);
            
            let chapterCount = 0;
            for (const chapterNumber of chapterNumbers) {
                const fileName = chapters[chapterNumber];
                const filePath = path.join(BIBLE_DIR, fileName);
                
                try {
                    const htmlContent = fs.readFileSync(filePath, 'utf8');
                    const verses = extractVerses(htmlContent);
                    
                    writeStream.write(`      "${chapterNumber}": {\n`);
                    writeStream.write(`        "verses": [\n`);
                    
                    verses.forEach((verse, index) => {
                        const isLast = index === verses.length - 1;
                        writeStream.write(`          ${JSON.stringify(verse)}${isLast ? '' : ','}\n`);
                    });
                    
                    writeStream.write(`        ]\n`);
                    writeStream.write(`      }${chapterCount < chapterNumbers.length - 1 ? ',' : ''}\n`);
                    
                    processedFiles++;
                    if (processedFiles % 50 === 0) {
                        console.log(`⏳ Procesados ${processedFiles}/${validFiles} archivos...`);
                        // Forzar liberación de memoria
                        if (global.gc) global.gc();
                    }
                    
                } catch (error) {
                    console.error(`❌ Error procesando archivo ${fileName}:`, error.message);
                }
                
                chapterCount++;
            }
            
            writeStream.write(`    }${bookCount < bookKeys.length - 1 ? ',' : ''}\n`);
            bookCount++;
        }
        
        writeStream.write('  }\n}');
        writeStream.end();
        
        // Esperar a que termine la escritura
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        
        console.log('✅ Procesamiento completado exitosamente!');
        console.log(`📊 Total de archivos procesados: ${processedFiles}`);
        console.log(`📚 Total de libros: ${bookKeys.length}`);
        console.log(`💾 Archivo generado: ${OUTPUT_FILE}`);
        
        // Verificar tamaño del archivo
        const stats = fs.statSync(OUTPUT_FILE);
        console.log(`📏 Tamaño del archivo: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        
    } catch (error) {
        console.error('❌ Error durante el procesamiento:', error);
        throw error;
    }
}

// Ejecutar el script
if (require.main === module) {
    processBibleContent().catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}

module.exports = { processBibleContent };
