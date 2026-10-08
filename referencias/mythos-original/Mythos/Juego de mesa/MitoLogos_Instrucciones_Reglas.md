# MitoLogos: Duelo de Corazones — Documento de reglas e instrucciones de implementación

Implementa las siguientes reglas y sistemas en el juego. Este documento es la fuente de verdad: si algo del código actual contradice lo que hay aquí, prevalece este documento.

---

## 1. Victoria y corazones

- Cada jugador tiene **4 corazones**: 2 por cada frente del tablero. Perderlos todos = derrota.
- Cada corazón tiene un **color y una función** que habilita un tipo de magia o mecánica. Si el corazón es destruido, el jugador **pierde para siempre el acceso a esa función**:
  - 🔴 **Rojo — Magia de ataque**: habilita las cartas mágicas que aumentan el ataque.
  - 🔵 **Azul claro — Magia de evasión**: habilita las cartas mágicas que aumentan la evasión.
  - 🟣 **Morado/rosa — Elemento**: habilita las cartas mágicas elementales. Estas NO tienen restricción de civilización: las puede usar todo el mundo.
  - 🟢 **Verde — Sacrificio**: puede **gastarse voluntariamente** como sustituto de un sacrificio al invocar (ver sección 4). Al gastarse **se destruye y cuenta como corazón perdido**.

### Ataque a un corazón
Cuando un personaje llega al final del recorrido y ataca un corazón: **mueren ambos**. El corazón se destruye y el personaje atacante también (sacrifica su alma para matarlo). No hay tirada de dado.

---

## 2. Tablero

- Dos **frentes independientes** (puente de losas 7×2 por frente). Lo que ocurre en un frente NO afecta al otro: los buffs, magias y efectos solo se aplican a las cartas de ese frente.
- La **única forma de cruzar de un frente a otro** son los portales (sección 8).
- **Movimiento**: los personajes avanzan **1 losa por turno**.

---

## 3. Estructura del turno

1. **Robar 1 carta** del mazo (siempre lo primero, obligatorio).
2. Después, **acciones en orden libre**: mover, invocar y atacar pueden combinarse en cualquier orden (ej. mover → invocar → atacar con otro personaje que ya estaba en el campo).

Restricciones:
- Un personaje **recién invocado no puede atacar** ese turno.
- Usar una carta mágica **no gasta la acción** del personaje seleccionado: ese personaje puede además moverse y atacar con normalidad.

---

## 4. Invocación por sacrificio

- No existe un recurso acumulable. El coste de invocación son **almas**: número de personajes propios en el campo que hay que sacrificar.
- Costes posibles: **0** (invocación libre), **1**, **2** o **3** almas.
- El **corazón verde de sacrificio** puede gastarse en lugar de sacrificar un personaje: sustituye a un personaje completo o cuenta como una de las 2-3 almas necesarias. Recordatorio: al gastarse se destruye y cuenta como corazón perdido.

---

## 5. Combate (dado de 12 caras)

El atacante declara un ataque contra un personaje defensor y se tira **1d12** contra la **evasión del defensor**:

- **Resultado ≤ evasión** → el golpe FALLA. No pasa nada (el defensor esquiva; el resultado exacto también cuenta como esquiva).
- **Resultado > evasión** → golpe EFECTIVO. Se comparan los niveles de ataque:
  - Ataque mayor → gana; el de menor ataque se destruye.
  - Ataques **iguales** → **mueren ambos**.

**EXCEPCIÓN (crítico):** si los ataques son IGUALES y el dado saca **EXACTAMENTE** la evasión del defensor, el ataque del atacante **se duplica** y **solo muere el defensor**. Nota importante para la implementación: esta es la ÚNICA situación en la que el resultado exacto NO cuenta como esquiva. Ejemplo: ambos con ataque 3, defensor con evasión 4 → dado 1-3: esquiva; dado exactamente 4: crítico, muere solo el defensor; dado 5-12: impacto normal, mueren ambos.

---

## 6. Cartas mágicas

### Dos clases
1. **De civilización**: solo puede seleccionarlas/usarlas un personaje de esa misma civilización (mágica griega → personaje griego).
2. **Comunes**: las puede usar cualquier personaje.

### Requisitos para usar una mágica
- El personaje seleccionado debe tener **nivel de magia** (el medallón en números romanos) **≥ coste de magia de la carta**. Si hay dos griegos en el frente y solo uno tiene magia suficiente, solo ese puede ser el seleccionado.
- El **corazón correspondiente debe seguir vivo**: rojo para las de ataque, azul claro para las de evasión, morado/rosa para las elementales. Corazón destruido = ese tipo de magia queda inutilizable.
- Además, en las de civilización, la coincidencia de civilización descrita arriba.

### Duración de los efectos
- **Buffs de ataque**: duran **solo 1 turno**.
- **Buffs de evasión**: son **permanentes** mientras viva el personaje seleccionado. Si ese personaje muere, el buff desaparece.
- Las mágicas de civilización pueden ser **de área**: ej. "+2 evasión a los griegos" afecta a TODOS los personajes griegos de ese frente (nunca del otro frente).

### Modelo de datos (fuente única de verdad)
Cada carta mágica lleva un objeto que gobierna a la vez el diseño del cinturón Y la mecánica. No dupliques esta información:

```js
efecto: {
  tipo: 'buff',
  stat: 'ataque' | 'evasion' | 'elemento',
  valor: 2,
  clase: 'civilizacion' | 'comun',
  civilizacion: 'griegos' | null,      // null si es común
  objetivo: 'personaje' | 'area_civilizacion',
  duracion: 'turno' | 'hasta_muerte_seleccionado',
  costeMagia: 1                         // se muestra en romanos (I, II, III…)
}
```

### Cinturón dinámico de las mágicas
El cinturón de las cartas mágicas NO es el de criaturas (ATQ · medallón · EVA). Se renderiza desde el objeto `efecto`:
- Medallón central: icono del stat (⚔ ataque, 🌀 evasión, icono elemental para las de elemento).
- Banda: el texto del efecto, ej. **"+2 ATAQUE"** en rojo (#ef4444) o **"+2 EVASIÓN"** en azul (#60a5fa). Debajo, en pequeño, la duración ("ESTE TURNO" / "MIENTRAS VIVA").
- El coste de magia en números romanos visible en la carta.

### Diseño visual
- Mágicas **de civilización**: marco y paleta con el color de su civilización (vikingos naranja-marrón, griegos azul, egipcios amarillo, hindúes morado, atlantes su color).
- Mágicas **comunes**: paleta verde neutra (como el diseño 2d existente).
- El diseño de mágicas y trampas es totalmente distinto al de criaturas.

### Flujo al jugar una mágica
1. Se juega desde la mano → modo selección: se iluminan (borde pulsante) solo los personajes VÁLIDOS (civilización correcta si aplica + magia suficiente + corazón vivo); el resto se atenúa.
2. Al elegir, se aplica el efecto según `efecto` y se muestra feedback visual: stat modificado en color (ej. "4→6 ⚔") e indicador ✦ flotante mientras dure.
3. Buffs de ataque se revierten al final del turno (lista `buffsActivos` limpiada en fin de turno, sin tocar nunca el stat base). Buffs de evasión se revierten cuando muere el personaje seleccionado.
4. La carta va al cementerio tras usarse.

---

## 7. Trampas

- Diseño: negro estrellado, se colocan boca abajo. Sin cinturón visible hasta revelarse.
- **PENDIENTE**: existen **3 trampas anti-portal** que pueden derruir portales y perjudicar gravemente al rival. Sus efectos concretos se definirán más adelante; deja el sistema preparado para ellas.

---

## 8. Portales (agujero de gusano)

- Hay **2 portales**, uno por frente, conectados entre sí como un agujero de gusano. Son la única vía para que un personaje cambie de frente.
- **Activación**: mediante **6 cartas de activación de portal** que van mezcladas en el mazo normal y pueden salir en cualquier momento; se juegan como cualquier carta.
- Con el portal activo, un personaje puede **teletransportarse** al portal del otro frente.

### Mecánica de la carta boca abajo (duelo psicológico)
Cada vez que un personaje ocupa el espacio del portal tras teletransportarse:

1. **Pantalla de decisión para el RIVAL**: puede elegir una carta **de su mano** y ponerla boca abajo encima del personaje teletransportado. Si lo hace, el personaje queda **inutilizado**.
2. **Pantalla de decisión para el DUEÑO** del personaje: ¿levantar la carta o no?
   - **La levanta y es una TRAMPA** → su personaje muere Y sufre además el efecto negativo de la trampa.
   - **La levanta y NO es trampa** (cualquier otro tipo de carta) → el dueño **se queda la carta** y su personaje sigue vivo y teletransportado en el campo.
   - **NO la levanta** → el personaje queda inutilizado y finalmente **ambas cartas van al cementerio**: el personaje y la carta boca abajo del rival.
3. Esta mecánica se puede repetir siempre que haya una carta en el espacio del portal.

Implementa ambas pantallas como diálogos modales claros de sí/no con el contexto visible (qué personaje, qué está en juego).

---

## 9. Reglas de datos ya establecidas (no cambiar)

- Elementos: ciclo Rayo → Agua → Fuego → Tierra → Rayo.
- Colores por civilización: vikingos naranja-marrón, griegos azul, egipcios amarillo, hindúes morado; mágicas comunes verde; trampas negro estrellado.
- Robo: 1 carta al inicio de cada turno.
- Vista mano (cámara baja 3D) ↔ vista cenital según lo ya construido.

---

## 10. PENDIENTES (no implementar aún, dejar preparado)

- Efectos concretos de las **3 trampas anti-portal**.
- Mecánica y reglas de la **carta de Dios** central.
- Detalle de las mágicas **elementales** (qué mejoran exactamente del elemento).
- Personajes restantes de cada civilización.
- Confirmar si una carta de activación abre los dos portales a la vez o cada portal necesita la suya (supuesto actual: al ser un agujero de gusano, una activación abre la conexión completa).
