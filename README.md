# Aplicación de Lectura de la Biblia Versión Recobro

Una aplicación web moderna y completa para leer la Biblia Versión Recobro con funcionalidades avanzadas de navegación, búsqueda y personalización.

## 🌟 Características Principales

### ✅ **Navegación Intuitiva**
- Menú lateral con acceso rápido a todos los libros bíblicos
- Navegación por Antiguo y Nuevo Testamento
- Botones de navegación anterior/siguiente entre capítulos
- Selectores de libro y capítulo en la barra superior
- Accesos directos a pasajes populares

### ✅ **Función de Búsqueda**
- Búsqueda de texto en toda la Biblia
- Resultados resaltados con referencias precisas
- Navegación directa a los versículos encontrados
- Búsqueda en tiempo real

### ✅ **Marcadores y Favoritos**
- Sistema de marcadores para guardar capítulos favoritos
- Gestión completa de marcadores (agregar/eliminar)
- Acceso rápido a pasajes guardados
- Marcadores persistentes (se guardan localmente)

### ✅ **Personalización Completa**
- **Temas**: Modo claro y oscuro
- **Fuentes**: Serif (Palatino), Sans-serif, Monospace
- **Tamaño de texto**: Pequeño, Mediano, Grande, Extra Grande
- **Espaciado**: Compacto, Normal, Relajado
- **Números de versículos**: Mostrar/ocultar
- Configuración persistente

### ✅ **Diseño Responsivo**
- Optimizado para dispositivos móviles y tablets
- Interfaz adaptativa que se ajusta a cualquier pantalla
- Navegación táctil intuitiva
- Rendimiento optimizado

### ✅ **Funcionalidades Avanzadas**
- Historial de lectura automático
- Notificaciones toast informativas
- Carga de contenido con indicadores visuales
- Interfaz moderna con animaciones suaves
- Almacenamiento local de preferencias

## 📁 Estructura del Proyecto

```
bible-app/
├── index.html          # Página principal de la aplicación
├── styles.css          # Estilos CSS responsivos y temas
├── app.js             # Lógica principal de la aplicación
├── bible-data.js      # Datos de libros y configuración
└── README.md          # Documentación
```

## 🚀 Instalación y Configuración

### Requisitos
- Los archivos HTML de la Biblia Versión Recobro (carpeta `bible 2`)
- Servidor web local (puede ser simple, como Live Server de VS Code)
- Navegador moderno con soporte para ES6+

### Pasos de Instalación

1. **Preparar los archivos**:
   ```
   /Users/lemon-miguel/Desktop/lemon/
   ├── bible-app/          # Aplicación nueva
   └── bible 2/           # Archivos HTML existentes de la Biblia
   ```

2. **Verificar la ruta**:
   - La aplicación busca los archivos HTML en `../bible 2/`
   - Si tienes la carpeta en otra ubicación, edita `APP_CONFIG.biblePath` en `bible-data.js`

3. **Iniciar un servidor web**:
   
   **Opción A - Con Python**:
   ```bash
   cd /Users/lemon-miguel/Desktop/lemon/bible-app
   python3 -m http.server 8000
   ```
   
   **Opción B - Con Node.js**:
   ```bash
   cd /Users/lemon-miguel/Desktop/lemon/bible-app
   npx serve .
   ```
   
   **Opción C - Con VS Code**:
   - Instala la extensión "Live Server"
   - Clic derecho en `index.html` > "Open with Live Server"

4. **Abrir en el navegador**:
   - Ve a `http://localhost:8000` (o el puerto que uses)

## 📱 Cómo Usar la Aplicación

### Navegación Básica
1. **Pantalla de Inicio**: Usa los botones de acceso rápido para comenzar
2. **Menú Lateral**: Toca el ícono ☰ para acceder a todos los libros
3. **Selectores**: Usa los menús desplegables para cambiar libro/capítulo
4. **Navegación**: Usa los botones ← Anterior / Siguiente → entre capítulos

### Búsqueda
1. Toca el ícono de búsqueda 🔍 en la parte superior
2. Escribe tu consulta (mínimo 3 caracteres)
3. Presiona Enter o el botón de búsqueda
4. Toca cualquier resultado para ir al versículo

### Marcadores
1. Navega al capítulo que quieres marcar
2. Abre el menú lateral
3. Toca "Agregar marcador" en la sección de Marcadores
4. Para eliminar: toca la X junto al marcador

### Personalización
1. Toca el ícono de configuración ⚙️
2. Ajusta:
   - Tamaño de fuente
   - Espaciado entre líneas  
   - Tipo de fuente
   - Visibilidad de números de versículos
3. Los cambios se aplican inmediatamente

### Temas
- Toca el ícono 🌙 para cambiar entre modo claro y oscuro
- El tema se guarda automáticamente

## 🔧 Configuración Técnica

### Modificar Rutas
Si tus archivos HTML están en otra ubicación, edita en `bible-data.js`:

```javascript
const APP_CONFIG = {
    biblePath: 'ruta/a/tus/archivos/biblia/', // Cambiar esta línea
    // ...
};
```

### Personalizar Búsqueda
Para mejorar el rendimiento de búsqueda en `app.js`:

```javascript
// Línea ~367: Cambiar los libros de muestra
const sampleBooks = ['01', '19', '40', '43']; // Agregar más libros
```

### Ajustar Configuración
En `bible-data.js` puedes modificar:
- Configuración por defecto
- Textos de la interfaz
- Límites de búsqueda
- Claves de almacenamiento local

## 🎨 Características de Diseño

- **Colores**: Esquema basado en el color primario de la Versión Recobro (#c70f15)
- **Tipografía**: Palatino para texto bíblico, fuentes del sistema para UI
- **Animaciones**: Transiciones suaves y micro-interacciones
- **Responsive**: Breakpoints en 768px y 480px para móviles
- **Accesibilidad**: Contraste adecuado y navegación por teclado

## 🐛 Solución de Problemas

### La aplicación no carga capítulos
- Verifica que la ruta `biblePath` sea correcta
- Asegúrate de usar un servidor HTTP (no `file://`)
- Revisa la consola del navegador para errores

### Los archivos no se encuentran
- Confirma que tienes la carpeta `bible 2` con los archivos HTML
- Verifica que los nombres de archivo coincidan con el formato esperado

### La búsqueda no funciona
- La búsqueda está limitada a algunos libros por rendimiento
- Puedes expandir la lista de libros en el código si lo necesitas

### Problemas de estilo
- Verifica que `styles.css` se cargue correctamente  
- Revisa que Font Awesome esté disponible online

## 🚀 Características Futuras

Esta aplicación tiene una base sólida que puede expandirse con:

- **Índice de búsqueda**: Pre-indexar todo el contenido para búsquedas más rápidas
- **Referencias cruzadas**: Enlaces entre versículos relacionados
- **Notas personales**: Sistema para agregar notas a versículos
- **Planes de lectura**: Guías estructuradas de lectura
- **Sincronización**: Backup en la nube de marcadores y configuración
- **Audio**: Integración con audio de los capítulos
- **Comparación**: Ver múltiples versiones lado a lado

## 📄 Licencia

Esta aplicación es de uso personal y educativo. El contenido bíblico pertenece a Living Stream Ministry según se indica en los archivos HTML originales.

---

**¡Disfruta tu lectura de la Palabra de Dios con esta aplicación moderna y funcional!** 📖✨
