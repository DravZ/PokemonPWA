# PokemonPWA

## Publicar en GitHub Pages

En **Settings > Pages**, publica la rama `main` desde la carpeta raíz. La aplicación quedará disponible en `https://dravz.github.io/PokemonPWA/`.

Los recursos usan rutas relativas (`./`) para funcionar bajo el subdirectorio del proyecto. Cuando cambies los archivos del app shell, incrementa `CACHE_NAME` en `serviceworker.js` para que los navegadores eliminen la caché anterior y descarguen la versión publicada.

El botón **Instalar** usa el aviso de instalación del navegador cuando está disponible. Una página web no puede desinstalar una PWA por sí misma; **Desinstalar** muestra cómo quitarla desde el menú o la configuración del dispositivo.
