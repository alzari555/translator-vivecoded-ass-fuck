# Traductor Material AI

Una interfaz web de traducción avanzada, diseñada específicamente para funcionar con modelos de Lenguaje Locales (LLMs) usando **KoboldCPP**, **LM Studio** u **Ollama** a través de una API compatible con OpenAI.

La aplicación es **100% Client-Side** (Single Page Application). No requiere base de datos ni entorno Node.js, por lo que puedes abrirla haciendo doble clic en el archivo `index.html` o alojarla gratuitamente en GitHub Pages.

## ✨ Características Principales

* 🔌 **Soporte Local y Nube:** Conéctate a cualquier backend compatible con OpenAI (por defecto configurado para el puerto de KoboldCPP `http://localhost:11434/v1`). Extrae dinámicamente los modelos instalados en tu servidor local.
* 📄 **Lector de Documentos Integrado:** Arrastra y suelta archivos para extraer su texto puro. Soporte nativo desde el navegador para `.txt`, `.pdf`, `.docx`, `.doc` y `.rtf` utilizando `pdf.js` y `mammoth.js`.
* ✂️ **Motor de Troceado (Chunking):** Permite traducir libros o textos enormes sin desbordar el contexto de tu LLM local. La aplicación recorta matemáticamente la entrada a bloques de 512 tokens y ajusta dinámicamente la ventana de salida (max_tokens).
* 🔗 **Coherencia por Superposición (Overlap):** El motor inyecta un porcentaje personalizable de la traducción del bloque anterior como "contexto" en el siguiente bloque, garantizando que el modelo mantenga el sentido y el estilo gramatical entre párrafos divididos.
* 🗣️ **Modos de Instrucción (Presets):** Configura los envíos en modo *Chat Completions* automático o fuerza formatos en crudo (*Completions*) ideales para Kobold Lite (como `ChatML`, `Llama 3`, `Alpaca`, `Vicuna` o `Gemma`).
* 🕵️ **Filtro de Razonamiento en Tiempo Real:** Ideal para modelos como DeepSeek-R1 o Gemma. Cuenta con un filtro que oculta la cadena de pensamiento (las etiquetas `<think>...</think>`) mientras se streamea, dejándote ver únicamente el texto final traducido.
* 🌍 **Idioma de Salida Personalizable:** Especifica en texto libre a qué idioma quieres traducir (inglés, francés, japonés, español argentino, etc.) y se inyectará automáticamente al sistema del modelo.
* 🎨 **Material Design 3:** Interfaz moderna, amigable, que no bloquea la lectura, con soporte reactivo tanto para PC como para dispositivos móviles.

## 🚀 Cómo Empezar (Uso Local)

1. Enciende tu backend de IA local (KoboldCPP, LM Studio, etc.) asegurándote de que tenga habilitado el servidor API y **CORS**.
2. Clona este repositorio o descarga los archivos.
3. Haz doble clic en el archivo `index.html` para abrirlo en tu navegador favorito.
4. Toca el botón del engranaje (Ajustes) arriba a la derecha.
5. Presiona **Conectar y Cargar Modelos**.
6. Selecciona tu modelo y pega tu texto o arrastra un documento. ¡Disfruta traduciendo!

## 🌐 Cómo Alojar en GitHub Pages

Dado que la aplicación consiste únicamente en archivos HTML, CSS y JS planos, alojarla no tiene costo:

1. Sube los archivos (`index.html`, `styles.css` y `app.js`) a un repositorio público en GitHub.
2. Ve a la pestaña **Settings** (Ajustes) de tu repositorio.
3. Haz clic en la sección **Pages** en la barra lateral izquierda.
4. En la opción *Source*, elige `Deploy from a branch`, selecciona la rama `main` y haz clic en guardar.
5. Tras un par de minutos, podrás acceder a tu Traductor AI desde la web a través de tu enlace de GitHub.

## 🛠️ Tecnologías Utilizadas

* **Estructura:** HTML5, CSS3, Vanilla JavaScript.
* **Estilos:** Material Design 3 (con variables CSS).
* **Dependencias Externas (CDN):**
  * `pdf.js` (Mozilla) para procesado local de PDFs.
  * `mammoth.js` para extracción de documentos Word (.docx).
  * Google Fonts & Material Symbols.

---

*Nota: Asegúrate de que el backend local o externo que utilices acepte cabeceras CORS provenientes de tu archivo local (`file://`) o de tu dominio en GitHub Pages.*
