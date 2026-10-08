# Instrucciones para Antigravity: arte de Mythos

Lee este documento entero antes de generar nada. Después lee `arte/README.md` (dónde y cómo se guardan las imágenes).

## 1. Qué es el proyecto

*Mythos: Guerra de Dioses* es un juego de cartas táctico con combates animados. Hay cinco guerreros, uno por civilización.

Cada guerrero se anima como una **marioneta 2D recortada**: su imagen se corta en piezas (cabeza, torso, brazos, piernas, arma, capa) y esas piezas se mueven sobre un esqueleto común. Por eso las normas técnicas de abajo no son opcionales: una imagen muy bonita que no las cumple no sirve.

## 2. Lo más importante: de perfil

El combate se ve de lado, como un juego de lucha 2D clásico. Las piezas solo encajan si el guerrero está **de perfil exacto (90 grados), mirando a la derecha**. De frente, de tres cuartos o con el pecho girado hacia la cámara no sirve.

Cómo conseguirlo:

- **Usa `arte/guias/pose-guardia.png` como imagen de referencia de pose.** Es un maniquí de madera en guardia, de perfil, con la maza delante. Copia su postura, los ángulos de brazos y piernas y la dirección. Solo la pose: no su aspecto.
- Piensa en las figuras de la cerámica griega antigua (figuras negras y rojas): siempre de perfil puro.
- Si el modelo insiste en girar el torso, añade: *"orthographic side view, as in the side view of a character turnaround sheet"*.

Comprobación de perfil:

- Se ve **un solo ojo**.
- El pecho se ve **de lado**: no se ven los dos pectorales ni la tableta entera de frente.
- Las puntas de los dos pies apuntan **a la derecha**.
- El brazo del fondo (el izquierdo) se ve por detrás del cuerpo.

## 3. Estilo: Age of Mythology + Yu-Gi-Oh clásico

- **De Age of Mythology:** mitología épica y auténtica; materiales creíbles (madera nudosa, piel de león, cuero, bronce, oro); anatomía de estatua clásica; los héroes parecen dioses entre hombres.
- **De Yu-Gi-Oh clásico (años 90):** contorno de tinta negro, limpio y marcado; sombreado duro por bloques (*cel shading*); colores saturados; dramatismo.
- **No:** estilo infantil o *chibi*, ojos grandes, aspecto de pegatina plana, realismo fotográfico.
- **Derechos:** inspírate en el estilo, pero no copies personajes, logotipos ni marcos de cartas de ninguno de los dos juegos. Nada de Arkantos.
- Para las ilustraciones de carta, sigue además `referencias/mythos-original/Mythos/Juego de mesa/imagenes_cartas/guia_estilo.md`.

## 4. Los guerreros

| Guerrero | Civilización | Rango | Elementos | Arma |
| --- | --- | --- | --- | --- |
| Hércules | Atenienses | Semidiós | Tierra y trueno | Maza de olivo |
| Rey Escorpión | Egipcios | Alto cargo | Fuego y tierra | Por decidir |
| Sabguru | India védica | Semidiós | Éter | Por decidir |
| Thor | Vikingos | Semidiós | Trueno y viento | Martillo |
| Héroe atlante | Atlantes | Semidiós | Agua | Por decidir |

Se empieza **solo por Hércules**. Los demás, cuando Adrián lo diga.

**Hércules** es el semidiós hijo de Zeus. Tiene que parecer un dios entre hombres y reconocerse al instante como el Hércules clásico de las estatuas griegas (el Hércules Farnesio). Físico colosal, hombros inmensos, cuello grueso, cara griega noble, barba espesa y rizada, mirada feroz. Lleva la piel del león de Nemea: la cabeza del león, enorme y feroz, como casco, con los colmillos sobre la frente; la piel como capa anudada al pecho con las patas delanteras, y la cola y las patas traseras colgando detrás. Maza de olivo maciza, con nudos. Sandalias atadas hasta la espinilla.

Las versiones `hercules-cuerpo-entero-v1` y `v2` **no valen**: no parecen un semidiós y no siguen bien el perfil. No las uses como referencia de aspecto.

## 5. Las imágenes de cada guerrero

| Tipo | Formato | Para qué |
| --- | --- | --- |
| `cuerpo-entero` | 3:4 vertical | La principal. De ella salen casi todas las piezas |
| `piezas-ocultas` | 3:2 horizontal | Solo lo que no se ve de perfil: brazo del fondo (brazo, antebrazo y mano por separado), torso de lado sin brazo delante, arma sola y capa sola. Exactamente esas piezas, sin repetir |
| `carta` | 5:4 horizontal | Ilustración de la carta. Aquí sí vale una pose dinámica hacia la cámara y fondo cósmico |

Normas para `cuerpo-entero` y `piezas-ocultas`:

- Cuerpo entero visible, con margen alrededor; nada cortado.
- Fondo gris claro liso. Sin escenario, sombra en el suelo, texto, marca de agua ni cuadriculado.
- Luz constante desde delante y arriba a la izquierda.
- **Sin brillos, auras ni efectos fuera del cuerpo.** Los efectos se añaden después con código.
- Manos con cinco dedos.

## 6. Cómo trabajar con Adrián

El cupo de imágenes es limitado. Por eso:

1. **Antes de generar la primera imagen, haz a Adrián estas preguntas** y espera sus respuestas:
   - ¿Qué edad aparenta Hércules? (propuesta: maduro, 35–40 años, como las estatuas clásicas)
   - ¿Con brazaletes y hebilla de oro, o solo piel de león y maza como en el mito?
   - ¿Algo de la estética de las cartas de `referencias/mythos-original/` que quiera mantener sí o sí?
2. **Una imagen cada vez.** Antes de cada una, explica a Adrián en español qué vas a pedir y espera su visto bueno.
3. **Después de generar,** revisa la imagen con la comprobación de perfil y las normas de la sección 5. Si falla, dilo con claridad y propón cómo corregir el prompt (máximo 3 intentos por imagen).
4. **Enséñale el resultado a Adrián.** Súbela a GitHub solo cuando la apruebe, siguiendo `arte/README.md`.
5. No modifiques ningún archivo del repositorio salvo para añadir imágenes aprobadas.
6. Habla siempre en español claro y explica los términos técnicos.

## 7. Prompt base de Hércules (cuerpo entero)

Adjunta `arte/guias/pose-guardia.png` como referencia de pose y ajusta el texto según las respuestas de Adrián:

```
Full-body character art of Hercules (Heracles), the legendary Greek demigod and son of Zeus, for a 2D side-view fighting game. Match exactly the pose, limb angles and facing direction of the attached pose reference (a simple wooden mannequin); use it only for the pose, not for the look. Strict orthographic side profile view (90 degrees), facing right, like a figure on ancient Greek pottery: only one eye visible, chest seen from the side, both feet pointing right and flat on the ground. He must look like a god among men, instantly recognisable as the classical Hercules of ancient Greek statues such as the Farnese Hercules. Powerful grounded battle stance: legs wide apart, front knee bent, back leg extended, weight forward, chest out, chin up. Right arm (near the viewer) gripping a massive heavy olive-wood club with thick knots, raised forward ready to strike, not overlapping his head or body. Left arm (far side) with a clenched fist, held back and down, clearly visible behind the torso. Superhuman colossal physique: immense broad shoulders, thick neck, huge chest and arms, idealised like a Greek marble statue, a mature man in his late thirties. Noble classical Greek face: strong straight nose, deep-set fierce eyes, furrowed brow, thick full dark curly beard and dense curly hair. The Nemean lion skin: a huge, majestic, ferocious golden lion head worn as a helmet, its upper fangs framing his forehead, its thick mane falling over his shoulders; the pelt worn as a cape knotted at the chest by the lion's front paws, hanging behind his back with the hind paws and tail. Wide golden bracers on both forearms, a heavy leather belt with a golden lion-head buckle, a leather strip skirt, sandals laced up the shins. Art style: epic mythological strategy-game art blended with classic 1990s anime trading-card illustration: bold clean black ink outlines, vibrant cel shading with hard-edged shadows, highly saturated colours, warm golden and bronze palette, epic, heroic and awe-inspiring, anatomically convincing, no chibi, no oversized eyes. Consistent light from the front-top-left. No glow, aura or effects outside his body. Whole body visible from head to feet with empty margin all around, nothing cropped. Plain flat light-grey background, no scenery, no ground shadow, no text, no watermark, no checkerboard pattern. High resolution.
```
