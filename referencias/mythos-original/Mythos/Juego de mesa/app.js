// ============================================================
// BASE DE DATOS OFICIAL — 45 Cartas de MitoLogos: Duelo de Corazones
// Fuente de verdad: Dossier oficial (PDF Kimi.ai export)
// ============================================================
const defaultCards = [
  // #1 TORNADO
  {
    id: 1,
    nombre: 'Tornado',
    tipo: 'Magica',
    civilizacion: 'Neutral',
    color: 'verde',
    nivel: 'M',
    magia: 2,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Viento',
    efecto: 'Levanta todas las cartas en juego de esa parte del campo y las devuelve a la mano de sus duenos.',
    descripcion: 'Una espiral de viento cosmico que barre el tablero. Nadie puede resistir su ira.'
  },
  // #2 EL OJO DE ODIN
  {
    id: 2,
    nombre: 'El Ojo de Odin',
    tipo: 'Magica',
    civilizacion: 'Vikinga',
    color: 'rojo',
    nivel: 'M',
    magia: 5,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    efecto: 'Revela la mano del rival durante 10 segundos. El jugador puede ver todas las cartas que el oponente tiene en mano.',
    descripcion: 'El ojo sacrificado del Padre de Todos. Coste: la razon. Recompensa: omnisciencia.',
    imagen: './yugioh_ojo_odin_art.png'
  },
  // #3 EL SABIO
  {
    id: 3,
    nombre: 'El Sabio',
    tipo: 'Personaje',
    civilizacion: 'Griega',
    color: 'azul',
    nivel: 'N1',
    magia: 3,
    ataque: 3, fe: 3, des: 12,
    costeSacrificio: 1,
    elemento: 'Viento',
    efecto: 'Sabiduria: su nivel de evasion es 12. Solo le puede acertar un 12 natural en el d12.',
    descripcion: 'Anciano de barba larga y blanca como la nieve, con ojos profundos que brillan con fulgor azulado. Viste una tunica desgastada por los anos del conocimiento.',
    imagen: './yugioh_sabio_art.png'
  },
  // #4 HERMES (LEGENDARIA)
  {
    id: 4,
    nombre: 'Hermes',
    tipo: 'Personaje',
    civilizacion: 'Griega',
    color: 'azul',
    nivel: 'N2',
    magia: 2,
    ataque: 4, fe: 1, des: 8,
    costeSacrificio: 2,
    legendaria: true,
    elemento: 'Viento',
    efecto: 'Mensajero Divino: puede moverse instantaneamente a su casilla simetrica del otro frente del tablero.',
    descripcion: 'El heraldo de los dioses olimpicos. Sandalias aladas que desafian el tiempo y el espacio. Portador del caduceo de serpientes entrelazadas.'
  },
  // #5 EL ARQUERO
  {
    id: 5,
    nombre: 'El Arquero',
    tipo: 'Personaje',
    civilizacion: 'Griega',
    color: 'azul',
    nivel: 'N1',
    magia: 2,
    ataque: 2, fe: 2, des: 7,
    costeSacrificio: 1,
    elemento: 'Viento',
    efecto: 'Ataque a distancia: puede saltarse un cuadro al atacar. No puede atacar directamente a un corazon.',
    descripcion: 'Un arquero de la guardia de Atenea, entrenado desde nino en la precision absoluta. Su flecha nunca yerra el blanco que puede ver.'
  },
  // #6 LEGIONARIO
  {
    id: 6,
    nombre: 'Legionario',
    tipo: 'Personaje',
    civilizacion: 'Griega',
    color: 'azul',
    nivel: 'N1',
    magia: 0,
    ataque: 4, fe: 0, des: 1,
    costeSacrificio: 1,
    elemento: 'Tierra',
    efecto: 'Sin efecto.',
    descripcion: 'Soldado espartano de pura cepa. Pecho de bronce, piernas de roca. Formacion de tortuga que ningun enemigo ha roto jamas.'
  },
  // #7 DRAGON DE FUEGO
  {
    id: 7,
    nombre: 'Dragon de Fuego',
    tipo: 'Animal Mitologico',
    civilizacion: 'Neutral',
    color: 'fantasia',
    nivel: 'N5',
    magia: 5,
    ataque: 7, fe: 5, des: 4,
    costeSacrificio: 3,
    elemento: 'Fuego+Viento',
    invocacionEspecial: true,
    efecto: 'Furia Ignea: invocacion especial (carta en mano + personaje N5 en campo + carta magica de bestia). Al atacar, el enemigo pierde 1 de evasion permanentemente.',
    descripcion: 'Bestia primordial cuya respiracion derrite las losas del puente. Alas que bloquean el sol. Sangre de lava y escamas imposibles de perforar.',
    imagen: './yugioh_dragon_art.png'
  },
  // #8 OSO
  {
    id: 8,
    nombre: 'Oso',
    tipo: 'Animal Salvaje',
    civilizacion: 'Neutral',
    color: 'verde',
    nivel: 'N1',
    magia: 0,
    ataque: 4, fe: 0, des: 2,
    costeSacrificio: 1,
    elemento: 'Tierra',
    efecto: 'Sin efecto.',
    descripcion: 'Oso pardo de los bosques boreales. Garras del tamano de hachas de guerra. Su rugido hace temblar el puente bajo sus patas.'
  },
  // #9 TIGRE DE SIBERIA
  {
    id: 9,
    nombre: 'Tigre de Siberia',
    tipo: 'Animal Salvaje',
    civilizacion: 'Neutral',
    color: 'verde',
    nivel: 'N1',
    magia: 0,
    ataque: 4, fe: 0, des: 5,
    costeSacrificio: 1,
    elemento: 'Tierra',
    efecto: 'Cazador Silencioso: al entrar en el campo, el rival no puede activar trampas hasta el final de este turno.',
    descripcion: 'El dientes-de-sable de las estepas heladas. Cada salto cubre tres losas. Sus colmillos fueron esculpidos por la extincion.'
  },
  // #10 ELEFANTE SAGRADO (GANESHA)
  {
    id: 10,
    nombre: 'Elefante Sagrado',
    tipo: 'Animal Mitologico',
    civilizacion: 'Hinduista',
    color: 'fantasia',
    nivel: 'N5',
    magia: 5,
    ataque: 8, fe: 5, des: 2,
    costeSacrificio: 3,
    elemento: 'Tierra+Agua',
    invocacionEspecial: true,
    efecto: 'Embestida Divina: al atacar, tira 1d12 adicional. Si sale 10, 11 o 12, el ataque se duplica (16). Ademas destruye toda trampa que pise al avanzar.',
    descripcion: 'Ganesha hecho bestia de guerra. Cuatro colmillos de marfil sagrado. Su sola presencia disuelve los obstaculos del destino.'
  },
  // #11 ESCLAVO
  {
    id: 11,
    nombre: 'Esclavo',
    tipo: 'Humano comun',
    civilizacion: 'Neutral',
    color: 'gris',
    nivel: 'N1',
    magia: 0,
    ataque: 1, fe: 0, des: 1,
    costeSacrificio: 0,
    elemento: 'Ninguno',
    efecto: 'Sin efecto. Invocacion libre (coste 0 almas).',
    descripcion: 'Un alma rota por la vida. Cadenas oxidadas en las munecas y en la mente. Pero incluso el puede bloquear el avance del enemigo.'
  },
  // #12 ARKANTOS
  {
    id: 12,
    nombre: 'Arkantos',
    tipo: 'Elite / Divinidad',
    civilizacion: 'Griega',
    color: 'dorado',
    nivel: 'N2',
    magia: 3,
    ataque: 10, fe: 2, des: 6,
    costeSacrificio: 2,
    elemento: 'Tierra+Rayo',
    efecto: 'Inmortalidad Divina: mientras Zeus este en el campo de batalla, Arkantos no puede morir.',
    descripcion: 'Heroe legendario de la Atlantida bendecido directamente por los Dioses del Olimpo. Empuna una lanza que ha atravesado tanto a titanes como a dioses menores.'
  },
  // #13 POSEIDON
  {
    id: 13,
    nombre: 'Poseidon',
    tipo: 'Elite / Divinidad',
    civilizacion: 'Griega',
    color: 'dorado',
    nivel: 'N2',
    magia: 3,
    ataque: 9, fe: 3, des: 5,
    costeSacrificio: 2,
    elemento: 'Agua+Rayo',
    efecto: 'Dominio del Mar: todos los ataques con elemento Agua de tu bando ganan +2 de fuerza este turno.',
    descripcion: 'El Senor de los Mares agita su tridente y el abismo responde. Temblor de tierra incluido sin coste adicional.'
  },
  // #14 LEONIDAS
  {
    id: 14,
    nombre: 'Leonidas',
    tipo: 'Elite / Divinidad',
    civilizacion: 'Griega',
    color: 'dorado',
    nivel: 'N2',
    magia: 2,
    ataque: 8, fe: 0, des: 7,
    costeSacrificio: 2,
    elemento: 'Tierra+Fuego',
    efecto: '300: Aumenta +1 la evasion de todos los personajes griegos adyacentes en su frente.',
    descripcion: 'Rey guerrero de Esparta. Las Termopilas no cayeron en un dia. El tampoco.'
  },
  // #15 AKUVIS
  {
    id: 15,
    nombre: 'Akuvis',
    tipo: 'Elite / Divinidad',
    civilizacion: 'Egipcia',
    color: 'dorado',
    nivel: 'N2',
    magia: 3,
    ataque: 5, fe: 4, des: 5,
    costeSacrificio: 2,
    elemento: 'Ninguno',
    efecto: 'Resurreccion: elige un personaje egipcio del cementerio y coloca en un portal activo.',
    descripcion: 'Sacerdote supremo de Anubis. Sus manos guian las almas entre el mundo de los vivos y los muertos. El mas temido de los dos lados.'
  },
  // #16 OSIRIS
  {
    id: 16,
    nombre: 'Osiris',
    tipo: 'Elite / Divinidad',
    civilizacion: 'Egipcia',
    color: 'dorado',
    nivel: 'N2',
    magia: 3,
    ataque: 6, fe: 3, des: 6,
    costeSacrificio: 2,
    elemento: 'Tierra+Agua',
    efecto: 'Renacimiento: la primera vez que muere, vuelve a tu mano en lugar de ir al cementerio.',
    descripcion: 'El Senor de la Resurreccion. Juez del Inframundo. Murio y volvio. Lleva las vendas como trofeo.'
  },
  // #17 TORT (THOTH)
  {
    id: 17,
    nombre: 'Tort (Thoth)',
    tipo: 'Elite / Divinidad',
    civilizacion: 'Egipcia',
    color: 'dorado',
    nivel: 'N2',
    magia: 4,
    ataque: 7, fe: 4, des: 8,
    costeSacrificio: 2,
    elemento: 'Rayo+Viento',
    efecto: 'Escritura Sagrada: al invocarlo, roba 1 carta magica adicional de tu mazo.',
    descripcion: 'Cabeza de ibis, mente de dios. El escriba del universo. Cada combate es un capitulo que el ya ha escrito.'
  },
  // #18 ZEUS
  {
    id: 18,
    nombre: 'Zeus',
    tipo: 'Dios',
    civilizacion: 'Griega',
    color: 'dorado',
    nivel: 'DIOS',
    magia: 99,
    ataque: '--', fe: '--', des: '--',
    costeSacrificio: 'inf',
    elemento: 'Rayo',
    efecto: 'Dominio del Olimpo: otorga +2 de evasion a todos los griegos del campo. Mientras Zeus este en juego, Arkantos es inmortal.',
    descripcion: 'El Padre de los Dioses trono y la realidad obedecio. Senor del rayo, del cielo y de los dos frentes del puente.'
  },
  // #19 RA
  {
    id: 19,
    nombre: 'Ra',
    tipo: 'Dios',
    civilizacion: 'Egipcia',
    color: 'dorado',
    nivel: 'DIOS',
    magia: 99,
    ataque: '--', fe: '--', des: '--',
    costeSacrificio: 'inf',
    elemento: 'Fuego',
    efecto: 'Rayo Solar: otorga +2 al nivel de magia de todos los egipcios en el campo.',
    descripcion: 'El dios solar que crea el universo cada amanecer. Mientras Ra ilumina el tablero, los egipcios no conocen la derrota espiritual.'
  },
  // #20 ODIN
  {
    id: 20,
    nombre: 'Odin',
    tipo: 'Dios',
    civilizacion: 'Vikinga',
    color: 'dorado',
    nivel: 'DIOS',
    magia: 99,
    ataque: '--', fe: '--', des: '--',
    costeSacrificio: 'inf',
    elemento: 'Viento',
    efecto: 'Padre de Todos: otorga +1 de ataque a todos los vikingos en el campo. Los vikingos que mueran van al Valhalla (tu mano) si sale 10, 11 o 12 en un d12 al morir.',
    descripcion: 'El Allfather que sacrifico su ojo para ver el destino. Sus cuervos Huginn y Muninn observan cada rincon del tablero.'
  },
  // #21 SHIVA
  {
    id: 21,
    nombre: 'Shiva',
    tipo: 'Dios',
    civilizacion: 'Hinduista',
    color: 'dorado',
    nivel: 'DIOS',
    magia: 99,
    ataque: '--', fe: '--', des: '--',
    costeSacrificio: 'inf',
    elemento: 'Fuego+Tierra',
    efecto: 'Trascendencia: permite usar todas tus magias sin cumplir requisitos de nivel de Fe.',
    descripcion: 'El Destructor y Recreador. Danza mientras el universo arde. Cuatro brazos, tercer ojo, tridente cosmico.'
  },
  // #22 SAMURAI
  {
    id: 22,
    nombre: 'Samurai',
    tipo: 'Humano comun',
    civilizacion: 'Neutral',
    color: 'gris',
    nivel: 'N1',
    magia: 0,
    ataque: 3, fe: 0, des: 4,
    costeSacrificio: 1,
    elemento: 'Ninguno',
    efecto: 'Sin efecto.',
    descripcion: 'Guerrero del Bushido de la era Sengoku. Su katana no brilla; simplemente corta. La disciplina como armadura.'
  },
  // #23 NINJA
  {
    id: 23,
    nombre: 'Ninja',
    tipo: 'Humano comun',
    civilizacion: 'Neutral',
    color: 'gris',
    nivel: 'N1',
    magia: 0,
    ataque: 2, fe: 0, des: 7,
    costeSacrificio: 1,
    elemento: 'Ninguno',
    efecto: 'Sigilo: no activa trampas cuando cruza el portal o avanza por losas ocupadas.',
    descripcion: 'Sombra con forma humana. Formado en las artes del Ninjutsu. Ataca desde donde nadie puede defenderse.'
  },
  // #24 YMIR
  {
    id: 24,
    nombre: 'Ymir',
    tipo: 'Animal Mitologico',
    civilizacion: 'Vikinga',
    color: 'fantasia',
    nivel: 'N5',
    magia: 5,
    ataque: 6, fe: 5, des: 2,
    costeSacrificio: 3,
    elemento: 'Tierra+Agua',
    invocacionEspecial: true,
    efecto: 'Glaciar Ancestral: al invocar a Ymir, lanza 1d12 por cada criatura enemiga en su frente. Si el resultado es mayor a su evasion, esa criatura queda paralizada 1 turno.',
    descripcion: 'El primer gigante. El mundo nacio de su cuerpo. Camina y los oceanos se congelan bajo sus pies. Su aliento es ventisca.'
  },
  // #25 PEGASUS
  {
    id: 25,
    nombre: 'Pegasus',
    tipo: 'Animal Mitologico',
    civilizacion: 'Griega',
    color: 'fantasia',
    nivel: 'N5',
    magia: 5,
    ataque: 5, fe: 5, des: 8,
    costeSacrificio: 3,
    elemento: 'Viento+Rayo',
    invocacionEspecial: true,
    efecto: 'Vuelo Celestial: puede saltar sobre cualquier criatura del puente. Si ataca desde el aire, gana +2 de ataque en ese combate.',
    descripcion: 'Caballo alado nacido de la sangre de la Gorgona Medusa. Sus cascos tocan el relampago. Sus alas barren el frente completo.'
  },
  // #26 KALIYA
  {
    id: 26,
    nombre: 'Kaliya',
    tipo: 'Animal Mitologico',
    civilizacion: 'Hinduista',
    color: 'fantasia',
    nivel: 'N5',
    magia: 5,
    ataque: 7, fe: 5, des: 7,
    costeSacrificio: 3,
    elemento: 'Agua+Viento',
    invocacionEspecial: true,
    efecto: 'Veneno Naga: si el ataque impacta, la criatura rival queda paralizada 1 turno (pierde su proximo movimiento y ataque).',
    descripcion: 'Kaliya, la serpiente naga de cinco cabezas que domino el rio Yamuna. Hasta Krishna necesito toda su divinidad para domarla.'
  },
  // #27 TRAMPA - RED DE LAS NORNAS
  {
    id: 27,
    nombre: 'Red de las Nornas',
    tipo: 'Trampa',
    civilizacion: 'Vikinga',
    color: 'trampa',
    nivel: 'T',
    magia: 0,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    oculta: true,
    efecto: 'Se coloca boca abajo. Al activarse cuando un enemigo entra en tu mitad del campo, queda inmovilizado 1 turno completo (no puede moverse ni atacar).',
    descripcion: 'Las tres tejedoras del destino estiraron sus hilos entre las losas. El que pise sin saberlo, pierde un turno de vida.'
  },
  // #28 TRAMPA - HOGUERA DE PROMETEO
  {
    id: 28,
    nombre: 'Hoguera de Prometeo',
    tipo: 'Trampa',
    civilizacion: 'Griega',
    color: 'trampa',
    nivel: 'T',
    magia: 0,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Fuego',
    oculta: true,
    efecto: 'Se coloca boca abajo. Al activarse, hace 3 de dano de fuego al primer personaje enemigo que la pise. Si su ATQ es menor que 3, muere sin tirada.',
    descripcion: 'El fuego que Prometeo robo a los dioses, ahora atrapado en una losa esperando al primer incauto que la pise.'
  },
  // #29 TRAMPA - FOSO DEL ABISMO
  {
    id: 29,
    nombre: 'Foso del Abismo',
    tipo: 'Trampa',
    civilizacion: 'Neutral',
    color: 'trampa',
    nivel: 'T',
    magia: 0,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    oculta: true,
    efecto: 'Se coloca boca abajo. Al activarse, envia directamente al cementerio a cualquier personaje que la active, sin tirada de dado ni combate.',
    descripcion: 'Una grieta en el puente que se abre sin previo aviso. Lo que cae al abismo entre los frentes no regresa.'
  },
  // #30 PORTAL ALPHA
  {
    id: 30,
    nombre: 'Portal Alpha',
    tipo: 'Portal',
    civilizacion: 'Neutral',
    color: 'azul',
    nivel: 'P',
    magia: 1,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    efecto: 'Activa el agujero de gusano: un personaje propio puede teletransportarse al portal del frente opuesto.',
    descripcion: 'Primera fisura en el tejido del puente. Un agujero de gusano que conecta los dos frentes de la batalla.'
  },
  // #31 PORTAL BETA
  {
    id: 31,
    nombre: 'Portal Beta',
    tipo: 'Portal',
    civilizacion: 'Neutral',
    color: 'azul',
    nivel: 'P',
    magia: 1,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    efecto: 'Activa el agujero de gusano: un personaje propio puede teletransportarse al portal del frente opuesto.',
    descripcion: 'Segunda fisura. Los portales son siempre bidireccionalmente peligrosos.'
  },
  // #32 PORTAL GAMMA
  {
    id: 32,
    nombre: 'Portal Gamma',
    tipo: 'Portal',
    civilizacion: 'Neutral',
    color: 'azul',
    nivel: 'P',
    magia: 1,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    efecto: 'Activa el agujero de gusano: un personaje propio puede teletransportarse al portal del frente opuesto.',
    descripcion: 'La tercera apertura. Con cada portal activo el tejido dimensional se vuelve mas inestable.'
  },
  // #33 PORTAL DELTA
  {
    id: 33,
    nombre: 'Portal Delta',
    tipo: 'Portal',
    civilizacion: 'Neutral',
    color: 'azul',
    nivel: 'P',
    magia: 1,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    efecto: 'Activa el agujero de gusano: un personaje propio puede teletransportarse al portal del frente opuesto.',
    descripcion: 'El cuarto portal. El puente entre dimensiones tiembla con cada nueva conexion.'
  },
  // #34 PORTAL EPSILON
  {
    id: 34,
    nombre: 'Portal Epsilon',
    tipo: 'Portal',
    civilizacion: 'Neutral',
    color: 'azul',
    nivel: 'P',
    magia: 1,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    efecto: 'Activa el agujero de gusano: un personaje propio puede teletransportarse al portal del frente opuesto.',
    descripcion: 'Quinto portal. Las fisuras ya son visibles a simple vista en el cielo del abismo.'
  },
  // #35 PORTAL OMEGA
  {
    id: 35,
    nombre: 'Portal Omega',
    tipo: 'Portal',
    civilizacion: 'Neutral',
    color: 'azul',
    nivel: 'P',
    magia: 2,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    efecto: 'Portal avanzado: ademas de teletransportar, permite invocar una criatura directamente en el portal del frente opuesto.',
    descripcion: 'El ultimo y mas poderoso. Cuando Omega se abre, el tablero cambia para siempre.'
  },
  // #36 TITAN CRONOS
  {
    id: 36,
    nombre: 'Cronos',
    tipo: 'Titan',
    civilizacion: 'Neutral',
    color: 'gris',
    nivel: 'N2',
    magia: 2,
    ataque: 9, fe: 1, des: 1,
    costeSacrificio: 2,
    elemento: 'Tierra+Rayo',
    efecto: 'Control Temporal: las criaturas enemigas adyacentes no pueden retroceder mientras Cronos este en el campo.',
    descripcion: 'El Titan del Tiempo. Su guadana no corta carne, corta instantes. Encarcelado en el Tartaro hasta que alguien fue lo suficientemente imprudente para liberarlo.'
  },
  // #37 TITAN ATLAS
  {
    id: 37,
    nombre: 'Atlas',
    tipo: 'Titan',
    civilizacion: 'Neutral',
    color: 'gris',
    nivel: 'N2',
    magia: 1,
    ataque: 10, fe: 0, des: 0,
    costeSacrificio: 2,
    elemento: 'Tierra',
    efecto: 'Soporte Terrestre: si Atlas muere, todas las losas adyacentes colapsan y las criaturas que las ocupan van al cementerio sin tirada.',
    descripcion: 'El gigante que sostiene el cielo. Nada se cae mientras el este en pie. Nada queda en pie cuando el cae.'
  },
  // #38 TITAN PROMETEO
  {
    id: 38,
    nombre: 'Prometeo',
    tipo: 'Titan',
    civilizacion: 'Neutral',
    color: 'gris',
    nivel: 'N2',
    magia: 2,
    ataque: 7, fe: 2, des: 3,
    costeSacrificio: 2,
    elemento: 'Fuego',
    efecto: 'Fuego del Saber: al invocarlo, otorga +1 de nivel de magia a una criatura aliada elegida.',
    descripcion: 'El Titan amigo de la humanidad. Robo el fuego de los dioses y lo regalo. Pago un precio eterno. Sigue pensando que valio la pena.'
  },
  // #39 SUERTE DE AZAR
  {
    id: 39,
    nombre: 'Suerte de Azar',
    tipo: 'Magica',
    civilizacion: 'Neutral',
    color: 'verde',
    nivel: 'M',
    magia: 1,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Ninguno',
    efecto: 'Tira 1d12: 1-4 el objetivo pierde 6 de ataque este turno, 5-7 sin efecto, 8-12 el objetivo gana +6 de ataque este turno.',
    descripcion: 'La Fortuna es ciega. Una moneda lanzada al vacio del abismo. El resultado es tuyo para sufrir o disfrutar.'
  },
  // #40 TRITON
  {
    id: 40,
    nombre: 'Triton',
    tipo: 'Escualo',
    civilizacion: 'Griega',
    color: 'azul',
    nivel: 'N1',
    magia: 1,
    ataque: 5, fe: 1, des: 5,
    costeSacrificio: 1,
    elemento: 'Agua',
    efecto: 'Mensajero Marino: si Triton ocupa una losa de portal activo, gana +2 de evasion permanentemente mientras permanezca ahi.',
    descripcion: 'Mitad hombre, mitad tiburon. Hijo de Poseidon y Anfitrite. Porta un tridente de coral. Respira bajo el agua y en la superficie.'
  },
  // #41 SIRENA
  {
    id: 41,
    nombre: 'Sirena',
    tipo: 'Escualo',
    civilizacion: 'Vikinga',
    color: 'rojo',
    nivel: 'N1',
    magia: 1,
    ataque: 3, fe: 2, des: 6,
    costeSacrificio: 1,
    elemento: 'Agua',
    efecto: 'Canto Irresistible: al inicio del turno rival, si la Sirena esta en campo, el oponente debe avanzar 1 losa con su criatura mas frontal hacia el portal (si puede).',
    descripcion: 'Criatura de los fiordos nordicos cuyo canto arrastra a los marineros al abismo. Belleza de muerte. Colmillos de tiburon bajo la sonrisa.'
  },
  // #42 CUERNO DE AEGIR
  {
    id: 42,
    nombre: 'Cuerno de Aegir',
    tipo: 'Magica',
    civilizacion: 'Vikinga',
    color: 'rojo',
    nivel: 'M',
    magia: 2,
    ataque: 'N/A', fe: 'N/A', des: 'N/A',
    costeSacrificio: 'magia',
    elemento: 'Agua',
    efecto: 'Hidromiel Divina: el vikingo seleccionado gana +3 de ataque durante 1 turno. Si ese vikingo muere ese turno, se activa el efecto de Odin si esta en campo.',
    descripcion: 'Un cuerno de vaca grabado con runas nordicas, rebosante de hidromiel de los banquetes de Aegir. El aroma a miel fermentada enloquece a los guerreros del norte.'
  },
  // #43 MEHALOGON G.
  {
    id: 43,
    nombre: 'Mehalogon G.',
    tipo: 'Animal comun',
    civilizacion: 'Neutral',
    color: 'gris',
    nivel: 'N1',
    magia: 0,
    ataque: 3, fe: 0, des: 3,
    costeSacrificio: 1,
    elemento: 'Agua',
    efecto: 'Dientes del Artico: sus dientes ignoran 1 punto de la evasion del defensor al calcular el impacto.',
    descripcion: 'Gran tiburon de Groenlandia. Adaptado a las aguas gelidas del Artico. Piel de tonos grises azulados, aletas como remos, cuerpo de depredador lento e imparable.'
  },
  // #44 VIKINGO CON HACHA
  {
    id: 44,
    nombre: 'Vikingo con Hacha',
    tipo: 'Personaje',
    civilizacion: 'Vikinga',
    color: 'rojo',
    nivel: 'N1',
    magia: 0,
    ataque: 4, fe: 0, des: 3,
    costeSacrificio: 1,
    elemento: 'Tierra',
    efecto: 'Sin efecto.',
    descripcion: 'Guerrero nordico de talla imponente. Capa de piel de oso sobre los hombros. Gran hacha de doble filo grabada con runas. Barba rojiza trenzada y ojos de hielo.'
  },
  // #45 EL FARAON
  {
    id: 45,
    nombre: 'El Faraon',
    tipo: 'Personaje',
    civilizacion: 'Egipcia',
    color: 'amarillo',
    nivel: 'N1',
    magia: 3,
    ataque: 3, fe: 3, des: 5,
    costeSacrificio: 1,
    elemento: 'Fuego',
    efecto: 'Resurreccion Real: si hay 5 o mas niveles de magia acumulados en su frente, puede resucitar un personaje egipcio con magia mayor o igual a 3 del cementerio.',
    descripcion: 'Gobernante supremo del Imperio del Nilo. Portador de la voluntad de Ra. El Nemes de oro y el cayado marcan su autoridad divina sobre los vivos y los muertos.'
  }
];

// ── VERSIONADO DE BASE DE DATOS ──────────────────────────────
// Si el usuario tiene una version antigua (< 45 cartas), resetear automaticamente
const DB_VERSION = "v2_45cards";
if (localStorage.getItem("mitologos_db_version") !== DB_VERSION) {
  localStorage.removeItem("mitologos_cards");
  localStorage.setItem("mitologos_db_version", DB_VERSION);
  console.log("[MitoLogos] Base de datos actualizada a 45 cartas. Cache reiniciada.");
}

// Estado de cartas editadas y variables locales
let cards = JSON.parse(localStorage.getItem("mitologos_cards")) || [...defaultCards];
let activeTab = "catalog";
let currentMode = "digital"; // digital | empty
let currentCivFilter = "all";
let currentCatFilter = "all";

// Configuración de Códice & Balance (Variables globales)
const defaultCodexConfig = {
  bonusVentaja: 0.5,
  bonusTerreno: 4,
  terreno: "neutral",
  varianzaRng: 0.15,
  iniciativa: "velocidad"
};
let codexConfig = JSON.parse(localStorage.getItem("mitologos_codex")) || {...defaultCodexConfig};

// Inicialización de la Aplicación al cargar
window.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initCatalog();
  initArena();
  initSandbox();
  initCodex();
  updateCycleView();
});


// ==========================================================================
// 1. MANEJO DE PESTAÑAS (TABS CONTROL)
// ==========================================================================
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      document.getElementById(`tab-${activeTab}`).classList.add("active");
      
      // Acciones adicionales por pestaña
      if (activeTab === "catalog") {
        renderCatalog();
      } else if (activeTab === "arena") {
        resetArenaSelectors();
      } else if (activeTab === "sandbox") {
        updateTeamSlotsView();
      } else if (activeTab === "codex") {
        renderCodexGrid();
      }
    });
  });
}

// ==========================================================================
// 2. CATÁLOGO DE CARTAS (BROWSER)
// ==========================================================================
function initCatalog() {
  const btnDigital = document.getElementById("btnDigital");
  const btnPlantilla = document.getElementById("btnPlantilla");

  btnDigital.addEventListener("click", () => {
    btnDigital.classList.add("active");
    btnPlantilla.classList.remove("active");
    currentMode = "digital";
    renderCatalog();
  });

  btnPlantilla.addEventListener("click", () => {
    btnPlantilla.classList.add("active");
    btnDigital.classList.remove("active");
    currentMode = "empty";
    renderCatalog();
  });

  // Filtros de Civilización
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCivFilter = btn.dataset.filter;
      renderCatalog();
    });
  });

  // Filtros de Categoría
  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCatFilter = btn.dataset.cat;
      renderCatalog();
    });
  });

  renderCatalog();
}

function renderCatalog() {
  const grid = document.getElementById("catalogDeckGrid");
  grid.innerHTML = "";

  const filtered = cards.filter(card => {
    const civMatch = currentCivFilter === "all" || 
                     (currentCivFilter === "Neutral" && card.civilizacion === "Neutral") ||
                     card.civilizacion === currentCivFilter;
    const catMatch = currentCatFilter === "all" || card.tipo === currentCatFilter;
    return civMatch && catMatch;
  });

  filtered.forEach(card => {
    const cardEl = renderCardElement(card, currentMode === "empty");
    grid.appendChild(cardEl);
  });
}

// ==========================================================================
// 3. AUXILIAR DE RENDERIZACIÓN DE CARTA (PREMIUM)
// ==========================================================================
function renderCardElement(card, isEmptyMode = false) {
  const cardDiv = document.createElement("div");
  cardDiv.className = getCardClass(card);
  if (isEmptyMode) {
    cardDiv.classList.add("hide-data");
  }

  // Coste de Sacrificio Rúnico (SVG)
  const runaSvg = getSacrificeRuneSVG(card.costeSacrificio);
  const elementsMarkup = getElementMarkup(card.elemento);
  const motifMarkup = getCivilizationMotif(card.civilizacion);

  // Contenido de la Ilustración
  let imgContent = `
    <div class="particle particle-1"></div>
    <div class="particle particle-2"></div>
    <div class="particle particle-3"></div>
  `;
  if (card.imagen && !isEmptyMode) {
    imgContent += `<img src="${card.imagen}" alt="${card.nombre}">`;
  } else {
    imgContent += `<span style="font-size:10px; color:#5c6882; text-align:center; z-index:2;">Ilustración de Fantasía</span>`;
  }

  // Estructura de Estadísticas (AATQ, FE, DES)
  let statsMarkup = "";
  if (card.tipo !== "Mágica" && card.tipo !== "Trampa" && card.tipo !== "Portal") {
    statsMarkup = `
      <div class="stats">
        <div class="stat atq">
          <b>${card.ataque}</b>
          <span>ATQ</span>
        </div>
        <div class="stat fe">
          <b>${card.fe}</b>
          <span>FE</span>
        </div>
        <div class="stat des">
          <b>${card.des}</b>
          <span>DES</span>
        </div>
      </div>
    `;
  }

  // Tipo / Subtítulo
  let subtitulo = card.tipo;
  if (card.legendaria) subtitulo += " — Legendaria";

  cardDiv.innerHTML = `
    <div class="carta-shining-overlay"></div>
    ${motifMarkup}
    <div class="cabecera">
      <div class="runa-sacrificio-container">
        ${runaSvg}
      </div>
      <div class="nombre">
        <h1>${card.nombre}</h1>
        <small>${subtitulo}</small>
      </div>
      <div class="nivel">
        <b>${card.nivel}</b>
        <span>Nivel</span>
      </div>
    </div>
    <div class="ilustracion">
      ${imgContent}
    </div>
    ${statsMarkup}
    <div class="efecto">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <b>Efecto</b>
        <div style="display:flex; gap:4px;">${elementsMarkup}</div>
      </div>
      <p style="margin:5px 0 0 0; line-height:1.4;">${card.efecto}</p>
    </div>
  `;

  return cardDiv;
}

// Mapeador de Clases de CSS de Carta
// Soporta todos los tipos del dossier oficial (45 cartas)
function getCardClass(card) {
  let cls = "carta";

  // Civilización (afecta al borde y paleta de color)
  if (card.civilizacion === "Vikinga") cls += " vikinga";
  else if (card.civilizacion === "Griega") cls += " griega";
  else if (card.civilizacion === "Egipcia") cls += " egipcia";
  else if (card.civilizacion === "Hinduista") cls += " hinduista";
  else if (card.tipo === "Trampa") cls += " trap";
  else cls += " comun-magica"; // Neutral o tipos sin civilización
  
  // Tipos especiales (añaden clase extra para estilos únicos)
  if (card.tipo === "Dios") cls += " dios";
  else if (card.tipo === "Elite / Divinidad") cls += " elite";
  else if (card.tipo === "Titan") cls += " titan";
  else if (card.tipo === "Animal Mitologico") cls += " animal-mit";
  else if (card.tipo === "Escualo") cls += " escualo";

  // Cartas sin barra de estadísticas
  const sinStats = ["Magica", "Trampa", "Portal", "Dios"];
  if (sinStats.includes(card.tipo)) {
    cls += " no-stats";
  }
  return cls;
}

// ==========================================================================
// 4. ARENA DE BATALLA (1v1)
// ==========================================================================
let fighter1 = null;
let fighter2 = null;
let logHistory = [];

function initArena() {
  const selectCiv1 = document.getElementById("selectCiv1");
  const selectCiv2 = document.getElementById("selectCiv2");
  const selectCrit1 = document.getElementById("selectCrit1");
  const selectCrit2 = document.getElementById("selectCrit2");
  const btnSimular = document.getElementById("btnSimular");
  const btnPasoAPaso = document.getElementById("btnPasoAPaso");
  const btnSimular100 = document.getElementById("btnSimular100");

  selectCiv1.addEventListener("change", () => populateCreatures(selectCiv1.value, selectCrit1, 1));
  selectCiv2.addEventListener("change", () => populateCreatures(selectCiv2.value, selectCrit2, 2));

  selectCrit1.addEventListener("change", () => {
    fighter1 = cards.find(c => c.id === parseInt(selectCrit1.value));
    renderFighterCard(fighter1, "cardFighter1");
    checkFightersSelected();
  });

  selectCrit2.addEventListener("change", () => {
    fighter2 = cards.find(c => c.id === parseInt(selectCrit2.value));
    renderFighterCard(fighter2, "cardFighter2");
    checkFightersSelected();
  });

  btnSimular.addEventListener("click", () => runCombatSimulation(false));
  btnPasoAPaso.addEventListener("click", () => runCombatSimulation(true));
  btnSimular100.addEventListener("click", runMassSimulation);
}

function resetArenaSelectors() {
  document.getElementById("selectCiv1").value = "";
  document.getElementById("selectCiv2").value = "";
  document.getElementById("selectCrit1").innerHTML = '<option value="">Selecciona Criatura</option>';
  document.getElementById("selectCrit2").innerHTML = '<option value="">Selecciona Criatura</option>';
  document.getElementById("selectCrit1").disabled = true;
  document.getElementById("selectCrit2").disabled = true;
  document.getElementById("cardFighter1").innerHTML = '<div class="card-empty-state">Selecciona una criatura...</div>';
  document.getElementById("cardFighter2").innerHTML = '<div class="card-empty-state">Selecciona una criatura...</div>';
  fighter1 = null;
  fighter2 = null;
  checkFightersSelected();
}

function populateCreatures(civ, selectEl, fighterNum) {
  selectEl.innerHTML = '<option value="">Selecciona Criatura</option>';
  if (!civ) {
    selectEl.disabled = true;
    return;
  }
  
  const filtered = cards.filter(c => {
    // Para Neutral, buscamos la coincidencia
    if (civ === "Neutral") return c.civilizacion === "Neutral";
    return c.civilizacion === civ;
  });

  filtered.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nombre} (ATQ: ${c.ataque})`;
    selectEl.appendChild(opt);
  });
  selectEl.disabled = false;
}

function renderFighterCard(card, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (card) {
    container.appendChild(renderCardElement(card, false));
  } else {
    container.innerHTML = '<div class="card-empty-state">Selecciona una criatura...</div>';
  }
}

function checkFightersSelected() {
  const enabled = fighter1 !== null && fighter2 !== null;
  document.getElementById("btnSimular").disabled = !enabled;
  document.getElementById("btnPasoAPaso").disabled = !enabled;
  document.getElementById("btnSimular100").disabled = !enabled;
}

// ==========================================================================
// 5. MOTOR DE COMBATE 1v1 Y ANIMACIONES (GIRO D12 Y RASGADO)
// ==========================================================================
const faceRotations = {
  1: { x: -90, y: 0 },
  2: { x: 90, y: 180 },
  3: { x: -26.565, y: 0 },
  4: { x: -26.565, y: -72 },
  5: { x: -26.565, y: -144 },
  6: { x: -26.565, y: -216 },
  7: { x: -26.565, y: -288 },
  8: { x: 153.435, y: -36 },
  9: { x: 153.435, y: -108 },
  10: { x: 153.435, y: -180 },
  11: { x: 153.435, y: -252 },
  12: { x: 153.435, y: -324 }
};

function runCombatSimulation(stepByStep = false) {
  logHistory = [];
  const consoleEl = document.getElementById("combatConsole");
  consoleEl.innerHTML = "";

  // 1. Mostrar Overlay Cinematográfico
  const overlay = document.getElementById("combatOverlay");
  const leftFighterBox = document.getElementById("combatantLeft");
  const rightFighterBox = document.getElementById("combatantRight");
  const verdictEl = document.getElementById("combatVerdict");
  const die = document.getElementById("d12Die");

  leftFighterBox.innerHTML = "";
  rightFighterBox.innerHTML = "";
  verdictEl.classList.remove("show");
  verdictEl.innerHTML = "";
  die.style.transform = "rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
  document.querySelectorAll(".face").forEach(f => f.classList.remove("active-face"));

  leftFighterBox.appendChild(renderCardElement(fighter1, false));
  rightFighterBox.appendChild(renderCardElement(fighter2, false));

  overlay.classList.add("active");
  logToConsole("⚔️ ¡Combate iniciado en el puente dimensional!", "event-header");

  // Calcular Combate
  setTimeout(() => {
    // 2. Determinar Iniciativa
    let initiativeWinner = fighter1;
    let initiativeLoser = fighter2;
    let init1 = parseInt(fighter1.des) || 0;
    let init2 = parseInt(fighter2.des) || 0;

    logToConsole(`Iniciativa: ${fighter1.nombre} (DES ${init1}) vs ${fighter2.nombre} (DES ${init2})`);

    if (codexConfig.iniciativa === "dado") {
      const roll1 = rollDice(6);
      const roll2 = rollDice(6);
      init1 += roll1;
      init2 += roll2;
      logToConsole(`Tirada de Iniciativa: ${fighter1.nombre} sacó d6(${roll1}) total ${init1} | ${fighter2.nombre} sacó d6(${roll2}) total ${init2}`);
    }

    if (init2 > init1) {
      initiativeWinner = fighter2;
      initiativeLoser = fighter1;
    }
    logToConsole(`⚡ Ataca primero: ${initiativeWinner.nombre}`, "event-success");

    // 3. Lanzar d12 del Destino
    const d12Result = rollDice(12);
    logToConsole(`🎲 ${initiativeWinner.nombre} lanza el Dado del Destino d12...`);

    // Animación de rotación del dado
    const targetRot = faceRotations[d12Result];
    const extraX = 1440; // 4 vueltas completas
    const extraY = 1440;
    die.style.transition = "transform 1.8s cubic-bezier(0.2, 0.8, 0.3, 1)";
    die.style.transform = `rotateX(${targetRot.x + extraX}deg) rotateY(${targetRot.y + extraY}deg) rotateZ(720deg)`;

    // Efecto partículas
    createClashParticles();

    setTimeout(() => {
      // Activar cara del dado
      const activeFaceEl = document.querySelector(`.face-${d12Result}`);
      if (activeFaceEl) activeFaceEl.classList.add("active-face");
      logToConsole(`Dado se detiene en: [${d12Result}]`, "event-header");

      // Paso 1: Comprobar Esquiva
      const esquivaDefensor = parseInt(initiativeLoser.des) || 0;
      logToConsole(`Paso 1: ¿Resultado (${d12Result}) supera la esquiva de ${initiativeLoser.nombre} (${esquivaDefensor})?`);

      if (d12Result > esquivaDefensor) {
        logToConsole("🎯 ¡IMPACTO!", "event-hit");

        // Paso 2: Choque de Fuerzas
        let fuerzaAtacante = parseInt(initiativeWinner.ataque) || 0;
        let fuerzaDefensor = parseInt(initiativeLoser.ataque) || 0;

        // Bonificaciones elementales
        const ventaja = checkElementalAdvantage(initiativeWinner.elemento, initiativeLoser.elemento);
        if (ventaja) {
          const bonus = Math.round(fuerzaAtacante * codexConfig.bonusVentaja);
          fuerzaAtacante += bonus;
          logToConsole(`🔥 ¡Ventaja Elemental! ${initiativeWinner.nombre} (${initiativeWinner.elemento}) gana +${bonus} de Fuerza contra ${initiativeLoser.nombre} (${initiativeLoser.elemento})`, "event-success");
        }

        // Armonía Terrenal
        if (codexConfig.terreno !== "neutral") {
          if (initiativeLoser.elemento && initiativeLoser.elemento.includes(codexConfig.terreno)) {
            fuerzaDefensor += codexConfig.bonusTerreno;
            logToConsole(`🪨 Terreno armónico de ${codexConfig.terreno}: Defensa de ${initiativeLoser.nombre} aumenta +${codexConfig.bonusTerreno}`, "event-success");
          }
        }

        // Calcular daño con Varianza
        if (codexConfig.varianzaRng > 0) {
          const varianzaAtk = (Math.random() * 2 - 1) * codexConfig.varianzaRng;
          fuerzaAtacante = Math.round(fuerzaAtacante * (1 + varianzaAtk));
          logToConsole(`🎲 Fuerza de choque de ataque recalculada con varianza a: ${fuerzaAtacante}`);
        }

        logToConsole(`Paso 2: Choque de Fuerzas $\\rightarrow$ Atacante: ${fuerzaAtacante} vs Defensor: ${fuerzaDefensor}`);

        if (fuerzaAtacante > fuerzaDefensor) {
          // El defensor muere - Lanzar Animación de Rasgado
          logToConsole(`💀 ¡${initiativeLoser.nombre} ha caído superado por las fuerzas!`, "event-death");
          
          verdictEl.innerHTML = `${initiativeWinner.nombre} VENCE`;
          verdictEl.style.color = "#34d399";
          verdictEl.classList.add("show");

          // Lanzar rasgado
          triggerCardTearing(initiativeLoser === fighter1 ? "combatantLeft" : "combatantRight");

        } else {
          // Resiste el golpe intacto
          logToConsole(`🛡️ ¡${initiativeLoser.nombre} resiste el golpe intacto! Las fuerzas se equiparan.`, "event-success");
          verdictEl.innerHTML = "¡RESISTIDO!";
          verdictEl.style.color = "#60a5fa";
          verdictEl.classList.add("show");
        }
      } else {
        // Falló
        logToConsole(`💨 ¡El ataque falla! ${initiativeLoser.nombre} esquiva el golpe.`, "event-miss");
        verdictEl.innerHTML = "¡ESQUIVADO!";
        verdictEl.style.color = "#818cf8";
        verdictEl.classList.add("show");
      }

      // Cerrar batalla cinematográfica tras 2.2 segundos de veredicto
      setTimeout(() => {
        overlay.classList.remove("active");
      }, 2600);

    }, 1900);

  }, 1000);
}

// Lanzar efecto de rasgado físico en la interfaz
function triggerCardTearing(containerId) {
  const container = document.getElementById(containerId);
  const cardElement = container.querySelector(".carta");
  if (!cardElement) return;

  const cardHtml = cardElement.innerHTML;
  const cardClass = cardElement.className;

  // Crear las dos mitades rotas
  const leftHalf = document.createElement("div");
  leftHalf.className = `${cardClass} carta-torn-left`;
  leftHalf.innerHTML = cardHtml;

  const rightHalf = document.createElement("div");
  rightHalf.className = `${cardClass} carta-torn-right`;
  rightHalf.innerHTML = cardHtml;

  // Ocultar original y añadir mitades
  cardElement.style.visibility = "hidden";
  container.appendChild(leftHalf);
  container.appendChild(rightHalf);

  // Trigger reflow para iniciar animación
  setTimeout(() => {
    leftHalf.classList.add("torn-active");
    rightHalf.classList.add("torn-active");
  }, 50);

  // Limpiar mitades tras finalizar
  setTimeout(() => {
    leftHalf.remove();
    rightHalf.remove();
  }, 1550);
}

// Partículas en el choque de dado
function createClashParticles() {
  const sparklesContainer = document.getElementById("clashSparkles");
  sparklesContainer.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const sp = document.createElement("div");
    sp.className = "clash-sparkle";
    sp.style.left = "50%";
    sp.style.top = "50%";
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 200;
    const duration = 0.5 + Math.random() * 1.2;

    sp.style.transition = `all ${duration}s cubic-bezier(0.1, 0.8, 0.2, 1)`;
    sparklesContainer.appendChild(sp);

    setTimeout(() => {
      sp.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0.1)`;
      sp.style.opacity = "0";
    }, 20);
  }
}

// Simulación de Balance de 100 batallas rápidas
function runMassSimulation() {
  if (!fighter1 || !fighter2) return;
  const consoleEl = document.getElementById("combatConsole");
  consoleEl.innerHTML = "";
  logToConsole("📊 Iniciando Test de Balance acelerado (100 combates)...", "event-header");

  let win1 = 0;
  let win2 = 0;
  let draws = 0;

  for (let i = 0; i < 100; i++) {
    let f1 = {...fighter1};
    let f2 = {...fighter2};

    // Iniciativa
    let init1 = parseInt(f1.des) || 0;
    let init2 = parseInt(f2.des) || 0;
    if (codexConfig.iniciativa === "dado") {
      init1 += Math.floor(Math.random() * 6) + 1;
      init2 += Math.floor(Math.random() * 6) + 1;
    }
    
    let atk = init1 >= init2 ? f1 : f2;
    let def = init1 >= init2 ? f2 : f1;

    // Tirar d12
    const roll = Math.floor(Math.random() * 12) + 1;
    const defEsquiva = parseInt(def.des) || 0;

    if (roll > defEsquiva) {
      let fAtk = parseInt(atk.ataque) || 0;
      let fDef = parseInt(def.ataque) || 0;

      // Bonificación elemental
      if (checkElementalAdvantage(atk.elemento, def.elemento)) {
        fAtk += Math.round(fAtk * codexConfig.bonusVentaja);
      }
      // Armonía Terrenal
      if (codexConfig.terreno !== "neutral" && def.elemento && def.elemento.includes(codexConfig.terreno)) {
        fDef += codexConfig.bonusTerreno;
      }
      // Varianza
      if (codexConfig.varianzaRng > 0) {
        fAtk = Math.round(fAtk * (1 + (Math.random() * 2 - 1) * codexConfig.varianzaRng));
      }

      if (fAtk > fDef) {
        if (atk.id === fighter1.id) win1++; else win2++;
      } else {
        draws++;
      }
    } else {
      draws++;
    }
  }

  logToConsole(`\n📊 RESULTADOS FINALES DE BALANCE:`);
  logToConsole(`🏆 Victoria ${fighter1.nombre}: ${win1}%`, "event-success");
  logToConsole(`💀 Victoria ${fighter2.nombre}: ${win2}%`, "event-death");
  logToConsole(`🤝 Empates/Resistidos: ${draws}%`);
}

// ==========================================================================
// 6. SANDBOX DE EQUIPOS (3v3 TAG-TEAM)
// ==========================================================================
let teamA = [null, null, null];
let teamB = [null, null, null];
let selectedSlotTeam = null; // 'A' | 'B'
let selectedSlotIndex = null; // 0, 1, 2

function initSandbox() {
  // Clic en slots de equipo para añadir criatura
  for (let i = 0; i < 3; i++) {
    document.getElementById(`slotA-${i}`).addEventListener("click", () => openSelectorModal("A", i));
    document.getElementById(`slotB-${i}`).addEventListener("click", () => openSelectorModal("B", i));
  }

  // Modal cerrar
  document.getElementById("closeSelectorModal").addEventListener("click", closeSelectorModal);
  
  // Filtros del modal selector
  document.querySelectorAll("#selectorCriaturaModal .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#selectorCriaturaModal .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderSelectorModalGrid(btn.dataset.civ);
    });
  });

  // Botón Simular 3v3
  document.getElementById("btnSimular3v3").addEventListener("click", runSandboxSimulation);
}

function openSelectorModal(team, index) {
  selectedSlotTeam = team;
  selectedSlotIndex = index;
  document.getElementById("selectorCriaturaModal").style.display = "flex";
  
  // Reset tabs modal
  document.querySelectorAll("#selectorCriaturaModal .tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('#selectorCriaturaModal .tab-btn[data-civ="todas"]').classList.add("active");
  
  renderSelectorModalGrid("todas");
}

function closeSelectorModal() {
  document.getElementById("selectorCriaturaModal").style.display = "none";
}

function renderSelectorModalGrid(civFilter) {
  const grid = document.getElementById("gridCriaturasSelector");
  grid.innerHTML = "";
  
  const filtered = cards.filter(c => {
    if (c.tipo === "Mágica" || c.tipo === "Trampa" || c.tipo === "Portal" || c.tipo === "Dios") return false;
    if (civFilter === "todas") return true;
    return c.civilizacion === civFilter;
  });

  filtered.forEach(c => {
    const item = document.createElement("div");
    item.className = "selector-card-item";
    item.innerHTML = `
      <div class="card-civ">${c.civilizacion}</div>
      <div class="card-name">${c.nombre}</div>
      <div class="card-stats">ATQ:${c.ataque} | FE:${c.fe} | DES:${c.des}</div>
    `;
    item.addEventListener("click", () => selectCreatureForSlot(c));
    grid.appendChild(item);
  });
}

function selectCreatureForSlot(card) {
  if (selectedSlotTeam === "A") {
    teamA[selectedSlotIndex] = card;
  } else {
    teamB[selectedSlotIndex] = card;
  }
  closeSelectorModal();
  updateTeamSlotsView();
  checkSandboxSimulationReady();
}

function updateTeamSlotsView() {
  for (let i = 0; i < 3; i++) {
    renderSlot("A", i, teamA[i]);
    renderSlot("B", i, teamB[i]);
  }
  analyzeTeam("A", teamA);
  analyzeTeam("B", teamB);
}

function renderSlot(team, index, card) {
  const slot = document.getElementById(`slot${team}-${index}`);
  if (card) {
    slot.className = "team-slot filled";
    slot.innerHTML = `
      <div class="team-slot-card-header">${card.civilizacion}</div>
      <div class="team-slot-card-name">${card.nombre}</div>
      <div class="team-slot-card-stats">ATQ: ${card.ataque} | FE: ${card.fe}</div>
      <button style="margin-top:8px; font-size:8px; padding:2px 6px; cursor:pointer;" onclick="event.stopPropagation(); removeSlot('${team}', ${index})">Quitar</button>
    `;
  } else {
    slot.className = "team-slot";
    slot.innerHTML = "+ Elegir";
  }
}

// Eliminar de slot expuesto globalmente
window.removeSlot = function(team, index) {
  if (team === "A") teamA[index] = null; else teamB[index] = null;
  updateTeamSlotsView();
  checkSandboxSimulationReady();
};

function analyzeTeam(teamName, teamArray) {
  const analysisEl = document.getElementById(`analysis${teamName}`);
  const activeCount = teamArray.filter(c => c !== null).length;

  if (activeCount === 0) {
    analysisEl.innerHTML = '<p class="placeholder-text">Añade criaturas para analizar el balance.</p>';
    return;
  }

  let totalAtk = 0;
  let totalFe = 0;
  let totalDes = 0;
  let elementList = [];

  teamArray.forEach(c => {
    if (c) {
      totalAtk += parseInt(c.ataque) || 0;
      totalFe += parseInt(c.fe) || 0;
      totalDes += parseInt(c.des) || 0;
      if (c.elemento && c.elemento !== "Ninguno") {
        elementList.push(...c.elemento.split("+"));
      }
    }
  });

  const uniqueElements = [...new Set(elementList)];

  analysisEl.innerHTML = `
    <div class="analysis-val-group">
      <span>Fuerza Ofensiva (ATQ):</span> <b>${totalAtk}</b>
    </div>
    <div class="analysis-val-group">
      <span>Fuerza Espiritual (FE):</span> <b>${totalFe}</b>
    </div>
    <div class="analysis-val-group">
      <span>Agilidad Promedio (DES):</span> <b>${Math.round(totalDes/activeCount)}</b>
    </div>
    <div class="analysis-val-group">
      <span>Afinidades Elementales:</span> <b>${uniqueElements.join(", ") || "Ninguna"}</b>
    </div>
  `;
}

function checkSandboxSimulationReady() {
  const activeA = teamA.filter(c => c !== null).length;
  const activeB = teamB.filter(c => c !== null).length;
  document.getElementById("btnSimular3v3").disabled = (activeA === 0 || activeB === 0);
}

// Simulación de Batalla por Relevos 3v3
function runSandboxSimulation() {
  const consoleEl = document.getElementById("sandboxConsole");
  consoleEl.innerHTML = "";
  
  let poolA = teamA.filter(c => c !== null).map(c => ({...c}));
  let poolB = teamB.filter(c => c !== null).map(c => ({...c}));

  logToConsole3v3("⚔️ ¡Inicio de Enfrentamiento por Relevos (3v3 Tag-Team)!", "event-header");

  let activeIndexA = 0;
  let activeIndexB = 0;
  let ronda = 1;

  while(activeIndexA < poolA.length && activeIndexB < poolB.length) {
    const fA = poolA[activeIndexA];
    const fB = poolB[activeIndexB];

    logToConsole3v3(`\n🔹 [RONDA ${ronda}] ${fA.nombre} (Aliado) vs ${fB.nombre} (Rival)`);
    
    // Resolviendo choque directo rápido
    const d12Result = rollDice(12);
    logToConsole3v3(`Tirada d12: [${d12Result}] contra la esquiva de ${fB.nombre} (${fB.des})`);

    if (d12Result > (fB.des || 0)) {
      logToConsole3v3("🎯 ¡Golpe exitoso!", "event-hit");
      let dmg = fA.ataque;
      
      if (checkElementalAdvantage(fA.elemento, fB.elemento)) {
        dmg = Math.round(dmg * (1 + codexConfig.bonusVentaja));
        logToConsole3v3(`🔥 Ventaja Elemental aplicada: daño total ${dmg}`, "event-success");
      }

      if (dmg > fB.ataque) {
        logToConsole3v3(`💀 ¡${fB.nombre} es destrozado por el impacto! Relevo enemigo necesario.`, "event-death");
        activeIndexB++;
      } else {
        logToConsole3v3(`🛡️ ${fB.nombre} resiste el impacto. Las defensas aguantan.`);
      }
    } else {
      logToConsole3v3(`💨 ${fA.nombre} falla su ataque. Evasión exitosa de ${fB.nombre}.`, "event-miss");
    }

    // Contraataque si el defensor sobrevivió
    if (activeIndexB < poolB.length) {
      const def = poolB[activeIndexB];
      const d12Counter = rollDice(12);
      logToConsole3v3(`🔄 Contraataque: ${def.nombre} lanza d12: [${d12Counter}] contra la esquiva de ${fA.nombre} (${fA.des})`);

      if (d12Counter > (fA.des || 0)) {
        let dmg = def.ataque;
        if (checkElementalAdvantage(def.elemento, fA.elemento)) {
          dmg = Math.round(dmg * (1 + codexConfig.bonusVentaja));
        }

        if (dmg > fA.ataque) {
          logToConsole3v3(`💀 ¡${fA.nombre} ha caído derrotado por el contraataque! Relevo aliado.`, "event-death");
          activeIndexA++;
        } else {
          logToConsole3v3(`🛡️ ${fA.nombre} resiste el contraataque.`);
        }
      } else {
        logToConsole3v3(`💨 ${def.nombre} falla su contraataque.`);
      }
    }

    ronda++;
    if (ronda > 15) { // Evitar bucle infinito
      logToConsole3v3("🤝 Tablas: Combate estancado tras 15 rondas intensas.");
      break;
    }
  }

  // Veredicto final
  if (activeIndexA >= poolA.length && activeIndexB >= poolB.length) {
    logToConsole3v3("\n🤝 ¡Doble K.O.! Ambos equipos cayeron luchando.");
  } else if (activeIndexA >= poolA.length) {
    logToConsole3v3("\n🏆 ¡EL EQUIPO RIVAL VENCE LA BATALLA!", "event-death");
  } else {
    logToConsole3v3("\n🏆 ¡EL EQUIPO ALIADO SE CORONA GANADOR!", "event-success");
  }
}

// ==========================================================================
// 7. CÓDICE & VARIABLES (EDITOR)
// ==========================================================================
let currentCodexCiv = "griega";

function initCodex() {
  // Inicializar Sliders Globales de Configuración
  const sliders = [
    { id: "valMultiplicadorVentaja", labelId: "labelVentaja", format: val => `+${Math.round(val * 100)}%`, key: "bonusVentaja" },
    { id: "valBonusTerreno", labelId: "labelTerreno", format: val => `+${val}`, key: "bonusTerreno" },
    { id: "valVarianzaRng", labelId: "labelVarianzaRng", format: val => `±${Math.round(val * 100)}%`, key: "varianzaRng" }
  ];

  sliders.forEach(s => {
    const input = document.getElementById(s.id);
    const label = document.getElementById(s.labelId);
    
    input.value = codexConfig[s.key];
    label.textContent = s.format(codexConfig[s.key]);

    input.addEventListener("input", () => {
      const val = parseFloat(input.value);
      codexConfig[s.key] = val;
      label.textContent = s.format(val);
      saveCodexConfig();
    });
  });

  // Selector de Terreno
  const selectTerreno = document.getElementById("selectTerreno");
  selectTerreno.value = codexConfig.terreno;
  selectTerreno.addEventListener("change", () => {
    codexConfig.terreno = selectTerreno.value;
    saveCodexConfig();
    updateCycleView();
  });

  // Selector de Iniciativa
  const selectIniciativa = document.getElementById("selectIniciativa");
  selectIniciativa.value = codexConfig.iniciativa;
  selectIniciativa.addEventListener("change", () => {
    codexConfig.iniciativa = selectIniciativa.value;
    saveCodexConfig();
  });

  // Pestañas de Civilización del Editor
  document.querySelectorAll(".codex-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".codex-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCodexCiv = btn.dataset.civ;
      renderCodexGrid();
    });
  });

  // Restaurar por defecto
  document.getElementById("btnRestaurarStats").addEventListener("click", () => {
    if (confirm("¿Estás seguro de restaurar todas las criaturas y variables a sus valores de fábrica?")) {
      localStorage.removeItem("mitologos_cards");
      localStorage.removeItem("mitologos_codex");
      cards = [...defaultCards];
      codexConfig = {...defaultCodexConfig};
      
      // Reiniciar sliders
      sliders.forEach(s => {
        const input = document.getElementById(s.id);
        input.value = codexConfig[s.key];
        document.getElementById(s.labelId).textContent = s.format(codexConfig[s.key]);
      });
      selectTerreno.value = codexConfig.terreno;
      selectIniciativa.value = codexConfig.iniciativa;

      renderCodexGrid();
      saveCodexConfig();
      updateCycleView();
      alert("Valores restaurados.");
    }
  });
}

function renderCodexGrid() {
  const grid = document.getElementById("gridCriaturasCodex");
  grid.innerHTML = "";

  // Filtrar criaturas válidas (con stats editables)
  const filtered = cards.filter(c => {
    // Normalizar coincidencia
    let match = false;
    if (currentCodexCiv === "indonesia") match = (c.civilizacion === "Indonesia");
    else if (currentCodexCiv === "griega") match = (c.civilizacion === "Griega");
    else if (currentCodexCiv === "vikinga") match = (c.civilizacion === "Vikinga");
    else if (currentCodexCiv === "egipcia") match = (c.civilizacion === "Egipcia");
    
    // Ignorar cartas sin stats
    return match && c.tipo !== "Mágica" && c.tipo !== "Trampa" && c.tipo !== "Portal" && c.tipo !== "Dios";
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--gris); grid-column: 1/3; text-align:center; padding: 20px;">Civilización en desarrollo. Añade criaturas a la base de datos en app.js.</p>';
    return;
  }

  filtered.forEach(c => {
    const editor = document.createElement("div");
    editor.className = "codex-item-editor";
    
    // Budget inicial = suma de stats
    const totalStats = (parseInt(c.ataque) || 0) + (parseInt(c.fe) || 0) + (parseInt(c.des) || 0);

    editor.innerHTML = `
      <div class="editor-header">
        <h4>${c.nombre}</h4>
        <div class="stat-total">Presupuesto total: <span id="budget-${c.id}">${totalStats}</span></div>
      </div>
      
      <div class="slider-row">
        <label>Ataque (ATQ): <span id="valAtk-${c.id}">${c.ataque}</span></label>
        <input type="range" min="0" max="15" value="${c.ataque}" oninput="updateCreatureStat(${c.id}, 'ataque', this.value)">
      </div>

      <div class="slider-row">
        <label>Fe (FE): <span id="valFe-${c.id}">${c.fe}</span></label>
        <input type="range" min="0" max="15" value="${c.fe}" oninput="updateCreatureStat(${c.id}, 'fe', this.value)">
      </div>

      <div class="slider-row">
        <label>Desventaja / Evasión (DES): <span id="valDes-${c.id}">${c.des}</span></label>
        <input type="range" min="0" max="15" value="${c.des}" oninput="updateCreatureStat(${c.id}, 'des', this.value)">
      </div>
    `;
    grid.appendChild(editor);
  });
}

// Actualizar estadísticas individuales
window.updateCreatureStat = function(cardId, statKey, val) {
  const card = cards.find(c => c.id === cardId);
  if (card) {
    card[statKey] = parseInt(val);
    
    // Actualizar labels en vivo
    if (statKey === "ataque") document.getElementById(`valAtk-${cardId}`).textContent = val;
    if (statKey === "fe") document.getElementById(`valFe-${cardId}`).textContent = val;
    if (statKey === "des") document.getElementById(`valDes-${cardId}`).textContent = val;
    
    // Calcular presupuesto total
    const total = (parseInt(card.ataque) || 0) + (parseInt(card.fe) || 0) + (parseInt(card.des) || 0);
    document.getElementById(`budget-${cardId}`).textContent = total;

    // Guardar cambios persistentes
    localStorage.setItem("mitologos_cards", JSON.stringify(cards));
  }
};

function saveCodexConfig() {
  localStorage.setItem("mitologos_codex", JSON.stringify(codexConfig));
}

// ==========================================================================
// 8. FUNCIONES AUXILIARES Y CICLO ELEMENTAL
// ==========================================================================
function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

// Comprobador del ciclo: Agua > Fuego > Viento > Rayo > Agua
function checkElementalAdvantage(elem1, elem2) {
  if (!elem1 || !elem2 || elem1 === "Ninguno" || elem2 === "Ninguno") return false;

  const list1 = elem1.split("+").map(e => e.trim());
  const list2 = elem2.split("+").map(e => e.trim());

  // Cadena elemental
  const cycle = {
    "Agua": "Fuego",
    "Fuego": "Tierra", // Según el ciclo del Sandbox: Fuego > Tierra
    "Tierra": "Rayo",  // Tierra > Rayo
    "Rayo": "Agua"     // Rayo > Agua
  };

  // Viento es neutro, no tiene ventajas

  for (const e1 of list1) {
    for (const e2 of list2) {
      if (cycle[e1] === e2) return true;
    }
  }
  return false;
}

// Iluminación en el ciclo de elementos del Códice
function updateCycleView() {
  document.querySelectorAll(".element-node").forEach(node => {
    node.classList.remove("active-harm");
  });
  
  if (codexConfig.terreno !== "neutral") {
    const node = document.getElementById(`node-${codexConfig.terreno}`);
    if (node) node.classList.add("active-harm");
  }
}

// Logs auxiliares en consola
function logToConsole(text, className = "") {
  const consoleEl = document.getElementById("combatConsole");
  const p = document.createElement("p");
  if (className) p.className = className;
  p.innerHTML = text;
  consoleEl.appendChild(p);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function logToConsole3v3(text, className = "") {
  const consoleEl = document.getElementById("sandboxConsole");
  const p = document.createElement("p");
  if (className) p.className = className;
  p.innerHTML = text;
  consoleEl.appendChild(p);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}
