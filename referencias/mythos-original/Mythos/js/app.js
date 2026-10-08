// Mythos Guerra Dioses — juego completo: magias, dioses, portales, farol de trampas,
// cartas de aumento, tablero en arco con cámara 3D y animaciones (vuelo, hilos, rotura de corazón).
// Portado desde el prototipo de Claude Design, sin frameworks (HTML/CSS/JS simple).

(function () {
  "use strict";

  // ---------- lienzo de tamaño fijo ----------
  // Todo el juego se dibuja siempre sobre un lienzo de este tamaño y después se escala
  // entero para caber en la ventana, como un videojuego. Así nunca hay que hacer scroll
  // y el diseño se ve igual en cualquier monitor: solo se diseña una vez, a un tamaño.
  const LIENZO_W = 1600, LIENZO_H = 1040;

  function ajustarLienzo(el) {
    const k = Math.min(window.innerWidth / LIENZO_W, window.innerHeight / LIENZO_H);
    const x = (window.innerWidth - LIENZO_W * k) / 2;
    const y = (window.innerHeight - LIENZO_H * k) / 2;
    el.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  }

  // Tablero en reloj de arena. Cruzar el campo de un borde al otro cuesta 5 pasos,
  // que es lo que pidió Adrii: 5 casillas a atravesar, no 5 casillas por frente.
  //   fila 0  -> borde del jugador, 2 casillas (aquí se invoca y aquí ataca la IA)
  //   fila 1  -> 2 casillas
  //   fila 2  -> casilla central única: el cuello por el que hay que pasar
  //   fila 3  -> 2 casillas
  //   fila 4  -> borde de la IA, 2 casillas (desde aquí se matan sus corazones)
  // Son 9 casillas por frente más el portal, que cuelga solo del cuello.
  const NF = 5;
  const FILA_CENTRO = 2;
  // Adelanto en Z por fila. Va a cero: se probó combar el puente hacia la cámara y no
  // funcionó — en vista de mano las filas adelantadas se montaban sobre las de detrás.
  // El tablero se queda plano y las columnas caen a plomo.
  const ARCO = [0, 0, 0, 0, 0];

  const ROMANO = ["✦", "I", "II", "III", "IV", "V"];

  // `prot` es la carta de protección fija que cada corazón lleva delante. No se elige
  // ni se roba: nace con el corazón y sirve de escudo de UN SOLO USO (ver atacarCorazon).
  // El dibujo lo pinta `_artProt` en SVG, no es un emoji: hacen falta formas propias
  // (estrella verde, urna con el alma saliendo) que el juego de emojis no tiene.
  // `protArt` es solo el artículo, para que el registro diga "hace pedazos EL Escudo" y
  // "hace pedazos LA Espada de Guerra" sin frases forzadas.
  const TIPOS_CORAZON = {
    ataque: { emoji: "❤️", color: "#e05c3a", nombre: "Ataque", prot: "Espada de Guerra", protArt: "la" },
    magia: { emoji: "💚", color: "#4caf7d", nombre: "Magia", prot: "Estrella Arcana", protArt: "la" },
    sacrificios: { emoji: "💛", color: "#d4a941", nombre: "Sacrificio", prot: "Urna de Cenizas", protArt: "la" },
    evasion: { emoji: "💙", color: "#4a9de0", nombre: "Defensa", prot: "Escudo", protArt: "el" },
  };

  // Dibujos de las cuatro protecciones. Se pintan con `currentColor` y sin ningún color
  // escrito dentro, así que basta con darle color al contenedor desde el CSS para que la
  // pieza entera vire con su corazón. Lienzo común de 40x52 (la misma proporción que la
  // carta de 58x68) para que las cuatro se vean del mismo tamaño.
  const ART_PROT = {
    // Espada de Guerra: hoja apuntando arriba, gavilán, empuñadura y pomo.
    ataque: `<svg viewBox="0 0 40 52" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">
        <path d="M20 4 L25 15 V31 H15 V15 Z" fill="rgba(255,255,255,.09)"/>
        <path d="M20 8 V31" stroke-width=".9" opacity=".5"/>
        <path d="M8 33 H32" stroke-width="3.2"/>
        <path d="M20 35 V44" stroke-width="2.6"/>
        <circle cx="20" cy="47" r="2.8" fill="rgba(255,255,255,.09)"/>
      </g></svg>`,
    // Escudo: chapa con nervadura en cruz.
    evasion: `<svg viewBox="0 0 40 52" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">
        <path d="M20 4 L34 9 V25 C34 37 27 44 20 48 C13 44 6 37 6 25 V9 Z" fill="rgba(255,255,255,.09)"/>
        <path d="M20 8 V44" stroke-width=".9" opacity=".55"/>
        <path d="M8 22 H32" stroke-width=".9" opacity=".55"/>
      </g></svg>`,
    // Estrella Arcana: estrella de cinco puntas con un núcleo encendido.
    magia: `<svg viewBox="0 0 40 52" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
        <polygon points="20,9 24.4,20 36.2,20.8 27,28.3 30,39.8 20,33.4 10,39.8 13,28.3 3.8,20.8 15.6,20" fill="rgba(255,255,255,.10)"/>
        <circle cx="20" cy="26" r="3.2" fill="currentColor" stroke="none" opacity=".55"/>
      </g></svg>`,
    // Urna de Cenizas con la silueta del alma saliendo por la boca.
    sacrificios: `<svg viewBox="0 0 40 52" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
        <g opacity=".75">
          <circle cx="20" cy="12" r="4.2" fill="rgba(255,255,255,.16)"/>
          <path d="M20 16.4 C15.6 17.2 13.8 21 15.4 25 C16.9 23.4 18.2 23.8 20 25.6 C21.8 23.8 23.1 23.4 24.6 25 C26.2 21 24.4 17.2 20 16.4 Z" fill="rgba(255,255,255,.16)"/>
        </g>
        <rect x="10.5" y="28" width="19" height="3.6" rx="1.8" fill="rgba(255,255,255,.09)"/>
        <path d="M13.5 32.4 C11.4 38.5 13.6 45.4 20 46.4 C26.4 45.4 28.6 38.5 26.5 32.4 Z" fill="rgba(255,255,255,.09)"/>
        <path d="M15 47.6 H25" stroke-width="2.4" stroke-linecap="round"/>
      </g></svg>`,
  };

  // Orden fijo de los corazones en el campo, leído de izquierda a derecha desde la mano
  // del jugador: 1 azul (defensa), 2 verde (magia), 3 rojo (ataque), 4 amarillo (sacrificio).
  // La clave interna del azul sigue siendo "evasion" a propósito: la usan ZEUS.bonoTipo y
  // colocarAumento, y el nombre que se ve sale de TIPOS_CORAZON.nombre = "Defensa".
  // Cada frente ocupa dos posiciones y el rival los tiene en el mismo orden, así que las
  // columnas quedan alineadas por color. Ya no se eligen: la partida empieza con ellos puestos.
  const ORDEN_CORAZONES = [
    ["evasion", "magia"],
    ["ataque", "sacrificios"],
  ];

  const CIV = {
    vikinga: { color: "#c1692f", glow: "#e08a4a", nombre: "Vikingos" },
    griega: { color: "#3d7fb8", glow: "#4a9de0", nombre: "Griegos" },
    magica: { color: "#4caf7d", glow: "#6fd89f", nombre: "Carta Mágica" },
    trampa: { color: "#6b6290", glow: "#8b8bb0", nombre: "Trampa" },
  };

  /* Colores de la CARTA GRANDE (300x485), copiados del mapa `T` de `Carta.dc.html`,
     en C:\Users\Usuario\Desktop\GAME\Animación y diseño de cartas. Se elige por TIPO
     primero y por civilización después, igual que allí: un Dios va dorado aunque sea
     griego. Son más vivos que los de CIV a propósito; CIV sigue mandando en el
     tablero y en la mano, que aún no se han pasado al diseño nuevo. */
  const TEMA_CARTA = {
    vikinga: { borde: "#f97316", halo: "rgba(249,115,22,.55)", oscuro: "#7c2d12", arte: "radial-gradient(circle at 50% 42%, #3a1c08 0%, #150a04 70%)" },
    griega: { borde: "#3b82f6", halo: "rgba(59,130,246,.55)", oscuro: "#1e3a8a", arte: "radial-gradient(circle at 50% 42%, #0e203f 0%, #050b16 70%)" },
    magica: { borde: "#10b981", halo: "rgba(16,185,129,.55)", oscuro: "#065f46", arte: "radial-gradient(circle at 50% 42%, #0f351e 0%, #05140b 70%)" },
    trampa: { borde: "#4b5563", halo: "rgba(75,85,99,.55)", oscuro: "#1f2937", arte: "radial-gradient(circle at 50% 42%, #1a1a24 0%, #06060c 70%)" },
    dios: { borde: "#d4a941", halo: "rgba(212,169,65,.55)", oscuro: "#854d0e", arte: "radial-gradient(circle at 50% 42%, #3a2e12 0%, #141006 70%)" },
  };
  const FONDO_CARTA = "linear-gradient(170deg, #221410 0%, #12161f 70%)";

  /* Los dos iconos del cinturón, tal cual vienen del diseño. */
  const ART_ESPADA = `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 1 L14.4 4.2 L14.4 13 L12 15.4 L9.6 13 L9.6 4.2 Z M6.4 14.8 L17.6 14.8 L17.6 17 L13.1 17 L13.1 20.6 L10.9 20.6 L10.9 17 L6.4 17 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width=".6"/><circle cx="12" cy="22" r="1.5" fill="#ef4444"/></svg>`;
  const ART_ESPIRAL = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"><path d="M12 12 c0 -1.2 1.8 -1.2 1.8 0 c0 1.8 -3.4 1.8 -3.4 0 c0 -3 5.2 -3 5.2 0 c0 4 -7 4 -7 0 c0 -5 8.8 -4.6 8.8 .4"/></svg>`;

  /* Sello de sacrificio de la cabecera, portado de `Carta.dc.html`. La FORMA dice lo
     que cuesta invocar (rombo 1, pentágono 2, hexágono 3) y las calaveras de dentro
     repiten el número, para que se lea de un vistazo sin contar. El rombo punteado es
     gratis, la estrella naranja es "cuesta magia" y el círculo con el lazo del
     infinito es el de los Dioses, que no se invocan. */
  function selloSacrificio(coste) {
    const GOLD = "#d4a941", DARK = "#0d1017";
    const circulo = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
    const SKULL = "M22 13 c-4.4 0 -7 3 -7 6.6 c0 2.2 1.2 3.8 2.6 4.8 L17.6 28 c0 1 .8 1.8 1.8 1.8 l5.2 0 c1 0 1.8 -.8 1.8 -1.8 l0 -3.6 c1.4 -1 2.6 -2.6 2.6 -4.8 c0 -3.6 -2.6 -6.6 -7 -6.6";
    const calavera = (cx, cy, k) => {
      const t = `translate(${cx} ${cy}) scale(${k}) translate(-22 -21)`;
      return `<path d="${SKULL}" fill="#e2e8f0" transform="${t}"/>`
        + `<path d="${circulo(19.3, 20, 1.7)}" fill="${DARK}" transform="${t}"/>`
        + `<path d="${circulo(24.7, 20, 1.7)}" fill="${DARK}" transform="${t}"/>`;
    };
    const ROMBO = "M22 2 L42 22 L22 42 L2 22 Z";
    const PENTA = "M22 2 L42 17 L34 41 L10 41 L2 17 Z";
    const HEXA = "M2 22 L12 5 L32 5 L42 22 L32 39 L12 39 Z";
    let brillo = "none", d;
    if (coste === "inf") {
      brillo = "drop-shadow(0 0 5px rgba(255,215,0,.55))";
      d = `<path d="${circulo(22, 22, 20)}" fill="${DARK}" stroke="#ffd700" stroke-width="2"/>`
        + `<path d="${circulo(22, 22, 15.5)}" stroke="rgba(255,215,0,.4)" stroke-width="1"/>`
        + `<path d="M22 3.5 L22 7 M22 37 L22 40.5 M3.5 22 L7 22 M37 22 L40.5 22 M8.9 8.9 L11.4 11.4 M32.6 32.6 L35.1 35.1 M35.1 8.9 L32.6 11.4 M11.4 32.6 L8.9 35.1" stroke="#ffd700" stroke-width="1.3"/>`
        + `<path d="M13 22 C13 18.2 19 18.2 22 22 C25 25.8 31 25.8 31 22 C31 18.2 25 18.2 22 22 C19 25.8 13 25.8 13 22 Z" stroke="#ffd700" stroke-width="2.1"/>`;
    } else if (coste === "magia") {
      brillo = "drop-shadow(0 0 5px rgba(253,186,116,.65))";
      d = `<path d="M22 2 L26.5 17.5 L42 22 L26.5 26.5 L22 42 L17.5 26.5 L2 22 L17.5 17.5 Z" fill="${DARK}" stroke="#fdba74" stroke-width="2"/>`
        + `<path d="M22 13 L23.8 20.2 L31 22 L23.8 23.8 L22 31 L20.2 23.8 L13 22 L20.2 20.2 Z" fill="#fdba74"/>`
        + `<path d="${circulo(22, 22, 1.8)}" fill="#fff7ed"/>`
        + `<path d="${circulo(29.5, 14.5, 1.2)}" fill="#fdba74"/>`
        + `<path d="${circulo(14.5, 29.5, 1.2)}" fill="#fdba74"/>`;
    } else if (coste === 1) {
      brillo = "drop-shadow(0 0 4px rgba(239,68,68,.4))";
      d = `<path d="${ROMBO}" fill="${DARK}" stroke="${GOLD}" stroke-width="2"/>` + calavera(22, 23, 1.05);
    } else if (coste === 2) {
      brillo = "drop-shadow(0 0 4px rgba(239,68,68,.4))";
      d = `<path d="${PENTA}" fill="${DARK}" stroke="${GOLD}" stroke-width="2"/>` + calavera(15.5, 24, .8) + calavera(28.5, 24, .8);
    } else if (coste >= 3) {
      brillo = "drop-shadow(0 0 5px rgba(239,68,68,.5))";
      d = `<path d="${HEXA}" fill="${DARK}" stroke="${GOLD}" stroke-width="2"/>` + calavera(14.5, 20, .68) + calavera(29.5, 20, .68) + calavera(22, 32, .78);
    } else {
      d = `<path d="M22 6 L38 22 L22 38 L6 22 Z" stroke="#4b5563" stroke-width="1.6" stroke-dasharray="3 3"/>`;
    }
    return `<svg viewBox="0 0 44 44" fill="none" style="filter:${brillo}">${d}</svg>`;
  }

  const VIK = [
    { nombre: "Einherjar", icon: "⚔️", civ: "vikinga", fuerza: 2, sac: 0, esq: 4, magia: 0 },
    { nombre: "Guerrero", icon: "🪓", civ: "vikinga", fuerza: 3, sac: 0, esq: 2, magia: 0 },
    { nombre: "Valquiria", icon: "🦅", civ: "vikinga", fuerza: 3, sac: 0, esq: 6, magia: 0 },
    { nombre: "Lobo de Fenrir", icon: "🐺", civ: "vikinga", fuerza: 4, sac: 1, esq: 5, magia: 0 },
    { nombre: "Jarl", icon: "👑", civ: "vikinga", fuerza: 4, sac: 1, esq: 3, magia: 1 },
    { nombre: "Berserker", icon: "😤", civ: "vikinga", fuerza: 5, sac: 1, esq: 1, magia: 0 },
    { nombre: "Gigante de Hielo", icon: "❄️", civ: "vikinga", fuerza: 6, sac: 2, esq: 0, magia: 0 },
    { nombre: "Jörmundgander", icon: "🐉", civ: "vikinga", fuerza: 7, sac: 2, esq: 2, magia: 3, efecto: "La serpiente del mundo, que rodea Midgard entera." },
  ];
  const GRI = [
    { nombre: "Sátiro", icon: "🐐", civ: "griega", fuerza: 2, sac: 0, esq: 7, magia: 0 },
    { nombre: "Hoplita", icon: "🛡️", civ: "griega", fuerza: 3, sac: 0, esq: 3, magia: 0 },
    { nombre: "Amazona", icon: "🏹", civ: "griega", fuerza: 3, sac: 0, esq: 5, magia: 0 },
    { nombre: "Oráculo", icon: "🔮", civ: "griega", fuerza: 2, sac: 0, esq: 5, magia: 3, efecto: "Vidente de Delfos, lee el destino en el humo." },
    { nombre: "Espartano", icon: "⚔️", civ: "griega", fuerza: 4, sac: 1, esq: 2, magia: 0 },
    { nombre: "Medusa", icon: "🐍", civ: "griega", fuerza: 4, sac: 1, esq: 4, magia: 1 },
    { nombre: "Minotauro", icon: "🐂", civ: "griega", fuerza: 5, sac: 1, esq: 1, magia: 0 },
    { nombre: "Cíclope", icon: "👁️", civ: "griega", fuerza: 6, sac: 2, esq: 0, magia: 0 },
  ];

  // ---------- Fase 2: magias, dioses, trampa, aumentos ----------
  const MAG = [
    { nombre: "Aliento de Hel", icon: "💀", civ: "magica", tipo: "magica", cat: "general", magia: 2, clave: "resucitar", efecto: "Mágica general (💚) · nivel II: devuelve la última criatura de tu cementerio a tu mano." },
    { nombre: "Tornado", icon: "🌪️", civ: "magica", tipo: "magica", cat: "general", magia: 2, clave: "tornado", efecto: "Mágica general (💚) · nivel II: levanta TODAS las cartas de un frente y las devuelve a las manos de sus dueños." },
    { nombre: "Agujero de Gusano", icon: "🕳️", civ: "magica", tipo: "magica", cat: "general", magia: 2, clave: "portal", efecto: "Mágica general (💚) · nivel II: abre los DOS portales en modo teletransporte (permanente) y libera a los congelados." },
    { nombre: "El Ojo de Odín", icon: "👁️", civ: "magica", tipo: "magica", cat: "general", magia: 5, clave: "revelar", efecto: "Mágica general (💚) · nivel V: revela la mano del rival durante 10 segundos." },
    { nombre: "Martillo de Thor", icon: "🔨", civ: "vikinga", tipo: "magica", cat: "civilizacion", civMagia: "vikinga", magia: 1, clave: "buffCiv", buff: 2, efecto: "Mágica de civilización (💚) · nivel I: +2 de ataque a un VIKINGO durante este turno." },
    { nombre: "Disipación", icon: "💨", civ: "magica", tipo: "magica", cat: "general", magia: 1, clave: "disipar", efecto: "Mágica general (💚) · nivel I: destruye TODAS las cartas de aumento del rival (sus personajes solo pierden el aumento)." },
  ];
  const AUMV = [
    { nombre: "Furia de Berserker", icon: "🗡️", civ: "vikinga", tipo: "aumento", stat: "fuerza", val: 1, efecto: "AUMENTO (❤️ Ataque) · Gratis: se coloca en tu corazón de Ataque libre y elige un VIKINGO de ese frente: +1 ATAQUE mientras viva." },
    { nombre: "Manto de Niebla", icon: "🌁", civ: "vikinga", tipo: "aumento", stat: "esq", val: 1, efecto: "AUMENTO (💙 Defensa) · Gratis: se coloca en tu corazón de Defensa libre y elige un VIKINGO de ese frente: +1 EVASIÓN mientras viva." },
  ];
  const AUMG = [
    { nombre: "Filo de Ares", icon: "⚔️", civ: "griega", tipo: "aumento", stat: "fuerza", val: 1, efecto: "AUMENTO (❤️ Ataque) · Gratis: se coloca en tu corazón de Ataque libre y elige un GRIEGO de ese frente: +1 ATAQUE mientras viva." },
    { nombre: "Gracia de Hermes", icon: "🪽", civ: "griega", tipo: "aumento", stat: "esq", val: 1, efecto: "AUMENTO (💙 Defensa) · Gratis: se coloca en tu corazón de Defensa libre y elige un GRIEGO de ese frente: +1 EVASIÓN mientras viva." },
  ];
  const TRAMPA = { nombre: "Marioneta del Abismo", icon: "🎭", civ: "trampa", tipo: "trampa", clave: "control", efecto: "TRAMPA · Se coloca boca abajo sobre un personaje rival en un portal. Si su dueño la levanta: el personaje pasa a tu control." };
  const ODIN = { nombre: "Odín", icon: "🦉", civ: "vikinga", tipo: "dios", bonoTipo: "fuerza", bonoVal: 1, efecto: "+1 de ataque a todos los vikingos mientras esté en el Abismo. Invocación: suma 5 niveles de magia entre tus vikingos." };
  const ZEUS = { nombre: "Zeus", icon: "🌩️", civ: "griega", tipo: "dios", bonoTipo: "evasion", bonoVal: 2, efecto: "+2 de evasión a todos los griegos mientras esté en el Abismo. Invocación: suma 5 niveles de magia entre tus griegos." };

  // ============================================================================
  //  TEMAS DEL ABISMO — "Puente del Vacío"
  // ============================================================================
  //  El aspecto del abismo central y el tinte de todo el fondo de la pantalla
  //  dependen del Dios que haya invocado en el centro. El mapa se busca por el
  //  NOMBRE de la carta de Dios, es decir por `g.dios.nombre`.
  //
  //  >>>>>>>>>>  DÓNDE PONER TUS IMÁGENES  <<<<<<<<<<
  //
  //  1. Copia el archivo (jpg, png, webp o gif) dentro de la carpeta  img/
  //     del proyecto:  C:\Users\Usuario\Claude\Projects\Mythos\img\
  //
  //  2. Escribe su ruta aquí abajo, en el campo `imagen` del Dios que toque.
  //     La ruta se escribe SIEMPRE empezando por "img/", así:
  //
  //         imagen: "img/abismo-zeus.jpg"
  //
  //  3. Guarda y refresca con Ctrl+F5. No hay que tocar nada más.
  //
  //  Si `imagen` se queda como "" (vacío), el abismo usa solo el color y no
  //  pide ningún archivo al servidor, así que no da error.
  //
  //  Para añadir un Dios nuevo, copia una línea entera y cambia el nombre: la
  //  clave tiene que coincidir EXACTAMENTE con el `nombre` de la carta.
  // ============================================================================

  // Aspecto cuando NO hay ningún Dios en el abismo (casi toda la partida).
  const TEMA_ABISMO_REPOSO = {
    imagen: "",                      // <-- tu imagen del abismo en reposo
    color: "#8b5cf6",                // halo y borde del abismo
    tinte: "rgba(139, 92, 246, .07)", // tinte del fondo de la pantalla
  };

  const TEMAS_ABISMO = {
    "Odín": { imagen: "", color: "#f97316", tinte: "rgba(249, 115, 22, .15)" },
    "Zeus": { imagen: "", color: "#3b82f6", tinte: "rgba(59, 130, 246, .17)" },
    // Ejemplo de Dios futuro, borra las barras para activarlo:
    // "Ra": { imagen: "img/abismo-ra.jpg", color: "#f5c542", tinte: "rgba(245, 197, 66, .17)" },
  };

  function temaAbismo(dios) {
    if (!dios) return TEMA_ABISMO_REPOSO;
    return TEMAS_ABISMO[dios.nombre] || TEMA_ABISMO_REPOSO;
  }

  class Juego {
    constructor(root) {
      this.root = root;
      this._c = 0;
      this._dadoTimer = null;
      this._lpT = null;
      this._lpFired = false;
      this._mounted = false;
      this._invFx = null;
      this._corVivoPrev = null;
      this._tiltPrev = null;
      this.state = this.estadoInicial();
      this.render();
      this._hilosLoop();
    }

    // ---------- utilidades ----------
    uid() { return ++this._c; }
    d12() { return Math.floor(Math.random() * 12) + 1; }

    cartaBase(c) {
      return {
        nombre: c.nombre, icon: c.icon, civ: c.civ, tipo: c.tipo || "criatura",
        fuerza: c.fuerza || 0, sac: c.sac || 0, esq: c.esq || 0, magia: c.magia || 0,
        efecto: c.efecto || null, cat: c.cat || null, civMagia: c.civMagia || null,
        buff: c.buff || 0, clave: c.clave || null, bonoTipo: c.bonoTipo || null,
        bonoVal: c.bonoVal || 0, stat: c.stat || null, val: c.val || 0, id: this.uid(),
      };
    }
    barajar(pool) {
      const m = pool.map((c) => this.cartaBase(c));
      for (let i = m.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [m[i], m[j]] = [m[j], m[i]];
      }
      return m;
    }
    robar(m0, h0, n) {
      const m = [...m0], h = [...h0];
      for (let i = 0; i < (n || 1); i++) if (m.length) h.push(m.shift());
      return [m, h];
    }

    estadoInicial() {
      // `prot: true` = la carta de protección está entera. Al romperse pasa a false y el
      // corazón queda a la vista; la carta no vuelve nunca.
      const corazonesFijos = () => ORDEN_CORAZONES.map((frente) => frente.map((tipo) => ({ tipo, vivo: true, prot: true })));
      const g = {
        fase: "juego",
        tablero: [[], []],
        corazones: {
          jugador: corazonesFijos(),
          ia: corazonesFijos(),
        },
        mazoJ: this.barajar([...VIK, ...VIK, ...MAG, MAG[2], ...AUMV, TRAMPA, TRAMPA, ODIN]),
        mazoIA: this.barajar([...GRI, ...GRI, ZEUS, ...AUMG, TRAMPA, TRAMPA]),
        manoJ: [], manoIA: [],
        cementerio: { jugador: [], ia: [] },
        dios: null,
        portales: { activos: false },
        farol: null,
        invocadoEnFrente: [false, false],
        movidas: [],
        turno: 1,
        log: ["⚔️ ¡Comienza el duelo! Vikingos contra Griegos."],
        eventos: [],
        fin: null,
      };
      [g.mazoJ, g.manoJ] = this.robar(g.mazoJ, g.manoJ, 7);
      [g.mazoIA, g.manoIA] = this.robar(g.mazoIA, g.manoIA, 7);
      return {
        g, selMano: null, selUnidad: null, sacrificios: [], sacFr: null,
        // verCarta = carta a pantalla completa (pulsación larga)
        // verTablero = id de la ficha del tablero que se está mirando en el panel
        //              de la izquierda, el mismo sitio donde salen las de la mano
        verCarta: null, verTablero: null, huecosPendientes: null, sacCorazon: null,
        objetivoMagia: null, tornadoElige: null, revelar: null, camara: "campo",
        dado: { n: 1, parado: false, evId: null },
      };
    }

    setState(update, cb) {
      const patch = typeof update === "function" ? update(this.state) : update;
      if (patch === null || patch === undefined) return;
      this.state = { ...this.state, ...patch };
      this.render();
      if (cb) cb();
    }

    clonar(prev) {
      return {
        ...prev,
        tablero: prev.tablero.map((f) => f.map((u) => ({ ...u }))),
        corazones: {
          jugador: prev.corazones.jugador.map((f) => f.map((c) => (c ? { ...c } : null))),
          ia: prev.corazones.ia.map((f) => f.map((c) => (c ? { ...c } : null))),
        },
        manoJ: [...prev.manoJ], mazoJ: [...prev.mazoJ],
        manoIA: [...prev.manoIA], mazoIA: [...prev.mazoIA],
        cementerio: { jugador: [...prev.cementerio.jugador], ia: [...prev.cementerio.ia] },
        dios: prev.dios ? { ...prev.dios } : null,
        portales: { ...prev.portales },
        farol: prev.farol ? { ...prev.farol } : null,
        invocadoEnFrente: [...prev.invocadoEnFrente],
        movidas: [...prev.movidas],
        log: [...prev.log],
        eventos: [...prev.eventos],
      };
    }

    alCementerio(st, u) {
      this.soltarAumentos(st, u);
      if (u.cartaEncima) st.cementerio[u.cartaEncima.dueno].push(u.cartaEncima.carta);
      st.cementerio[u.dueño === "jugador" ? "jugador" : "ia"].push(this.cartaBase(u));
    }

    mismaPos(a, b) { return !!a.portal === !!b.portal && (a.portal || (a.fila === b.fila && a.carril === b.carril)); }
    unidadEn(g, fr, pos) { return g.tablero[fr].find((u) => this.mismaPos(u, pos)); }
    corazonVivo(g, lado, tipo, fr) { return g.corazones[lado][fr].some((c) => c && c.vivo && c.tipo === tipo); }
    sacReq(carta) { return carta ? carta.sac || 0 : 0; }
    corazonAumLibre(g, lado, carta, fr) {
      const t = carta.stat === "fuerza" ? "ataque" : "evasion";
      return g.corazones[lado][fr].some((c) => c && c.vivo && c.tipo === t && !c.carta);
    }
    sumaMagiaFrente(g, lado, fr) {
      return g.tablero[fr].filter((u) => u.dueño === lado && !u.congelada).reduce((a, u) => a + (u.magia || 0), 0);
    }
    sumaMagiaCivFrente(g, lado, civ, fr) {
      return g.tablero[fr].filter((u) => u.dueño === lado && u.civ === civ && !u.congelada).reduce((a, u) => a + (u.magia || 0), 0);
    }
    mejorSumaDios(g, lado, civ) { return this.sumaMagiaCivFrente(g, lado, civ, 0) + this.sumaMagiaCivFrente(g, lado, civ, 1); }
    frentesCanaliza(g, carta) {
      const res = [];
      for (let fr = 0; fr < 2; fr++) {
        if (this.corazonVivo(g, "jugador", "magia", fr) && this.sumaMagiaFrente(g, "jugador", fr) >= (carta.magia || 0)) res.push(fr);
      }
      return res;
    }
    _liberarCorazon(st, lado, c) {
      if (!c || !c.carta) return;
      for (const f of st.tablero) {
        const u = f.find((x) => x.id === c.unidadId);
        if (u) {
          if (c.carta.stat === "fuerza") u.aumF = Math.max(0, (u.aumF || 0) - c.carta.val);
          else u.aumE = Math.max(0, (u.aumE || 0) - c.carta.val);
        }
      }
      st.cementerio[lado].push(c.carta);
      c.carta = null;
      c.unidadId = null;
    }
    soltarAumentos(st, u) {
      for (const lado of ["jugador", "ia"]) {
        for (const frH of st.corazones[lado]) for (const c of frH) {
          if (c && c.carta && c.unidadId === u.id) {
            st.cementerio[lado].push(c.carta);
            st.log.unshift(`🂠 ${c.carta.icon} ${c.carta.nombre} se descarta: su personaje ya no está en el campo.`);
            c.carta = null;
            c.unidadId = null;
          }
        }
      }
    }
    liberarCongelados(st) {
      for (let f = 0; f < 2; f++) {
        for (const u of st.tablero[f]) {
          if (u.congelada) {
            if (u.cartaEncima) st.cementerio[u.cartaEncima.dueno].push(u.cartaEncima.carta);
            u.congelada = false;
            u.cartaEncima = null;
            st.log.unshift(`🔓 ${u.icon} ${u.nombre} queda liberado del hechizo del portal.`);
          }
        }
      }
    }
    esZonaInv(pos, g) { return pos.fila === 0 || (!!pos.portal && g.portales.activos); }
    OUT(fr) { return fr === 0 ? 0 : 1; } // carril de campo junto al portal de cada frente
    vecinos(g, fr, pos) {
      const v = [];
      if (pos.portal) {
        // El portal solo enlaza con la casilla central (más el salto al otro portal).
        v.push({ fila: FILA_CENTRO, carril: 0 });
        if (g.portales.activos) v.push({ portal: true, teletransporte: true });
        return v;
      }
      if (pos.fila === FILA_CENTRO) {
        // Desde el cuello se sale por el carril que se quiera, hacia un lado o el otro:
        // por eso es la casilla que decide por dónde acaba atacando cada uno.
        for (const f of [FILA_CENTRO - 1, FILA_CENTRO + 1]) {
          for (const c of [0, 1]) v.push({ fila: f, carril: c });
        }
        if (g.portales.activos) v.push({ portal: true });
        return v;
      }
      // Filas de dos casillas: se avanza hacia el cuello, se retrocede hacia tu borde
      // y se puede cambiar de carril lateralmente. Solo por donde hay línea dibujada.
      const haciaCentro = pos.fila < FILA_CENTRO ? pos.fila + 1 : pos.fila - 1;
      v.push(haciaCentro === FILA_CENTRO
        ? { fila: FILA_CENTRO, carril: 0 }
        : { fila: haciaCentro, carril: pos.carril });
      const alejandose = pos.fila < FILA_CENTRO ? pos.fila - 1 : pos.fila + 1;
      if (alejandose >= 0 && alejandose < NF) v.push({ fila: alejandose, carril: pos.carril });
      v.push({ fila: pos.fila, carril: 1 - pos.carril });
      return v;
    }

    golpe(st, at, def) {
      const dios = st.dios;
      const dF = (u) => (dios && dios.civ === u.civ && dios.bonoTipo === "fuerza") ? dios.bonoVal : 0;
      const dE = (u) => (dios && dios.civ === u.civ && dios.bonoTipo === "evasion") ? dios.bonoVal : 0;
      const diosAt = dF(at), diosDef = dF(def), diosEsq = dE(def);
      const buffAt = (at.buffF || 0) + (at.aumF || 0), buffDef = (def.buffF || 0) + (def.aumF || 0);
      const esqEff = def.esq + (def.aumE || 0) + diosEsq;
      const tirada = this.d12();
      const critico = tirada === esqEff;
      const acierta = critico || tirada > esqEff;
      const fAtq = (at.fuerza + buffAt + diosAt) * (critico ? 2 : 1);
      const fDef = def.fuerza + buffDef + diosDef;
      const mata = acierta && fAtq > fDef;
      return { tirada, esqEff, diosAt, diosDef, diosEsq, diosNombre: dios ? dios.nombre : null, buffAt, buffDef, critico, acierta, fAtq, fDef, mata };
    }
    combate(st, fr, at, def) {
      const g1 = this.golpe(st, at, def);
      st.eventos.push({ id: this.uid(), atacante: { ...at }, defensor: { ...def }, g1 });
      if (g1.mata) {
        st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== def.id);
        this.alCementerio(st, def);
        st.log.unshift(`☠️ ${def.icon} ${def.nombre} cae ante ${at.icon} ${at.nombre}${g1.critico ? " (CRÍTICO ×2)" : ""}.`);
        return "gana_atacante";
      }
      st.log.unshift(`🛡️ ${def.icon} ${def.nombre} ${g1.acierta ? "resiste el golpe" : "esquiva el ataque"} de ${at.icon}.`);
      return "nada";
    }
    comprobarFin(st) {
      const vivos = (lado) => st.corazones[lado].flat().filter((c) => c && c.vivo).length;
      if (vivos("ia") === 0) { st.fin = "victoria"; st.log.unshift("🏆 ¡Los 4 corazones griegos han caído! VICTORIA."); }
      else if (vivos("jugador") === 0) { st.fin = "derrota"; st.log.unshift("💀 Tus 4 corazones han caído. DERROTA."); }
    }

    // ---------- acciones del jugador ----------

    marcarSacrificio(u, fr) {
      const prev = this.state;
      const carta = prev.g.manoJ.find((c) => c.id === prev.selMano);
      if (!carta) return;
      const usaCor = prev.sacCorazon === fr && carta.sac > 0;
      const req = Math.max(0, this.sacReq(carta) - (usaCor ? 1 : 0));
      const ids = [...prev.sacrificios, u.id];
      if (ids.length < req) { this.setState({ sacrificios: ids, sacFr: fr }); return; }
      this.setState((p) => {
        const st = this.clonar(p.g);
        const huecos = [];
        for (const id of ids) {
          const v = st.tablero[fr].find((x) => x.id === id);
          if (v) huecos.push({ fila: v.fila, carril: v.carril, portal: !!v.portal });
        }
        for (const id of ids) {
          const v = st.tablero[fr].find((x) => x.id === id);
          if (v) {
            st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== id);
            this.alCementerio(st, v);
            st.log.unshift(`🩸 Sacrificas a ${v.icon} ${v.nombre}.`);
          }
        }
        st.log.unshift("✨ Elige en cuál de los huecos aparece la invocación.");
        return { g: st, huecosPendientes: { cartaId: carta.id, fr, huecos, usaCorazon: usaCor ? fr : null }, sacrificios: [], sacFr: null };
      });
    }

    colocarEnHueco(pos) {
      this._capturarVuelo(this.state.huecosPendientes ? this.state.huecosPendientes.cartaId : null);
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const hp = prev.huecosPendientes;
        const carta = st.manoJ.find((c) => c.id === hp.cartaId);
        if (!carta || st.invocadoEnFrente[hp.fr] || this.unidadEn(st, hp.fr, pos)) return null;
        st.manoJ = st.manoJ.filter((c) => c.id !== carta.id);
        const nu = { ...carta, id: this.uid(), dueño: "jugador", fila: pos.fila, carril: pos.carril, portal: !!pos.portal, aumF: 0, aumE: 0 };
        st.tablero[hp.fr].push(nu);
        st.invocadoEnFrente[hp.fr] = true;
        st.movidas.push(nu.id);
        st.log.unshift(`🟠 Invocas ${carta.icon} ${carta.nombre} sobre el hueco del sacrificio${pos.portal ? " (PORTAL)" : ""}.`);
        if (hp.usaCorazon != null) {
          const cor = st.corazones.jugador[hp.usaCorazon].find((c) => c && c.vivo && c.tipo === "sacrificios");
          if (cor) { cor.vivo = false; st.log.unshift("💛 Tu corazón de Sacrificios arde como alma de la invocación (se destruye)."); }
          this.comprobarFin(st);
        }
        this.farolTrigger(st, hp.fr, nu.id);
        return { g: st, huecosPendientes: null, selMano: null, sacCorazon: null };
      });
    }

    invocar(fr, pos, sacIds) {
      this._capturarVuelo(this.state.selMano);
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const carta = st.manoJ.find((c) => c.id === prev.selMano);
        if (!carta || st.invocadoEnFrente[fr]) return null;
        const usaCor = prev.sacCorazon === fr && carta.sac > 0;
        const req = Math.max(0, this.sacReq(carta) - (usaCor ? 1 : 0));
        const ids = sacIds || [];
        if (ids.length < req) return null;
        const oc = this.unidadEn(st, fr, pos);
        if (oc && !ids.includes(oc.id)) return null;
        for (const id of ids.slice(0, req)) {
          const v = st.tablero[fr].find((x) => x.id === id);
          if (v) {
            st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== id);
            this.alCementerio(st, v);
            st.log.unshift(`🩸 Sacrificas a ${v.icon} ${v.nombre}.`);
          }
        }
        st.manoJ = st.manoJ.filter((c) => c.id !== carta.id);
        const nu = { ...carta, id: this.uid(), dueño: "jugador", fila: pos.fila, carril: pos.carril, portal: !!pos.portal, aumF: 0, aumE: 0 };
        st.tablero[fr].push(nu);
        st.invocadoEnFrente[fr] = true;
        st.movidas.push(nu.id);
        st.log.unshift(`🟠 Invocas ${carta.icon} ${carta.nombre}${req > 0 ? " sobre el hueco del sacrificio" : ""}${pos.portal ? " (PORTAL)" : ""}.`);
        if (usaCor) {
          const cor = st.corazones.jugador[fr].find((c) => c && c.vivo && c.tipo === "sacrificios");
          if (cor) { cor.vivo = false; st.log.unshift("💛 Tu corazón de Sacrificios arde como alma de la invocación (se destruye)."); }
          this.comprobarFin(st);
        }
        this.farolTrigger(st, fr, nu.id);
        return { g: st, selMano: null, sacrificios: [], sacFr: null, sacCorazon: null };
      });
    }

    mover(fr, pos) {
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        let u, frO;
        for (let f = 0; f < 2; f++) {
          const x = st.tablero[f].find((x) => x.id === prev.selUnidad.id);
          if (x) { u = x; frO = f; }
        }
        if (!u || u.congelada) return null;
        const oc = this.unidadEn(st, fr, pos);
        let movio = false;
        if (oc && oc.dueño === "ia") {
          const res = this.combate(st, fr, u, oc);
          if (res === "gana_atacante") {
            st.tablero[frO] = st.tablero[frO].filter((x) => x.id !== u.id);
            st.tablero[fr].push({ ...u, fila: pos.fila, carril: pos.carril, portal: !!pos.portal });
            movio = true;
          }
        } else if (!oc) {
          st.tablero[frO] = st.tablero[frO].filter((x) => x.id !== u.id);
          st.tablero[fr].push({ ...u, fila: pos.fila, carril: pos.carril, portal: !!pos.portal });
          movio = true;
          if (fr !== frO) st.log.unshift(`🌀 ${u.icon} ${u.nombre} cruza el agujero de gusano al otro frente.`);
        }
        st.movidas.push(u.id);
        if (movio && pos.portal) this.farolTrigger(st, fr, u.id);
        this.comprobarFin(st);
        return { g: st, selUnidad: null };
      }, () => this._syncDado());
    }

    atacarCorazon(fr, carril) {
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const u = st.tablero[fr].find((x) => x.id === prev.selUnidad.id);
        if (!u || u.congelada || u.fila !== NF - 1 || u.carril !== carril) return null;
        const c = st.corazones.ia[fr][carril];
        if (!c || !c.vivo) return null;
        const tc = TIPOS_CORAZON[c.tipo];
        // Escudo de un uso: el primer ataque se lleva la carta de protección por delante
        // y el corazón se salva. El atacante muere igual, como cuando revienta un corazón.
        st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== u.id);
        this.alCementerio(st, u);
        if (c.prot) {
          c.prot = false;
          st.log.unshift(`🛡️ ${u.icon} ${u.nombre} hace pedazos ${tc.protArt} ${tc.prot} y deja al descubierto el corazón de ${tc.nombre} griego (y muere).`);
        } else {
          c.vivo = false;
          st.log.unshift(`💔 ${u.icon} ${u.nombre} destruye el corazón de ${tc.nombre} griego (y muere).`);
        }
        st.movidas.push(u.id);
        this.comprobarFin(st);
        return { g: st, selUnidad: null };
      });
    }

    colocarAumento(fr, unidadId) {
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const carta = st.manoJ.find((c) => c.id === prev.selMano);
        if (!carta || carta.tipo !== "aumento" || st.fase !== "juego" || st.fin) return null;
        const tipoCor = carta.stat === "fuerza" ? "ataque" : "evasion";
        const cor = st.corazones.jugador[fr].find((c) => c && c.vivo && c.tipo === tipoCor && !c.carta);
        const u = st.tablero[fr].find((x) => x.id === unidadId);
        if (!cor || !u || u.dueño !== "jugador" || u.congelada || u.civ !== carta.civ) return null;
        st.manoJ = st.manoJ.filter((c) => c.id !== carta.id);
        cor.carta = this.cartaBase(carta);
        cor.unidadId = u.id;
        if (carta.stat === "fuerza") u.aumF = (u.aumF || 0) + carta.val; else u.aumE = (u.aumE || 0) + carta.val;
        st.log.unshift(`${carta.icon} ${carta.nombre} ocupa tu corazón de ${TIPOS_CORAZON[tipoCor].nombre}: ${u.icon} ${u.nombre} gana +${carta.val} de ${carta.stat === "fuerza" ? "ataque" : "evasión"}.`);
        return { g: st, selMano: null };
      });
    }

    invocarDios() {
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const carta = st.manoJ.find((c) => c.id === prev.selMano);
        if (!carta || carta.tipo !== "dios" || st.fase !== "juego" || st.fin) return null;
        if (this.mejorSumaDios(st, "jugador", carta.civ) < 5) return null;
        if (st.dios) {
          st.cementerio[st.dios.dueño === "jugador" ? "jugador" : "ia"].push(this.cartaBase(st.dios));
          st.log.unshift(`⚡ ${st.dios.icon} ${st.dios.nombre} es destronado del Abismo y destruido.`);
        }
        st.manoJ = st.manoJ.filter((c) => c.id !== carta.id);
        st.dios = { ...carta, dueño: "jugador" };
        st.log.unshift(`🌩️ ¡${carta.nombre} desciende al Abismo de los Dioses! ${carta.efecto}`);
        return { g: st, selMano: null };
      });
    }

    activarMagia() {
      const p = this.state;
      const carta = p.g.manoJ.find((c) => c.id === p.selMano);
      if (carta && carta.clave === "tornado") { this.setState({ tornadoElige: carta.id }); return; }
      if (carta && carta.clave === "buffCiv") { this.setState({ objetivoMagia: carta.id }); return; }
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const carta = st.manoJ.find((c) => c.id === prev.selMano);
        if (!carta || carta.tipo !== "magica" || st.fase !== "juego" || st.fin) return null;
        if (!this.frentesCanaliza(st, carta).length) return null;
        st.manoJ = st.manoJ.filter((c) => c.id !== carta.id);
        st.cementerio.jugador.push(this.cartaBase(carta));
        let revelar = prev.revelar;
        if (carta.clave === "portal") {
          st.portales = { activos: true };
          st.log.unshift(`🕳️ ${carta.nombre}: los DOS portales se abren en modo teletransporte. El puente entero vibra.`);
          this.liberarCongelados(st);
        } else if (carta.clave === "revelar") {
          revelar = { n: 10 };
          st.log.unshift(`👁️ ${carta.nombre}: la mano rival queda al descubierto durante 10 segundos.`);
          this._iniciarRevelar();
        } else if (carta.clave === "resucitar") {
          let idx = -1;
          for (let i = st.cementerio.jugador.length - 1; i >= 0; i--) {
            if (st.cementerio.jugador[i].tipo === "criatura") { idx = i; break; }
          }
          if (idx >= 0) {
            const cr = st.cementerio.jugador.splice(idx, 1)[0];
            st.manoJ.push({ ...cr, id: this.uid() });
            st.log.unshift(`✨ ${carta.icon} ${carta.nombre}: ${cr.icon} ${cr.nombre} vuelve a tu mano.`);
          } else {
            st.log.unshift(`✨ ${carta.icon} ${carta.nombre}: no había criaturas en tu cementerio.`);
          }
        } else if (carta.clave === "disipar") {
          let n = 0;
          for (const frH of st.corazones.ia) for (const cz of frH) if (cz && cz.carta) { this._liberarCorazon(st, "ia", cz); n++; }
          st.log.unshift(n ? `💨 ${carta.nombre}: ${n} aumento(s) del rival se desvanecen.` : `💨 ${carta.nombre}: el rival no tenía aumentos colocados.`);
        }
        return { g: st, selMano: null, revelar };
      });
    }

    ejecutarTornado(fr) {
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const carta = st.manoJ.find((c) => c.id === prev.tornadoElige);
        if (!carta) return { tornadoElige: null };
        st.manoJ = st.manoJ.filter((c) => c.id !== carta.id);
        st.cementerio.jugador.push(this.cartaBase(carta));
        for (const u of st.tablero[fr]) {
          this.soltarAumentos(st, u);
          if (u.cartaEncima) {
            const dst = u.cartaEncima.dueno === "jugador" ? st.manoJ : st.manoIA;
            dst.push({ ...u.cartaEncima.carta, id: this.uid() });
          }
          const dst = u.dueño === "jugador" ? st.manoJ : st.manoIA;
          dst.push(this.cartaBase(u));
        }
        st.tablero[fr] = [];
        st.log.unshift(`🌪️ ¡Tornado arrasa el frente ${fr === 0 ? "izquierdo" : "derecho"}! Todas las cartas vuelven a las manos de sus dueños.`);
        return { g: st, tornadoElige: null, selMano: null };
      });
    }

    aplicarObjetivo(fr, unidadId) {
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const carta = st.manoJ.find((c) => c.id === prev.objetivoMagia);
        if (!carta) return { objetivoMagia: null };
        const u = st.tablero[fr].find((x) => x.id === unidadId);
        if (!u) return null;
        st.manoJ = st.manoJ.filter((c) => c.id !== carta.id);
        st.cementerio.jugador.push(this.cartaBase(carta));
        u.buffF = (u.buffF || 0) + (carta.buff || 2);
        st.log.unshift(`${carta.icon} ${carta.nombre}: ${u.icon} ${u.nombre} gana +${carta.buff || 2} de ataque este turno.`);
        return { g: st, objetivoMagia: null, selMano: null };
      });
    }

    // ---------- farol de portal ----------
    farolTrigger(st, fr, unidadId) {
      if (st.farol) return;
      const u = st.tablero[fr].find((x) => x.id === unidadId);
      if (!u || u.congelada || !u.portal) return;
      if (u.dueño === "jugador") {
        if (st.manoIA.length && Math.random() < 0.7) {
          let idx = st.manoIA.findIndex((c) => c.tipo === "trampa");
          if (idx < 0 && Math.random() < 0.5) idx = Math.floor(Math.random() * st.manoIA.length);
          if (idx >= 0) {
            const carta = st.manoIA.splice(idx, 1)[0];
            st.farol = { etapa: "decision", fr, unidadId, carta };
            st.log.unshift(`🃏 La IA coloca una carta boca abajo sobre ${u.icon} ${u.nombre}…`);
          }
        }
      } else {
        st.farol = { etapa: "eligeCarta", fr, unidadId };
        st.log.unshift(`🌀 ${u.icon} ${u.nombre} de la IA aparece en el portal: puedes ponerle una carta boca abajo.`);
      }
    }

    resolverFarol(levanta) {
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const f = st.farol;
        if (!f || f.etapa !== "decision") return null;
        const u = st.tablero[f.fr].find((x) => x.id === f.unidadId);
        st.farol = null;
        if (!u) { st.cementerio.ia.push(f.carta); return { g: st }; }
        if (!levanta) {
          u.congelada = true;
          u.cartaEncima = { carta: f.carta, dueno: "ia" };
          st.log.unshift(`🧊 No te atreves a mirar: ${u.icon} ${u.nombre} queda congelado bajo la carta. Otro Agujero de Gusano lo liberará.`);
          return { g: st, selUnidad: null };
        }
        if (f.carta.tipo === "trampa") {
          this.soltarAumentos(st, u);
          u.dueño = "ia";
          u.girada = true;
          st.cementerio.ia.push(f.carta);
          st.log.unshift(`🎭 ¡Era ${f.carta.nombre}! ${u.icon} ${u.nombre} pasa al control de la IA.`);
        } else {
          st.manoJ.push({ ...f.carta, id: this.uid() });
          st.log.unshift(`😮‍💨 Era un farol (${f.carta.icon} ${f.carta.nombre}): ${u.nombre} vive y te quedas la carta de la IA.`);
        }
        this.comprobarFin(st);
        return { g: st };
      });
    }

    elegirCartaFarol(cartaId) {
      this.setState((prev) => {
        const st = this.clonar(prev.g);
        const f = st.farol;
        if (!f || f.etapa !== "eligeCarta") return null;
        const u = st.tablero[f.fr].find((x) => x.id === f.unidadId);
        st.farol = null;
        if (cartaId == null || !u) {
          st.log.unshift("Dejas pasar la ocasión: el personaje de la IA queda libre en el portal.");
          return { g: st };
        }
        const carta = st.manoJ.find((c) => c.id === cartaId);
        if (!carta) return { g: st };
        st.manoJ = st.manoJ.filter((c) => c.id !== cartaId);
        const levanta = Math.random() < 0.6;
        if (!levanta) {
          u.congelada = true;
          u.cartaEncima = { carta, dueno: "jugador" };
          st.log.unshift(`🧊 La IA no se atreve a mirar: su ${u.icon} ${u.nombre} queda congelado bajo tu carta.`);
        } else if (carta.tipo === "trampa") {
          this.soltarAumentos(st, u);
          u.dueño = "jugador";
          u.girada = true;
          st.cementerio.jugador.push(carta);
          st.log.unshift(`🎭 ¡La IA levanta tu carta y cae en ${carta.nombre}! ${u.icon} ${u.nombre} ahora es TUYO.`);
        } else {
          st.manoIA.push({ ...carta, id: this.uid() });
          st.log.unshift(`😬 La IA levanta tu carta (${carta.icon} ${carta.nombre}): era un farol y se la queda.`);
        }
        return { g: st, selMano: null };
      });
    }

    _iniciarRevelar() {
      if (this._revT) clearInterval(this._revT);
      this._revT = setInterval(() => {
        this.setState((s) => {
          const n = (s.revelar ? s.revelar.n : 0) - 1;
          if (n <= 0) { clearInterval(this._revT); this._revT = null; return { revelar: null }; }
          return { revelar: { n } };
        });
      }, 1000);
    }

    // ---------- turno de la IA ----------
    turnoIA(base) {
      const st = this.clonar(base);

      // 1 · Dios al Abismo
      const diosIA = st.manoIA.find((c) => c.tipo === "dios");
      if (diosIA && (!st.dios || st.dios.dueño === "jugador") && this.mejorSumaDios(st, "ia", diosIA.civ) >= 5) {
        if (st.dios) {
          st.cementerio[st.dios.dueño === "jugador" ? "jugador" : "ia"].push(this.cartaBase(st.dios));
          st.log.unshift(`⚡ ${st.dios.icon} ${st.dios.nombre} es destronado del Abismo y destruido.`);
        }
        st.manoIA = st.manoIA.filter((c) => c.id !== diosIA.id);
        st.dios = { ...diosIA, dueño: "ia" };
        st.log.unshift(`🌩️ ¡La IA invoca a ${diosIA.nombre} en el Abismo de los Dioses! ${diosIA.efecto}`);
      }

      // 1b · Aumentos a los corazones
      for (const carta of [...st.manoIA.filter((c) => c.tipo === "aumento")]) {
        const t = carta.stat === "fuerza" ? "ataque" : "evasion";
        for (let fr = 0; fr < 2; fr++) {
          const cor = st.corazones.ia[fr].find((c) => c && c.vivo && c.tipo === t && !c.carta);
          if (!cor) continue;
          const objs = st.tablero[fr].filter((u) => u.dueño === "ia" && !u.congelada && u.civ === carta.civ && u.tipo === "criatura");
          if (!objs.length) continue;
          const u = [...objs].sort((a, b) => (b.fuerza + b.esq) - (a.fuerza + a.esq))[0];
          st.manoIA = st.manoIA.filter((c) => c.id !== carta.id);
          cor.carta = this.cartaBase(carta);
          cor.unidadId = u.id;
          if (carta.stat === "fuerza") u.aumF = (u.aumF || 0) + carta.val; else u.aumE = (u.aumE || 0) + carta.val;
          st.log.unshift(`🔵 La IA coloca ${carta.icon} ${carta.nombre} en su corazón de ${TIPOS_CORAZON[t].nombre}: ${u.icon} ${u.nombre} +${carta.val}.`);
          break;
        }
      }

      for (let fr = 0; fr < 2; fr++) {
        if (!st.manoIA.length) break;
        const sacables = st.tablero[fr].filter((u) => u.dueño === "ia" && !u.congelada && this.esZonaInv({ fila: u.fila, carril: u.carril, portal: u.portal }, st))
          .sort((a, b) => a.fuerza - b.fuerza);
        const jugables = st.manoIA.filter((c) => {
          if (c.tipo !== "criatura") return false;
          const req = this.sacReq(c);
          return req === 0 || sacables.length >= req;
        });
        if (!jugables.length) continue;
        const amenaza = st.tablero[fr].filter((u) => u.dueño === "jugador").length;
        const defensas = st.tablero[fr].filter((u) => u.dueño === "ia").length;
        if (defensas > amenaza + 1 && Math.random() < 0.4) continue;
        const carta = [...jugables].sort((a, b) => b.fuerza - a.fuerza)[0];
        const req = this.sacReq(carta);
        if (req > 0) {
          const victimas = sacables.slice(0, req);
          if (victimas.length < req || victimas.some((v) => v.fuerza >= carta.fuerza)) continue;
          const hueco = { fila: victimas[0].fila, carril: victimas[0].carril };
          for (const v of victimas) {
            st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== v.id);
            this.alCementerio(st, v);
            st.log.unshift(`🩸 La IA sacrifica a ${v.icon} ${v.nombre}.`);
          }
          st.manoIA = st.manoIA.filter((c) => c.id !== carta.id);
          const nu = { ...carta, id: this.uid(), dueño: "ia", fila: hueco.fila, carril: hueco.carril, aumF: 0, aumE: 0 };
          st.tablero[fr].push(nu);
          st.log.unshift(`🔵 La IA invoca ${carta.icon} ${carta.nombre} sobre el hueco del sacrificio.`);
          continue;
        }
        const opciones = [0, 1].map((c) => ({ fila: NF - 1, carril: c })).filter((p) => !this.unidadEn(st, fr, p));
        if (!opciones.length) continue;
        const pos = opciones[0];
        st.manoIA = st.manoIA.filter((c) => c.id !== carta.id);
        const nu = { ...carta, id: this.uid(), dueño: "ia", fila: pos.fila, carril: pos.carril, aumF: 0, aumE: 0 };
        st.tablero[fr].push(nu);
        st.log.unshift(`🔵 La IA invoca ${carta.icon} ${carta.nombre}.`);
      }

      for (let fr = 0; fr < 2; fr++) {
        const mias = [...st.tablero[fr].filter((u) => u.dueño === "ia" && !u.congelada && !u.portal)].sort((a, b) => a.fila - b.fila);
        for (const u0 of mias) {
          const u = st.tablero[fr].find((x) => x.id === u0.id);
          if (!u || u.congelada) continue;
          if (u.fila === 0) {
            const c = st.corazones.jugador[fr][u.carril];
            if (c && c.vivo) {
              const tc = TIPOS_CORAZON[c.tipo];
              st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== u.id);
              this.alCementerio(st, u);
              if (c.prot) {
                c.prot = false;
                st.log.unshift(`🛡️ ${u.icon} ${u.nombre} hace pedazos tu ${tc.prot} y deja al descubierto tu corazón de ${tc.nombre} (y muere).`);
              } else {
                c.vivo = false;
                st.log.unshift(`💔 ${u.icon} ${u.nombre} destruye tu corazón de ${tc.nombre} (y muere).`);
              }
              continue;
            }
            const otro = { fila: 0, carril: 1 - u.carril };
            const oc = this.unidadEn(st, fr, otro);
            if (!oc) { u.fila = otro.fila; u.carril = otro.carril; continue; }
            if (oc.dueño === "jugador") this.combate(st, fr, u, oc);
            continue;
          }
          const candidatos = this.vecinos(st, fr, { fila: u.fila, carril: u.carril })
            .filter((v) => !v.portal && v.fila < u.fila)
            .sort((a, b) => a.fila - b.fila);
          let hecho = false;
          for (const v of candidatos) {
            if (!this.unidadEn(st, fr, v)) { u.fila = v.fila; u.carril = v.carril; hecho = true; break; }
          }
          if (!hecho) {
            for (const v of candidatos) {
              const oc = this.unidadEn(st, fr, v);
              if (oc && oc.dueño === "jugador") {
                const res = this.combate(st, fr, u, oc);
                if (res === "gana_atacante") {
                  const yo = st.tablero[fr].find((x) => x.id === u.id);
                  if (yo) { yo.fila = v.fila; yo.carril = v.carril; }
                }
                break;
              }
            }
          }
        }
      }

      this.comprobarFin(st);
      if (!st.fin) {
        if (!st.mazoJ.length) { st.fin = "derrota"; st.log.unshift("🕳️ Tu mazo se ha agotado. DERROTA."); }
        else {
          [st.mazoJ, st.manoJ] = this.robar(st.mazoJ, st.manoJ, 1);
          if (st.mazoIA.length) [st.mazoIA, st.manoIA] = this.robar(st.mazoIA, st.manoIA, 1);
          else { st.fin = "victoria"; st.log.unshift("🏆 El mazo griego se ha agotado. VICTORIA."); }
        }
      }
      st.turno = base.turno + 1;
      st.invocadoEnFrente = [false, false];
      st.movidas = [];
      for (const u of st.tablero.flat()) u.buffF = 0;
      st.log = st.log.slice(0, 40);
      return st;
    }

    terminarTurno() {
      const p = this.state;
      if (p.g.fin || p.g.eventos.length || p.g.farol || p.g.fase !== "juego" || p.huecosPendientes || p.tornadoElige || p.objetivoMagia) return;
      const st = this.turnoIA(p.g);
      this.setState({
        g: st, selMano: null, selUnidad: null, sacrificios: [], sacFr: null, sacCorazon: null,
        tornadoElige: null, objetivoMagia: null,
      }, () => this._syncDado());
    }

    cerrarEvento() {
      this.setState((prev) => ({ g: { ...prev.g, eventos: prev.g.eventos.slice(1) } }), () => this._syncDado());
    }

    _syncDado() {
      const ev = this.state.g.eventos[0];
      if (this._dadoTimer) { clearInterval(this._dadoTimer); this._dadoTimer = null; }
      if (!ev || this.state.dado.evId === ev.id) return;
      this.setState({ dado: { n: 1, parado: false, evId: ev.id } });
      let ticks = 0;
      this._dadoTimer = setInterval(() => {
        ticks++;
        if (ticks > 10) {
          clearInterval(this._dadoTimer); this._dadoTimer = null;
          this.setState({ dado: { n: ev.g1.tirada, parado: true, evId: ev.id } });
        } else {
          this.setState((s) => ({ dado: { ...s.dado, n: Math.floor(Math.random() * 12) + 1 } }));
        }
      }, 70);
    }

    // ---------- efectos visuales (Fase 2: pulido) ----------
    _capturarVuelo(cartaId) {
      const el = this.root.querySelector(`[data-mano="${cartaId}"]`);
      if (el) {
        const icon = el.querySelector(".mg-carta-icon");
        this._invFx = { rect: (icon || el).getBoundingClientRect() };
      }
    }

    _leerFx() {
      const m = new Map();
      this.root.querySelectorAll("[data-uid]").forEach((el) => {
        m.set(el.getAttribute("data-uid"), { rect: el.getBoundingClientRect(), icon: el.getAttribute("data-icon") });
      });
      return m;
    }

    _fxUpdate(rectsAntes) {
      const nuevos = this._leerFx();
      for (const [id, n] of nuevos) {
        const v = rectsAntes.get(id);
        const el = this.root.querySelector(`[data-uid="${id}"]`);
        if (!el || !n.rect.width) continue;
        if (v && v.rect.width) {
          const dx = v.rect.left - n.rect.left, dy = v.rect.top - n.rect.top;
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            el.animate([
              { transform: `translate(${dx}px,${dy}px)` },
              { transform: "translate(0,0)" },
            ], { duration: 420, easing: "cubic-bezier(.3,.7,.4,1)" });
          }
        } else if (rectsAntes.size || this._invFx) {
          if (this._invFx) {
            this._volarInvocacion(this._invFx, el);
            this._invFx = null;
          } else {
            el.animate([
              { transform: "scale(0)", opacity: 0, filter: "brightness(2.4) drop-shadow(0 0 14px rgba(110,240,170,.9))" },
              { transform: "scale(1.18)", opacity: 1, filter: "brightness(1.5)", offset: 0.65 },
              { transform: "scale(1)", filter: "brightness(1)" },
            ], { duration: 460, easing: "ease-out" });
          }
        }
      }
      for (const [id, v] of rectsAntes) {
        if (!nuevos.has(id)) this._spawnGhost(v.rect, v.icon);
      }
    }

    // la carta vuela desde la mano hasta la losa donde aparece la nueva unidad
    _volarInvocacion(inv, el) {
      if (!inv.rect || !inv.rect.width) return;
      const r1 = el.getBoundingClientRect();
      if (!r1.width) return;
      const d = document.createElement("div");
      d.className = "mg-vuelo";
      d.style.left = inv.rect.left + "px";
      d.style.top = inv.rect.top + "px";
      d.style.width = inv.rect.width + "px";
      d.style.height = inv.rect.height + "px";
      document.body.appendChild(d);
      const dx = r1.left + r1.width / 2 - (inv.rect.left + inv.rect.width / 2);
      const dy = r1.top + r1.height / 2 - (inv.rect.top + inv.rect.height / 2);
      const anim = d.animate([
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 60}px) scale(.8)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${dx}px,${dy}px) scale(.3)`, opacity: 0 },
      ], { duration: 520, easing: "cubic-bezier(.3,.6,.35,1)" });
      anim.onfinish = () => {
        d.remove();
        el.animate([
          { transform: "scale(0)", opacity: 0, filter: "brightness(2.6) drop-shadow(0 0 16px rgba(110,240,170,.9))" },
          { transform: "scale(1.22)", opacity: 1, filter: "brightness(1.7)", offset: 0.6 },
          { transform: "scale(1)", filter: "brightness(1)" },
        ], { duration: 380, easing: "ease-out" });
      };
    }

    _spawnGhost(rect, icon) {
      if (!rect || !rect.width) return;
      const d = document.createElement("div");
      d.className = "mg-ghost";
      d.style.left = rect.left + "px";
      d.style.top = rect.top + "px";
      d.style.width = rect.width + "px";
      d.style.height = rect.height + "px";
      d.textContent = icon || "💀";
      document.body.appendChild(d);
      d.animate([
        { transform: "translateY(0) rotate(0deg) scale(1)", opacity: 1, filter: "grayscale(0) brightness(1)" },
        { transform: "translateY(-16px) rotate(10deg) scale(1.05)", opacity: .9, filter: "grayscale(.5) brightness(1.4)", offset: .35 },
        { transform: "translateY(-38px) rotate(20deg) scale(.65)", opacity: 0, filter: "grayscale(1) brightness(.6)" },
      ], { duration: 780, easing: "ease-in" });
      setTimeout(() => d.remove(), 800);
    }

    _burstCorazon(key) {
      const el = this.root.querySelector(`[data-cor="${key}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const f = document.createElement("div");
      f.className = "mg-flash";
      f.style.left = cx - 60 + "px"; f.style.top = cy - 60 + "px";
      document.body.appendChild(f);
      f.animate([{ opacity: 1, transform: "scale(.3)" }, { opacity: 0, transform: "scale(1.8)" }], { duration: 520, easing: "ease-out" });
      setTimeout(() => f.remove(), 540);
      const root = this.root.querySelector(".mg-screen");
      if (root) root.animate([
        { transform: "translate(0,0)" }, { transform: "translate(6px,-4px)" }, { transform: "translate(-6px,4px)" },
        { transform: "translate(4px,-3px)" }, { transform: "translate(-3px,2px)" }, { transform: "translate(0,0)" },
      ], { duration: 360, easing: "linear" });
    }

    // Rotura de una protección: más pequeña que la de un corazón (no hay sacudida de
    // pantalla, que se reserva para cuando cae un corazón de verdad). Salen esquirlas
    // del color de la carta desde el centro de la propia carta.
    _burstProt(key) {
      const cont = this.root.querySelector(`[data-cor="${key}"]`);
      const el = cont && cont.querySelector(".mg-prot");
      if (!el) return;
      const [lado, fr, carril] = key.split("-");
      const cz = ((this.state.g.corazones[lado] || [])[Number(fr)] || [])[Number(carril)];
      const color = cz ? TIPOS_CORAZON[cz.tipo].color : "#d4a941";
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let i = 0; i < 10; i++) {
        const ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
        const dist = 34 + Math.random() * 26;
        const p = document.createElement("div");
        p.className = "mg-esquirla";
        p.style.left = cx + "px";
        p.style.top = cy + "px";
        p.style.background = color;
        document.body.appendChild(p);
        const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
        p.animate([
          { transform: "translate(-50%,-50%) rotate(0deg) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) rotate(${(180 + Math.random() * 180).toFixed(0)}deg) scale(.35)`, opacity: 0 },
        ], { duration: 620, easing: "cubic-bezier(.2,.7,.3,1)" });
        setTimeout(() => p.remove(), 640);
      }
    }

    // hilos de energía entre cada carta de aumento (corazón) y su personaje ligado
    _hilosLoop() {
      this._hilosCont = document.createElement("div");
      this._hilosCont.className = "mg-hilos-cont";
      document.body.appendChild(this._hilosCont);
      this._hiloEls = {};
      let dash = 0;
      const paso = () => {
        const g = this.state.g;
        const activos = {};
        dash = (dash + 0.5) % 14;
        if (g && g.corazones) for (const lado of ["jugador", "ia"]) for (let fr = 0; fr < 2; fr++) {
          (g.corazones[lado][fr] || []).forEach((cz, carril) => {
            if (!cz || !cz.vivo || !cz.carta || cz.unidadId == null) return;
            const key = `${lado}-${fr}-${carril}`;
            // El hilo sale de la carta de aumento, no del contenedor: desde que el
            // contenedor lleva también la protección y el altar, su centro ya no está
            // donde está la carta.
            const a = this.root.querySelector(`[data-cor-carta="${key}"]`) || this.root.querySelector(`[data-cor="${key}"]`);
            const b = this.root.querySelector(`[data-uid="${cz.unidadId}"]`);
            if (!a || !b) return;
            const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
            if (!ra.width || !rb.width) return;
            const x0 = ra.left + ra.width / 2, y0 = ra.top + ra.height / 2;
            const x1 = rb.left + rb.width / 2, y1 = rb.top + rb.height / 2;
            const len = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
            const color = (TIPOS_CORAZON[cz.tipo] || {}).color || "#d4a941";
            let el = this._hiloEls[key];
            if (!el) { el = document.createElement("div"); el.className = "mg-hilo"; this._hiloEls[key] = el; this._hilosCont.appendChild(el); }
            el.style.cssText = `left:${x0}px;top:${y0}px;width:${len}px;transform:rotate(${ang}rad);background:repeating-linear-gradient(90deg,${color} 0 7px,transparent 7px 14px);background-position:${-dash}px 0;filter:drop-shadow(0 0 3px ${color})`;
            activos[key] = true;
          });
        }
        for (const k in this._hiloEls) if (!activos[k]) { this._hiloEls[k].remove(); delete this._hiloEls[k]; }
        this._hilosRaf = requestAnimationFrame(paso);
      };
      paso();
    }

    reiniciar() {
      if (this._dadoTimer) clearInterval(this._dadoTimer);
      this.state = this.estadoInicial();
      this._mounted = false;
      this._corVivoPrev = null;
      this.render();
      this._mounted = true;
    }

    toggleVista() {
      this.setState((prev) => ({ camara: prev.camara === "mano" ? "campo" : "mano" }));
    }

    // ---------- pulsación larga (ver carta grande) ----------
    lpDown(carta) {
      return () => {
        this._lpFired = false;
        if (this._lpT) clearTimeout(this._lpT);
        this._lpT = setTimeout(() => { this._lpFired = true; this.setState({ verCarta: carta }); }, 450);
      };
    }
    lpUp() { return () => { if (this._lpT) clearTimeout(this._lpT); }; }
    lpCtx() { return (e) => e.preventDefault(); }

    // ---------- lámina holográfica (solo cartas especiales) ----------
    // Traduce la posición del ratón dentro de la carta a cuatro cosas: dónde cae la
    // franja de arcoíris, dónde cae la purpurina (que se desplaza siete veces menos,
    // y por eso parece estar en otro plano) y cuánto se inclina la carta en 3D.
    // Es la misma matemática del CodePen original, pero sin jQuery. Los estilos que
    // consumen estas variables están en css/estilo.css (.mg-carta.holo).
    //
    // El detalle del "--dur": la carta hace zoom en 220 ms al pasar el ratón, y ese
    // mismo tiempo de transición volvería lento el seguimiento del brillo. Así que se
    // espera a que el zoom termine y solo entonces se pone la transición a cero, para
    // que la inclinación vaya pegada al cursor. Al salir se restaura sola.
    // `zona` es el hueco que envuelve a la carta: los eventos se escuchan ahí (no se
    // pierden cuando la carta se amplía y se despega del cursor) pero las medidas se
    // siguen tomando de la carta, que es lo que hay que iluminar e inclinar.
    holo(carta, zona) {
      const oyente = zona || carta;
      const mover = (e) => {
        const r = carta.getBoundingClientRect();
        // fracción 0..1 dentro de la carta; el rectángulo ya viene escalado por el
        // zoom del lienzo y por el x1,5 del hover, pero al ser proporciones da igual
        const fx = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
        const fy = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
        const px = (1 - fx) * 100;
        const py = (1 - fy) * 100;
        const lp = 50 + (px - 50) / 1.5;
        const tp = 50 + (py - 50) / 1.5;
        carta.style.setProperty("--bgx", lp.toFixed(1) + "%");
        carta.style.setProperty("--bgy", tp.toFixed(1) + "%");
        carta.style.setProperty("--sparkx", (50 + (px - 50) / 7).toFixed(1) + "%");
        carta.style.setProperty("--sparky", (50 + (py - 50) / 7).toFixed(1) + "%");
        // inclinación suave: no pasa de unos 9 grados para que no maree
        carta.style.setProperty("--rx", (((tp - 50) / 2) * -1).toFixed(2) + "deg");
        carta.style.setProperty("--ry", (((lp - 50) / 1.5) * 0.5).toFixed(2) + "deg");
      };
      let t = null;
      oyente.addEventListener("pointerenter", () => {
        t = setTimeout(() => carta.style.setProperty("--dur", "0s"), 240);
      });
      oyente.addEventListener("pointermove", mover);
      oyente.addEventListener("pointerleave", () => {
        if (t) clearTimeout(t);
        ["--bgx", "--bgy", "--sparkx", "--sparky", "--rx", "--ry", "--dur"]
          .forEach((v) => carta.style.removeProperty(v));
      });
    }
    consumir() { if (this._lpFired) { this._lpFired = false; return true; } return false; }

    // ---------- cálculo de destinos y celdas ----------
    destinosValidos(g, selUnidad) {
      if (!selUnidad || g.fase !== "juego") return [];
      const u = g.tablero[selUnidad.fr].find((x) => x.id === selUnidad.id);
      if (!u || u.congelada || g.movidas.includes(u.id)) return [];
      const dest = [];
      for (const v of this.vecinos(g, selUnidad.fr, u.portal ? { portal: true } : { fila: u.fila, carril: u.carril })) {
        const frD = v.teletransporte ? 1 - selUnidad.fr : selUnidad.fr;
        const oc = this.unidadEn(g, frD, v);
        if (!oc || oc.dueño === "ia") dest.push({ ...v, fr: frD });
      }
      if (!u.portal && u.fila === NF - 1) {
        const c = g.corazones.ia[selUnidad.fr][u.carril];
        if (c && c.vivo) dest.push({ corazon: true, carril: u.carril });
      }
      return dest;
    }

    losaCelda(ctx, fr, pos) {
      const { g, cartaMano, dests, selUnidad, sacrificios, sacFr, huecosPendientes, eligiendo, sacCorazon, objetivo } = ctx;
      const u = this.unidadEn(g, fr, pos);
      const portalActivo = g.portales.activos;
      const zonaInv = this.esZonaInv(pos, g);
      const reqFr = cartaMano ? Math.max(0, (cartaMano.sac || 0) - (sacCorazon === fr ? 1 : 0)) : 0;
      const esObjetivo = !!(objetivo && u && u.dueño === "jugador" && !u.congelada &&
        this.frentesCanaliza(g, objetivo).includes(fr) && (!objetivo.civMagia || u.civ === objetivo.civMagia));
      const esAum = !!(cartaMano && cartaMano.tipo === "aumento" && g.fase === "juego" && u && u.dueño === "jugador" && !u.congelada && u.civ === cartaMano.civ && this.corazonAumLibre(g, "jugador", cartaMano, fr));
      const esCriatMano = !!(cartaMano && cartaMano.tipo === "criatura");
      const esInvocable = g.fase === "juego" && esCriatMano && reqFr === 0 && !u && !g.invocadoEnFrente[fr] && zonaInv && !huecosPendientes;
      const dest = dests.find((d) => !d.corazon && d.fr === fr && this.mismaPos(d, pos));
      const seleccionada = !!(selUnidad && u && u.id === selUnidad.id);
      const marcadaSac = !!(u && sacrificios.includes(u.id));
      const sacrificable = eligiendo && esCriatMano && reqFr > 0 && u && u.dueño === "jugador" && !u.congelada && !marcadaSac &&
        zonaInv && !g.invocadoEnFrente[fr] && (sacrificios.length === 0 || sacFr === fr) && sacrificios.length < reqFr;
      const esHueco = !!(huecosPendientes && !u && huecosPendientes.fr === fr && huecosPendientes.huecos.some((h) => this.mismaPos(h, pos)));
      const movida = !!(u && u.dueño === "jugador" && g.movidas.includes(u.id));
      const esLosaInv = !pos.portal && (pos.fila === 0 || pos.fila === NF - 1);

      let bg;
      if (esObjetivo || esAum) bg = "rgba(76,175,125,.34)";
      else if (dest) bg = "rgba(224,92,58,.34)";
      else if (esInvocable) bg = "rgba(212,169,65,.32)";
      else if (esHueco) bg = "rgba(212,169,65,.42)";
      else if (marcadaSac) bg = "rgba(160,40,40,.48)";
      else if (pos.portal && portalActivo) bg = "#170f24";
      else if (pos.portal) bg = "rgba(130,130,170,.08)";
      // Huecos en reposo, al estilo Yu-Gi-Oh: casi negros, para que el borde sea lo
      // único que los dibuje y no compitan con las ilustraciones de las cartas.
      // El color exacto lo calcula el CSS a partir del Dios en juego (ver --dios-color).
      else if (esLosaInv) bg = "var(--losa-fondo-inv)";
      else bg = "var(--losa-fondo)";

      let borde;
      if (esObjetivo || esAum) borde = "2px solid #4caf7d";
      else if (seleccionada || esHueco) borde = "2px solid #f0d27a";
      else if (marcadaSac) borde = "2px solid #c03030";
      else if (sacrificable) borde = "2px solid #8a3a3a";
      else if (dest) borde = "2px solid #e05c3a";
      else if (esInvocable) borde = "2px solid #d4a941";
      else if (pos.portal && portalActivo) borde = "2px solid #9a5fe0";
      else if (pos.portal) borde = "2px dashed var(--losa-borde-portal)";
      else if (esLosaInv) borde = "1.5px solid var(--losa-borde-inv)";
      else borde = "1.5px solid var(--losa-borde)";

      // Antes esto llevaba también "&& !cartaMano": con una carta de la mano elegida
      // no se podía coger ninguna ficha del tablero, y había que volver a pulsar la
      // carta para soltarla primero. Ahora se puede ir directo (ver onClick).
      const uSel = !!(u && u.dueño === "jugador" && !u.congelada && !movida);
      // Solo sirve para decidir si el cursor es una manita (ver _celdaEl); no decide
      // ninguna regla. Se incluye "|| !!u" porque ahora tocar cualquier ficha hace
      // algo —enseñarla en el panel—, así que sería mentir con el cursor no marcarlas.
      const clicable = esInvocable || !!dest || sacrificable || marcadaSac || esHueco || uSel || esObjetivo || esAum || !!u;

      const onClick = () => {
        if (this.consumir()) return;
        const s = this.state;
        if (s.g.fin || s.g.eventos.length || s.g.farol || s.g.fase !== "juego" || s.tornadoElige) return;
        if (s.objetivoMagia) { if (esObjetivo && u) this.aplicarObjetivo(fr, u.id); return; }
        if (esAum && u) { this.colocarAumento(fr, u.id); return; }
        if (s.huecosPendientes) { if (esHueco) this.colocarEnHueco(pos); return; }
        if (sacrificable) {
          if (reqFr === 1) return this.invocar(fr, pos, [u.id]);
          return this.marcarSacrificio(u, fr);
        }
        if (marcadaSac) { this.setState({ sacrificios: s.sacrificios.filter((id) => id !== u.id) }); return; }
        if (esInvocable) return this.invocar(fr, pos, []);
        if (dest) return this.mover(dest.fr, dest.portal ? { portal: true } : { fila: dest.fila, carril: dest.carril });
        // Tocar una ficha la enseña en grande en el panel de la izquierda, igual que
        // al tocar una carta de la mano. Vale para CUALQUIER ficha —las del rival y
        // las tuyas ya movidas incluidas—, porque esto es solo consultar: no mueve
        // nada ni cambia el turno. Va al final para no pisar ninguna jugada de
        // arriba (invocar, mover, sacrificar...): si la casilla tenía una acción
        // pendiente, esa acción manda y aquí no se llega.
        // Pulsar en el tablero SUELTA la carta de la mano que tuvieras elegida, sea
        // cual sea la casilla: son dos jugadas distintas y antes obligaba a volver a
        // pulsar la carta para deseleccionarla primero. Aquí solo se llega si el clic
        // no significaba nada para esa carta —invocar, sacrificar, aumentar y elegir
        // objetivo de una magia se resuelven todos más arriba y no pasan por aquí—,
        // así que soltarla nunca pisa una jugada buena.
        const soltarMano = s.selMano != null
          ? { selMano: null, sacrificios: [], sacFr: null, sacCorazon: null }
          : null;
        if (u) {
          // volver a tocar la misma ficha la quita del panel, igual que en la mano
          const cambios = { verTablero: s.verTablero === u.id ? null : u.id, ...soltarMano };
          // si además es una unidad tuya que puede moverse, se sigue seleccionando
          // para mover exactamente igual que antes
          if (uSel) cambios.selUnidad = seleccionada ? null : { fr, id: u.id };
          this.setState(cambios);
          return;
        }
        if (soltarMano) { this.setState(soltarMano); return; }
      };

      return { u, bg, borde, clicable, onClick, movida, seleccionada, esHueco, esPortal: !!pos.portal, portalActivo, marcadaSac };
    }

    // ---------- construcción del DOM ----------
    // Mazo y cementerio van anclados a las esquinas del campo (como en Yu-Gi-Oh),
    // no en filas propias: así no roban altura y refuerzan la sensación de tablero.
    _pilasRow(nCement, nMazo, labelCement, labelMazo, donde) {
      const row = document.createElement("div");
      row.className = "mg-pilas " + donde;
      const mk = (n, label) => {
        const w = document.createElement("div"); w.className = "mg-pila-wrap";
        const box = document.createElement("div"); box.className = "mg-pila" + (n > 0 ? " con-cartas" : "");
        const badge = document.createElement("div"); badge.className = "mg-pila-badge"; badge.textContent = String(n);
        box.appendChild(badge);
        const lab = document.createElement("div"); lab.className = "mg-pila-label"; lab.textContent = label;
        w.appendChild(box); w.appendChild(lab);
        return w;
      };
      row.appendChild(mk(nCement, labelCement));
      const mazo = mk(nMazo, labelMazo);
      // Marca para saber de dónde salen volando las cartas al robar.
      mazo.dataset.mazo = donde === "abajo" ? "jugador" : "ia";
      row.appendChild(mazo);
      return row;
    }

    _renderAbismo(g, s) {
      const tema = temaAbismo(g.dios);
      const d = document.createElement("div");
      d.className = "mg-abismo" + (g.dios ? "" : " vacio");
      d.dataset.abismo = "1";
      d.style.setProperty("--abismo-color", tema.color);

      // Capa donde se pinta la imagen del tema. Mientras no haya archivo se queda
      // vacía y no se pide nada al servidor (ver TEMAS_ABISMO arriba del todo).
      const fondo = document.createElement("div");
      fondo.className = "mg-abismo-fondo";
      if (tema.imagen) fondo.style.backgroundImage = `url("${tema.imagen}")`;
      d.appendChild(fondo);

      if (g.dios) {
        const box = document.createElement("div");
        box.className = "mg-dios " + (g.dios.dueño === "jugador" ? "vikinga" : "griega");
        box.title = `${g.dios.nombre}: ${g.dios.efecto}`;
        box.onclick = () => this.setState({ verCarta: g.dios });
        // Profundidad real (translateZ sobre la perspectiva del abismo) en vista de
        // campo, donde luce. En vista de mano el tablero se tumba 38° y una carta que
        // sobresale se monta encima de lo de detrás, así que se repliega casi a cero:
        // conserva el tamaño pero deja de sobresalir.
        const cam = s ? s.camara : "campo";
        box.style.transform = this._tfDios(cam);
        if (this._camaraPrev !== undefined && this._camaraPrev !== cam) {
          this._animCamara.push([box, [
            { transform: this._tfDios(this._camaraPrev) },
            { transform: box.style.transform },
          ]]);
        }
        box.innerHTML = `<div class="mg-dios-icon">${g.dios.icon}</div><div class="mg-dios-nombre">${g.dios.nombre}</div><div class="mg-dios-dueno">${g.dios.dueño === "jugador" ? "TUYO" : "DE LA IA"}</div>`;
        d.appendChild(box);
      } else {
        const hueco = document.createElement("div");
        hueco.className = "mg-dios-hueco";
        d.appendChild(hueco);
      }
      return d;
    }

    // Pinta el tinte del fondo de la pantalla según el Dios en juego, y lanza el
    // destello de onda expansiva la primera vez que aparece uno nuevo.
    _aplicarTemaAbismo(g) {
      const tema = temaAbismo(g.dios);
      if (!this._tinte) {
        this._tinte = document.createElement("div");
        this._tinte.className = "mg-tinte";
        document.body.appendChild(this._tinte);
      }
      this._tinte.style.backgroundColor = tema.tinte;
      // Un único color manda sobre todo el ambiente del tablero: los bordes y fondos
      // en reposo se derivan de él con color-mix en el CSS. Los colores que SIGNIFICAN
      // algo en la partida (verde objetivo, rojo destino, dorado invocable) no dependen
      // de esto a propósito: si viraran, dejarían de leerse.
      document.documentElement.style.setProperty("--dios-color", tema.color);

      const nombreAhora = g.dios ? g.dios.nombre : null;
      if (this._diosPrev !== undefined && this._diosPrev !== nombreAhora && nombreAhora) {
        this._destelloDios(tema.color);
      }
      this._diosPrev = nombreAhora;
    }

    // Vuelo de las cartas recién robadas: salen del mazo, giran y aterrizan en la mano.
    // Se usa tanto al empezar la partida (las 7 de golpe, escalonadas) como en el robo
    // de cada turno. Compara los identificadores de la mano con los del render anterior.
    _volarRobadas() {
      const cartas = [...this.root.querySelectorAll("[data-mano]")];
      const idsAhora = cartas.map((c) => c.getAttribute("data-mano"));
      const previas = this._manoPrev || [];
      this._manoPrev = idsAhora;

      const mazo = this.root.querySelector('[data-mazo="jugador"]');
      if (!mazo) return;
      const nuevas = cartas.filter((c) => !previas.includes(c.getAttribute("data-mano")));
      if (!nuevas.length) return;

      const rm = mazo.getBoundingClientRect();
      if (!rm.width) return;
      nuevas.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        const dx = rm.left + rm.width / 2 - (r.left + r.width / 2);
        const dy = rm.top + rm.height / 2 - (r.top + r.height / 2);
        const retraso = i * 95;
        // composite "add" para sumarse al giro en abanico que ya tiene cada carta,
        // en vez de pisarlo y dejarlas todas rectas al terminar.
        el.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(.34) rotate(-14deg)` },
          { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
        ], { duration: 640, delay: retraso, easing: "cubic-bezier(.25,.9,.3,1)", fill: "backwards", composite: "add" });
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: retraso, fill: "backwards" });
      });
    }

    _destelloDios(color) {
      const ab = this.root.querySelector("[data-abismo]");
      if (!ab) return;
      const r = ab.getBoundingClientRect();
      const onda = document.createElement("div");
      onda.className = "mg-onda-dios";
      onda.style.left = (r.left + r.width / 2) + "px";
      onda.style.top = (r.top + r.height / 2) + "px";
      onda.style.borderColor = color;
      document.body.appendChild(onda);
      onda.addEventListener("animationend", () => onda.remove());
    }

    // Dibujo de la carta de protección. Va en SVG y con `currentColor`, así que hereda
    // el color del corazón desde el CSS y no hay que repetirlo aquí.
    _artProt(tipo) {
      const art = document.createElement("div");
      art.className = "mg-prot-art";
      art.innerHTML = ART_PROT[tipo] || "";
      return art;
    }

    _corazonesRow(g, fr, lado, dests, s) {
      const row = document.createElement("div");
      const esJ = lado === "jugador";
      // La animación de forja solo se pone en el PRIMER montaje. Todo el DOM se rehace en
      // cada render, y una animación de CSS sí arranca en un elemento recién insertado
      // (al revés que una transición): sin este freno, cualquier clic volvía a hacer
      // aparecer de golpe los 8 corazones y las 8 protecciones.
      const naciendo = this._mounted ? "" : " naciendo";
      // La protección mira siempre al enemigo: encima del corazón en tu lado y debajo
      // en el de la IA. La clase `ia` es la que da la vuelta al montaje en el CSS.
      row.className = "mg-corazones" + (esJ ? "" : " ia");
      for (let carril = 0; carril < 2; carril++) {
        const cz = g.corazones[lado][fr][carril];
        const tc = cz ? TIPOS_CORAZON[cz.tipo] : null;
        const key = `${lado}-${fr}-${carril}`;
        let atacable = false;
        if (!esJ) atacable = dests.some((d) => d.corazon && d.carril === carril) && s.selUnidad && s.selUnidad.fr === fr;

        const cell = document.createElement("div");
        cell.className = "mg-corazon-cont";
        cell.setAttribute("data-cor", key);

        // El rótulo se pinta SIEMPRE y lo enseña el CSS con :hover. Antes se guardaba el
        // corazón señalado en el estado, y eso redibujaba el juego entero cada vez que el
        // ratón entraba o salía: como todas las piezas se crean de cero en cada render,
        // volvían a lanzar su animación de aparición y el tablero parpadeaba.
        if (cz && cz.vivo) {
          const tip = document.createElement("div");
          tip.className = "mg-corazon-tip";
          tip.style.borderColor = tc.color;
          tip.style.boxShadow = `0 4px 12px rgba(0,0,0,.6), 0 0 8px ${tc.color}44`;
          const partes = [tc.nombre, cz.prot ? tc.prot : `${tc.prot} (rota)`];
          if (cz.carta) partes.push(cz.carta.nombre);
          tip.textContent = partes.join(" · ");
          cell.appendChild(tip);
        }

        if (!cz) {
          const ico = document.createElement("div");
          ico.className = "mg-corazon-icovacio";
          ico.textContent = "🤍";
          cell.appendChild(ico);
        } else if (cz.vivo) {
          // El corazón se queda siempre igual: altar con su emoji. Lo que cambia es que
          // ahora lo tapa a medias la carta de protección.
          const altar = document.createElement("div");
          altar.className = "mg-corazon-altar" + naciendo + (atacable && !cz.prot ? " atacable" : "");
          altar.style.borderColor = tc.color;
          if (!(atacable && !cz.prot)) altar.style.boxShadow = `0 0 5px ${tc.color}66, inset 0 0 6px rgba(0,0,0,.6)`;
          const punt = document.createElement("div"); punt.className = "mg-corazon-punteado";
          const emo = document.createElement("div"); emo.className = "mg-corazon-emoji";
          emo.style.filter = `drop-shadow(0 0 4px ${tc.color})`;
          emo.textContent = tc.emoji;
          altar.appendChild(punt); altar.appendChild(emo);
          cell.appendChild(altar);

          // Carta de protección, del tamaño de una casilla (58x68). Al romperse deja el
          // hueco marcado con línea de puntos: se ve que el corazón está expuesto.
          this._protFx = this._protFx || {};
          const rompiendo = !cz.prot && !!(this._protFx[key] && Date.now() - this._protFx[key] < 1400);
          const prot = document.createElement("div");
          prot.className = "mg-prot" + (cz.prot ? naciendo : rompiendo ? " rompiendo" : " rota") + (atacable && cz.prot ? " atacable" : "");
          prot.style.setProperty("--prot-color", tc.color);
          if (cz.prot || rompiendo) prot.appendChild(this._artProt(cz.tipo));
          cell.appendChild(prot);

          // El aumento se apoya ENCIMA de la protección, desplazado unos píxeles para que
          // se siga viendo el dibujo de debajo, como dos cartas apiladas de verdad.
          if (cz.carta) {
            const cta = document.createElement("div");
            // esta sí se anima cada vez que se COLOCA, comparando con el render anterior
            cta.className = "mg-corazon-carta" + ((this._cartaCorNueva && this._cartaCorNueva[key]) ? " naciendo" : "");
            cta.setAttribute("data-cor-carta", key);
            cta.style.borderColor = tc.color;
            cta.style.boxShadow = `0 3px 9px rgba(0,0,0,.7), 0 0 9px ${tc.color}55`;
            const ic = document.createElement("div"); ic.className = "mg-corazon-carta-icon"; ic.textContent = cz.carta.icon;
            const vl = document.createElement("div"); vl.className = "mg-corazon-carta-val"; vl.textContent = `+${cz.carta.val}`;
            cta.appendChild(ic); cta.appendChild(vl);
            cell.appendChild(cta);
          }
        } else {
          // Corazón muerto: ni altar ni protección (para llegar aquí la carta ya se
          // rompió). Solo el rastro, en el sitio que ocupaba el altar.
          this._corFx = this._corFx || {};
          const roto = !!(this._corFx[key] && Date.now() - this._corFx[key] < 1500);
          const resto = document.createElement("div");
          resto.className = "mg-corazon-resto";
          if (roto) {
            const r = document.createElement("div"); r.className = "mg-corazon-roto"; r.textContent = "💔";
            resto.appendChild(r);
          } else {
            const c = document.createElement("div"); c.className = "mg-corazon-ceniza";
            resto.appendChild(c);
          }
          cell.appendChild(resto);
        }

        cell.style.cursor = atacable ? "pointer" : "default";
        if (atacable) cell.onclick = () => this.atacarCorazon(fr, carril);
        row.appendChild(cell);
      }
      return row;
    }

    _celdaEl(info) {
      const cell = document.createElement("div");
      cell.className = "mg-losa" + (info.esHueco ? " hueco" : "");
      cell.style.background = info.bg;
      cell.style.border = info.borde;
      cell.style.cursor = info.clicable ? "pointer" : "default";
      if (info.esPortal && !info.u) {
        cell.textContent = info.portalActivo ? "🌀" : "";
        cell.style.fontSize = "18px";
      }
      if (info.u) {
        cell.style.opacity = info.movida && !info.seleccionada ? ".55" : "1";
        const u = info.u;
        const glow = u.dueño === "jugador" ? "#e08a4a" : "#4a9de0";
        let borde = u.dueño === "jugador" ? CIV.vikinga.color : CIV.griega.color;
        let sombra = "0 2px 6px rgba(0,0,0,.6)";
        if ((u.aumF || 0) > 0) sombra += ",0 0 9px #e05c3a";
        else if ((u.aumE || 0) > 0) sombra += ",0 0 9px #4a9de0";
        if (info.seleccionada) { borde = "#f0d27a"; sombra = "0 0 12px #f0d27a"; }
        const ficha = document.createElement("div");
        ficha.className = "mg-ficha";
        ficha.style.borderColor = borde;
        ficha.style.boxShadow = sombra;
        ficha.setAttribute("data-uid", String(u.id));
        ficha.setAttribute("data-icon", u.icon);
        if (u.girada) ficha.classList.add("girada");
        const icon = document.createElement("div"); icon.className = "mg-ficha-icon"; icon.textContent = u.icon;
        icon.style.filter = `drop-shadow(0 0 4px ${glow})`;
        const magColor = u.magia >= 5 ? "#8ec8e8" : u.magia ? "#4caf7d" : "#4a5266";
        const stats = document.createElement("div"); stats.className = "mg-ficha-stats";
        stats.innerHTML = `<span class="atq">${u.fuerza + (u.aumF || 0) + (u.buffF || 0)}⚔</span><span class="mag" style="color:${magColor}">${ROMANO[u.magia]}</span>`;
        const esq = document.createElement("div"); esq.className = "mg-ficha-esq"; esq.textContent = `${u.esq + (u.aumE || 0)}🌀`;
        ficha.appendChild(icon); ficha.appendChild(stats); ficha.appendChild(esq);
        ficha.onpointerdown = this.lpDown(u);
        ficha.onpointerup = this.lpUp();
        ficha.onpointerleave = this.lpUp();
        ficha.oncontextmenu = this.lpCtx();
        cell.appendChild(ficha);
        if (u.congelada) {
          const overlay = document.createElement("div");
          overlay.className = "mg-congelada-overlay";
          overlay.textContent = "?";
          cell.appendChild(overlay);
        }
        if (info.marcadaSac) {
          const sangre = document.createElement("div");
          sangre.className = "mg-sac-marcador";
          sangre.textContent = "🩸";
          cell.appendChild(sangre);
        }
      }
      cell.onclick = info.onClick;
      return cell;
    }

    _filaTablero(ctx, fr, fila) {
      const row = document.createElement("div");
      row.className = "mg-fila";
      const izq = fr === 0;
      row.style.transform = `translateZ(${ARCO[fila]}px)`;
      if (fila === FILA_CENTRO) {
        // Fila del cuello: una única casilla, más ancha y centrada.
        const centro = this._celdaEl(this.losaCelda(ctx, fr, { fila, carril: 0 }));
        centro.classList.add("mg-losa-centro");
        row.appendChild(centro);
      } else {
        const celdas = [];
        celdas.push(this._celdaEl(this.losaCelda(ctx, fr, { fila, carril: 0 })));
        const linkH = document.createElement("div");
        linkH.className = "mg-cadena-h";
        celdas.push(linkH);
        celdas.push(this._celdaEl(this.losaCelda(ctx, fr, { fila, carril: 1 })));
        celdas.forEach((c) => row.appendChild(c));
      }
      if (fila === FILA_CENTRO) {
        // El portal va suelto (posición absoluta), no dentro del flujo de la fila.
        // Si formara parte del flex empujaría las dos columnas 33 px hacia un lado
        // y esa fila dejaría de cuadrar con las otras seis.
        const portal = this._celdaEl(this.losaCelda(ctx, fr, { portal: true }));
        portal.classList.add("mg-losa-portal", izq ? "izq" : "der");
        row.appendChild(portal);
      }
      return row;
    }

    // Cadenas entre filas. En el tablero de reloj de arena todas las uniones van de
    // una fila de dos casillas a la casilla central, así que se dibujan en diagonal
    // convergiendo hacia el medio, como en el boceto.
    _cadenaRow(fr, tz, diagonal, cuelloArriba) {
      const row = document.createElement("div");
      // `cuelloArriba` invierte el sentido de las diagonales: si el cuello queda encima
      // se abren hacia fuera, y si queda debajo convergen hacia él.
      row.className = "mg-cadena-fila" + (diagonal ? " diagonal" : "") + (diagonal && cuelloArriba ? " cuello-arriba" : "");
      // Z intermedia entre las dos filas que une, para que la comba sea continua.
      row.style.transform = `translateZ(${tz}px)`;
      for (let i = 0; i < 2; i++) {
        const slot = document.createElement("div");
        slot.className = "mg-cadena-slot";
        const link = document.createElement("div");
        // Solo van inclinadas las que unen una fila de dos casillas con el cuello.
        // Las de los corazones cuelgan rectas de su propia columna.
        link.className = "mg-cadena-v" + (diagonal ? (i === 0 ? " diag-izq" : " diag-der") : "");
        slot.appendChild(link);
        row.appendChild(slot);
      }
      return row;
    }

    _renderFrente(fr, g, s, cartaMano, objetivo, dests, eligiendo) {
      const wrap = document.createElement("div");
      wrap.className = "mg-frente";
      const ctx = { g, cartaMano, objetivo, dests, selUnidad: s.selUnidad, sacrificios: s.sacrificios, sacFr: s.sacFr, huecosPendientes: s.huecosPendientes, eligiendo, sacCorazon: s.sacCorazon };
      wrap.appendChild(this._corazonesRow(g, fr, "ia", dests, s));
      wrap.appendChild(this._cadenaRow(fr, 0));
      for (let f = NF - 1; f >= 0; f--) {
        wrap.appendChild(this._filaTablero(ctx, fr, f));
        // Solo van en diagonal las dos uniones que tocan el cuello central. Cuando
        // f es la fila del cuello, el cuello queda ARRIBA de esa unión.
        if (f > 0) wrap.appendChild(this._cadenaRow(fr, (ARCO[f] + ARCO[f - 1]) / 2, f === FILA_CENTRO || f - 1 === FILA_CENTRO, f === FILA_CENTRO));
      }
      wrap.appendChild(this._cadenaRow(fr, 0));
      wrap.appendChild(this._corazonesRow(g, fr, "jugador", dests, s));
      return wrap;
    }

    // Transformaciones que dependen de la cámara, en un solo sitio para poder calcular
    // también la de la vista anterior y animar entre las dos.
    _tfManoIA(camara) {
      return camara === "mano" ? "rotateX(0deg) scale(.72) translateY(-6px)" : "rotateX(0deg) scale(.8)";
    }
    _tfDios(camara) {
      return camara === "mano" ? "translateZ(6px) scale(1.16)" : "translateZ(40px) scale(1.10)";
    }

    // Las manos y la carta de Dios se vuelven a crear en cada render, así que sus
    // transiciones de CSS nunca llegan a dispararse: saltaban de golpe mientras el
    // tablero se deslizaba 900 ms, y el tablero llegaba solo y con retraso. Aquí se les
    // lanza la animación a mano, ya montadas en el DOM, con la misma duración y curva
    // que el tablero. Se encola durante el render y se ejecuta justo después.
    _correrAnimCamara() {
      const opts = { duration: 900, easing: "cubic-bezier(.4,0,.2,1)" };
      for (const [el, keyframes] of this._animCamara) el.animate(keyframes, opts);
      this._animCamara = [];
    }

    _renderMano(g, s) {
      const bar = document.createElement("div");
      bar.className = "mg-mano";
      bar.style.cssText = `position:fixed;left:0;right:0;bottom:0;padding:${s.camara === "mano" ? "22px 12px 18px" : "16px 12px 12px"};background:linear-gradient(0deg,rgba(8,10,16,.92) 0%,rgba(8,10,16,.55) 55%,transparent);display:flex;gap:0;overflow:visible;z-index:20;justify-content:center;align-items:flex-end;transition:padding .5s;box-sizing:border-box`;

      // La carta de la mano es la de 300x485 a escala: 124x201 con la cámara en mano y
      // 100x162 en campo (misma proporción, 1:1,617). Antes solo se fijaba el ANCHO y
      // el alto lo ponía el texto del efecto, así que cada carta medía una cosa —de 150
      // a 194— y el abanico salía desigual. Ver la escalera de tamaños en el comentario
      // grande de .mg-carta-grande, en css/estilo.css.
      const anchoCarta = s.camara === "mano" ? 124 : 100;
      const altoCarta = s.camara === "mano" ? 201 : 162;
      const nM = g.manoJ.length, mitadM = (nM - 1) / 2;
      const vw = LIENZO_W; // el ancho de referencia es el del lienzo, no el de la ventana
      const solape = nM > 1 ? Math.max(0, Math.min(anchoCarta - 42, (nM * anchoCarta + 48 - Math.min(vw, 1100)) / (nM - 1))) : 0;
      // En vista de campo la mano se hunde para no comerse el tablero, pero lo que se
      // fija es CUÁNTO ASOMA, no cuánto baja: si se fija el hundido, al cambiar el alto
      // de la carta se descuadra solo. Pasó justo eso al bajar de ~170 a 162: con los
      // 152 de antes asomaban 10 px, y las de los extremos —que además caen por el arco
      // del abanico— desaparecían enteras. Con 80 (lo pidió Adrii, subiendo desde 62)
      // asoma el nombre y buena parte del dibujo en todas, incluidas las de las puntas.
      const ASOMA_CAMPO = 80;
      const hundir = s.camara === "mano" ? 0 : altoCarta - ASOMA_CAMPO;

      // Valores equivalentes con la cámara del render anterior, para poder animar
      // cada carta desde donde estaba en vez de dejarla saltar.
      const camPrev = this._camaraPrev;
      const cambioCam = camPrev !== undefined && camPrev !== s.camara;
      const anchoPrev = camPrev === "mano" ? 124 : 100;
      const altoPrev = camPrev === "mano" ? 201 : 162;
      const hundirPrev = camPrev === "mano" ? 0 : altoPrev - ASOMA_CAMPO;
      const solapePrev = nM > 1 ? Math.max(0, Math.min(anchoPrev - 42, (nM * anchoPrev + 48 - Math.min(vw, 1100)) / (nM - 1))) : 0;
      const medallon = (mVal) => {
        const color = mVal >= 5 ? "#8ec8e8" : mVal ? "#4caf7d" : "#3a4258";
        const txt = mVal >= 5 ? "#8ec8e8" : mVal ? "#4caf7d" : "#4a5266";
        const glow = mVal >= 5 ? "box-shadow:0 0 12px rgba(142,200,232,.55);" : mVal ? "box-shadow:0 0 10px rgba(76,175,125,.35);" : "";
        return `<div class="mg-carta-medallon" style="border:1.5px solid ${color};font-size:${mVal ? "14" : "17"}px;color:${txt};${glow}">${ROMANO[mVal]}</div>`;
      };

      g.manoJ.forEach((c, i) => {
        const sel = s.selMano === c.id;
        const civ = CIV[c.civ] || CIV.vikinga;
        const m = c.magia || 0;
        const esT = c.tipo === "trampa", esD = c.tipo === "dios";
        let fondo = "linear-gradient(170deg,#1c2230,#12161f)";
        if (esT) fondo = "radial-gradient(1px 1px at 20% 30%,#fff,transparent 2px),radial-gradient(1px 1px at 70% 60%,#cbd5ff,transparent 2px),radial-gradient(1px 1px at 40% 82%,#fff,transparent 2px),radial-gradient(1px 1px at 85% 20%,#e9d5ff,transparent 2px),linear-gradient(170deg,#14141c,#0a0a12)";
        if (esD) fondo = "linear-gradient(170deg,#2a2410,#14100a)";

        const rot = (i - mitadM) * Math.min(5, 44 / Math.max(nM - 1, 1));
        const arco = Math.pow(Math.abs(i - mitadM), 1.55) * 5;
        const totalM = nM * anchoCarta - (nM - 1) * solape;
        const cx = (vw - totalM) / 2 + i * (anchoCarta - solape) + anchoCarta / 2;
        const half = (anchoCarta * 1.5) / 2 + 10;
        const shift = cx - half < 0 ? half - cx : cx + half > vw ? vw - half - cx : 0;
        // el zoom al pasar el ratón se deja a :hover en CSS (no a estado de React/JS):
        // esta app reconstruye todo el DOM en cada render(), así que un hover manejado
        // por estado no tiene "elemento anterior" del que partir la transición y el
        // zoom aparecería de golpe en vez de animarse. --shift/--hover-y llevan los
        // valores por carta (dependen del índice) hasta la regla :hover del CSS.
        const tf = sel ? "translateY(-34px) scale(1.18) rotate(0deg)" : `rotate(${rot}deg) translateY(${arco + hundir}px)`;
        const bajada = sel ? -34 : arco + hundir;   // lo que la carta baja dentro de su hueco

        // El HUECO: ocupa el sitio en la fila y no se mueve nunca. Es él quien recibe
        // el :hover, así el zoom no parpadea cuando la carta se despega del cursor
        // (ver .mg-carta-zona en css/estilo.css). También se lleva el ancho, el solape
        // y el orden de apilado, que antes iban en la carta.
        const zona = document.createElement("div");
        zona.className = "mg-carta-zona";
        zona.style.cssText = `min-width:${anchoCarta}px;width:${anchoCarta}px;height:${altoCarta}px;margin-left:${i > 0 ? -solape : 0}px;z-index:${sel ? 100 : i + 1};box-sizing:border-box`;
        zona.style.setProperty("--bajada", `${bajada}px`);
        zona.style.setProperty("--alza", `${44 + arco}px`);

        const card = document.createElement("div");
        // Dioses, mágicas y trampas llevan lámina holográfica; las tropas normales no.
        // Así el brillo significa "carta especial" en vez de ser puro adorno.
        const esEspecial = esD || esT || c.tipo === "magica";
        card.className = "mg-carta" + (esEspecial ? " holo" : "");
        card.setAttribute("data-mano", String(c.id));
        // La transición de aquí es la de la VUELTA (0,8 s frenando al final); la de la
        // subida vive en la regla :hover del CSS. Ver el comentario de .mg-carta-zona.
        card.style.cssText = `user-select:none;-webkit-user-select:none;width:100%;height:100%;border-radius:10px;padding:5px 5px 4px;cursor:pointer;background:${fondo};border:1.5px solid ${sel ? "#f0d27a" : esD ? "#d4a941" : civ.color};transform:${tf};transform-origin:50% 100%;position:relative;z-index:1;transition:all .8s cubic-bezier(.19,1,.22,1);box-shadow:${sel ? "0 14px 34px rgba(0,0,0,.65), 0 6px 16px rgba(240,210,122,.25)" : "0 3px 10px rgba(0,0,0,.45)"};display:flex;flex-direction:column;box-sizing:border-box;filter:${g.fase === "juego" ? "none" : "saturate(.45) brightness(.62)"}`;
        card.style.setProperty("--shift", `${shift.toFixed(0)}px`);
        card.style.setProperty("--hover-y", `-${44 + arco}px`);

        if (cambioCam) {
          // el giro y el arco son de la carta; el ancho y el solape, del hueco
          const tfPrev = sel ? tf : `rotate(${rot}deg) translateY(${arco + hundirPrev}px)`;
          this._animCamara.push([card, [{ transform: tfPrev }, { transform: tf }]]);
          this._animCamara.push([zona, [
            { width: `${anchoPrev}px`, minWidth: `${anchoPrev}px`, height: `${altoPrev}px`, marginLeft: `${i > 0 ? -solapePrev : 0}px` },
            { width: `${anchoCarta}px`, minWidth: `${anchoCarta}px`, height: `${altoCarta}px`, marginLeft: `${i > 0 ? -solape : 0}px` },
          ]]);
        }

        let statsHtml;
        if (c.tipo === "criatura") {
          const sacTxt = c.sac ? `<div class="mg-carta-sac">${"🩸".repeat(c.sac)}</div>` : "";
          statsHtml = `<div class="mg-carta-stats"><span class="atq">${c.fuerza}⚔</span>${medallon(m)}<span class="esq">${c.esq}🌀</span></div>${sacTxt}`;
        } else if (c.tipo === "magica") {
          statsHtml = `<div class="mg-carta-stats-magica"><span>${c.cat === "civilizacion" ? "MÁG. CIVILIZACIÓN" : "MÁGICA"}</span>${medallon(m)}</div>`;
        } else if (c.tipo === "trampa") {
          statsHtml = `<div class="mg-carta-stats-trampa"><span>🎭 TRAMPA</span></div>`;
        } else if (c.tipo === "dios") {
          statsHtml = `<div class="mg-carta-stats-dios"><span>⚡ DIOS</span></div>`;
        } else if (c.tipo === "aumento") {
          statsHtml = `<div class="mg-carta-stats-aumento"><span>+${c.val} ${c.stat === "fuerza" ? "⚔ ATAQUE" : "🌀 EVASIÓN"}</span></div>`;
        } else {
          statsHtml = "";
        }
        // SIN texto de efecto, como en el modo "hand" del diseño: en 124 px de ancho no
        // cabe sin quedar cortado, y para leerlo están el panel de la izquierda (a un
        // clic) y la ventana de pulsación larga. La ilustración se queda con el hueco.
        card.innerHTML = `
          <div class="mg-carta-nombre">${c.nombre}</div>
          <div class="mg-carta-icon">${c.icon}</div>
          ${statsHtml}
        `;
        // Los manejadores van en el HUECO, no en la carta: la carta se despega del
        // cursor al ampliarse, y el hueco no. Los eventos de la carta suben igual
        // hasta aquí, así que se sigue pudiendo pulsar sobre ella.
        zona.onclick = () => {
          if (this.consumir()) return;
          const st = this.state;
          if (st.g.fin || st.g.eventos.length || st.g.farol || st.g.fase !== "juego" || st.huecosPendientes || st.tornadoElige) return;
          // verTablero se limpia aquí: si estabas mirando una ficha y ahora coges una
          // carta de la mano, al soltarla el panel debe quedarse vacío, no volver a
          // enseñar la ficha de antes como si nada hubiera pasado.
          this.setState({ selUnidad: null, sacrificios: [], sacFr: null, sacCorazon: null, objetivoMagia: null, verTablero: null, selMano: st.selMano === c.id ? null : c.id });
        };
        zona.onpointerdown = this.lpDown(c);
        zona.onpointerup = this.lpUp();
        zona.onpointerleave = this.lpUp();
        zona.oncontextmenu = this.lpCtx();
        // el holo va con addEventListener, no con on..., para no pisar los manejadores
        // de pulsación larga de arriba (onpointerleave ya está ocupado por lpUp)
        if (esEspecial) this.holo(card, zona);
        zona.appendChild(card);
        bar.appendChild(zona);
      });
      return bar;
    }

    _renderCombate(g, s) {
      const ev = g.eventos[0];
      const { atacante: at, defensor: def, g1 } = ev;
      const overlay = document.createElement("div");
      overlay.className = "mg-overlay";
      const box = document.createElement("div"); box.className = "mg-combate";
      const info = (c) => `${c.fuerza + (c.aumF || 0)}⚔ · ${c.esq + (c.aumE || 0)}🌀 · ${ROMANO[c.magia]}`;
      const parado = s.dado.parado;
      let textoResultado = "";
      if (parado && g1.critico) textoResultado = '<b class="crit">¡IMPACTO CRÍTICO ×2!</b>';
      else if (parado && g1.acierta) textoResultado = '<b class="impacto">¡impacto!</b>';
      else if (parado && !g1.acierta) textoResultado = '<b class="esquiva">esquiva el golpe.</b>';
      let choque = "";
      if (parado && g1.acierta) {
        choque = `<div class="mg-combate-texto">${at.icon} ${at.fuerza}⚔${g1.buffAt ? ` +${g1.buffAt}✨` : ""}${g1.diosAt ? ` +${g1.diosAt}⚡${g1.diosNombre}` : ""}${g1.critico ? " ×2 CRÍTICO" : ""} = ${g1.fAtq} · contra ${def.icon} ${def.fuerza}⚔${g1.buffDef ? ` +${g1.buffDef}✨` : ""}${g1.diosDef ? ` +${g1.diosDef}⚡${g1.diosNombre}` : ""} = ${g1.fDef}</div>
          <div class="mg-combate-resultado ${g1.mata ? "mata" : "resiste"}">${g1.mata ? `☠️ ${def.nombre} muere.` : `🛡️ ${def.nombre} resiste el golpe intacto.`}</div>`;
      }
      box.innerHTML = `
        <div class="mg-combate-vs">
          <div><div class="mg-combate-icon">${at.icon}</div><div>${at.nombre}</div><div class="mg-combate-info">${info(at)}</div></div>
          <div><div class="mg-combate-icon">${def.icon}</div><div>${def.nombre}</div><div class="mg-combate-info">${info(def)}</div></div>
        </div>
        <div class="mg-vs">— VS —</div>
        <div class="mg-dado ${parado ? (g1.acierta ? "acierta" : "falla") : ""}" style="transform:${parado ? "scale(1.1)" : `rotate(${s.dado.n * 30}deg)`}">${s.dado.n}</div>
        <div class="mg-combate-texto">🎲 Saca ${parado ? g1.tirada : "…"} contra evasión ${def.esq + (def.aumE || 0)}${g1.diosEsq ? ` (+${g1.diosEsq} de ${g1.diosNombre})` : ""} → ${textoResultado}</div>
        ${choque}
      `;
      const btn = document.createElement("button");
      btn.textContent = `Continuar${g.eventos.length > 1 ? ` (${g.eventos.length - 1} más)` : ""}`;
      btn.disabled = !parado;
      btn.onclick = () => this.cerrarEvento();
      box.appendChild(btn);
      overlay.appendChild(box);
      return overlay;
    }

    // Tarjeta grande de una carta. Se usa en dos sitios: la ventana emergente de
    // pulsación larga y el panel fijo de la izquierda, de ahí que esté separada.
    _cartaGrandeBox(vc, conCerrar) {
      const esD = vc.tipo === "dios";
      const clave = esD ? "dios" : (vc.tipo === "magica" || vc.tipo === "trampa") ? vc.tipo : vc.civ;
      const tema = TEMA_CARTA[clave] || TEMA_CARTA.vikinga;
      const box = document.createElement("div");
      box.className = "mg-carta-grande";
      box.style.setProperty("--cg-borde", tema.borde);
      box.style.setProperty("--cg-halo", tema.halo);
      box.style.setProperty("--cg-oscuro", tema.oscuro);
      box.style.setProperty("--cg-arte", tema.arte);
      box.style.setProperty("--cg-fondo", FONDO_CARTA);
      box.style.boxShadow = `0 0 50px ${tema.borde}44, 0 10px 40px rgba(0,0,0,.8)`;

      // Lo que cuesta invocarla, en el idioma del sello: los Dioses no se invocan
      // ("inf"), las mágicas y trampas se pagan con magia, y los aumentos son gratis.
      let coste;
      if (esD) coste = "inf";
      else if (vc.tipo === "magica" || vc.tipo === "trampa") coste = "magia";
      else if (vc.tipo === "aumento") coste = 0;
      else coste = vc.sac || 0;

      // El nombre solo tiene 171 px de hueco (los 271 útiles menos el sello, el hueco
      // simétrico de la derecha y los dos separadores de 9), así que la letra encoge
      // según lo largo que sea. Los cortes salen de medir en pantalla, no a ojo:
      // "Jörmundgander" (13) se salía a 17 px. Si aun así no cabe, el nombre parte en
      // dos líneas en vez de cortarse con puntos suspensivos: en el panel es donde se
      // LEE la carta, y un nombre a medias ahí es peor que una línea de más.
      const largo = (vc.nombre || "").length;
      const base = esD ? 25 : 21;
      const tamNombre = largo <= 9 ? base : largo <= 12 ? base - 4 : largo <= 15 ? base - 7 : largo <= 18 ? base - 9 : base - 11;

      const m = vc.magia || 0;
      const medallon = `<div class="mg-cg-med${m ? "" : " apagado"}" style="font-size:${m <= 2 ? 28 : 22}px">${ROMANO[m]}</div>`;
      // Una placa sola en vez de las dos pastillas, para las cartas que no pegan ni esquivan.
      const placa = (txt, conMedallon) => `<div class="mg-cg-placa">${txt}</div>${conMedallon ? medallon : ""}`;
      let cinturon;
      if (vc.tipo === "criatura") {
        cinturon = `<div class="mg-cg-atq">${ART_ESPADA}<span class="mg-cg-num">${vc.fuerza}</span></div>`
          + medallon
          + `<div class="mg-cg-def"><span class="mg-cg-num">${vc.esq}</span>${ART_ESPIRAL}</div>`;
      } else if (vc.tipo === "magica") {
        cinturon = placa(vc.cat === "civilizacion" ? "MÁG. CIVILIZACIÓN" : "MÁGICA GENERAL", true);
      } else if (vc.tipo === "trampa") {
        cinturon = placa("TRAMPA", false);
      } else if (esD) {
        cinturon = placa("DIOS", false);
      } else if (vc.tipo === "aumento") {
        cinturon = placa(`+${vc.val} ${vc.stat === "fuerza" ? "ATAQUE" : "EVASIÓN"}`, false);
      } else {
        cinturon = "";
      }

      // "EFECTO:" solo delante de los textos que no se presentan solos; los de las
      // mágicas y los aumentos ya empiezan diciendo lo que son.
      const conRotulo = vc.tipo === "criatura" || esD;
      const efecto = vc.efecto
        ? (conRotulo ? `<b>EFECTO: </b>${vc.efecto}` : vc.efecto)
        : "Sin efecto.";

      box.innerHTML = `
        <div class="mg-cg-cab">
          <div class="mg-cg-sello">${selloSacrificio(coste)}</div>
          <div class="mg-cg-nombre" style="font-size:${tamNombre}px;letter-spacing:${largo <= 14 ? 2 : 1}px">${vc.nombre}</div>
          <div class="mg-cg-hueco"></div>
        </div>
        <div class="mg-cg-arte"><div class="mg-cg-arte-icon" style="filter:drop-shadow(0 0 22px ${tema.borde})">${vc.icon}</div></div>
        ${cinturon ? `<div class="mg-cg-cinturon"><div class="mg-cg-cinturon-in">${cinturon}</div></div>` : ""}
        <div class="mg-cg-efecto">${efecto}</div>
      `;
      if (!conCerrar) return box;
      // La carta mide 485 justos, así que el aviso de cerrar va DEBAJO, no dentro.
      const wrap = document.createElement("div");
      wrap.appendChild(box);
      const pie = document.createElement("div");
      pie.className = "mg-cg-cerrar";
      pie.textContent = "Toca fuera de la carta para cerrar ✕";
      wrap.appendChild(pie);
      return wrap;
    }

    _renderCartaGrande(vc) {
      const overlay = document.createElement("div");
      overlay.className = "mg-overlay";
      overlay.onclick = () => this.setState({ verCarta: null });
      const box = this._cartaGrandeBox(vc, true);
      box.onclick = (e) => e.stopPropagation();
      overlay.appendChild(box);
      return overlay;
    }

    // Panel fijo de la izquierda: identidad del juego, turno y la carta seleccionada
    // a tamaño grande. Ocupa el ancho que antes se desperdiciaba a los lados.
    _renderPanel(g, s, cartaMano, fichaVista) {
      const panel = document.createElement("div");
      panel.className = "mg-panel";

      const header = document.createElement("div");
      header.className = "mg-header";
      header.innerHTML = `<div class="mg-kicker">Mythos</div><h1>Guerra Dioses</h1><div class="mg-turno">Turno ${g.turno}</div>`;
      panel.appendChild(header);

      const visor = document.createElement("div");
      visor.className = "mg-panel-visor";
      // Manda la carta de la mano: si estás preparando una jugada, el panel tiene que
      // enseñar lo que vas a jugar. La ficha del tablero es el segundo en la cola.
      const vc = cartaMano || fichaVista || null;
      if (vc) {
        visor.appendChild(this._cartaGrandeBox(vc, false));
      } else {
        const vacio = document.createElement("div");
        vacio.className = "mg-panel-vacio";
        // El texto va DENTRO del marco para que el hueco vacío mida exactamente lo
        // mismo que una carta puesta, y el panel no dé un salto al seleccionar.
        vacio.innerHTML = `<div class="mg-panel-vacio-marco">
            <div class="mg-panel-vacio-txt">Toca una carta de tu mano<br>o una ficha del tablero<br>para verla aquí en grande.</div>
          </div>`;
        visor.appendChild(vacio);
      }
      panel.appendChild(visor);
      return panel;
    }

    _hintTxt(s, g, cartaMano, eligiendo) {
      if (g.fin) return "";
      if (s.tornadoElige) return "🌪️ Elige el frente que arrasa el tornado.";
      if (s.huecosPendientes) return "✨ ¡Sacrificio hecho! Toca una de las casillas que brillan para invocar ahí a tu carta.";
      if (s.objetivoMagia) return "✨ Toca un personaje TUYO resaltado en verde (o vuelve a tocar la carta para cancelar).";
      const esTrampaSel = cartaMano && cartaMano.tipo === "trampa";
      const esAumSel = cartaMano && cartaMano.tipo === "aumento";
      const esDiosSel = cartaMano && cartaMano.tipo === "dios";
      const esMagicaSel = cartaMano && cartaMano.tipo === "magica";
      if (esTrampaSel) return "🎭 Las trampas no se juegan directamente: cuando un personaje RIVAL aparezca en un portal, podrás ponérsela boca abajo.";
      if (esAumSel) return `${cartaMano.stat === "fuerza" ? "❤️" : "💙"} Toca un personaje TUYO resaltado en verde: la carta ocupará tu corazón de ${cartaMano.stat === "fuerza" ? "Ataque" : "Defensa"} de ese frente.`;
      if (esDiosSel) {
        const suma = this.mejorSumaDios(g, "jugador", cartaMano.civ);
        return suma >= 5 ? `⚡ Pulsa INVOCAR DIOS: ${cartaMano.nombre} bajará al Abismo.` : `⚡ Necesitas sumar 5 niveles de magia entre tus ${cartaMano.civ === "vikinga" ? "vikingos" : "griegos"}: ${suma}/5.`;
      }
      if (esMagicaSel) {
        const frCan = this.frentesCanaliza(g, cartaMano);
        if (frCan.length) return `✨ Pulsa el botón para canalizar ${cartaMano.nombre} (nivel ${ROMANO[cartaMano.magia]}).`;
        return `💚 Necesitas, en un mismo frente: tu corazón de Magia vivo Y que tus personajes de ese frente sumen magia ${ROMANO[cartaMano.magia]} o más (izq: ${this.sumaMagiaFrente(g, "jugador", 0)}, der: ${this.sumaMagiaFrente(g, "jugador", 1)}).`;
      }
      if (eligiendo) {
        const desc = s.sacCorazon != null ? 1 : 0;
        const req = Math.max(0, (cartaMano.sac || 0) - desc);
        const faltan = req - s.sacrificios.length;
        if (req === 0) return "💛 El corazón de Sacrificios pagará el alma: invoca directo en una losa verde de tu frente.";
        return faltan <= 1
          ? "🩸 Toca una carta TUYA en zona de invocación (fila más cercana a tu mano, o portal activo): se sacrifica y la nueva ocupa su losa."
          : `🩸 Marca ${faltan} cartas TUYAS del mismo frente en zona de invocación.`;
      }
      if (cartaMano) return g.portales.activos
        ? "Invoca en tus losas verdes (fila más cercana a tu mano) o en un portal 🌀."
        : "Invoca en tus losas verdes (fila más cercana a tu mano). Los portales están desactivados.";
      if (s.selUnidad) return "Losas rojas: mover o combatir. Corazón iluminado arriba: atacar.";
      return "Elige una carta de tu mano, o toca una carta tuya del tablero.";
    }

    _renderFarol(g) {
      const f = g.farol;
      const uF = g.tablero[f.fr].find((x) => x.id === f.unidadId);
      const nombreU = uF ? `${uF.icon} ${uF.nombre}` : "el personaje";
      const overlay = document.createElement("div");
      overlay.className = "mg-overlay";
      const box = document.createElement("div"); box.className = "mg-farol";
      if (f.etapa === "decision") {
        box.innerHTML = `<div class="mg-farol-titulo">🌀 El farol del portal</div>
          <div class="mg-farol-texto">La IA ha puesto una carta boca abajo sobre ${nombreU}. Si la levantas y es una TRAMPA, se cumplirá su efecto. Si no lo es, vive y te quedas su carta. Si no la levantas, quedará congelado.</div>
          <div class="mg-farol-dorso">?</div>`;
        const btns = document.createElement("div"); btns.className = "mg-farol-btns";
        const b1 = document.createElement("button"); b1.textContent = "👁 Levantar la carta"; b1.onclick = () => this.resolverFarol(true);
        const b2 = document.createElement("button"); b2.textContent = "🧊 No levantar"; b2.className = "mg-btn-secundario"; b2.onclick = () => this.resolverFarol(false);
        btns.appendChild(b1); btns.appendChild(b2);
        box.appendChild(btns);
      } else {
        box.innerHTML = `<div class="mg-farol-titulo">🌀 El farol del portal</div>
          <div class="mg-farol-texto">${nombreU} de la IA ha aparecido en el portal. Puedes ponerle UNA carta de tu mano boca abajo: si es tu trampa y la IA la levanta, el personaje será tuyo.</div>`;
        const cartas = document.createElement("div"); cartas.className = "mg-farol-cartas";
        g.manoJ.forEach((c) => {
          const el = document.createElement("div");
          el.className = "mg-farol-carta";
          el.innerHTML = `<div>${c.icon}</div><div class="mg-farol-carta-nombre">${c.nombre}</div>`;
          el.onclick = () => this.elegirCartaFarol(c.id);
          cartas.appendChild(el);
        });
        box.appendChild(cartas);
        const btns = document.createElement("div"); btns.className = "mg-farol-btns";
        const b = document.createElement("button"); b.textContent = "No poner nada"; b.className = "mg-btn-secundario"; b.onclick = () => this.elegirCartaFarol(null);
        btns.appendChild(b);
        box.appendChild(btns);
      }
      overlay.appendChild(box);
      return overlay;
    }

    _renderTornado() {
      const overlay = document.createElement("div");
      overlay.className = "mg-overlay";
      const box = document.createElement("div"); box.className = "mg-tornado";
      box.innerHTML = `<div class="mg-tornado-titulo">🌪️ Tornado</div><div class="mg-tornado-texto">¿Qué frente arrasa el tornado? Todas las cartas de ese frente volverán a las manos de sus dueños.</div>`;
      const btns = document.createElement("div"); btns.className = "mg-tornado-btns";
      const b0 = document.createElement("button"); b0.textContent = "⬅️ Frente izquierdo"; b0.onclick = () => this.ejecutarTornado(0);
      const b1 = document.createElement("button"); b1.textContent = "Frente derecho ➡️"; b1.onclick = () => this.ejecutarTornado(1);
      const b2 = document.createElement("button"); b2.textContent = "Cancelar"; b2.className = "mg-btn-secundario"; b2.onclick = () => this.setState({ tornadoElige: null });
      btns.appendChild(b0); btns.appendChild(b1); btns.appendChild(b2);
      box.appendChild(btns);
      overlay.appendChild(box);
      return overlay;
    }

    render() {
      const s = this.state;
      const g = s.g;
      const rectsAntes = this._mounted ? this._leerFx() : new Map();
      const corazonesRotos = [];
      if (this._corVivoPrev) {
        for (const lado of ["jugador", "ia"]) for (let fr = 0; fr < 2; fr++) {
          (g.corazones[lado][fr] || []).forEach((cz, carril) => {
            const key = `${lado}-${fr}-${carril}`;
            const antes = this._corVivoPrev[key];
            if (antes && cz && !cz.vivo) {
              corazonesRotos.push(key);
              this._corFx = this._corFx || {};
              this._corFx[key] = Date.now();
              setTimeout(() => this.render(), 1600);
            }
          });
        }
      }
      // Mismo mecanismo para las protecciones: se comparan con el render anterior para
      // saber cuáles se acaban de romper y lanzarles su animación.
      const protRotas = [];
      if (this._protPrev) {
        for (const lado of ["jugador", "ia"]) for (let fr = 0; fr < 2; fr++) {
          (g.corazones[lado][fr] || []).forEach((cz, carril) => {
            const key = `${lado}-${fr}-${carril}`;
            if (this._protPrev[key] && cz && !cz.prot) {
              protRotas.push(key);
              this._protFx = this._protFx || {};
              this._protFx[key] = Date.now();
              setTimeout(() => this.render(), 1500);
            }
          });
        }
      }
      // OJO con el orden: esto corre ANTES de montar el DOM, así que los mapas "Prev" hay
      // que leerlos aquí y dejar ya resuelto en `_cartaCorNueva` qué aumentos son nuevos.
      // Si se consultara el mapa desde _corazonesRow ya estaría pisado por este render.
      const cartaAntes = this._cartaCorPrev || {};
      this._corVivoPrev = {};
      this._protPrev = {};
      this._cartaCorPrev = {};
      this._cartaCorNueva = {};
      for (const lado of ["jugador", "ia"]) for (let fr = 0; fr < 2; fr++) {
        (g.corazones[lado][fr] || []).forEach((cz, carril) => {
          const key = `${lado}-${fr}-${carril}`;
          const tiene = !!(cz && cz.carta);
          this._corVivoPrev[key] = !!(cz && cz.vivo);
          this._protPrev[key] = !!(cz && cz.prot);
          this._cartaCorPrev[key] = tiene;
          this._cartaCorNueva[key] = tiene && !cartaAntes[key];
        });
      }

      const cartaMano = g.manoJ.find((c) => c.id === s.selMano) || null;
      // La ficha que se está mirando se busca por su id en los dos frentes, no se
      // guarda el objeto: así, si mientras tanto muere o la devuelven a la mano, el
      // panel se vacía solo en vez de enseñar una carta que ya no está en el tablero.
      const fichaVista = s.verTablero
        ? (g.tablero[0].find((u) => u.id === s.verTablero) || g.tablero[1].find((u) => u.id === s.verTablero) || null)
        : null;
      const objetivo = s.objetivoMagia ? g.manoJ.find((c) => c.id === s.objetivoMagia) || null : null;
      const dests = this.destinosValidos(g, s.selUnidad);
      const eligiendo = !!(cartaMano && cartaMano.tipo === "criatura" && (cartaMano.sac || 0) > 0 && !s.huecosPendientes);

      this._animCamara = []; // se llena durante el render y se ejecuta al final
      const screen = document.createElement("div");
      screen.className = "mg-screen";

      // La pantalla se parte en dos columnas: el panel fijo de la izquierda (identidad,
      // turno y la carta seleccionada en grande) y el campo de juego en el centro.
      // Tres columnas: panel de carta a la izquierda, campo en el centro y botonera a
      // la derecha. Los dos laterales miden lo mismo, así el campo queda centrado
      // de verdad respecto a la pantalla y no desplazado por el panel.
      screen.appendChild(this._renderPanel(g, s, cartaMano, fichaVista));
      const campo = document.createElement("div");
      campo.className = "mg-campo";
      const lateral = document.createElement("div");
      lateral.className = "mg-lateral";

      // Mano de la IA al estilo Yu-Gi-Oh: los dorsos van en fila recta y separados,
      // inclinados hacia atrás, como si estuvieran de pie al fondo del campo.
      const iaMano = document.createElement("div");
      iaMano.className = "mg-ia-mano";
      const iaFila = document.createElement("div");
      iaFila.className = "mg-ia-mano-fila";
      // Los dorsos van SIEMPRE de pie, de frente a cámara, aunque el tablero se tumbe
      // por debajo: es lo que hace Yu-Gi-Oh y lo que da sensación de mano sujetada.
      // En vista de mano además encogen, para que se lean como algo que está al fondo
      // y no compitan con tus propias cartas, que es lo que estás mirando ahí.
      iaFila.style.transform = this._tfManoIA(s.camara);
      if (this._camaraPrev !== undefined && this._camaraPrev !== s.camara) {
        this._animCamara.push([iaFila, [
          { transform: this._tfManoIA(this._camaraPrev) },
          { transform: iaFila.style.transform },
        ]]);
      }
      g.manoIA.forEach(() => {
        const back = document.createElement("div");
        back.className = "mg-card-back";
        back.textContent = "Ω";
        iaFila.appendChild(back);
      });
      iaMano.appendChild(iaFila);
      campo.appendChild(iaMano);

      if (s.revelar) {
        const rev = document.createElement("div");
        rev.className = "mg-revelar";
        rev.innerHTML = `<div class="mg-revelar-titulo">👁 EL OJO DE ODÍN REVELA LA MANO RIVAL (${s.revelar.n}s)</div>
          <div class="mg-revelar-cartas">${g.manoIA.map((c) => `<div class="mg-revelar-carta"><div>${c.icon}</div><div>${c.nombre}</div></div>`).join("")}</div>`;
        campo.appendChild(rev);
      }

      const tableroWrap = document.createElement("div");
      tableroWrap.className = "mg-tablero-wrap";
      const puente = document.createElement("div");
      puente.className = "mg-puente";
      const board = document.createElement("div");
      board.className = "mg-board";
      const tiltTransform = s.camara === "mano" ? "rotateX(38deg) scale(.94) translateY(-30px)" : "rotateX(0deg) scale(1)";
      board.style.transform = tiltTransform;
      board.appendChild(this._pilasRow(g.cementerio.ia.length, g.mazoIA.length, "Cement. IA", "Mazo IA", "arriba"));
      const frentesRow = document.createElement("div");
      frentesRow.className = "mg-frentes";
      frentesRow.appendChild(this._renderFrente(0, g, s, cartaMano, objetivo, dests, eligiendo));
      frentesRow.appendChild(this._renderAbismo(g, s));
      frentesRow.appendChild(this._renderFrente(1, g, s, cartaMano, objetivo, dests, eligiendo));
      board.appendChild(frentesRow);
      board.appendChild(this._pilasRow(g.cementerio.jugador.length, g.mazoJ.length, "Cementerio", "Mazo", "abajo"));
      puente.appendChild(board);
      tableroWrap.appendChild(puente);
      campo.appendChild(tableroWrap);
      if (this._tiltPrev !== null && this._tiltPrev !== tiltTransform) {
        board.animate([{ transform: this._tiltPrev }, { transform: tiltTransform }], { duration: 900, easing: "cubic-bezier(.4,0,.2,1)" });
      }
      this._tiltPrev = tiltTransform;

      // La pista y el registro se montan aquí pero se cuelgan más abajo, en la
      // columna derecha debajo de los botones, no bajo el tablero.
      const hint = document.createElement("div");
      hint.className = "mg-hint";
      hint.textContent = this._hintTxt(s, g, cartaMano, eligiendo);

      const esMagicaSel = cartaMano && cartaMano.tipo === "magica";
      const esDiosSel = cartaMano && cartaMano.tipo === "dios";
      const frCan = esMagicaSel ? this.frentesCanaliza(g, cartaMano) : [];
      const sumaDios = esDiosSel ? this.mejorSumaDios(g, "jugador", cartaMano.civ) : 0;
      const puedeCanalizar = esMagicaSel && frCan.length > 0;
      const puedeDios = esDiosSel && sumaDios >= 5;
      const puedeAccion = esDiosSel ? puedeDios : puedeCanalizar;
      const mostrarActivar = !!((esMagicaSel || esDiosSel) && g.fase === "juego" && !g.fin && !g.eventos.length && !g.farol && !s.huecosPendientes && !s.tornadoElige && !s.objetivoMagia);

      const btns = document.createElement("div");
      btns.className = "mg-botones";
      if (mostrarActivar) {
        const b = document.createElement("button");
        b.textContent = esDiosSel ? (puedeDios ? "⚡ Invocar Dios" : `⚡ Magia ${sumaDios}/5`) : (puedeCanalizar ? (cartaMano.clave === "buffCiv" ? "✨ Elegir objetivo" : "✨ Activar magia") : "✨ No canalizable");
        b.disabled = !puedeAccion;
        b.onclick = () => { if (esDiosSel) this.invocarDios(); else this.activarMagia(); };
        btns.appendChild(b);
      }
      if (eligiendo) {
        const frCorSac = [0, 1].filter((fr) => this.corazonVivo(g, "jugador", "sacrificios", fr));
        if (frCorSac.length) {
          const b = document.createElement("button");
          const activo = s.sacCorazon != null;
          b.textContent = activo ? `💛 Corazón en juego (frente ${s.sacCorazon === 0 ? "izq" : "der"}) ✕` : "💛 Gastar corazón de Sacrificios (1 alma)";
          b.className = "mg-btn-corazon" + (activo ? " activo" : "");
          b.onclick = () => {
            if (s.sacCorazon != null) { this.setState({ sacCorazon: null }); return; }
            const fr = (s.sacFr != null && frCorSac.includes(s.sacFr)) ? s.sacFr : frCorSac[0];
            this.setState({ sacCorazon: fr });
          };
          btns.appendChild(b);
        }
      }
      const btnTerminar = document.createElement("button");
      btnTerminar.textContent = "Terminar turno ⚔️";
      btnTerminar.disabled = !!(g.fin || g.fase !== "juego" || g.eventos.length || g.farol || s.huecosPendientes || s.tornadoElige || s.objetivoMagia);
      btnTerminar.onclick = () => this.terminarTurno();
      btns.appendChild(btnTerminar);
      const btnVista = document.createElement("button");
      btnVista.textContent = s.camara === "mano" ? "📷 Vista campo" : "📷 Vista mano";
      btnVista.className = "mg-btn-secundario";
      btnVista.onclick = () => this.toggleVista();
      btns.appendChild(btnVista);
      const btnReiniciar = document.createElement("button");
      btnReiniciar.textContent = "Reiniciar";
      btnReiniciar.className = "mg-btn-secundario";
      btnReiniciar.onclick = () => this.reiniciar();
      btns.appendChild(btnReiniciar);
      lateral.appendChild(btns);
      lateral.appendChild(hint);

      if (g.fin) {
        const fin = document.createElement("div");
        fin.className = "mg-fin " + (g.fin === "victoria" ? "victoria" : "derrota");
        fin.textContent = g.fin === "victoria" ? "🏆 ¡VICTORIA VIKINGA!" : "💀 DERROTA";
        campo.appendChild(fin);
      }

      const log = document.createElement("div");
      log.className = "mg-log";
      g.log.forEach((l, i) => {
        const d = document.createElement("div");
        d.style.opacity = i === 0 ? "1" : ".65";
        d.textContent = l;
        log.appendChild(d);
      });
      lateral.appendChild(log);
      screen.appendChild(campo);
      screen.appendChild(lateral);

      screen.appendChild(this._renderMano(g, s));

      if (g.eventos[0]) screen.appendChild(this._renderCombate(g, s));
      else if (g.farol) screen.appendChild(this._renderFarol(g));
      if (s.tornadoElige) screen.appendChild(this._renderTornado());
      if (s.verCarta) screen.appendChild(this._renderCartaGrande(s.verCarta));

      this.root.innerHTML = "";
      this.root.appendChild(screen);
      this._aplicarTemaAbismo(g);
      this._correrAnimCamara();
      this._camaraPrev = s.camara;
      this._volarRobadas();
      this._fxUpdate(rectsAntes);
      for (const key of corazonesRotos) {
        setTimeout(() => this._burstCorazon(key), 30);
      }
      for (const key of protRotas) {
        setTimeout(() => this._burstProt(key), 30);
      }
      this._mounted = true;
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const raiz = document.getElementById("juego");
    new Juego(raiz);
    ajustarLienzo(raiz);
    window.addEventListener("resize", () => ajustarLienzo(raiz));
  });
})();
