export interface ChangelogVersion {
  version: string;
  date: string;
  tag?: string;
  performance?: string;
  highlights: string[];
  changes: { type: string; text: string }[];
}

export const es = {
  layout: {
    skipLink: 'Saltar al contenido',
    metaKeywords: 'minimatch, glob, coincidencia de patrones, rápido, rendimiento, nodejs, javascript, typescript, picomatch, coincidencia de archivos, comodín, regex, paquete npm',
    jsonLdDescription: 'Alternativa directa a minimatch. Coincidencia de patrones glob hasta 36x más rápida para Node.js. Cero vulnerabilidades, 100% compatible con la API.',
    jsonLdReleaseNotes: 'Correcciones de exactitud de la caché, alineación de hasMagic()/makeRe() con minimatch, compatibilidad 1:1 de escape/unescape. 402 tests. Publicado mediante npm trusted publishing (OIDC) con procedencia (provenance).',
    jsonLdKeywords: ['glob', 'minimatch', 'coincidencia de patrones', 'rápido', 'rendimiento', 'nodejs', 'javascript', 'typescript'],
    ogImageAlt: 'minimatch-fast - coincidencia de patrones glob hasta 36x más rápida',
  },
  page: {
    title: 'minimatch-fast | Coincidencia de patrones glob hasta 36x más rápida para Node.js',
    description: 'Alternativa directa a minimatch. Coincidencia de patrones glob hasta 36x más rápida gracias a picomatch. Cero vulnerabilidades (a salvo de CVE-2022-3517). 100% compatible con la API. Soporte de TypeScript. Usado por desarrolladores de todo el mundo para builds más rápidos.',
  },
  header: {
    nav: [
      { href: '#features', label: 'características' },
      { href: '#benchmarks', label: 'benchmarks' },
      { href: '#install', label: 'instalación' },
      { href: '#api', label: 'api' },
      { href: '#changelog', label: 'changelog' },
    ],
    githubAria: 'Repositorio de GitHub',
    themeAria: 'Alternar modo oscuro',
    menuAria: 'Alternar menú',
    langToggleAria: 'Versión en inglés',
  },
  hero: {
    badge: 'v0.4.0 disponible en npm',
    subtitle1: 'Alternativa directa a minimatch.',
    subtitle2: 'Hasta 36x más rápido. Cero vulnerabilidades.',
    copyAria: 'Copiar comando de instalación',
    cta: 'Empezar',
    chips: ['motor picomatch', '100% compatible con la API', 'TypeScript', 'ESM + CJS', '402 tests'],
    license: 'Licencia MIT',
  },
  features: {
    heading: '¿Por qué minimatch-fast?',
    sub: 'La mejora de rendimiento y seguridad que tu coincidencia de globs necesita',
    items: [
      {
        title: 'Ultrarrápido',
        description: 'hasta 36x más rápido que minimatch. Impulsado por el motor picomatch con caché LRU y rutas rápidas optimizadas para los patrones más comunes.'
      },
      {
        title: 'Seguro',
        description: 'No vulnerable a CVE-2022-3517 (ReDoS). Protección integrada contra el backtracking catastrófico y los ataques DoS.'
      },
      {
        title: 'Estable',
        description: 'Nunca se congela con patrones como {1..1000}. Los límites en la expansión de llaves evitan bloqueos y problemas de memoria.'
      },
      {
        title: '100% compatible',
        description: 'Alternativa directa con una API idéntica. 402 tests garantizan plena compatibilidad con el comportamiento de minimatch v10.x.'
      },
      {
        title: 'TypeScript listo',
        description: 'Soporte completo de TypeScript con definiciones de tipos incluidas. No hace falta instalar paquetes @types aparte.'
      },
      {
        title: 'Soporte dual de módulos',
        description: 'Funciona tanto con ESM como con CommonJS. Usa import o require(): ambos sistemas de módulos funcionan sin configuración.'
      }
    ],
  },
  benchmark: {
    heading: 'Benchmarks de rendimiento',
    sub: 'Todos los escenarios superan a minimatch v10.x — 3 ejecuciones consecutivas estables, mediana de 21 rondas, corpus de 1000 rutas',
    baseline: 'Referencia',
    cols: { pattern: 'Patrón', scenario: 'Escenario', speedup: 'Aceleración' },
    warm: {
      heading: 'Globbing en el mundo real (caché LRU caliente)',
      note: 'La carga de trabajo real de glob: las herramientas de build y los linters comparan un puñado de patrones contra miles de archivos. minimatch recompila en cada llamada; minimatch-fast cachea los patrones compilados. Esta asimetría es una característica del producto, reconocida abiertamente.',
      earlyRejection: 'Los números grandes vienen del early rejection: los patrones sin / se rechazan sin compilar para rutas con directorios, porque un segmento no puede cruzar /.',
      rows: [
        { scenario: '{src,lib}/**/*.{js,ts,tsx}', minimatch: '88.0ms', fast: '2.4ms', speedup: '36x más rápido', highlight: true },
        { scenario: '@(foo|bar|baz).js', minimatch: '—', fast: '—', speedup: '~190x más rápido', highlight: true },
        { scenario: '*.js', minimatch: '—', fast: '—', speedup: '~64x más rápido', highlight: true },
        { scenario: '**/*.js', minimatch: '—', fast: '—', speedup: '4.3x más rápido', highlight: true },
      ],
    },
    engine: {
      heading: 'Motor contra motor (precompilado, sin caché)',
      note: 'La comparación más honesta: el mismo patrón precompilado en ambos lados, sin intervención de caché. El motor gana entre 2.4x y 12x en cada forma de patrón medida.',
      rows: [
        { scenario: 'file[0-9].js', speedup: '12x más rápido', highlight: true },
        { scenario: '@(foo|bar|baz).js', speedup: '12x más rápido', highlight: true },
        { scenario: '*.js / !*.test.js / ???.js', speedup: '8-9x más rápido', highlight: true },
        { scenario: '{src,lib}/**/*.{js,ts,tsx}', speedup: '3.4x más rápido', highlight: true },
        { scenario: '**/*.js / **/**/**/*.js', speedup: '2.7x más rápido', highlight: true },
        { scenario: '{src,lib}/*.js', speedup: '2.4x más rápido', highlight: true },
      ],
    },
    compileCold: {
      heading: 'Compilación y llamadas en frío',
      note: 'El peor caso de uso: llamadas puntuales en las que cada patrón se compila. Incluso ahí, siempre por encima de la paridad.',
      rows: [
        { scenario: 'Compilar {src,lib}/**/*.{js,ts,tsx}', speedup: '5.7x más rápido', highlight: true },
        { scenario: 'Compilar @(foo|bar|baz).js (extglob)', speedup: '3x más rápido', highlight: true },
        { scenario: 'Compilar *.js / **/*.js', speedup: '1.6-2.3x más rápido', highlight: false },
        { scenario: 'En frío @(foo|bar|baz).js (extglob)', speedup: '~105x más rápido', highlight: true },
        { scenario: 'En frío *.js', speedup: '~20x más rápido', highlight: true },
        { scenario: 'En frío llaves complejas', speedup: '~4x más rápido', highlight: true },
        { scenario: 'En frío **/*.js', speedup: '1.1-1.9x más rápido', highlight: false },
      ],
    },
    security: {
      heading: 'Comparación de seguridad',
      featureCol: 'Característica',
      rows: [
        { feature: 'CVE-2022-3517 (ReDoS)', minimatch: 'Vulnerable', fast: 'No afectado', danger: true },
        { feature: 'Patrón {1..1000}', minimatch: 'Se congela', fast: 'Instantáneo', danger: true },
        { feature: 'Límite de expansión de llaves', minimatch: 'Ninguno', fast: '10.000 máx', danger: false },
      ],
    },
    note: 'Node.js 22, Linux. Metodología: A/B/B/A intercalado, 5 rondas de calentamiento, mediana de 21 rondas, corpus determinista de 1000 rutas, 3 ejecuciones consecutivas estables. Reprodúcelo con',
  },
  install: {
    heading: 'Instalación',
    sub: 'Dos formas de migrar desde minimatch',
    option1Badge: 'opción 1',
    option1Title: 'Actualizar los imports',
    option1Intro: 'Instala el paquete y actualiza tus sentencias de importación:',
    option1Then: 'Después, actualiza tus imports:',
    option2Badge: 'opción 2',
    option2Title: 'npm aliasing',
    option2Intro: 'Sin tocar ni una línea de código. Usa el aliasing de paquetes de npm:',
    option2DetailPre: 'Esto instala minimatch-fast como',
    option2DetailPost: ', de modo que todos tus imports existentes siguen funcionando sin ningún cambio.',
    option2NoteStrong: 'Nota:',
    option2Note: 'Esto también actualiza minimatch para todas tus dependencias que lo usan.',
  },
  usage: {
    heading: 'Ejemplos de uso',
    sub: 'Patrones comunes y casos de uso',
    examples: [
      { title: 'Coincidencia básica' },
      { title: 'Coincidencia de arrays' },
      { title: 'Función de filtro' },
      { title: 'Clase Minimatch' },
      { title: 'Expansión de llaves' },
      { title: 'Escape / Unescape' },
    ],
  },
  patterns: {
    heading: 'Referencia de patrones glob',
    sub: 'Guía completa de la sintaxis de patrones glob',
    cols: { pattern: 'Patrón', description: 'Descripción', example: 'Ejemplo', class: 'Clase', matches: 'Coincidencias' },
    posixHeading: 'Clases de caracteres POSIX',
    posixSub: 'Soporte completo de las expresiones de corchetes POSIX',
    unicodeHeading: 'Soporte Unicode',
    unicodeSub: 'Soporte completo de Unicode y emoji en patrones y nombres de archivo',
    patterns: [
      { pattern: '*', description: 'Coincide con cualquier carácter excepto los separadores de ruta', example: '*.js coincide con foo.js, bar.js' },
      { pattern: '**', description: 'Coincide con cualquier carácter incluidos los separadores de ruta (globstar)', example: '**/*.js coincide con src/foo.js, a/b/c.js' },
      { pattern: '?', description: 'Coincide con exactamente un carácter (excepto el separador de ruta)', example: '?.js coincide con a.js, b.js' },
      { pattern: '[abc]', description: 'Coincide con cualquier carácter del conjunto', example: '[abc].js coincide con a.js, b.js, c.js' },
      { pattern: '[a-z]', description: 'Coincide con cualquier carácter del rango', example: '[a-z].js coincide con a.js hasta z.js' },
      { pattern: '[!abc]', description: 'Coincide con cualquier carácter que NO esté en el conjunto', example: '[!a].js coincide con b.js, c.js (no con a.js)' },
      { pattern: '{a,b,c}', description: 'Coincide con cualquiera de los patrones separados por comas', example: '{foo,bar}.js coincide con foo.js, bar.js' },
      { pattern: '{1..5}', description: 'Coincide con un rango numérico', example: 'file{1..3}.js coincide con file1.js, file2.js, file3.js' },
      { pattern: '{a..c}', description: 'Coincide con un rango alfabético', example: '{a..c}.js coincide con a.js, b.js, c.js' },
      { pattern: '!pattern', description: 'Niega la coincidencia', example: '!*.min.js excluye los archivos minificados' },
      { pattern: '?(a|b)', description: 'Coincide con cero o uno de los patrones', example: '?(foo).js coincide con .js, foo.js' },
      { pattern: '*(a|b)', description: 'Coincide con cero o más de los patrones', example: '*(a|b).js coincide con .js, a.js, ab.js, aab.js' },
      { pattern: '+(a|b)', description: 'Coincide con uno o más de los patrones', example: '+(a|b).js coincide con a.js, ab.js, aab.js' },
      { pattern: '@(a|b)', description: 'Coincide con exactamente uno de los patrones', example: '@(foo|bar).js coincide con foo.js, bar.js' },
    ],
    posixClasses: [
      { pattern: '[[:alpha:]]', description: 'Caracteres alfabéticos (a-z, A-Z)', example: '[[:alpha:]]*.txt coincide con file.txt' },
      { pattern: '[[:digit:]]', description: 'Dígitos numéricos (0-9)', example: 'file[[:digit:]].js coincide con file1.js' },
      { pattern: '[[:alnum:]]', description: 'Alfanuméricos (letras y dígitos)', example: '[[:alnum:]] coincide con a, Z, 5' },
      { pattern: '[[:space:]]', description: 'Caracteres de espacio en blanco', example: '[[:space:]] coincide con espacio, tabulador' },
      { pattern: '[[:upper:]]', description: 'Letras mayúsculas', example: '[[:upper:]] coincide con A pero no con a' },
      { pattern: '[[:lower:]]', description: 'Letras minúsculas', example: '[[:lower:]] coincide con a pero no con A' },
      { pattern: '[[:xdigit:]]', description: 'Dígitos hexadecimales (0-9, a-f, A-F)', example: '[[:xdigit:]] coincide con 0, a, F' },
    ],
    unicodeExamples: [
      { pattern: '*.txt', description: 'Soporte Unicode completo en nombres de archivo', example: 'café.txt, 文件.txt, ファイル.txt' },
      { pattern: '文件夹/*.js', description: 'Unicode en los patrones', example: 'coincide con 文件夹/test.js' },
      { pattern: '{🎉,🎊}.txt', description: 'Soporte de emoji', example: '🎉.txt, 🎊.txt' },
    ],
  },
  api: {
    heading: 'Referencia de la API',
    sub: 'Documentación completa de la API',
    params: 'Parámetros',
    returns: 'Devuelve',
    example: 'Ejemplo',
    methods: [
      {
        name: 'minimatch(path, pattern, [options])',
        description: 'Comprueba una ruta contra un patrón. Devuelve true si la ruta coincide.',
        params: [
          { name: 'path', type: 'string', desc: 'La ruta a comprobar' },
          { name: 'pattern', type: 'string', desc: 'El patrón glob' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Configuración opcional' },
        ],
        returns: 'boolean',
      },
      {
        name: 'minimatch.match(list, pattern, [options])',
        description: 'Filtra un array de rutas y devuelve las que coinciden con el patrón.',
        params: [
          { name: 'list', type: 'string[]', desc: 'Array de rutas a filtrar' },
          { name: 'pattern', type: 'string', desc: 'El patrón glob' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Configuración opcional' },
        ],
        returns: 'string[]',
      },
      {
        name: 'minimatch.filter(pattern, [options])',
        description: 'Crea una función de filtro para usar con Array.filter().',
        params: [
          { name: 'pattern', type: 'string', desc: 'El patrón glob' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Configuración opcional' },
        ],
        returns: '(path: string) => boolean',
      },
      {
        name: 'minimatch.makeRe(pattern, [options])',
        description: 'Crea una expresión regular a partir del patrón.',
        params: [
          { name: 'pattern', type: 'string', desc: 'El patrón glob' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Configuración opcional' },
        ],
        returns: 'RegExp | false',
      },
      {
        name: 'minimatch.braceExpand(pattern, [options])',
        description: 'Expande los patrones con llaves en un array de patrones.',
        params: [
          { name: 'pattern', type: 'string', desc: 'Patrón con llaves' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Configuración opcional' },
        ],
        returns: 'string[]',
      },
      {
        name: 'minimatch.escape(str, [options])',
        description: 'Escapa los caracteres glob especiales de una cadena.',
        params: [
          { name: 'str', type: 'string', desc: 'Cadena a escapar' },
          { name: 'options', type: '{ windowsPathsNoEscape?: boolean }', desc: 'Configuración opcional' },
        ],
        returns: 'string',
      },
      {
        name: 'minimatch.unescape(str, [options])',
        description: 'Elimina los caracteres de escape de una cadena.',
        params: [
          { name: 'str', type: 'string', desc: 'Cadena a desescapar' },
          { name: 'options', type: '{ windowsPathsNoEscape?: boolean }', desc: 'Configuración opcional' },
        ],
        returns: 'string',
      },
      {
        name: 'minimatch.defaults(options)',
        description: 'Crea una nueva función minimatch con opciones por defecto.',
        params: [
          { name: 'options', type: 'MinimatchOptions', desc: 'Opciones por defecto a aplicar' },
        ],
        returns: 'typeof minimatch',
      },
      {
        name: 'new Minimatch(pattern, [options])',
        description: 'Crea un matcher reutilizable para un patrón. Más eficiente al comparar el mismo patrón contra varias rutas.',
        params: [
          { name: 'pattern', type: 'string', desc: 'El patrón glob' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Configuración opcional' },
        ],
        returns: 'Minimatch',
      },
    ],
  },
  options: {
    heading: 'Opciones',
    sub: 'Opciones de configuración para afinar la coincidencia de patrones',
    cols: { option: 'Opción', type: 'Tipo', default: 'Por defecto', description: 'Descripción' },
    coreHeading: 'Opciones principales',
    coreBadge: 'minimatch compatible',
    extendedHeading: 'Opciones extendidas',
    extendedBadge: 'nuevo en v0.3.0',
    callbackHeading: 'Opciones de callback',
    callbackBadge: 'nuevo en v0.3.0',
    examplesHeading: 'Ejemplos',
    core: [
      { name: 'dot', type: 'boolean', default: 'false', description: 'Coincide con dotfiles (archivos que empiezan por .). Por defecto, * y ? no coinciden con puntos iniciales.' },
      { name: 'nocase', type: 'boolean', default: 'false', description: 'Realiza la coincidencia sin distinguir mayúsculas de minúsculas.' },
      { name: 'nonegate', type: 'boolean', default: 'false', description: 'Suprime el comportamiento de negación con ! inicial.' },
      { name: 'nobrace', type: 'boolean', default: 'false', description: 'No expande patrones con llaves como {a,b,c}.' },
      { name: 'noext', type: 'boolean', default: 'false', description: 'Desactiva los patrones extglob como ?(a|b), *(a|b), etc.' },
      { name: 'noglobstar', type: 'boolean', default: 'false', description: 'Desactiva la coincidencia de ** a través de los límites de directorio.' },
      { name: 'nocomment', type: 'boolean', default: 'false', description: 'Suprime el tratamiento de # como carácter de comentario.' },
      { name: 'matchBase', type: 'boolean', default: 'false', description: 'Si el patrón no tiene barras, coincide con el basename de la ruta. foo coincide con bar/baz/foo.' },
      { name: 'partial', type: 'boolean', default: 'false', description: 'Coincidencia parcial: el patrón puede coincidir con una porción de la ruta.' },
      { name: 'flipNegate', type: 'boolean', default: 'false', description: 'Devuelve true para patrones negados que no coinciden.' },
      { name: 'preserveMultipleSlashes', type: 'boolean', default: 'false', description: 'No colapsa las barras múltiples (a//b se queda como a//b).' },
      { name: 'optimizationLevel', type: 'number', default: '1', description: 'Nivel de optimización de la regex: 0 = ninguna, 1 = segura (por defecto), 2 = agresiva.' },
      { name: 'platform', type: 'string', default: 'process.platform', description: 'Plataforma para el manejo de rutas: "win32", "darwin", "linux", etc.' },
      { name: 'windowsPathsNoEscape', type: 'boolean', default: 'false', description: 'En Windows, trata \\ como separador de ruta, no como carácter de escape.' },
      { name: 'allowWindowsEscape', type: 'boolean', default: 'platform !== "win32"', description: 'Permite \\ como carácter de escape en Windows.' },
      { name: 'nocaseMagicOnly', type: 'boolean', default: 'false', description: 'Aplica nocase solo a las porciones mágicas del patrón.' },
      { name: 'magicalBraces', type: 'boolean', default: 'false', description: 'Trata la expansión de llaves como mágica (afecta a hasMagic()).' },
      { name: 'debug', type: 'boolean', default: 'false', description: 'Activa la salida de depuración.' },
    ],
    extended: [
      { name: 'ignore', type: 'string | string[]', default: 'undefined', description: 'Patrones a excluir de la coincidencia.' },
      { name: 'failglob', type: 'boolean', default: 'false', description: 'Lanza un error si no se encuentran coincidencias (tiene prioridad sobre nonull).' },
      { name: 'maxLength', type: 'number', default: '65536', description: 'Longitud máxima del patrón. Previene ataques ReDoS.' },
      { name: 'expandRange', type: 'function', default: 'undefined', description: 'Función personalizada para expandir rangos en patrones con llaves.' },
      { name: 'bash', type: 'boolean', default: 'false', description: 'Sigue las reglas de coincidencia de bash de forma más estricta.' },
      { name: 'contains', type: 'boolean', default: 'false', description: 'Coincide con el patrón en cualquier parte de la cadena (no solo coincidencia completa).' },
      { name: 'format', type: 'function', default: 'undefined', description: 'Función personalizada para formatear cadenas antes de la coincidencia.' },
      { name: 'flags', type: 'string', default: 'undefined', description: 'Flags de regex a usar en la regex generada.' },
      { name: 'strictBrackets', type: 'boolean', default: 'false', description: 'Lanza un error si hay corchetes, llaves o paréntesis desbalanceados.' },
      { name: 'literalBrackets', type: 'boolean', default: 'false', description: 'Escapa los corchetes para coincidir con [ y ] literales.' },
      { name: 'keepQuotes', type: 'boolean', default: 'false', description: 'Conserva las comillas en la regex generada.' },
      { name: 'unescape', type: 'boolean', default: 'false', description: 'Elimina las barras invertidas que preceden a los caracteres escapados.' },
    ],
    callbacks: [
      { name: 'onMatch', type: 'function', default: 'undefined', description: 'Se llama cuando un patrón coincide. Recibe el objeto de resultado de la coincidencia.' },
      { name: 'onIgnore', type: 'function', default: 'undefined', description: 'Se llama cuando un patrón se ignora. Recibe el objeto de resultado de la coincidencia.' },
      { name: 'onResult', type: 'function', default: 'undefined', description: 'Se llama para todos los resultados. Recibe el objeto de resultado de la coincidencia.' },
    ],
  },
  security: {
    heading: 'Seguridad',
    sub: 'Protección integrada contra las vulnerabilidades más comunes',
    cve: {
      title: 'Protección contra CVE-2022-3517',
      p1: 'El minimatch original es vulnerable a Regular Expression Denial of Service (ReDoS) a través de CVE-2022-3517. Los patrones maliciosos pueden provocar backtracking catastrófico y congelar tu aplicación.',
      p2: 'minimatch-fast usa picomatch internamente, que está diseñado específicamente para evitar los problemas de backtracking y no es vulnerable a este CVE.',
    },
    brace: {
      title: 'Límites en la expansión de llaves',
      p1Pre: 'La expansión de llaves sin restricciones puede explotarse para crear ataques de denegación de servicio. Un patrón como',
      p1Post: 'generaría un millón de patrones, consumiendo toda la memoria disponible.',
      p2: 'minimatch-fast limita la expansión de llaves a 10.000 patrones como máximo y la expansión de rangos a 1.000 elementos, previniendo ataques DoS.',
    },
    input: {
      title: 'Validación de entradas',
      p1: 'El minimatch original acepta entradas inválidas que pueden causar comportamientos inesperados o errores en tiempo de ejecución en lo profundo de la pila de llamadas.',
      p2: 'minimatch-fast valida por adelantado los argumentos de ruta y patrón, lanzando TypeErrors descriptivos de inmediato. La longitud del patrón también está limitada para prevenir DoS.',
    },
    summary: {
      title: 'Características de seguridad',
      items: [
        'No afectado por CVE-2022-3517 (ReDoS)',
        'Máximo de 10.000 patrones desde la expansión de llaves',
        'Máximo de 1.000 elementos en la expansión de rangos ({1..N})',
        'Sin backtracking catastrófico en las regex',
        'Fallback elegante para patrones demasiado grandes',
        'Validación de tipos de ruta y patrón',
        'Límites de longitud del patrón (máx. 65.536 caracteres)',
      ],
    },
  },
  typescript: {
    heading: 'Soporte de TypeScript',
    sub: 'Definiciones de tipos completas incluidas',
    introPre: 'minimatch-fast incluye definiciones completas de TypeScript. Todos los tipos se exportan y están listos para usar sin instalar paquetes',
    introPost: 'aparte.',
    exportedHeading: 'Tipos exportados',
    types: [
      { name: 'minimatch', desc: 'La función principal' },
      { name: 'Minimatch', desc: 'La clase Minimatch' },
      { name: 'MinimatchOptions', desc: 'Interfaz de opciones de configuración' },
      { name: 'MMRegExp', desc: 'RegExp extendida con información de índice' },
      { name: 'ParseReturn', desc: 'Tipo para los segmentos del patrón parseado' },
      { name: 'AST', desc: 'Tipo para el árbol de sintaxis abstracta' },
    ],
  },
  tests: {
    heading: 'Testing y compatibilidad',
    sub: 'Una suite de tests exhaustiva garantiza la fiabilidad',
    categories: [
      { name: 'Tests unitarios', count: 42, description: 'Tests de la funcionalidad principal' },
      { name: 'Tests de compatibilidad', count: 196, description: 'Paridad de comportamiento con minimatch' },
      { name: 'Tests de casos límite', count: 64, description: 'Rutas de Windows, opciones extendidas, dotfiles' },
      { name: 'Tests de seguridad', count: 23, description: 'Tests de CVE-2022-3517 y validación de entradas' },
      { name: 'Tests de verificación', count: 53, description: 'Clases POSIX, Unicode, casos límite de regex' },
      { name: 'Tests de regresión', count: 24, description: 'Exactitud de la caché, alineación de hasMagic, makeRe y escape' },
    ],
    totalBadge: '402 tests en total',
    totalText: 'Cada release se verifica contra la suite de tests del minimatch original más tests adicionales para casos límite, rutas de Windows y vulnerabilidades de seguridad.',
    runHeading: 'Ejecutar los tests',
    reportHeading: 'Reportar problemas',
    reportIntro: '¿Encontraste un problema de compatibilidad? Abre un issue en GitHub con:',
    reportItems: [
      'El patrón y la ruta que producen resultados distintos',
      'Comportamiento esperado (lo que devuelve minimatch)',
      'Comportamiento real (lo que devuelve minimatch-fast)',
      'Cualquier opción relevante usada',
    ],
    reportLink: 'Abrir un issue en GitHub',
  },
  changelog: {
    heading: 'Changelog',
    sub: 'Evolución del proyecto e historial de versiones',
    typeLabels: {
      added: 'añadido',
      changed: 'cambiado',
      security: 'seguridad',
      fixed: 'corregido',
      removed: 'eliminado',
    },
    versions: ([
      {
        version: '0.4.0',
        date: '20/07/2026',
        tag: 'Actual',
        highlights: [
          'Correcciones de exactitud de la caché',
          'Paridad de hasMagic() y makeRe() con minimatch',
          'Alineación 1:1 de escape/unescape',
          '402 tests'
        ],
        changes: [
          { type: 'fixed', text: 'La clave de caché ahora incluye todas las opciones que afectan a la coincidencia (contains, bash, flags, ignore, maxLength, strictBrackets, literalBrackets, keepQuotes, unescape, magicalBraces)' },
          { type: 'fixed', text: 'hasMagic() devuelve false para patrones literales, igual que minimatch' },
          { type: 'fixed', text: 'makeRe() respeta los patrones negados (!*.js), igual que minimatch' },
          { type: 'fixed', text: 'La opción nonull ya no se filtra entre llamadas a través de la caché de patrones' },
          { type: 'changed', text: 'escape()/unescape() alineados 1:1 con minimatch: las llaves solo se escapan con magicalBraces: true' },
          { type: 'changed', text: 'Las rutas rápidas recurren al motor completo cuando hay opciones que no pueden respetar' },
          { type: 'security', text: 'maxLength ahora también se aplica antes de la coincidencia por ruta rápida' },
          { type: 'security', text: 'Releases publicadas mediante npm trusted publishing (OIDC) con procedencia Sigstore' },
          { type: 'added', text: '24 nuevos tests de regresión (402 en total)' },
        ]
      },
      {
        version: '0.3.0',
        date: '01/02/2026',
        highlights: [
          '15 nuevas opciones de picomatch',
          'Soporte de callbacks',
          'Mejores mensajes de error',
          '378 tests'
        ],
        changes: [
          { type: 'added', text: 'Opciones extendidas de picomatch: ignore, failglob, maxLength, expandRange, bash, contains, format, flags' },
          { type: 'added', text: 'Opciones de corchetes: strictBrackets, literalBrackets, keepQuotes, unescape' },
          { type: 'added', text: 'Opciones de callback: onMatch, onIgnore, onResult' },
          { type: 'changed', text: 'Mensajes de error de maxLength mejorados con la longitud del patrón y detalles del límite' },
          { type: 'changed', text: 'failglob ahora muestra cuántas rutas se buscaron' },
          { type: 'security', text: 'maxLength ahora valida que sea un número finito positivo' },
          { type: 'added', text: '22 nuevos tests para las opciones extendidas' },
        ]
      },
      {
        version: '0.2.3',
        date: '01/02/2026',
        highlights: [
          'Validación de la entrada path',
          'Mejoras de limpieza del código',
          'Eliminación de código muerto',
          '356 tests'
        ],
        changes: [
          { type: 'security', text: 'Añadida validación de tipos para el parámetro path en minimatch()' },
          { type: 'changed', text: 'Mensaje de error genérico sustituido por un mensaje descriptivo' },
          { type: 'removed', text: 'Eliminado console.warn del código de la librería' },
          { type: 'removed', text: 'Eliminado código muerto (hasMagicChars, escapeRegex, hasBraces)' },
          { type: 'changed', text: 'Operadores consistentes (?? en lugar de || para los valores por defecto)' },
          { type: 'added', text: 'Tests para la validación de path (5 casos)' },
        ]
      },
      {
        version: '0.2.2',
        date: '31/01/2026',
        highlights: [
          'Auditoría de seguridad',
          'Actualización de dependencias',
          'Revisión de limpieza del código'
        ],
        changes: [
          { type: 'security', text: 'Auditoría de seguridad completada' },
          { type: 'changed', text: 'Dependencias actualizadas' },
          { type: 'changed', text: 'Mejoras de limpieza del código' },
        ]
      },
      {
        version: '0.2.1',
        date: '19/01/2026',
        highlights: [
          'Validación de longitud del patrón',
          'Landing page',
          'Benchmarks'
        ],
        changes: [
          { type: 'security', text: 'Añadida validación de longitud del patrón (máx. 65.536 caracteres)' },
          { type: 'added', text: 'Landing page con documentación' },
          { type: 'added', text: 'Suite de benchmarks comparando con el minimatch original' },
        ]
      },
      {
        version: '0.2.0',
        date: '29/12/2025',
        highlights: [
          'Caché LRU de patrones (500 entradas)',
          'Rutas rápidas para patrones simples',
          'Caché de expansión de llaves (200 entradas)',
          'Funciones de utilidad de caché'
        ],
        performance: '9.4x más rápido de media',
        changes: [
          { type: 'added', text: 'Caché de patrones para instancias compiladas de Minimatch' },
          { type: 'added', text: 'Rutas rápidas para los patrones *, *.js, ???, .*' },
          { type: 'added', text: 'Caché de expansión de llaves' },
          { type: 'added', text: 'Utilidades clearCache() y getCacheSize()' },
          { type: 'changed', text: 'Flags de regex precalculados en la clase Minimatch' },
          { type: 'changed', text: 'Extracción de basename optimizada' },
          { type: 'changed', text: 'Normalización de rutas de Windows más inteligente' },
        ]
      },
      {
        version: '0.1.0',
        date: '10/11/2025',
        tag: 'Release inicial',
        highlights: [
          '100% compatible con la API de minimatch',
          'Impulsado por el motor picomatch',
          'Soporte completo de TypeScript',
          'Exports duales ESM/CJS'
        ],
        performance: '7-29x más rápido',
        changes: [
          { type: 'added', text: 'Release inicial de minimatch-fast' },
          { type: 'added', text: '100% de compatibilidad con la API de minimatch v10.x' },
          { type: 'added', text: 'Soporte completo de TypeScript con definiciones de tipos' },
          { type: 'added', text: 'Exports duales de módulos ESM y CommonJS' },
          { type: 'added', text: 'Suite de tests exhaustiva (302 tests)' },
          { type: 'added', text: 'Pipeline de CI/CD con GitHub Actions' },
          { type: 'security', text: 'No afectado por CVE-2022-3517 (ReDoS)' },
          { type: 'security', text: 'Límites en la expansión de llaves para prevenir DoS' },
        ]
      }
    ] as ChangelogVersion[]),
  },
  footer: {
    tagline1: 'Alternativa directa a minimatch.',
    tagline2: 'Hasta 36x más rápido. Cero vulnerabilidades.',
    linksHeading: 'Enlaces',
    creditsHeading: 'Créditos',
    mitLabel: 'Licencia MIT',
    bottom: 'Licencia MIT. Construido con',
  },
  codeBlock: {
    copyAria: 'Copiar código',
    copy: 'copiar',
    copied: '¡copiado!',
  },
};

export type Translations = typeof es;
