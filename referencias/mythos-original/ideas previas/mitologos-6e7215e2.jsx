import { useState, useEffect, useRef } from "react";

// ============ DATOS ============
const ELEMENTOS = {
  agua:   { icon: "💧", gana: "fuego" },
  fuego:  { icon: "🔥", gana: "viento" },
  viento: { icon: "🌪️", gana: "rayo" },
  rayo:   { icon: "⚡", gana: "agua" },
};
const ROMANO = ["✦", "I", "II", "III"];
const VERDE_MAGIA = "#4caf7d";

const TIPOS_CORAZON = {
  vigor:       { emoji: "❤️", color: "#e05c3a", nombre: "Vigor" },
  magia:       { emoji: "💚", color: "#4caf7d", nombre: "Magia" },
  sacrificios: { emoji: "💛", color: "#d4a941", nombre: "Sacrif." },
  elementos:   { emoji: "💙", color: "#4a9de0", nombre: "Elem." },
};

const CARTAS_VIKINGAS = [
  { nombre: "Einherjar",        icon: "⚔️", fuerza: 2, sac: 0, esq: 4, elems: ["rayo"],         magia: 0, efecto: null },
  { nombre: "Guerrero",         icon: "🪓", fuerza: 3, sac: 0, esq: 2, elems: ["fuego"],        magia: 0, efecto: null },
  { nombre: "Valquiria",        icon: "🦅", fuerza: 3, sac: 0, esq: 6, elems: ["viento"],       magia: 0, efecto: null },
  { nombre: "Lobo de Fenrir",   icon: "🐺", fuerza: 4, sac: 1, esq: 5, elems: ["viento"],       magia: 0, efecto: null },
  { nombre: "Jarl",             icon: "👑", fuerza: 4, sac: 1, esq: 3, elems: ["rayo"],         magia: 1, efecto: null },
  { nombre: "Berserker",        icon: "😤", fuerza: 5, sac: 1, esq: 1, elems: ["fuego"],        magia: 0, efecto: null },
  { nombre: "Gigante de Hielo", icon: "❄️", fuerza: 6, sac: 2, esq: 0, elems: ["agua"],         magia: 0, efecto: null },
  { nombre: "Jörmundgander",    icon: "🐉", fuerza: 7, sac: 2, esq: 2, elems: ["agua", "rayo"], magia: 2, efecto: "Puede trasladarse una vez al otro frente." },
];

const CARTAS_GRIEGAS = [
  { nombre: "Sátiro",    icon: "🐐", fuerza: 2, sac: 0, esq: 7, elems: ["viento"], magia: 0, efecto: null },
  { nombre: "Hoplita",   icon: "🛡️", fuerza: 3, sac: 0, esq: 3, elems: ["fuego"],  magia: 0, efecto: null },
  { nombre: "Amazona",   icon: "🏹", fuerza: 3, sac: 0, esq: 5, elems: ["rayo"],   magia: 0, efecto: null },
  { nombre: "Pegaso",    icon: "🐴", fuerza: 3, sac: 0, esq: 6, elems: ["viento"], magia: 0, efecto: null },
  { nombre: "Espartano", icon: "⚔️", fuerza: 4, sac: 1, esq: 2, elems: ["fuego"],  magia: 0, efecto: null },
  { nombre: "Medusa",    icon: "🐍", fuerza: 4, sac: 1, esq: 4, elems: ["agua"],   magia: 1, efecto: null },
  { nombre: "Minotauro", icon: "🐂", fuerza: 5, sac: 1, esq: 1, elems: ["agua"],   magia: 0, efecto: null },
  { nombre: "Cíclope",   icon: "👁️", fuerza: 6, sac: 2, esq: 0, elems: ["rayo"],   magia: 0, efecto: null },
];

const CARTA_DIOS_DEMO = {
  nombre: "Zeus", icon: "🌩️", tipo: "dios", civ: "griega",
  efecto: "+1 esquiva a todas las cartas griegas.",
};

// Tablero HORIZONTAL: columnas 0..6 (jugador a la izquierda, avanza →).
// Columnas 0 y 6 = losas de invocación/golpeo. Portal = extensión de la columna central,
// en el borde exterior (frente 0 arriba, frente 1 abajo).
const N_FILAS = 7;
const FILA_PORTAL = 3;
const OUT = (fr) => (fr === 0 ? 0 : 1);

// Zona de invocación del jugador: su fila (0) o el portal.
const esZonaInvJugador = (pos) =>
  pos.zona === "portal" || (pos.zona === "campo" && pos.fila === 0);
// Zona de invocación de la IA: su fila (6) o el portal.
const esZonaInvIA = (pos) =>
  pos.zona === "portal" || (pos.zona === "campo" && pos.fila === N_FILAS - 1);

// ============ UTILIDADES ============
let _uid = 0;
const uid = () => ++_uid;

function crearMazo(pool, n = 20) {
  const mazo = [];
  for (let i = 0; i < n; i++) mazo.push({ ...pool[i % pool.length], id: uid() });
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
  }
  return mazo;
}

function ventaja(a, b) {
  for (const ea of a.elems)
    for (const eb of b.elems)
      if (ELEMENTOS[ea].gana === eb) return { bono: 1, elem: ea, contra: eb };
  return { bono: 0 };
}
const d12 = () => Math.floor(Math.random() * 12) + 1;

function robar(mazo, mano, n = 1) {
  const m = [...mazo], h = [...mano];
  for (let i = 0; i < n; i++) if (m.length) h.push(m.shift());
  return [m, h];
}

function golpe(atacante, defensor) {
  const tirada = d12();
  const acierta = tirada > defensor.esq;
  const v = ventaja(atacante, defensor);
  const mata = acierta && atacante.fuerza + v.bono > defensor.fuerza;
  return { tirada, acierta, ...v, mata };
}

const iconosElems = (c) => c.elems.map((e) => ELEMENTOS[e].icon).join("");
const mismaPos = (a, b) =>
  a.zona === b.zona && (a.zona !== "campo" || (a.fila === b.fila && a.carril === b.carril));

function estadoInicial() {
  const tipos = Object.keys(TIPOS_CORAZON);
  const barajados = [...tipos].sort(() => Math.random() - 0.5);
  const s = {
    fase: "colocacion",
    tablero: [[], []],
    corazones: {
      jugador: [[null, null], [null, null]],
      ia: [
        [{ tipo: barajados[0], vivo: true }, { tipo: barajados[1], vivo: true }],
        [{ tipo: barajados[2], vivo: true }, { tipo: barajados[3], vivo: true }],
      ],
    },
    corazonesPendientes: tipos,
    mazoJ: crearMazo(CARTAS_VIKINGAS),
    mazoIA: crearMazo(CARTAS_GRIEGAS),
    manoJ: [], manoIA: [],
    cementerio: { jugador: [], ia: [] },
    dios: { ...CARTA_DIOS_DEMO },
    invocadoEnFrente: [false, false],
    movidas: [],
    turno: 1,
    log: ["🫀 Coloca tus 4 corazones: cada uno da un poder a su zona."],
    eventos: [],
    fin: null,
  };
  [s.mazoJ, s.manoJ] = robar(s.mazoJ, s.manoJ, 5);
  [s.mazoIA, s.manoIA] = robar(s.mazoIA, s.manoIA, 5);
  return s;
}

// ============ COMPONENTE ============
export default function MitoLogos() {
  const [g, setG] = useState(estadoInicial);
  const [selMano, setSelMano] = useState(null);
  const [selUnidad, setSelUnidad] = useState(null);
  const [sacrificios, setSacrificios] = useState([]);
  const [tipoCorazon, setTipoCorazon] = useState(null);
  const [verCarta, setVerCarta] = useState(null); // carta mostrada a pantalla completa
  // Tras un sacrificio doble: casillas vacías donde falta colocar la invocación.
  const [huecosPendientes, setHuecosPendientes] = useState(null); // { cartaId, huecos: [{fr,pos},{fr,pos}] }

  // --- Pulsación larga (long press): mantener ~0,45 s abre la carta en grande ---
  const timerPulsacion = useRef(null);
  const fuePulsacionLarga = useRef(false);
  const pulsacionLarga = (abrir) => ({
    onPointerDown: () => {
      fuePulsacionLarga.current = false;
      clearTimeout(timerPulsacion.current);
      timerPulsacion.current = setTimeout(() => {
        fuePulsacionLarga.current = true;
        abrir();
      }, 450);
    },
    onPointerUp: () => clearTimeout(timerPulsacion.current),
    onPointerLeave: () => clearTimeout(timerPulsacion.current),
    onPointerCancel: () => clearTimeout(timerPulsacion.current),
    onContextMenu: (e) => e.preventDefault(), // evita el menú del navegador al mantener pulsado
  });
  // Tras una pulsación larga, el "click" que llega después se ignora.
  const consumirPulsacion = () => {
    if (fuePulsacionLarga.current) {
      fuePulsacionLarga.current = false;
      return true;
    }
    return false;
  };

  const cartaMano = g.manoJ.find((c) => c.id === selMano);
  const faltanSac = cartaMano ? cartaMano.sac - sacrificios.length : 0;

  const unidadEn = (st, fr, pos) => st.tablero[fr].find((u) => mismaPos(u.pos, pos));

  const clonar = (prev) => ({
    ...prev,
    tablero: prev.tablero.map((f) => f.map((u) => ({ ...u, pos: { ...u.pos } }))),
    corazones: {
      jugador: prev.corazones.jugador.map((f) => f.map((c) => (c ? { ...c } : null))),
      ia: prev.corazones.ia.map((f) => f.map((c) => (c ? { ...c } : null))),
    },
    corazonesPendientes: [...prev.corazonesPendientes],
    manoJ: [...prev.manoJ], mazoJ: [...prev.mazoJ],
    manoIA: [...prev.manoIA], mazoIA: [...prev.mazoIA],
    cementerio: { jugador: [...prev.cementerio.jugador], ia: [...prev.cementerio.ia] },
    dios: prev.dios ? { ...prev.dios } : null,
    invocadoEnFrente: [...prev.invocadoEnFrente],
    movidas: [...prev.movidas],
    log: [...prev.log],
    eventos: [...prev.eventos],
  });

  const alCementerio = (st, u) =>
    st.cementerio[u.dueño === "jugador" ? "jugador" : "ia"].push({ ...u });

  const vecinos = (fr, pos) => {
    const v = [];
    if (pos.zona === "campo") {
      const { fila, carril } = pos;
      if (fila + 1 < N_FILAS) v.push({ zona: "campo", fila: fila + 1, carril });
      if (fila - 1 >= 0) v.push({ zona: "campo", fila: fila - 1, carril });
      v.push({ zona: "campo", fila, carril: 1 - carril });
      if (fila === FILA_PORTAL && carril === OUT(fr)) v.push({ zona: "portal" });
    } else if (pos.zona === "portal") {
      v.push({ zona: "campo", fila: FILA_PORTAL, carril: OUT(fr) });
      v.push({ zona: "portal", teletransporte: true });
    }
    return v;
  };

  const destinosValidos = () => {
    if (!selUnidad || g.fase !== "juego") return [];
    const u = g.tablero[selUnidad.fr].find((x) => x.id === selUnidad.id);
    if (!u || g.movidas.includes(u.id)) return [];
    const dest = [];
    for (const v of vecinos(selUnidad.fr, u.pos)) {
      const frDest = v.teletransporte ? 1 - selUnidad.fr : selUnidad.fr;
      const oc = unidadEn(g, frDest, v);
      if (!oc || oc.dueño === "ia") dest.push({ ...v, fr: frDest, combate: !!oc });
    }
    if (u.pos.zona === "campo" && u.pos.fila === N_FILAS - 1) {
      const c = g.corazones.ia[selUnidad.fr][u.pos.carril];
      if (c?.vivo) dest.push({ corazon: true, carril: u.pos.carril });
    }
    return dest;
  };
  const dests = destinosValidos();
  const esDestino = (fr, pos) => dests.find((d) => !d.corazon && d.fr === fr && mismaPos(d, pos));

  const combate = (st, fr, atacante, defensor) => {
    const g1 = golpe(atacante, defensor);
    st.eventos.push({ atacante: { ...atacante }, defensor: { ...defensor }, g1 });
    if (g1.mata) {
      st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== defensor.id);
      alCementerio(st, defensor);
      st.log.unshift(`☠️ ${defensor.icon} ${defensor.nombre} cae ante ${atacante.icon} ${atacante.nombre}.`);
      return "gana_atacante";
    }
    st.log.unshift(`🛡️ ${defensor.icon} ${defensor.nombre} aguanta el ataque de ${atacante.icon}.`);
    return "nada";
  };

  const comprobarFin = (st) => {
    const vivos = (lado) => st.corazones[lado].flat().filter((c) => c?.vivo).length;
    if (vivos("ia") === 0) { st.fin = "victoria"; st.log.unshift("🏆 ¡Los 4 corazones griegos han caído! VICTORIA."); }
    else if (vivos("jugador") === 0) { st.fin = "derrota"; st.log.unshift("💀 Tus 4 corazones han caído. DERROTA."); }
  };

  const colocarCorazon = (fr, carril) => {
    if (!tipoCorazon) return;
    setG((prev) => {
      const st = clonar(prev);
      if (st.corazones.jugador[fr][carril]) return prev;
      st.corazones.jugador[fr][carril] = { tipo: tipoCorazon, vivo: true };
      st.corazonesPendientes = st.corazonesPendientes.filter((t) => t !== tipoCorazon);
      if (!st.corazonesPendientes.length) {
        st.fase = "juego";
        st.log.unshift("⚔️ ¡Comienza el duelo! Vikingos contra Griegos.");
      }
      return st;
    });
    setTipoCorazon(null);
  };

  // Marca un sacrificio; si con él se completa el coste, se ejecuta AL INSTANTE:
  // los sacrificados van al cementerio y sus casillas quedan brillando a la espera.
  const marcarSacrificio = (u) => {
    const ids = [...sacrificios, u.id];
    if (!cartaMano || ids.length < cartaMano.sac) return setSacrificios(ids);
    const huecos = [];
    for (const id of ids) {
      for (let f = 0; f < 2; f++) {
        const v = g.tablero[f].find((x) => x.id === id);
        if (v) huecos.push({ fr: f, pos: { ...v.pos } });
      }
    }
    setG((prev) => {
      const st = clonar(prev);
      for (const id of ids) {
        for (let f = 0; f < 2; f++) {
          const v = st.tablero[f].find((x) => x.id === id);
          if (v) {
            st.tablero[f] = st.tablero[f].filter((x) => x.id !== id);
            alCementerio(st, v);
            st.log.unshift(`🩸 Sacrificas a ${v.icon} ${v.nombre}.`);
          }
        }
      }
      st.log.unshift("✨ Elige en cuál de los dos huecos aparece la invocación.");
      return st;
    });
    setHuecosPendientes({ cartaId: cartaMano.id, huecos });
    setSacrificios([]);
  };

  // Coloca la carta pendiente en uno de los huecos que dejó el sacrificio doble.
  const colocarEnHueco = (fr, pos) => {
    setG((prev) => {
      const st = clonar(prev);
      const carta = st.manoJ.find((c) => c.id === huecosPendientes.cartaId);
      if (!carta || st.invocadoEnFrente[fr] || unidadEn(st, fr, pos)) return prev;
      st.manoJ = st.manoJ.filter((c) => c.id !== carta.id);
      const nu = { ...carta, id: uid(), dueño: "jugador", pos: { ...pos } };
      st.tablero[fr].push(nu);
      st.invocadoEnFrente[fr] = true;
      st.movidas.push(nu.id);
      st.log.unshift(`🔵 Invocas ${carta.icon} ${carta.nombre} sobre el hueco del sacrificio${pos.zona === "portal" ? " (PORTAL)" : ""} (frente ${fr === 0 ? "norte" : "sur"}).`);
      return st;
    });
    setHuecosPendientes(null);
    setSelMano(null);
  };

  // Invoca la carta seleccionada en (fr, pos).
  // sacIds: ids de las unidades a sacrificar. La nueva carta ocupa el hueco
  // de un sacrificado (o una losa de invocación vacía si la carta no exige sacrificios).
  const invocar = (fr, pos, sacIds = []) => {
    setG((prev) => {
      const st = clonar(prev);
      const carta = st.manoJ.find((c) => c.id === selMano);
      if (!carta || st.invocadoEnFrente[fr]) return prev;
      if (sacIds.length < carta.sac) return prev;
      const oc = unidadEn(st, fr, pos);
      // La losa debe estar vacía o bien ocupada por uno de los sacrificados.
      if (oc && !sacIds.includes(oc.id)) return prev;
      for (const id of sacIds.slice(0, carta.sac)) {
        for (let f = 0; f < 2; f++) {
          const v = st.tablero[f].find((x) => x.id === id);
          if (v) {
            st.tablero[f] = st.tablero[f].filter((x) => x.id !== id);
            alCementerio(st, v);
            st.log.unshift(`🩸 Sacrificas a ${v.icon} ${v.nombre}.`);
          }
        }
      }
      st.manoJ = st.manoJ.filter((c) => c.id !== selMano);
      const nu = { ...carta, id: uid(), dueño: "jugador", pos: { ...pos } };
      st.tablero[fr].push(nu);
      st.invocadoEnFrente[fr] = true;
      st.movidas.push(nu.id);
      st.log.unshift(
        `🔵 Invocas ${carta.icon} ${carta.nombre}` +
        (carta.sac > 0 ? " sobre el hueco del sacrificio" : "") +
        `${pos.zona === "portal" ? " en el PORTAL" : ""} (frente ${fr === 0 ? "norte" : "sur"}).`
      );
      return st;
    });
    setSelMano(null); setSacrificios([]);
  };

  const mover = (fr, pos) => {
    setG((prev) => {
      const st = clonar(prev);
      let u, frOrigen;
      for (let f = 0; f < 2; f++) {
        const x = st.tablero[f].find((x) => x.id === selUnidad.id);
        if (x) { u = x; frOrigen = f; }
      }
      if (!u) return prev;
      const oc = unidadEn(st, fr, pos);
      if (oc && oc.dueño === "ia") {
        const res = combate(st, fr, u, oc);
        if (res === "gana_atacante") {
          st.tablero[frOrigen] = st.tablero[frOrigen].filter((x) => x.id !== u.id);
          st.tablero[fr].push({ ...u, pos: { ...pos } });
        }
      } else if (!oc) {
        st.tablero[frOrigen] = st.tablero[frOrigen].filter((x) => x.id !== u.id);
        st.tablero[fr].push({ ...u, pos: { ...pos } });
        if (fr !== frOrigen) st.log.unshift(`🌀 ${u.icon} ${u.nombre} cruza el portal al otro frente.`);
      }
      st.movidas.push(u.id);
      comprobarFin(st);
      return st;
    });
    setSelUnidad(null);
  };

  const atacarCorazon = (fr, carril) => {
    setG((prev) => {
      const st = clonar(prev);
      const u = st.tablero[fr].find((x) => x.id === selUnidad.id);
      if (!u || u.pos.zona !== "campo" || u.pos.fila !== N_FILAS - 1 || u.pos.carril !== carril) return prev;
      const c = st.corazones.ia[fr][carril];
      if (!c?.vivo) return prev;
      c.vivo = false;
      st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== u.id);
      alCementerio(st, u);
      st.log.unshift(`💔 ${u.icon} ${u.nombre} destruye el corazón de ${TIPOS_CORAZON[c.tipo].nombre} griego (y muere).`);
      st.movidas.push(u.id);
      comprobarFin(st);
      return st;
    });
    setSelUnidad(null);
  };

  const turnoIA = (st) => {
    for (let fr = 0; fr < 2; fr++) {
      if (!st.manoIA.length) break;
      // Solo pueden sacrificarse unidades de la IA en SU zona de invocación (fila 6 o portal).
      const sacrificablesIA = st.tablero[fr]
        .filter((u) => u.dueño === "ia" && esZonaInvIA(u.pos))
        .sort((a, b) => a.fuerza - b.fuerza);
      const jugables = st.manoIA.filter((c) => c.sac === 0 || sacrificablesIA.length >= c.sac);
      if (!jugables.length) continue;
      const amenaza = st.tablero[fr].filter((u) => u.dueño === "jugador").length;
      const defensas = st.tablero[fr].filter((u) => u.dueño === "ia").length;
      if (defensas > amenaza + 1 && Math.random() < 0.4) continue;
      const carta = [...jugables].sort((a, b) => b.fuerza - a.fuerza)[0];

      if (carta.sac > 0) {
        const victimas = sacrificablesIA.slice(0, carta.sac);
        // No sacrifica si perdería algo igual o más fuerte que lo que invoca.
        if (victimas.length < carta.sac || victimas.some((v) => v.fuerza >= carta.fuerza)) continue;
        const hueco = { ...victimas[0].pos }; // la nueva carta ocupa el hueco del sacrificado
        for (const v of victimas) {
          st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== v.id);
          alCementerio(st, v);
          st.log.unshift(`🩸 La IA sacrifica a ${v.icon} ${v.nombre}.`);
        }
        st.manoIA = st.manoIA.filter((c) => c.id !== carta.id);
        st.tablero[fr].push({ ...carta, id: uid(), dueño: "ia", pos: hueco });
        st.log.unshift(`🔴 La IA invoca ${carta.icon} ${carta.nombre} sobre el hueco del sacrificio${hueco.zona === "portal" ? " (PORTAL)" : ""} (frente ${fr === 0 ? "norte" : "sur"}).`);
        continue;
      }

      const opciones = [];
      if (!unidadEn(st, fr, { zona: "portal" }) && Math.random() < 0.25) opciones.push({ zona: "portal" });
      for (const c of [0, 1]) {
        const pos = { zona: "campo", fila: N_FILAS - 1, carril: c };
        if (!unidadEn(st, fr, pos)) opciones.push(pos);
      }
      if (!opciones.length) continue;
      const pos = opciones[0];
      st.manoIA = st.manoIA.filter((c) => c.id !== carta.id);
      st.tablero[fr].push({ ...carta, id: uid(), dueño: "ia", pos: { ...pos } });
      st.log.unshift(`🔴 La IA invoca ${carta.icon} ${carta.nombre}${pos.zona === "portal" ? " en el PORTAL" : ""} (frente ${fr === 0 ? "norte" : "sur"}).`);
    }
    for (let fr = 0; fr < 2; fr++) {
      const mias = [...st.tablero[fr].filter((u) => u.dueño === "ia")]
        .sort((a, b) => (a.pos.fila ?? 9) - (b.pos.fila ?? 9));
      for (const u of mias) {
        if (!st.tablero[fr].some((x) => x.id === u.id)) continue;
        if (u.pos.zona === "campo" && u.pos.fila === 0) {
          const c = st.corazones.jugador[fr][u.pos.carril];
          if (c?.vivo) {
            c.vivo = false;
            st.tablero[fr] = st.tablero[fr].filter((x) => x.id !== u.id);
            alCementerio(st, u);
            st.log.unshift(`💔 ${u.icon} ${u.nombre} destruye tu corazón de ${TIPOS_CORAZON[c.tipo].nombre} (y muere).`);
            continue;
          }
          const otro = { zona: "campo", fila: 0, carril: 1 - u.pos.carril };
          const oc = unidadEn(st, fr, otro);
          if (!oc) { u.pos = otro; continue; }
          if (oc.dueño === "jugador") { combate(st, fr, u, oc); continue; }
          continue;
        }
        const candidatos = vecinos(fr, u.pos)
          .filter((v) => !v.teletransporte)
          .sort((a, b) => (a.fila ?? 9) - (b.fila ?? 9));
        let hecho = false;
        for (const v of candidatos) {
          if (v.zona !== "campo") continue;
          if (u.pos.zona === "campo" && v.fila >= u.pos.fila) continue;
          const oc = unidadEn(st, fr, v);
          if (!oc) { u.pos = { ...v }; hecho = true; break; }
        }
        if (!hecho) {
          for (const v of candidatos) {
            if (v.zona !== "campo") continue;
            if (u.pos.zona === "campo" && v.fila >= u.pos.fila) continue;
            const oc = unidadEn(st, fr, v);
            if (oc && oc.dueño === "jugador") {
              const res = combate(st, fr, u, oc);
              if (res === "gana_atacante") {
                const yo = st.tablero[fr].find((x) => x.id === u.id);
                if (yo) yo.pos = { ...v };
              }
              break;
            }
          }
        }
      }
    }
  };

  const terminarTurno = () => {
    if (g.fin || g.eventos.length || g.fase !== "juego" || huecosPendientes) return;
    setSelMano(null); setSelUnidad(null); setSacrificios([]);
    setG((prev) => {
      const st = clonar(prev);
      turnoIA(st);
      comprobarFin(st);
      if (!st.fin) {
        if (!st.mazoJ.length) { st.fin = "derrota"; st.log.unshift("🕳️ Tu mazo se ha agotado. DERROTA."); }
        else {
          [st.mazoJ, st.manoJ] = robar(st.mazoJ, st.manoJ);
          if (st.mazoIA.length) [st.mazoIA, st.manoIA] = robar(st.mazoIA, st.manoIA);
          else { st.fin = "victoria"; st.log.unshift("🏆 El mazo griego se ha agotado. VICTORIA."); }
        }
      }
      st.turno = prev.turno + 1;
      st.invocadoEnFrente = [false, false];
      st.movidas = [];
      st.log = st.log.slice(0, 40);
      return st;
    });
  };

  const cerrarEvento = () => setG((prev) => ({ ...prev, eventos: prev.eventos.slice(1) }));

  // ============ PANTALLA DE BATALLA ============
  const Dado = ({ valor, esquiva }) => {
    const [n, setN] = useState(1);
    const [parado, setParado] = useState(false);
    useEffect(() => {
      setParado(false);
      let ticks = 0;
      const it = setInterval(() => {
        ticks++;
        if (ticks > 12) { setN(valor); setParado(true); clearInterval(it); }
        else setN(Math.floor(Math.random() * 12) + 1);
      }, 70);
      return () => clearInterval(it);
    }, [valor]);
    const acierta = valor > esquiva;
    return (
      <div style={{
        width: 64, height: 64, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, fontWeight: 800, color: "#141414",
        background: parado
          ? (acierta ? "linear-gradient(160deg,#f0d27a,#c8952f)" : "linear-gradient(160deg,#8b93a7,#565e72)")
          : "linear-gradient(160deg,#e8e2d4,#a9a291)",
        clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        transform: parado ? "rotate(0deg) scale(1.1)" : `rotate(${n * 30}deg)`,
        transition: "transform .07s",
        filter: parado ? `drop-shadow(0 0 12px ${acierta ? "#f0d27a" : "#565e72"})` : "none",
      }}>{n}</div>
    );
  };

  const PantallaBatalla = ({ ev }) => {
    const { atacante, defensor, g1 } = ev;
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 50, background: "rgba(5,7,11,0.9)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}>
        <div style={{
          width: "100%", maxWidth: 380, background: "#10141d", borderRadius: 14,
          border: "1px solid #d4a941", padding: "16px 18px", textAlign: "center",
          boxShadow: "0 0 40px rgba(212,169,65,0.25)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: 4 }}>
            {[atacante, defensor].map((c, i) => (
              <div key={i}>
                <div style={{ fontSize: 38, filter: `drop-shadow(0 0 8px ${c.dueño === "jugador" ? "#e05c3a" : "#4a9de0"})` }}>{c.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{c.nombre}</div>
                <div style={{ fontSize: 11, color: "#cfc7b4" }}>
                  {c.fuerza}⚔ · {c.esq}🌀 · <span style={{ color: VERDE_MAGIA }}>{ROMANO[c.magia]}</span> · {iconosElems(c)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#6f7893", letterSpacing: 3 }}>— VS —</div>
          <div style={{ margin: "10px 0" }}>
            <div style={{ fontSize: 12, color: "#d4a941", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
              Ataque de {atacante.nombre}
            </div>
            <Dado valor={g1.tirada} esquiva={defensor.esq} />
            <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
              🎲 Saca <b>{g1.tirada}</b> contra esquiva <b>{defensor.esq}</b>🌀 →{" "}
              {g1.acierta ? <b style={{ color: "#f0d27a" }}>¡impacto!</b> : <b style={{ color: "#8b93a7" }}>{defensor.nombre} esquiva el golpe.</b>}
            </div>
            {g1.acierta && (
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                {atacante.icon} <b>{atacante.fuerza}</b>⚔
                {g1.bono ? <span style={{ color: "#f0906a" }}> +{g1.bono} ({ELEMENTOS[g1.elem].icon} domina a {ELEMENTOS[g1.contra].icon})</span> : ""}{" "}
                frente a {defensor.icon} <b>{defensor.fuerza}</b>⚔ →{" "}
                {g1.mata
                  ? <b style={{ color: "#e05c3a" }}>☠️ {defensor.nombre} muere.</b>
                  : <b style={{ color: "#8b93a7" }}>{defensor.nombre} resiste el golpe.</b>}
              </div>
            )}
          </div>
          <button onClick={cerrarEvento} style={{
            marginTop: 10, background: "linear-gradient(180deg,#d4a941,#a87f24)", color: "#141414",
            border: "none", borderRadius: 8, padding: "9px 26px", fontSize: 14, fontWeight: 700,
            fontFamily: "inherit", cursor: "pointer",
          }}>Continuar {g.eventos.length > 1 ? `(${g.eventos.length - 1} más)` : ""}</button>
        </div>
      </div>
    );
  };

  // ============ CARTA A PANTALLA COMPLETA ============
  const CartaGrande = ({ c }) => {
    const esDios = c.tipo === "dios";
    const colorBorde = esDios ? "#d4a941" : c.dueño === "ia" ? "#3d7fb8" : "#b5432c";
    const colorBrillo = esDios ? "#f0d27a" : c.dueño === "ia" ? "#4a9de0" : "#e05c3a";
    return (
      <div onClick={() => setVerCarta(null)} style={{
        position: "fixed", inset: 0, zIndex: 60, background: "rgba(5,7,11,0.94)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          width: "100%", maxWidth: 320, borderRadius: 18, padding: "16px 16px 12px",
          background: "linear-gradient(170deg,#1c2230,#12161f)",
          border: `3px solid ${colorBorde}`,
          boxShadow: `0 0 50px ${colorBrillo}44, 0 10px 40px rgba(0,0,0,0.8)`,
          display: "flex", flexDirection: "column", boxSizing: "border-box",
          userSelect: "none", WebkitUserSelect: "none",
        }}>
          {/* cabecera: coste de sacrificio + nombre */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              minWidth: 42, height: 42, borderRadius: 8, background: "#0d1017",
              border: `1.5px solid ${colorBorde}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: esDios ? 20 : (c.sac ? 15 : 20), color: "#8b93a7",
            }}>{esDios ? "⚡" : c.sac ? "❤️".repeat(c.sac) : "—"}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>{c.nombre}</div>
              <div style={{ fontSize: 11, color: "#a89f8c", letterSpacing: 1, textTransform: "uppercase" }}>
                {esDios ? "Carta de Dios" : c.dueño === "ia" ? "Griegos" : "Vikingos"}
              </div>
            </div>
          </div>
          {/* ilustración */}
          <div style={{
            height: 160, borderRadius: 12, border: "1px solid #252c3c",
            background: "radial-gradient(ellipse at 50% 30%, #232c40, #0d1017 75%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 90, filter: `drop-shadow(0 0 18px ${colorBrillo})` }}>{c.icon}</span>
          </div>
          {/* barra de stats (los dioses no la llevan) */}
          {!esDios && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              margin: "-14px 8px 0", position: "relative",
              background: "linear-gradient(180deg,#232a3a,#161c29)",
              border: "1.5px solid #d4a941", borderRadius: 12, padding: "6px 16px",
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#e0705a" }}>{c.fuerza}⚔</span>
              <span style={{
                width: 40, height: 40, marginTop: -20, borderRadius: "50%",
                background: "radial-gradient(circle at 50% 35%, #2a3348, #12161f 80%)",
                border: `1.5px solid ${c.magia ? VERDE_MAGIA : "#3a4258"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: c.magia ? 17 : 20, fontWeight: 800,
                color: c.magia ? VERDE_MAGIA : "#4a5266",
                boxShadow: c.magia ? `0 0 14px ${VERDE_MAGIA}55` : "none",
              }}>{ROMANO[c.magia]}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#6fb3e8" }}>{c.esq}🌀</span>
            </div>
          )}
          {/* elementos */}
          {!esDios && (
            <div style={{ textAlign: "center", fontSize: 24, margin: "10px 0 2px" }}>{iconosElems(c)}</div>
          )}
          {/* efecto */}
          <div style={{
            marginTop: 8, borderRadius: 10, background: "#0d1017", border: "1px solid #252c3c",
            padding: "10px 12px", fontSize: 14, lineHeight: 1.5, color: "#c9c2b2", minHeight: 44,
          }}>
            {c.efecto
              ? <span><b style={{ color: "#f0d27a" }}>Efecto:</b> {c.efecto}</span>
              : <span style={{ color: "#5a6278", fontStyle: "italic" }}>Sin efecto.</span>}
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#6f7893", marginTop: 10 }}>
            Toca fuera de la carta para cerrar ✕
          </div>
        </div>
      </div>
    );
  };

  // ============ PIEZAS DEL PUENTE (vertical, ancho) ============
  const CELL_W = 58, CELL_H = 68, GAP = 14, CHAIN = 12;
  const eligiendoSacrificios = cartaMano && faltanSac > 0 && !huecosPendientes;
  // arco: las filas se separan del abismo hacia el portal, máximo en la central
  const ARCO = [0, 7, 13, 18, 13, 7, 0];

  const Ficha = ({ u }) => (
    <div style={{
      width: "100%", height: "100%", borderRadius: 6, padding: "2px 0",
      background: "linear-gradient(170deg,#1c2230,#12161f)",
      border: `1.5px solid ${u.dueño === "jugador" ? "#b5432c" : "#3d7fb8"}`,
      boxShadow: "0 2px 6px rgba(0,0,0,.6)",
      textAlign: "center", lineHeight: 1.12, boxSizing: "border-box",
      display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      <div style={{ fontSize: 21, filter: `drop-shadow(0 0 4px ${u.dueño === "jugador" ? "#e05c3a" : "#4a9de0"})` }}>{u.icon}</div>
      <div style={{ fontSize: 9.5, fontWeight: 700 }}>
        <span style={{ color: "#e0705a" }}>{u.fuerza}⚔</span>{" "}
        <span style={{ color: VERDE_MAGIA }}>{ROMANO[u.magia]}</span>
      </div>
      <div style={{ fontSize: 8.5 }}>{iconosElems(u)}<span style={{ color: "#6fb3e8" }}>{u.esq}🌀</span></div>
    </div>
  );

  // cadena vertical entre losas
  const CadenaV = () => (
    <div style={{
      width: 4, height: CHAIN, margin: "0 auto",
      background: "repeating-linear-gradient(180deg, #6b6252 0 3px, #3a3428 3px 5px)",
      borderRadius: 2, boxShadow: "0 1px 2px rgba(0,0,0,.8)",
    }} />
  );
  const CadenaH = () => (
    <div style={{
      width: CHAIN, height: 4, alignSelf: "center", flexShrink: 0,
      background: "repeating-linear-gradient(90deg, #6b6252 0 3px, #3a3428 3px 5px)",
      borderRadius: 2, boxShadow: "0 1px 2px rgba(0,0,0,.8)",
    }} />
  );

  const Losa = ({ fr, pos, tipo }) => {
    const u = unidadEn(g, fr, pos);
    const esZonaInvocacion = esZonaInvJugador(pos);
    // Invocación directa (sin sacrificios) en losa vacía de la zona de invocación.
    const esInvocable =
      g.fase === "juego" && cartaMano && cartaMano.sac === 0 && !u &&
      !g.invocadoEnFrente[fr] && esZonaInvocacion;
    const dest = esDestino(fr, pos);
    const seleccionada = selUnidad && u && u.id === selUnidad.id;
    const marcadaSac = u && sacrificios.includes(u.id);
    // Solo se sacrifica en la zona de invocación (regla 3) y en frentes
    // donde aún no se ha invocado este turno.
    const sacrificable =
      eligiendoSacrificios && u && u.dueño === "jugador" && !marcadaSac &&
      esZonaInvocacion && !g.invocadoEnFrente[fr];
    // Hueco brillante dejado por un sacrificio doble: toca para invocar ahí.
    const esHueco = !!(huecosPendientes && !u &&
      huecosPendientes.huecos.some((h) => h.fr === fr && mismaPos(h.pos, pos)));
    const movida = u && u.dueño === "jugador" && g.movidas.includes(u.id);
    const esLosaInv = pos.zona === "campo" && (pos.fila === 0 || pos.fila === N_FILAS - 1);

    const onClick = () => {
      if (consumirPulsacion()) return; // la pulsación larga ya abrió la carta en grande
      if (g.fin || g.eventos.length || g.fase !== "juego") return;
      if (huecosPendientes) {
        // Hasta colocar la invocación pendiente no se puede hacer otra cosa.
        if (esHueco) return colocarEnHueco(fr, pos);
        return;
      }
      if (sacrificable) {
        // Regla 1: si solo pide un alma, se sacrifica y la nueva ocupa su losa al instante.
        if (cartaMano.sac === 1) return invocar(fr, pos, [u.id]);
        // Coste doble: al marcar el segundo, el sacrificio se ejecuta al momento.
        return marcarSacrificio(u);
      }
      if (marcadaSac) return setSacrificios((s) => s.filter((id) => id !== u.id));
      if (esInvocable) return invocar(fr, pos);
      if (dest) return mover(fr, pos);
      if (u && u.dueño === "jugador" && !movida && !cartaMano) {
        setSelUnidad(seleccionada ? null : { fr, id: u.id });
      }
    };

    const esPortal = tipo === "portal";
    return (
      <div onClick={onClick} {...(u ? pulsacionLarga(() => setVerCarta(u)) : {})} style={{
        userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none",
        width: CELL_W, height: CELL_H, borderRadius: 9,
        position: "relative", boxSizing: "border-box", padding: 2, flexShrink: 0,
        background:
          dest ? "rgba(224,92,58,0.30)" :
          esInvocable ? "rgba(212,169,65,0.28)" :
          esHueco ? "rgba(212,169,65,0.38)" :
          marcadaSac ? "rgba(160,40,40,0.4)" :
          esPortal ? "#170f24" :
          esLosaInv
            ? "linear-gradient(160deg,#2a3d2c,#16241a), repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,.15) 6px 7px)"
            : "linear-gradient(160deg,#3a3f4d,#22252f), repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,.18) 6px 7px)",
        backgroundBlendMode: "overlay",
        border:
          seleccionada ? "2px solid #f0d27a" :
          esHueco ? "2px solid #f0d27a" :
          marcadaSac ? "2px solid #c03030" :
          sacrificable ? "2px solid #8a3a3a" :
          dest ? "2px solid #e05c3a" :
          esInvocable ? "2px solid #d4a941" :
          esPortal ? "2px solid transparent" :
          esLosaInv ? "2px solid #4d7a56" :
          "2px solid #4a4f60",
        cursor: esInvocable || dest || sacrificable || marcadaSac || esHueco || (u && u.dueño === "jugador" && !movida && !cartaMano) ? "pointer" : "default",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow:
          seleccionada ? "0 0 14px rgba(240,210,122,0.55)" :
          esHueco ? "0 0 18px rgba(240,210,122,0.65)" :
          "0 7px 12px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.07)",
        opacity: movida && !seleccionada ? 0.55 : 1,
        animation: esHueco ? "latido .9s infinite" : "none",
        transition: "all .15s", zIndex: 1,
      }}>
        {esPortal && (
          <div style={{
            position: "absolute", inset: -3, borderRadius: 12, zIndex: -1,
            background: "conic-gradient(#9a5fe0, #3a1a5c, #d18aff, #3a1a5c, #9a5fe0)",
            animation: "girar 3.5s linear infinite",
            filter: "blur(1px) drop-shadow(0 0 8px #9a5fe0)",
          }} />
        )}
        {esPortal && <div style={{ position: "absolute", inset: 2, borderRadius: 8, background: "#170f24", zIndex: -1 }} />}
        {!u && esHueco && <div style={{ fontSize: 20, filter: "drop-shadow(0 0 8px #f0d27a)" }}>✨</div>}
        {!u && esPortal && !esHueco && <div style={{ fontSize: 18, filter: "drop-shadow(0 0 6px #b98aff)", animation: "girar 6s linear infinite" }}>🌀</div>}
        {!u && esLosaInv && !esHueco && <div style={{
          fontSize: 17,
          filter: "sepia(1) saturate(4) hue-rotate(-18deg) brightness(1.15) drop-shadow(0 0 5px #d4a941)",
        }}>🌳</div>}
        {u && <Ficha u={u} />}
        {marcadaSac && <div style={{ position: "absolute", top: 1, right: 3, fontSize: 11 }}>🩸</div>}
      </div>
    );
  };

  const CorazonUI = ({ c, atacable, colocable, onClick, tam = 27 }) => (
    <div onClick={(atacable || colocable) ? onClick : undefined} style={{
      width: CELL_W, textAlign: "center", flexShrink: 0,
      cursor: atacable || colocable ? "pointer" : "default",
      transition: "all .2s", transform: atacable ? "scale(1.2)" : "none",
    }}>
      <div style={{
        fontSize: tam,
        filter: !c ? (colocable ? "drop-shadow(0 0 8px #f0d27a)" : "grayscale(1) brightness(0.6)") :
          c.vivo ? `drop-shadow(0 0 ${atacable ? 12 : 6}px ${atacable ? "#f0d27a" : TIPOS_CORAZON[c.tipo].color})` :
          "grayscale(1) brightness(0.35)",
        animation: colocable ? "latido 1s infinite" : "none",
      }}>{!c ? "🤍" : c.vivo ? TIPOS_CORAZON[c.tipo].emoji : "🖤"}</div>
      <div style={{ fontSize: 6.5, color: "#a89f8c", letterSpacing: .5, textTransform: "uppercase", marginTop: -2, fontWeight: 700 }}>
        {c ? TIPOS_CORAZON[c.tipo].nombre : colocable ? "elige" : ""}
      </div>
    </div>
  );

  // Frente vertical: IA arriba (fila 6), tú abajo (fila 0). Portal en el borde exterior, fila central.
  const Frente = ({ fr }) => {
    const izq = fr === 0;
    const filaLosas = (fila, extra = null) => {
      const celdas = [];
      [0, 1].forEach((c, i) => {
        if (i > 0) celdas.push(<CadenaH key={"ch" + c} />);
        celdas.push(<Losa key={c} fr={fr} pos={{ zona: "campo", fila, carril: c }} />);
      });
      const contenido = extra ? (izq ? [extra, <CadenaH key="chp" />, ...celdas] : [...celdas, <CadenaH key="chp" />, extra]) : celdas;
      return (
        <div key={"f" + fila} style={{
          display: "flex", alignItems: "center",
          justifyContent: izq ? "flex-end" : "flex-start",
          transform: `translateX(${izq ? -ARCO[fila] : ARCO[fila]}px)`,
        }}>{contenido}</div>
      );
    };
    // cadenas verticales entre filas, bajo cada carril
    const filaCadenas = (fila) => (
      <div key={"c" + fila} style={{
        display: "flex", justifyContent: izq ? "flex-end" : "flex-start", gap: GAP,
        transform: `translateX(${izq ? -(ARCO[fila] + ARCO[fila + 1]) / 2 : (ARCO[fila] + ARCO[fila + 1]) / 2}px)`,
      }}>
        <div style={{ width: CELL_W }}><CadenaV /></div>
        <div style={{ width: CELL_W }}><CadenaV /></div>
      </div>
    );
    const portal = <Losa key="portal" fr={fr} pos={{ zona: "portal" }} tipo="portal" />;
    const filaCorazones = (lado) => {
      const esJ = lado === "jugador";
      return (
        <div key={lado} style={{ display: "flex", justifyContent: izq ? "flex-end" : "flex-start", gap: GAP }}>
          {[0, 1].map((c) => {
            const cz = g.corazones[lado][fr][c];
            let props = {};
            if (esJ) {
              props.colocable = g.fase === "colocacion" && !cz && !!tipoCorazon;
              props.onClick = () => colocarCorazon(fr, c);
            } else {
              props.atacable = dests.some((d) => d.corazon && d.carril === c) && selUnidad?.fr === fr;
              props.onClick = () => atacarCorazon(fr, c);
            }
            return <CorazonUI key={c} c={cz} {...props} />;
          })}
        </div>
      );
    };

    const filas = [];
    for (let f = N_FILAS - 1; f >= 0; f--) {
      filas.push(filaLosas(f, f === FILA_PORTAL ? portal : null));
      if (f > 0) filas.push(filaCadenas(f - 1));
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {filaCorazones("ia")}
        <div style={{ display: "flex", justifyContent: izq ? "flex-end" : "flex-start", gap: GAP }}>
          <div style={{ width: CELL_W }}><CadenaV /></div>
          <div style={{ width: CELL_W }}><CadenaV /></div>
        </div>
        {filas}
        <div style={{ display: "flex", justifyContent: izq ? "flex-end" : "flex-start", gap: GAP }}>
          <div style={{ width: CELL_W }}><CadenaV /></div>
          <div style={{ width: CELL_W }}><CadenaV /></div>
        </div>
        {filaCorazones("jugador")}
      </div>
    );
  };

  // ============ LAYOUT ============
  return (
    <div style={{
      minHeight: "100vh",
      background: `
        radial-gradient(1px 1px at 12% 22%, #fff9, transparent 2px),
        radial-gradient(1px 1px at 78% 12%, #fff7, transparent 2px),
        radial-gradient(1.5px 1.5px at 55% 35%, #ffe9c9aa, transparent 2px),
        radial-gradient(1px 1px at 30% 70%, #fff6, transparent 2px),
        radial-gradient(1px 1px at 88% 62%, #cfe4ff88, transparent 2px),
        radial-gradient(1.5px 1.5px at 65% 85%, #fff8, transparent 2px),
        radial-gradient(1px 1px at 8% 90%, #ffd9f2aa, transparent 2px),
        radial-gradient(ellipse 60% 40% at 75% 15%, #2a1a4a55, transparent),
        radial-gradient(ellipse 50% 35% at 20% 80%, #14304a44, transparent),
        radial-gradient(ellipse at 50% 45%, #131722 0%, #07080f 75%)
      `,
      color: "#e8e2d4", fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
      padding: "10px 2px 150px", boxSizing: "border-box", overflowX: "hidden",
    }}>
      <style>{`
        @keyframes latido { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes girar { to { transform: rotate(360deg) } }
        @keyframes ascua {
          0% { transform: translateY(0) scale(1); opacity: .7 }
          100% { transform: translateY(-60px) scale(.4); opacity: 0 }
        }
        @keyframes nube { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(12px) } }
      `}</style>
      {g.eventos.length > 0 && <PantallaBatalla ev={g.eventos[0]} />}
      {verCarta && <CartaGrande c={verCarta} />}

      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#d4a941", textTransform: "uppercase" }}>MitoLogos</div>
        <h1 style={{ margin: "1px 0 0", fontSize: 20, fontWeight: 400, textShadow: "0 0 14px rgba(212,169,65,.4)" }}>Duelo de Corazones</h1>
        <div style={{ fontSize: 11, color: "#8b93a7" }}>
          Turno {g.turno} · <span style={{ color: "#e05c3a" }}>Vikingos</span> vs <span style={{ color: "#4a9de0" }}>Griegos</span>
        </div>
      </div>

      {g.fase === "colocacion" && (
        <div style={{
          maxWidth: 400, margin: "0 auto 6px", padding: "6px 10px", borderRadius: 10,
          background: "rgba(212,169,65,0.1)", border: "1px solid #d4a941", textAlign: "center",
        }}>
          <div style={{ fontSize: 11.5, marginBottom: 5 }}>Elige un corazón y colócalo en un hueco 🤍 (abajo):</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {g.corazonesPendientes.map((t) => (
              <div key={t} onClick={() => setTipoCorazon(tipoCorazon === t ? null : t)} style={{
                padding: "3px 9px", borderRadius: 8, cursor: "pointer", fontSize: 11.5,
                border: `1.5px solid ${tipoCorazon === t ? "#f0d27a" : TIPOS_CORAZON[t].color}`,
                background: tipoCorazon === t ? "rgba(240,210,122,0.15)" : "transparent",
              }}>{TIPOS_CORAZON[t].emoji} {TIPOS_CORAZON[t].nombre}</div>
            ))}
          </div>
        </div>
      )}

      {/* ===== EL PUENTE SOBRE EL UNIVERSO ===== */}
      <div style={{ overflowX: "auto", padding: "4px 0" }}>
        <div style={{ width: "max-content", margin: "0 auto" }}>

          {/* pilas IA */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <Pila etiqueta="Cement. IA" n={g.cementerio.ia.length} />
            <Pila etiqueta="Mazo IA" n={g.mazoIA.length} />
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
            <Frente fr={0} />

            {/* ABISMO INFERNAL CENTRAL (vertical) */}
            <div style={{
              position: "relative", width: 84, alignSelf: "stretch",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `
                radial-gradient(ellipse 90% 70% at 120% 50%, #7a2408bb, transparent 70%),
                radial-gradient(ellipse 90% 70% at -20% 50%, #7a2408bb, transparent 70%),
                radial-gradient(ellipse 70% 90% at 50% 50%, #d4551a55, transparent 65%),
                linear-gradient(90deg, transparent, #1a0803 35%, #2a0d04 65%, transparent)
              `,
              borderRadius: 16,
            }}>
              {[18, 42, 66].map((y, i) => (
                <div key={i} style={{
                  position: "absolute", top: `${y}%`, left: `${25 + i * 20}%`,
                  width: 3, height: 3, borderRadius: "50%",
                  background: i % 2 ? "#ffb35c" : "#ff7a3a",
                  boxShadow: "0 0 6px #ff9a4a",
                  animation: `ascua ${2.6 + i * 0.6}s linear infinite`,
                  animationDelay: `${i * 0.7}s`, opacity: .7,
                }} />
              ))}
              <div style={{
                position: "absolute", width: 40, height: 150, borderRadius: "50%",
                background: "radial-gradient(ellipse, #e8e2d422, transparent 70%)",
                filter: "blur(4px)", animation: "nube 7s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute", width: 26, height: 100, borderRadius: "50%", marginLeft: 22,
                background: "radial-gradient(ellipse, #e8e2d41c, transparent 70%)",
                filter: "blur(3px)", animation: "nube 9s ease-in-out infinite reverse",
              }} />
              {/* hueco de carta de Dios */}
              <div {...(g.dios ? pulsacionLarga(() => setVerCarta(g.dios)) : {})} style={{
                userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none",
                width: 58, height: 76, borderRadius: 9, boxSizing: "border-box", zIndex: 2,
                border: g.dios ? "2px solid #d4a941" : "2px dashed #d4a94199",
                background: g.dios ? "linear-gradient(170deg,#2a2410,#171207)" : "rgba(13,16,23,0.7)",
                boxShadow: g.dios ? "0 0 20px rgba(212,169,65,0.6)" : "0 0 12px rgba(212,169,65,0.25)",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: 2, textAlign: "center",
              }} title={g.dios ? `${g.dios.nombre}: ${g.dios.efecto}` : "Zona de Dioses y Lugares"}>
                {g.dios ? (
                  <>
                    <div style={{ fontSize: 21, filter: "drop-shadow(0 0 6px #f0d27a)" }}>{g.dios.icon}</div>
                    <div style={{ fontSize: 7.5, fontWeight: 800, color: "#f0d27a", lineHeight: 1 }}>{g.dios.nombre}</div>
                    <div style={{ fontSize: 5.5, color: "#a89f8c", lineHeight: 1.15, marginTop: 1 }}>{g.dios.efecto}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 16, color: "#d4a941" }}>⚡</div>
                )}
              </div>
              <div style={{
                position: "absolute", bottom: 6, fontSize: 6, color: "#c96a3a", width: "100%",
                textAlign: "center", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700,
              }}>Abismo de<br/>los Dioses</div>
            </div>

            <Frente fr={1} />
          </div>

          {/* pilas jugador */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <Pila etiqueta="Cement." n={g.cementerio.jugador.length} />
            <Pila etiqueta="Mazo" n={g.mazoJ.length} />
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "6px 0", fontSize: 11.5, minHeight: 16,
        color: selMano || selUnidad || tipoCorazon ? "#d4a941" : "#8b93a7" }}>
        {g.fin ? "" :
          g.fase === "colocacion" ? (tipoCorazon ? "Toca un hueco 🤍 abajo." : "Selecciona un tipo de corazón arriba.") :
          huecosPendientes ? "✨ ¡Sacrificio hecho! Toca una de las dos casillas que brillan para invocar ahí a tu carta." :
          eligiendoSacrificios ? (
            cartaMano.sac === 1
              ? "🩸 Toca una carta TUYA en zona de invocación (🌳/🌀): se sacrifica y la nueva ocupa su losa."
              : `🩸 Marca ${faltanSac} carta${faltanSac > 1 ? "s" : ""} TUYAS en zona de invocación (🌳/🌀): al marcar la segunda, el sacrificio es inmediato.`
          ) :
          cartaMano ? "Invoca en tus losas verdes 🌳 (abajo) o en un portal 🌀 (1 por frente)." :
          selUnidad ? "Losas rojas: mover o combatir. Corazón iluminado: atacar." :
          "Toca una carta tuya del tablero o una de tu mano."}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8 }}>
        <button onClick={terminarTurno} disabled={!!g.fin || g.eventos.length > 0 || g.fase !== "juego"} style={{
          background: g.fin || g.fase !== "juego" ? "#2a2f3d" : "linear-gradient(180deg,#d4a941,#a87f24)",
          color: "#141414", border: "none", borderRadius: 8, padding: "10px 22px",
          fontSize: 15, fontWeight: 700, fontFamily: "inherit",
          cursor: g.fin || g.fase !== "juego" ? "default" : "pointer", letterSpacing: 1,
        }}>Terminar turno ⚔️</button>
        <button onClick={() => { setG(estadoInicial()); setSelMano(null); setSelUnidad(null); setSacrificios([]); setTipoCorazon(null); setHuecosPendientes(null); setVerCarta(null); }} style={{
          background: "transparent", color: "#8b93a7", border: "1px solid #3a4258",
          borderRadius: 8, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", cursor: "pointer",
        }}>Reiniciar</button>
      </div>

      {g.fin && (
        <div style={{
          textAlign: "center", padding: 14, margin: "0 auto 8px", maxWidth: 340, borderRadius: 10,
          background: g.fin === "victoria" ? "rgba(212,169,65,0.12)" : "rgba(224,92,58,0.10)",
          border: `1px solid ${g.fin === "victoria" ? "#d4a941" : "#e05c3a"}`, fontSize: 18,
        }}>{g.fin === "victoria" ? "🏆 ¡VICTORIA VIKINGA!" : "💀 DERROTA"}</div>
      )}

      <div style={{
        maxWidth: 430, margin: "0 auto", background: "#10141dcc", border: "1px solid #252c3c",
        borderRadius: 8, padding: "8px 12px", fontSize: 11.5, lineHeight: 1.5, color: "#aab0c0",
        maxHeight: 96, overflowY: "auto", fontFamily: "ui-monospace, Menlo, monospace",
      }}>
        {g.log.map((l, i) => <div key={i} style={{ opacity: i === 0 ? 1 : 0.65 }}>{l}</div>)}
      </div>

      <div style={{ textAlign: "center", fontSize: 10, color: "#6f7893", margin: "6px 0 4px" }}>
        Losas verdes 🌳: invocas en las tuyas (abajo), golpeas corazones desde las rivales (arriba) ·
        🩸 sacrificios solo en zona de invocación; el nuevo ocupa el hueco ·
        🌀 portal · 💧&gt;🔥&gt;🌪️&gt;⚡&gt;💧 (+2)
      </div>

      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, padding: "14px 8px 10px",
        background: "linear-gradient(transparent, #07080f 30%)",
        display: "flex", gap: 7, overflowX: "auto", zIndex: 20,
        justifyContent: g.manoJ.length < 4 ? "center" : "flex-start",
      }}>
        {g.manoJ.map((c) => {
          const sel = selMano === c.id;
          return (
            <div key={c.id} onClick={() => {
              if (consumirPulsacion()) return; // la pulsación larga ya abrió la carta en grande
              if (g.fin || g.eventos.length || g.fase !== "juego" || huecosPendientes) return;
              setSelUnidad(null); setSacrificios([]);
              setSelMano(sel ? null : c.id);
            }} {...pulsacionLarga(() => setVerCarta(c))} style={{
              userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none",
              minWidth: 92, width: 92, borderRadius: 10, padding: "5px 5px 4px", cursor: "pointer",
              background: "linear-gradient(170deg,#1c2230,#12161f)",
              border: `1.5px solid ${sel ? "#f0d27a" : "#b5432c"}`,
              transform: sel ? "translateY(-10px)" : "none",
              transition: "all .15s",
              boxShadow: sel ? "0 6px 16px rgba(240,210,122,0.3)" : "0 3px 10px rgba(0,0,0,0.45)",
              display: "flex", flexDirection: "column", boxSizing: "border-box",
              opacity: g.fase === "juego" ? 1 : 0.5,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <div style={{
                  minWidth: 18, height: 18, borderRadius: 4, background: "#0d1017",
                  border: "1px solid #b5432c", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: c.sac ? 8 : 10, letterSpacing: -1.5, color: "#8b93a7",
                }}>{c.sac ? "❤️".repeat(c.sac) : "—"}</div>
                <div style={{ fontSize: 8.5, fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nombre}</div>
              </div>
              <div style={{
                height: 42, borderRadius: 6, border: "1px solid #252c3c",
                background: "radial-gradient(ellipse at 50% 30%, #232c40, #0d1017 75%)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
              }}>{c.icon}</div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                margin: "-7px 2px 0", position: "relative",
                background: "linear-gradient(180deg,#232a3a,#161c29)",
                border: "1px solid #d4a941", borderRadius: 7, padding: "2px 6px",
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#e0705a" }}>{c.fuerza}⚔</span>
                <span style={{
                  width: 20, height: 20, marginTop: -9, borderRadius: "50%",
                  background: "radial-gradient(circle at 50% 35%, #2a3348, #12161f 80%)",
                  border: `1px solid ${c.magia ? VERDE_MAGIA : "#3a4258"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: c.magia ? 9 : 11, fontWeight: 800,
                  color: c.magia ? VERDE_MAGIA : "#4a5266",
                  boxShadow: c.magia ? `0 0 8px ${VERDE_MAGIA}55` : "none",
                }}>{ROMANO[c.magia]}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#6fb3e8" }}>{c.esq}🌀</span>
              </div>
              <div style={{
                marginTop: 3, borderRadius: 6, background: "#0d1017", border: "1px solid #252c3c",
                padding: "3px 5px", fontSize: 7.5, lineHeight: 1.35, color: "#c9c2b2",
                minHeight: 24, position: "relative",
              }}>
                <span style={{ float: "right", fontSize: 9, marginLeft: 3 }}>{iconosElems(c)}</span>
                {c.efecto
                  ? <span><b style={{ color: "#f0d27a" }}>Efecto:</b> {c.efecto}</span>
                  : <span style={{ color: "#5a6278", fontStyle: "italic" }}>Sin efecto.</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  function Pila({ etiqueta, n }) {
    return (
      <div style={{ textAlign: "center", width: 54 }}>
        <div style={{
          width: 38, height: 48, margin: "0 auto", borderRadius: 6, position: "relative",
          background: n > 0
            ? "repeating-linear-gradient(135deg, #1d2436 0 4px, #232c44 4px 8px)"
            : "rgba(10,13,20,0.5)",
          border: `2px solid ${n > 0 ? "#d4a941" : "#3a4258"}`,
          boxShadow: n > 1 ? "3px 3px 0 #12161f, 3px 3px 0 1px #3a4258" : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {n > 0 && <div style={{ fontSize: 13, color: "#d4a941", opacity: .8 }}>🜏</div>}
          <div style={{
            position: "absolute", bottom: -7, right: -7, minWidth: 17, height: 17,
            borderRadius: "50%", background: "#d4a941", color: "#141414",
            fontSize: 9.5, fontWeight: 800, display: "flex", alignItems: "center",
            justifyContent: "center", border: "1.5px solid #0b0d13",
          }}>{n}</div>
        </div>
        <div style={{ fontSize: 7, color: "#a89f8c", letterSpacing: 1, textTransform: "uppercase", marginTop: 5, fontWeight: 700 }}>{etiqueta}</div>
      </div>
    );
  }
}
