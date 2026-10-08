# Mythos Animation Build Plan

Owner: Adrii · 8 October 2026

The 25 steps, in order, to build the combat animation system for *Mythos: Guerra de Dioses*. Build in plain HTML, CSS and JavaScript; Adrii reviews the finished work at the end.

> For Claude Code: keep this file in the repository root and read it before starting each step. Work one step at a time, in order, and check each step's **Done when** before moving on.

## Project at a glance

*Mythos* is a tactical card game with five civilizations. Each civilization gets **one realistic, animated fighter** whose attacks change with the element in play.

| Fighter | Civilization | Rank | Elements | Notes |
| --- | --- | --- | --- | --- |
| Hercules (Hércules) | Athenians | Demigod | Earth, thunder | First through the pipeline. Olive-wood club, Nemean lion skin |
| Scorpion King (Rey Escorpión) | Egyptians | High rank | TBD | The historical king (c. 3200 BC), not the film character |
| Sabguru | Indian (Vedic) | Demigod | Aether, to confirm | Spelled S-A-B-G-U-R-U |
| Thor | Vikings | Demigod | TBD | A god who plays as a demigod |
| Atlantean hero | Atlanteans | Demigod | TBD | Original character, name TBD. Do not use Arkantos (Age of Mythology) |

The true gods (Zeus, Ra, Shiva, Odin) use a different game system and are out of scope.

## Constraints and working agreement

Work through the 25 steps in order; Adrii reviews the finished build at the end, so each step's **Done when** is your own check.

- **Tech:** HTML, CSS and vanilla JavaScript only. No frameworks, game engines or third-party libraries. Native browser APIs (Canvas 2D, WebGL, Web Audio) are fine.
- **Platform:** runs in the browser, mobile first, installable as a PWA, deployed on Netlify.
- **Art:** realistic, painted 2D fighters animated as cut-out puppets on one shared skeleton. One side view per fighter; no 3D.
- **Dates:** none set.
- **Rights:** nothing from Age of Mythology, including Arkantos. The Scorpion King comes from history and Hercules from classical myth, not from films.

| Who | Does what |
| --- | --- |
| Adrii | Generates each fighter's full-body image and parts sheet in Antigravity from your prompts (step 6); answers the open questions; sends the Claude Design link (step 25) |
| Developer, with Claude Code | Everything else: rig, animation engine, art clean-up and rigging, effects, rules, sound, PWA |

Contact Adrii during the build only to request images and to settle open questions.

## Roadmap

Each phase starts when the one before is finished.

| Phase | Steps | Covers |
| --- | --- | --- |
| A · Motion foundation | 1–4 | Rig and motion |
| B · Character art | 5–11 | Adrii's images turned into rigged parts |
| C · The five fighters | 12–16 | One fighter per civilization |
| D · Effects and impact | 17–19 | Element effects and hit feel |
| E · Game layer | 20–24 | Rules, sound, PWA |
| F · Merge | 25 | Claude Design project |

The only input from outside the build is Adrii's images, which Phase B needs from step 7 on. Adrii reviews at the end.

## Phase A · Motion foundation (steps 1–4)

Phase A builds the skeleton and motion system every fighter shares. No character art yet.

**Step 1 · Skeleton rig.** A 2D bone hierarchy: pelvis (root), torso, neck and head; shoulder, elbow and wrist on each arm; hip, knee and ankle on each leg; a weapon bone on the front hand.

- Each joint has angle limits: knees and elbows bend one way only.
- Feet stay planted on the ground line. The whole rig mirrors to face left.
- Debug view: drag joints directly, or pick a joint and move a slider.
- Done when: no joint leaves its limits and mirroring works. Adrii has a working canvas prototype of this step if you want to see it (`prototipos/maniqui.html`).

**Step 2 · Keyframe engine.** Poses stored as keyframes, with the in-betweens interpolated on easing curves.

- Clips with their own timing, and smooth transitions between clips.
- Frame events (for example `impact`) to sync effects, sound and damage.
- Done when: transitions run at 60 fps on a mid-range phone and each event fires on its frame.

**Step 3 · Base animation set** on the plain mannequin: idle (breathing), guard, attack, hit reaction, miss, dodge, defeat (fall) and victory.

- Use anticipation (wind-up before the strike), follow-through (the body keeps moving after it) and weight.
- The miss is the attacker striking the air. The rules give it its own clip and sound, so it must read clearly.
- Done when: each clip plays from a test button and returns cleanly to idle.

**Step 4 · Secondary motion.** Cape, hair, plumes and cloth on simple spring physics, lagging behind the body.

- Done when: a cape trails every move and settles naturally.

## Phase B · Character art (steps 5–11)

Phase B turns Adrii's AI images into rigged cut-out fighters. Prove the whole pipeline on Hercules before asking for the other four.

**Step 5 · Character sheets.** One sheet per fighter: build, clothing, weapon, colours, elements and rank. The sheets feed the image prompts.

**Step 6 · Image prompts.** Two prompts per fighter for Adrii to run in Antigravity. The template and a Hercules example are under *Image prompts* below.

- Full body: side view facing right, fighting stance, arms and legs held away from the torso, the whole body including feet, plain flat light-grey background, no scenery, shadow or text, high resolution.
- Parts sheet: the same character in the same style, every part separated and spaced apart.
- Same style and lighting for all five fighters.

**Step 7 · Pipeline test with Hercules.** Adrii generates Hercules' two images; check they can be rigged before the other four are made.

- Check every image's angle: an early test in Canva came out front-facing although the prompt asked for a side view.
- If an image doesn't work (wrong angle, limbs touching the body), send Adrii a corrected prompt.

**Step 8 · Background removal.** Transparent PNGs.

**Step 9 · Clean the parts.** Cut each part from the parts sheet. Repaint the areas hidden at the joints and add overlap, so no gaps show when limbs rotate.

**Step 10 · Rig the parts.** Set a pivot point, draw order and scale for each part; check mirroring.

- Done when: Hercules plays every base clip from step 3 with no seams or gaps.

**Step 11 · The other four.** Repeat steps 7–10 for each remaining fighter.

## Phase C · The five fighters (steps 12–16)

Each fighter gets its own attacks. Adrii's rule: attacks depend on the element in play, so build **one attack per element the fighter has**, played with that fighter's weapon.

**Step 12 · Hercules.** Earth and thunder. Olive-wood club; Nemean lion skin worn as hood and cape.

**Step 13 · Scorpion King.** Egyptians, high rank, elements TBD. Based on the historical king.

**Step 14 · Sabguru.** Indian (Vedic), demigod. Aether to confirm; aether beats every element.

**Step 15 · Thor.** Vikings; a god who plays as a demigod. Elements TBD.

**Step 16 · Atlantean hero.** An original character. Name, look and elements TBD.

- Done when (each fighter): the full base set from step 3 plus one attack per element, with no seams.

## Phase D · Effects and impact (steps 17–19)

Phase D makes every hit look and feel heavy.

**Step 17 · Element effects.** One modular effect per element: water, wind, fire, earth, thunder and aether. Build each in layers: light, particles, trail and shockwave.

- Any fighter can play any element's effect. Effects attach to the weapon or body through the `impact` frame event from step 2.
- Done when: all six effects play on any fighter at 60 fps on a phone.

**Step 18 · Hit feel.** Hit-stop (freeze a few frames on impact), screen shake, a zoom on the hit and large damage numbers.

**Step 19 · Backgrounds.** One per civilization or one shared; see *Open questions*.

## Phase E · Game layer (steps 20–24)

Phase E wraps the animation in a playable duel.

**Step 20 · Fighter select.** A screen to pick the two fighters.

**Step 21 · Combat rules.** Implement *Game rules* below.

- Show the defender's evasion above the die and centred above the two fighting cards.
- The d12 roll, Mode 1 and Mode 2, element resolution, and hooks for magic and trap cards (attack modifiers).
- Each outcome triggers its own clip and sound (table under *Game rules*).
- Done when: every outcome in the rules can be reached and plays its clip.

**Step 22 · Sound.** Hits, one sound per element, a very loud and clear miss sound, and music. Browsers only play audio after the player's first tap.

**Step 23 · Mobile and PWA.** Smooth on a phone, installable (manifest and service worker), deployed on Netlify.

**Step 24 · Final pass.** Test every fighter × element × mode combination and fix what breaks.

## Phase F · Merge (step 25)

**Step 25 · Merge with the Claude Design project.** Adrii has a related unfinished project, which he believes is in Claude Design. Merge it with this build and convert it to code in the same stack (HTML, CSS, JavaScript).

- Link pending: Adrii will send it.
- Done when: one codebase holds both, deployed on Netlify, ready for Adrii's review.

## Game rules

The combat rules exactly as Adrii defined them; Spanish terms in brackets are his. Rank decides which of the two modes applies.

### Ranks

Low to high: soldiers (soldados), specialists (especializados), high ranks (altos cargos), demigods (semidioses).

### Elements

Five elements in a cycle, each beating the next: **water → wind → fire → earth → thunder → water**.

- Elements that are not next to each other have no relation (water–fire, fire–thunder).
- Aether (éter) beats every element.
- Most fighters have two elements; some have one.
- On screen the elements sit on a pentagon, aether in the centre and water at the top right.

### The roll

The defender rolls a d12 and compares it with the defender's evasion number.

| Roll | Result |
| --- | --- |
| Below evasion | Miss: the attacker strikes the air. Own clip and a very loud, clear miss sound |
| Equal to evasion | Element attack (resolved per mode, below) |
| Above evasion | Normal hit |

### Mode 1 · Different ranks

Decided in one blow: **the fighter with the lower attack dies**, attacker or defender.

- Normal hit: compare attack values; the lower dies. Animate both fighters attacking at once.
- Element attack: pick the attacker's element pairing that does the most damage. If one of the attacker's elements beats one of the defender's, the attacker's attack doubles before comparing.
- Equal attack (for example 4 against 4): each side draws one of its elements at random. The fighter whose element wins survives and the other dies; with no relation it is a draw and nobody dies. Placement in Mode 1 to confirm.
- Magic cards raise attack, so a lower rank can beat a higher one. Trap cards cancel a magic card, and then the base attack counts.
- Example: an attacker with base attack 4 (magic card cancelled) hits a higher rank with 6. The attacker dies.

### Mode 2 · Same rank

Same rank, even with different attack values: a turn-based fight to 0 HP.

- Each fighter has 10 HP; later this will depend on level.
- Turns alternate. A miss does nothing; a normal hit takes the attacker's attack value off the defender's HP.
- Element attack: each side draws one of its elements at random, independently. Attacker's element wins → double damage. Defender's element wins → half, rounded up. No relation → normal damage.
- A fighter at 0 HP loses.

| Attack | Normal hit | Attacker's element wins | Defender's element wins |
| --- | --- | --- | --- |
| 4 | 4 | 8 | 2 |
| 5 | 5 | 10 | 3 |

### Outcomes to animate

| Outcome | Animation | Sound |
| --- | --- | --- |
| Miss | Attacker strikes the air | Very loud, clear miss |
| Normal hit | Attack and hit reaction | Hit |
| Element attack | Attack with that element's effect | Element |
| Mode 1 comparison | Both attack at once; the lower attack falls | Clash |
| Mode 1 draw | Both attack; nobody falls | TBD |
| Defeat | Fighter falls | TBD |

## Image prompts

The Hercules pair below is the model for step 6: write the other four the same way, changing only the character lines, so all five match. Adrii runs them in Antigravity, full body first, then the parts sheet from that image.

Full body:

```
Full-body illustration of Hercules, the ancient Greek mythological hero, for a 2D fighting game. Side view, facing right, in a wide fighting stance with legs apart. Arms held away from the torso so they do not overlap the body. Muscular, with short dark curly hair and beard. He wears the skin of the Nemean lion: the lion's head as a hood and the pelt as a cape tied at the chest. Leather belt and loincloth, sandals laced up the shins. In his right hand, a large knotted olive-wood club. Realistic, detailed digital painting, epic fantasy game art, warm dramatic light. Whole body visible from head to feet. Plain flat light-grey background, no scenery, no shadow, no text. High resolution.
```

Parts sheet:

```
Using this same character in the same style, make a sheet with his body parts separated and spaced apart: head, torso, right upper arm, right forearm with hand and club, left upper arm, left forearm with hand, each thigh, each lower leg with foot, and the lion-skin cape. Plain flat light-grey background.
```

## Open questions

Adrii settles these; tick each one as it is answered. Answers come from the "Dudas pendientes" section of `reglas/reglas-de-combate.pdf`.

- [x] Elements of Thor, the Scorpion King, Sabguru and the Atlantean hero. → Thor: thunder and wind. Scorpion King: fire and earth. Sabguru: aether. Atlantean hero: water.
- [x] Does Sabguru have only aether? What happens when aether meets aether? → Only aether. If two aether fighters touch with aether, both die, whoever started the attack.
- [ ] The Atlantean hero's name and look.
- [ ] Confirm that the equal-attack draw rule belongs to Mode 1. → Partial answer: "in Mode 1, if the attack is the same, they survive". Still to confirm whether that replaces the random-element draw or only covers the no-relation case.
- [x] Who attacks first in Mode 2? → Whoever starts the attack.
- [ ] Attack and evasion values for each fighter. → Partial answer: attack values go 1–12, then jump straight to 15. 13 and 14 do not exist for fighters; they are reserved for beasts (mythological animals below demigods, e.g. the hydra).
- [x] How HP changes with level. → Adrii leaves it to the developer to propose.
- [ ] Backgrounds: one per civilization or one shared?
- [ ] Sounds for a draw and for defeat.
- [ ] Language of in-game text (the prototypes used Spanish).
- [ ] Link to the Claude Design project (step 25).
