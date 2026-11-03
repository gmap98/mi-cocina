# Mi Cocina

Aplicación web estática y progresiva (PWA) para guardar una despensa, elegir una región culinaria, preparar solicitudes para ChatGPT y conservar recetas.

## Costos
- No usa OpenAI API ni otra API de generación.
- No requiere claves ni suscripciones adicionales.
- ChatGPT se abre por separado y utiliza la cuenta con la que ya iniciás sesión.
- GitHub Pages ofrece alojamiento estático gratuito para repositorios públicos.

## Uso local
Abrí `index.html` en un navegador. La selección de ingredientes y las recetas se guardan en el almacenamiento local del navegador.

Para probar la instalación PWA y el funcionamiento offline, serví la carpeta mediante un servidor local o publicala en GitHub Pages. Los service workers no funcionan al abrir el archivo directamente con `file://`.

## Publicar gratis con GitHub Pages
1. Creá un repositorio público llamado `mi-cocina`.
2. Subí todos los archivos de esta carpeta manteniendo su estructura.
3. En GitHub, abrí **Settings → Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**.
5. Seleccioná la rama `main` y la carpeta `/ (root)`, y guardá.
6. GitHub te dará una dirección similar a `https://TU-USUARIO.github.io/mi-cocina/`.

## Instalar en Android
1. Abrí la dirección publicada en Chrome.
2. Abrí el menú de Chrome y elegí **Instalar aplicación** o **Agregar a pantalla principal**.
3. Confirmá. Aparecerá el ícono de Mi Cocina.

## Flujo de recetas
1. Marcá ingredientes y elegí una región.
2. Tocá **Preparar mis 3 recetas**. La solicitud se copia al portapapeles y se abre ChatGPT.
3. Pegá y enviá el texto en ChatGPT. Elegí una de las tres opciones en esa conversación.
4. Cuando recibas la receta completa, volvé a Mi Cocina, abrí **Guardar una receta de ChatGPT**, y pegá el texto.

## Privacidad y límites
- Los datos se guardan localmente en el navegador/dispositivo; no hay cuenta ni sincronización entre dispositivos.
- Borrar los datos del navegador puede borrar la despensa y las recetas.
- La solicitud se copia al portapapeles y se abre ChatGPT. Por limitaciones de integración, la página no puede leer automáticamente las respuestas de ChatGPT ni enviarlas a la conversación.
- Las fuentes tipográficas se cargan desde Google Fonts cuando hay conexión; la aplicación funciona también con fuentes alternativas.
