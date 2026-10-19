# PokemonPWA

## Publicar en GitHub Pages

En **Settings > Pages**, publica la rama `main` desde la carpeta raíz. La aplicación quedará disponible en `https://dravz.github.io/PokemonPWA/`.

Los recursos usan rutas relativas (`./`) para funcionar bajo el subdirectorio del proyecto. Cuando cambies los archivos del app shell, incrementa `CACHE_NAME` en `serviceworker.js` para que los navegadores eliminen la caché anterior y descarguen la versión publicada.
