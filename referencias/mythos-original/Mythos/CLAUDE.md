# Mythos (Mitólogos)

## Contexto del proyecto
Aplicación web sobre mitología. El propietario del proyecto (Adrii) no es técnico:
explica siempre en español, con lenguaje sencillo, y aclara los términos técnicos
entre paréntesis. Antes de hacer cambios grandes, resume el plan en pocas líneas.

## Estructura
- `index.html` — página principal
- `css/estilo.css` — estilos
- `js/app.js` — lógica

## IMPORTANTE: marca de versión
`index.html` carga el CSS y el JS con `?v=N`. **Al terminar cualquier cambio en
`css/estilo.css` o `js/app.js`, subir ese número en los dos sitios de `index.html`.**
Sin eso Adrii sigue viendo la copia antigua y parece que el arreglo no funciona.

## Flujo de trabajo con Claude Design
Este proyecto se trabaja en conjunto con Claude Design:
- El diseño visual (pantallas, componentes) se crea en Claude Design.
- Los diseños llegan aquí mediante "Handoff to Claude Code": intégralos
  respetando la estructura existente.
- Usa `/design-sync` para mantener el sistema de diseño sincronizado.

## Convenciones
- HTML, CSS y JS sencillos, sin frameworks salvo que se decida lo contrario.
- Comentarios en el código en español.
- Solo escritorio. Se diseña sobre un lienzo ancho fijo; no hay soporte de móvil.
- Los 4 corazones no se colocan: orden fijo de izquierda a derecha e igual en ambos
  lados (💙 defensa, 💚 magia, ❤️ ataque, 💛 sacrificio). Ver `ORDEN_CORAZONES` en `js/app.js`.
  El azul se llama Defensa de cara al jugador, pero su clave interna sigue siendo
  `evasion` (la usan `ZEUS.bonoTipo` y `colocarAumento`).
- Cada corazón nace con una CARTA DE PROTECCIÓN fija de 58×68 (lo que mide una casilla)
  apoyada encima: ⚔️ Espada de Guerra, 🛡️ Escudo, ✦ Estrella Arcana y ⚱️ Urna de Cenizas,
  dibujadas en SVG en `ART_PROT`. Es un escudo de UN SOLO USO: el primer ataque la rompe
  y salva el corazón. Los aumentos se apilan sobre ella.
- Las ilustraciones de carta las aporta Adrii, a 300×485 px (proporción áurea).
