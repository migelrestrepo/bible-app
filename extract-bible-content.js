#!/usr/bin/env node

// Script para extraer todo el contenido bíblico desde los archivos HTML
// Este script debe ejecutarse con Node.js en el servidor

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuración
const BIBLE_PATH = '/Users/lemon-miguel/Desktop/lemon/bible 2';
const OUTPUT_FILE = './bible-content.json';

// Mapping de archivos a información de libros
const FILE_TO_BOOK = {
    // Antiguo Testamento
    'Genesis': { id: '01', name: 'Génesis', abbr: 'Gn', testament: 'antiguo' },
    'Exodus': { id: '02', name: 'Éxodo', abbr: 'Éx', testament: 'antiguo' },
    'Leviticus': { id: '03', name: 'Levítico', abbr: 'Lv', testament: 'antiguo' },
    'Numbers': { id: '04', name: 'Números', abbr: 'Nm', testament: 'antiguo' },
    'Deuteronomy': { id: '05', name: 'Deuteronomio', abbr: 'Dt', testament: 'antiguo' },
    'Joshua': { id: '06', name: 'Josué', abbr: 'Jos', testament: 'antiguo' },
    'Judges': { id: '07', name: 'Jueces', abbr: 'Jue', testament: 'antiguo' },
    'Ruth': { id: '08', name: 'Rut', abbr: 'Rt', testament: 'antiguo' },
    '1Samuel': { id: '09', name: '1 Samuel', abbr: '1 S', testament: 'antiguo' },
    '2Samuel': { id: '10', name: '2 Samuel', abbr: '2 S', testament: 'antiguo' },
    '1Kings': { id: '11', name: '1 Reyes', abbr: '1 R', testament: 'antiguo' },
    '2Kings': { id: '12', name: '2 Reyes', abbr: '2 R', testament: 'antiguo' },
    '1Chronicles': { id: '13', name: '1 Crónicas', abbr: '1 Cr', testament: 'antiguo' },
    '2Chronicles': { id: '14', name: '2 Crónicas', abbr: '2 Cr', testament: 'antiguo' },
    'Ezra': { id: '15', name: 'Esdras', abbr: 'Esd', testament: 'antiguo' },
    'Nehemiah': { id: '16', name: 'Nehemías', abbr: 'Neh', testament: 'antiguo' },
    'Esther': { id: '17', name: 'Ester', abbr: 'Est', testament: 'antiguo' },
    'Job': { id: '18', name: 'Job', abbr: 'Job', testament: 'antiguo' },
    'Psalms': { id: '19', name: 'Salmos', abbr: 'Sal', testament: 'antiguo' },
    'Proverbs': { id: '20', name: 'Proverbios', abbr: 'Pr', testament: 'antiguo' },
    'Ecclesiastes': { id: '21', name: 'Eclesiastés', abbr: 'Ec', testament: 'antiguo' },
    'SongofSongs': { id: '22', name: 'Cantares', abbr: 'Cnt', testament: 'antiguo' },
    'Isaiah': { id: '23', name: 'Isaías', abbr: 'Is', testament: 'antiguo' },
    'Jeremiah': { id: '24', name: 'Jeremías', abbr: 'Jer', testament: 'antiguo' },
    'Lamentations': { id: '25', name: 'Lamentaciones', abbr: 'Lm', testament: 'antiguo' },
    'Ezekiel': { id: '26', name: 'Ezequiel', abbr: 'Ez', testament: 'antiguo' },
    'Daniel': { id: '27', name: 'Daniel', abbr: 'Dn', testament: 'antiguo' },
    'Hosea': { id: '28', name: 'Oseas', abbr: 'Os', testament: 'antiguo' },
    'Joel': { id: '29', name: 'Joel', abbr: 'Jl', testament: 'antiguo' },
    'Amos': { id: '30', name: 'Amós', abbr: 'Am', testament: 'antiguo' },
    'Obadiah': { id: '31', name: 'Abdías', abbr: 'Abd', testament: 'antiguo' },
    'Jonah': { id: '32', name: 'Jonás', abbr: 'Jon', testament: 'antiguo' },
    'Micah': { id: '33', name: 'Miqueas', abbr: 'Mi', testament: 'antiguo' },
    'Nahum': { id: '34', name: 'Nahúm', abbr: 'Nah', testament: 'antiguo' },
    'Habakkuk': { id: '35', name: 'Habacuc', abbr: 'Hab', testament: 'antiguo' },
    'Zephaniah': { id: '36', name: 'Sofonías', abbr: 'Sof', testament: 'antiguo' },
    'Haggai': { id: '37', name: 'Hageo', abbr: 'Hag', testament: 'antiguo' },
    'Zechariah': { id: '38', name: 'Zacarías', abbr: 'Zac', testament: 'antiguo' },
    'Malachi': { id: '39', name: 'Malaquías', abbr: 'Mal', testament: 'antiguo' },
    
    // Nuevo Testamento
    'Matthew': { id: '40', name: 'Mateo', abbr: 'Mt', testament: 'nuevo' },
    'Mark': { id: '41', name: 'Marcos', abbr: 'Mr', testament: 'nuevo' },
    'Luke': { id: '42', name: 'Lucas', abbr: 'Lc', testament: 'nuevo' },
    'John': { id: '43', name: 'Juan', abbr: 'Jn', testament: 'nuevo' },
    'Acts': { id: '44', name: 'Hechos', abbr: 'Hch', testament: 'nuevo' },
    'Romans': { id: '45', name: 'Romanos', abbr: 'Ro', testament: 'nuevo' },
    '1Corinthians': { id: '46', name: '1 Corintios', abbr: '1 Co', testament: 'nuevo' },
    '2Corinthians': { id: '47', name: '2 Corintios', abbr: '2 Co', testament: 'nuevo' },
    'Galatians': { id: '48', name: 'Gálatas', abbr: 'Gá', testament: 'nuevo' },
    'Ephesians': { id: '49', name: 'Efesios', abbr: 'Ef', testament: 'nuevo' },
    'Philippians': { id: '50', name: 'Filipenses', abbr: 'Fil', testament: 'nuevo' },
    'Colossians': { id: '51', name: 'Colosenses', abbr: 'Col', testament: 'nuevo' },
    '1Thessalonians': { id: '52', name: '1 Tesalonicenses', abbr: '1 Ts', testament: 'nuevo' },
    '2Thessalonians': { id: '53', name: '2 Tesalonicenses', abbr: '2 Ts', testament: 'nuevo' },
    '1Timothy': { id: '54', name: '1 Timoteo', abbr: '1 Ti', testament: 'nuevo' },
    '2Timothy': { id: '55', name: '2 Timoteo', abbr: '2 Ti', testament: 'nuevo' },
    'Titus': { id: '56', name: 'Tito', abbr: 'Tit', testament: 'nuevo' },
    'Philemon': { id: '57', name: 'Filemón', abbr: 'Flm', testament: 'nuevo' },
    'Hebrews': { id: '58', name: 'Hebreos', abbr: 'He', testament: 'nuevo' },
    'James': { id: '59', name: 'Santiago', abbr: 'Jac', testament: 'nuevo' },
    '1Peter': { id: '60', name: '1 Pedro', abbr: '1 P', testament: 'nuevo' },
    '2Peter': { id: '61', name: '2 Pedro', abbr: '2 P', testament: 'nuevo' },
    '1John': { id: '62', name: '1 Juan', abbr: '1 Jn', testament: 'nuevo' },
    '2John': { id: '63', name: '2 Juan', abbr: '2 Jn', testament: 'nuevo' },
    '3John': { id: '64', name: '3 Juan', abbr: '3 Jn', testament: 'nuevo' },
    'Jude': { id: '65', name: 'Judas', abbr: 'Jud', testament: 'nuevo' },
    'Revelation': { id: '66', name: 'Apocalipsis', abbr: 'Ap', testament: 'nuevo' }
};

function parseFileName(fileName) {
    // Formato: XX_BookName_YY.html
    const match = fileName.match(/^(\d{2})_(.+)_(\d+)\.html$/);
    if (!match) return null;
    
    const [, bookNumber, bookName, chapter] = match;
    const bookInfo = FILE_TO_BOOK[bookName];
    
    if (!bookInfo) {
        console.warn(`Book not found: ${bookName}`);
        return null;
    }
    
    return {
        bookId: bookInfo.id,
        bookName: bookInfo.name,
        bookAbbr: bookInfo.abbr,
        testament: bookInfo.testament,
        chapter: parseInt(chapter)
    };
}

function extractVerses(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const verses = [];
    const verseElements = document.querySelectorAll('.verse, p[id*="-"]');
    
    verseElements.forEach((verseEl, index) => {
        let verseText = verseEl.textContent.trim();
        let verseNumber = index + 1;
        
        // Try to extract verse number from content
        // Format: "Gn 1:1 En el principio..."
        const verseMatch = verseText.match(/^[A-Za-z\s\d]+(\d+):(\d+)\s+(.+)$/);
        if (verseMatch) {
            verseNumber = parseInt(verseMatch[2]);
            verseText = verseMatch[3];
        } else {
            // Alternative formats
            const boldMatch = verseEl.querySelector('b');
            if (boldMatch) {
                const boldText = boldMatch.textContent;
                const numberMatch = boldText.match(/:(\d+)/);
                if (numberMatch) {
                    verseNumber = parseInt(numberMatch[1]);
                }
                // Remove the bold part from the text
                verseText = verseText.replace(boldText, '').trim();
            }
        }
        
        if (verseText && verseText.length > 0) {
            verses.push({
                number: verseNumber,
                text: verseText
            });
        }
    });
    
    return verses;
}

async function processBibleFiles() {
    console.log('Starting Bible content extraction...');
    
    const bibleContent = {
        metadata: {
            created: new Date().toISOString(),
            version: 'Versión Recobro',
            source: 'Living Stream Ministry'
        },
        books: {}
    };
    
    try {
        const files = fs.readdirSync(BIBLE_PATH)
            .filter(file => file.endsWith('.html'))
            .filter(file => file.match(/^\d{2}_\w+_\d+\.html$/))
            .sort();
        
        console.log(`Found ${files.length} chapter files`);
        
        let processedCount = 0;
        let errorCount = 0;
        
        for (const file of files) {
            try {
                const fileInfo = parseFileName(file);
                if (!fileInfo) {
                    console.warn(`Skipping file: ${file}`);
                    continue;
                }
                
                const filePath = path.join(BIBLE_PATH, file);
                const html = fs.readFileSync(filePath, 'utf8');
                const verses = extractVerses(html);
                
                if (!bibleContent.books[fileInfo.bookId]) {
                    bibleContent.books[fileInfo.bookId] = {
                        id: fileInfo.bookId,
                        name: fileInfo.bookName,
                        abbr: fileInfo.bookAbbr,
                        testament: fileInfo.testament,
                        chapters: {}
                    };
                }
                
                bibleContent.books[fileInfo.bookId].chapters[fileInfo.chapter] = {
                    number: fileInfo.chapter,
                    verses: verses,
                    verseCount: verses.length
                };
                
                processedCount++;
                
                if (processedCount % 50 === 0) {
                    console.log(`Processed ${processedCount} files...`);
                }
                
            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
                errorCount++;
            }
        }
        
        // Calculate chapter counts for each book
        Object.keys(bibleContent.books).forEach(bookId => {
            const book = bibleContent.books[bookId];
            book.chapterCount = Object.keys(book.chapters).length;
        });
        
        // Write the output file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bibleContent, null, 2));
        
        console.log(`\n✅ Extraction completed!`);
        console.log(`📚 Books processed: ${Object.keys(bibleContent.books).length}`);
        console.log(`📖 Chapters processed: ${processedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`💾 Output file: ${OUTPUT_FILE}`);
        
        // Display summary
        console.log('\n📊 Summary by testament:');
        const oldTestament = Object.values(bibleContent.books).filter(b => b.testament === 'antiguo');
        const newTestament = Object.values(bibleContent.books).filter(b => b.testament === 'nuevo');
        
        console.log(`   Antiguo Testamento: ${oldTestament.length} libros`);
        console.log(`   Nuevo Testamento: ${newTestament.length} libros`);
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run the extraction
processBibleFiles();
