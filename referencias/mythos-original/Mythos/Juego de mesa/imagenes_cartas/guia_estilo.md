# Guía de Estilo Visual y Generación de Imágenes - MitoLogos

Esta guía establece las directrices artísticas y técnicas obligatorias para generar las ilustraciones de las cartas de **MitoLogos: Duelo de Corazones**. Cualquier modelo de IA o asistente que retome este proyecto debe leer y aplicar estrictamente este documento antes de realizar cualquier generación.

---

## 📐 Especificaciones Técnicas (Medidas)

* **Orientación:** Horizontal (Apaisada / *Landscape*), ligeramente más ancha que alta.
* **Relación de Aspecto:** `5:4` — es el ratio soportado por Antigravity (Nano Banana Pro / Gemini 3 Pro Image) más cercano al 1024x824 original.
* **Resolución Recomendada:** Produce aprox. `1024x819` píxeles (ancho x alto).
* **Instrucción para el Prompt:** Seleccionar `5:4` como parámetro de aspect ratio antes de generar.

---

## 🎨 Pilares Artísticos (Estilo Yu-Gi-Oh! Clásico)

Para mantener una homogeneidad total en las 100+ cartas del juego, cada imagen debe cumplir estrictamente con los siguientes 5 pilares visuales inspirados en el estilo artístico de cartas coleccionables de finales de los 90:

1. **Líneas de Contorno Definidas (*Bold Ink Lineart*):** 
   * Los personajes, criaturas y elementos principales deben tener contornos de tinta negra limpios, gruesos y marcados (estilo anime/manga retro). Evitar ilustraciones realistas difusas o pinturas digitales sin bordes.
2. **Sombreado Duro (*Cel Shading*):** 
   * Las sombras y luces deben aplicarse en bloques o celdas de color bien definidos con bordes nítidos. Utilizar un alto contraste entre las sombras profundas (casi negras) y las luces intensas (brillos metálicos o incandescentes).
3. **Perspectiva Dinámica (Escorzo/Acción):** 
   * Los personajes no deben estar en poses estáticas o de perfil aburrido. Deben abalanzarse hacia adelante, apuntar armas hacia la cámara o realizar acciones extremas que den la sensación de que "salen" de la carta.
4. **Fondo Cósmico/Abstracto Mágico:** 
   * Evitar paisajes hiperrealistas o fondos recargados. Usar vórtices, torbellinos de energía cósmica, espirales de magia, tormentas elementales o nebulosas abstractas. El fondo debe servir para resaltar al personaje.
5. **Contraste de Temperatura de Color:** 
   * Si el personaje usa colores cálidos (fuego, luz, dorado), el fondo abstracto debe usar colores fríos (azul marino, morado oscuro, verde agua) y viceversa, garantizando que la figura principal explote hacia adelante.

---

## 📝 Plantilla de Prompt Maestro

Cada prompt de generación de imagen para las cartas debe estructurarse obligatoriamente de la siguiente manera:

```text
[Descripción del Sujeto en pose dinámica y exagerada en primer plano, ej. Un espartano apuntando su lanza], [Descripción del fondo abstracto elemental/cósmico con colores complementarios, ej. espiral de energía azul y rayos], Yu-Gi-Oh! card art style, vintage 1990s anime trading card illustration, bold clean ink outlines, vibrant cel shading, high contrast shadows, dynamic action pose, cosmic energy vortex background, dramatic lighting, highly saturated colors, masterpiece, 5:4 landscape aspect ratio, slightly wider than tall.
```

**Recuerda:** además de este texto, selecciona `5:4` como parámetro de aspect ratio en el generador antes de lanzar la imagen. El texto por sí solo no fuerza el formato.

---

## 🖼️ Imagen de Referencia Visual

* **Ruta:** `C:\Users\Usuario\Desktop\Juego e mesa\imagenes_cartas\imagen_de_referencia.png`

---

## 🔄 Flujo de Trabajo y Aprobación del Usuario

1. **Paso a Paso:** Las imágenes se diseñan y generan **una por una**. No se generarán imágenes en masa sin aprobación.
2. **Ciclo de Aprobación:**
   * El asistente propone la idea conceptual y el prompt técnico en español.
   * El usuario revisa, refina y aprueba el prompt dando luz verde.
   * El asistente genera la imagen, la muestra y la guarda físicamente en `c:\Users\Usuario\Desktop\Juego e mesa\imagenes_cartas\`.
3. **Reinicios de Chat:** Si el chat actual se vuelve lento o pesado debido al límite de contexto, se iniciará un chat nuevo. El asistente entrante leerá este archivo y el de progreso para continuar sin perder coherencia.
