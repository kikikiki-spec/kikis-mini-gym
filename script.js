const STORAGE_KEY = "kikis-mini-gym-pixel-rpg-v1";
const WORLD_WIDTH = 1024;
const WORLD_HEIGHT = 640;
const PLAYER_RADIUS = 16;
const NPC_RADIUS = 16;
const MAX_STAT = 100;
const WORKOUT_TIME = 1400;

const levelThresholds = [
  { level: 1, xp: 0, title: "Beginner Body" },
  { level: 2, xp: 100, title: "Slightly Fitter" },
  { level: 3, xp: 240, title: "Athletic" },
  { level: 4, xp: 440, title: "Stronger" },
  { level: 5, xp: 720, title: "Gym Star" },
];

const outfits = [
  { id: "basic", name: "Basic Gym Fit", cost: 0, level: 1 },
  { id: "pink", name: "Pink Tracksuit", cost: 100, level: 1 },
  { id: "black", name: "Black Gym Set", cost: 150, level: 2 },
  { id: "boxing", name: "Boxing Outfit", cost: 200, level: 3 },
  { id: "vip", name: "VIP Gym Fit", cost: 350, level: 5 },
];

const defaultState = {
  xp: 0,
  level: 1,
  energy: 100,
  mood: 80,
  strength: 10,
  cardio: 10,
  stamina: 10,
  coins: 0,
  player: { x: 128, y: 176 },
  workouts: 0,
  completedMissions: [],
  talkedTo: [],
  usedStations: [],
  ownedOutfits: ["basic"],
  equippedOutfit: "basic",
  music: { enabled: false, volume: 0.35 },
};

const stations = [
  { id: "reception", label: "Reception", x: 128, y: 84, width: 128, height: 40, className: "desk", blocking: true, dialogue: "Welcome! Train, rest, and talk to members for safe gym tips." },
  { id: "treadmill1", group: "treadmill", label: "Treadmill", x: 336, y: 112, width: 88, height: 48, className: "treadmill", action: "Jogging", xp: 18, coins: 12, energy: 12, effects: { cardio: 8, stamina: 2 } },
  { id: "treadmill2", group: "treadmill", label: "Treadmill", x: 448, y: 112, width: 88, height: 48, className: "treadmill", action: "Jogging", xp: 18, coins: 12, energy: 12, effects: { cardio: 8, stamina: 2 } },
  { id: "dumbbells", group: "dumbbells", label: "Dumbbells", x: 640, y: 112, width: 88, height: 32, className: "dumbbells", action: "Lifting", xp: 20, coins: 14, energy: 14, effects: { strength: 8, stamina: 1 } },
  { id: "squats", group: "squats", label: "Squat Rack", x: 884, y: 116, width: 88, height: 80, className: "squat-rack", action: "Squats", xp: 24, coins: 16, energy: 16, effects: { strength: 6, stamina: 5 } },
  { id: "boxing", group: "boxing", label: "Boxing Bag", x: 144, y: 352, width: 48, height: 96, className: "boxing-bag", action: "Boxing", unlockLevel: 2, xp: 28, coins: 18, energy: 18, effects: { stamina: 8, mood: 2 } },
  { id: "stretch", group: "stretch", label: "Stretch Mat", x: 384, y: 360, width: 112, height: 48, className: "stretch-mat", action: "Stretching", xp: 16, coins: 10, energy: 8, effects: { mood: 7, stamina: 4 } },
  { id: "bench", group: "rest", label: "Rest Bench", x: 640, y: 360, width: 120, height: 48, className: "bench", action: "Resting", restore: { energy: 30, mood: 5 } },
  { id: "smoothie", group: "smoothie", label: "Smoothies", x: 864, y: 320, width: 128, height: 56, className: "smoothie-bar", action: "Smoothie", unlockLevel: 3, restore: { energy: 24, mood: 12 }, xp: 8, coins: 4 },
  { id: "locker", group: "locker", label: "Locker Room", x: 880, y: 532, width: 64, height: 80, className: "locker-door", unlockLevel: 4, blocking: true, dialogue: "Locker room unlocked. Your outfits are ready in the wardrobe panel." },
];

const missions = [
  { text: "Complete 3 workouts", xp: 40, coins: 25, complete: (s) => s.workouts >= 3 },
  { text: "Talk to 3 NPCs", xp: 35, coins: 20, complete: (s) => s.talkedTo.length >= 3 },
  { text: "Use 3 different equipment types", xp: 45, coins: 30, complete: (s) => s.usedStations.length >= 3 },
  { text: "Reach Level 2", xp: 40, coins: 25, complete: (s) => s.level >= 2 },
  { text: "Reach 50 Strength", xp: 55, coins: 40, complete: (s) => s.strength >= 50 },
  { text: "Reach 50 Cardio", xp: 55, coins: 40, complete: (s) => s.cardio >= 50 },
];

const npcTemplates = [
  { name: "Mia", personality: "supportive", color: "#f27ab7", x: 304, y: 240, prefers: ["stretch", "rest"], tips: ["Rest is important.", "You are doing great. Keep your form slow and steady.", "At higher levels, balance strength with mobility work."] },
  { name: "Leo", personality: "competitive", color: "#77bfe8", x: 456, y: 176, prefers: ["treadmill", "boxing"], tips: ["Cardio improves stamina.", "Beat your last effort, not someone else's.", "Level up by mixing hard sessions with recovery."] },
  { name: "Zara", personality: "stylish", color: "#7453b6", x: 680, y: 168, prefers: ["dumbbells", "smoothie"], tips: ["Train different muscles.", "A good outfit is fun, but good form matters most.", "Higher level outfits unlock when your training backs it up."] },
  { name: "Max", personality: "funny", color: "#77bfe8", x: 176, y: 464, prefers: ["boxing", "smoothie"], tips: ["Don't skip leg day.", "Protein helps recovery.", "If the bag wins, blame lag and hydrate."] },
  { name: "Sofia", personality: "calm", color: "#fff7ff", x: 576, y: 472, prefers: ["rest", "stretch"], tips: ["Rest is important.", "Stretching can improve mood and keep training comfortable.", "Quiet progress still counts."] },
  { name: "Noah", personality: "serious bodybuilder", color: "#6d7080", x: 760, y: 288, prefers: ["dumbbells", "squats"], tips: ["Train different muscles.", "Strength takes consistency.", "Level 5 means recovery, nutrition, and discipline too."] },
  { name: "Ava", personality: "beginner-friendly", color: "#f27ab7", x: 240, y: 184, prefers: ["treadmill", "stretch"], tips: ["Start light and learn the movement.", "Cardio improves stamina.", "Small wins stack up quickly."] },
  { name: "Luca", personality: "confident trainer", color: "#7453b6", x: 744, y: 424, prefers: ["squats", "dumbbells"], tips: ["Don't skip leg day.", "Protein helps recovery.", "Advanced training is about smart variety, not just intensity."] },
];

const elements = {
  startScreen: document.getElementById("startScreen"),
  instructionsScreen: document.getElementById("instructionsScreen"),
  pauseScreen: document.getElementById("pauseScreen"),
  gameShell: document.getElementById("gameShell"),
  entityLayer: document.getElementById("entityLayer"),
  interactionPrompt: document.getElementById("interactionPrompt"),
  actionBanner: document.getElementById("actionBanner"),
  dialogueBox: document.getElementById("dialogueBox"),
  dialogueName: document.getElementById("dialogueName"),
  dialogueText: document.getElementById("dialogueText"),
  floatLayer: document.getElementById("floatLayer"),
  toast: document.getElementById("toast"),
  xpValue: document.getElementById("xpValue"),
  nextXpValue: document.getElementById("nextXpValue"),
  xpBar: document.getElementById("xpBar"),
  energyValue: document.getElementById("energyValue"),
  energyBar: document.getElementById("energyBar"),
  moodValue: document.getElementById("moodValue"),
  moodBar: document.getElementById("moodBar"),
  coinsValue: document.getElementById("coinsValue"),
  levelValue: document.getElementById("levelValue"),
  titleText: document.getElementById("titleText"),
  titleValue: document.getElementById("titleValue"),
  strengthValue: document.getElementById("strengthValue"),
  cardioValue: document.getElementById("cardioValue"),
  staminaValue: document.getElementById("staminaValue"),
  currentOutfitValue: document.getElementById("currentOutfitValue"),
  missionText: document.getElementById("missionText"),
  missionReward: document.getElementById("missionReward"),
  shopList: document.getElementById("shopList"),
  wardrobeList: document.getElementById("wardrobeList"),
  musicToggle: document.getElementById("musicToggle"),
  volumeControl: document.getElementById("volumeControl"),
  musicTrack: document.getElementById("musicTrack"),
  workoutSfx: document.getElementById("workoutSfx"),
  levelSfx: document.getElementById("levelSfx"),
  buySfx: document.getElementById("buySfx"),
};

let state = loadGame();
let playerEl;
let nearestTarget = null;
let isGameStarted = false;
let isPaused = false;
let isBusy = false;
let lastFrame = performance.now();
let toastTimer = 0;
const keys = new Set();

const npcs = npcTemplates.map((npc, index) => ({
  ...npc,
  id: npc.name.toLowerCase(),
  targetX: npc.x,
  targetY: npc.y,
  wait: 900 + index * 250,
  usingStation: false,
  el: null,
}));

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("instructionsButton").addEventListener("click", () => showScreen("instructions"));
document.getElementById("closeInstructionsButton").addEventListener("click", () => showScreen("start"));
document.getElementById("resumeButton").addEventListener("click", togglePause);
document.getElementById("saveButton").addEventListener("click", saveAndToast);
document.getElementById("pauseSaveButton").addEventListener("click", saveAndToast);
document.getElementById("resetButton").addEventListener("click", resetGame);
document.getElementById("pauseResetButton").addEventListener("click", resetGame);
elements.musicToggle.addEventListener("change", updateMusicSetting);
elements.volumeControl.addEventListener("input", updateVolumeSetting);

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  if (event.key.toLowerCase() === "p" && isGameStarted) return togglePause();
  if (event.key.toLowerCase() === "e" && isGameStarted && !isPaused) return interact();
  keys.add(event.key.toLowerCase());
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

buildWorld();
applyAudioSettings();
render();
requestAnimationFrame(gameLoop);

function buildWorld() {
  stations.forEach((station) => {
    const prop = document.createElement("div");
    prop.className = `entity prop ${station.className}`;
    prop.dataset.station = station.id;
    prop.style.left = `${station.x}px`;
    prop.style.top = `${station.y}px`;
    prop.style.width = `${station.width}px`;
    prop.style.height = `${station.height}px`;
    const label = document.createElement("span");
    label.className = "prop-name";
    label.textContent = station.label;
    prop.appendChild(label);
    elements.entityLayer.appendChild(prop);
    station.el = prop;
  });

  npcs.forEach((npc) => {
    npc.el = createSprite("npc", npc.name, npc.color);
    elements.entityLayer.appendChild(npc.el);
  });

  playerEl = createSprite("player", "Kiki", "#f27ab7");
  playerEl.querySelector(".sprite-body").style.background = "";
  elements.entityLayer.appendChild(playerEl);
}

function createSprite(type, name, color) {
  const sprite = document.createElement("div");
  sprite.className = `entity pixel-sprite ${type} idle`;
  sprite.innerHTML = `
    <span class="sprite-name">${name}</span>
    <span class="sprite-hair"></span>
    <span class="sprite-head"></span>
    <span class="sprite-body"></span>
    <span class="sprite-arm left"></span>
    <span class="sprite-arm right"></span>
    <span class="sprite-leg left"></span>
    <span class="sprite-leg right"></span>
  `;
  sprite.querySelector(".sprite-body").style.background = color;
  return sprite;
}

function showScreen(screen) {
  elements.startScreen.classList.toggle("hidden", screen !== "start");
  elements.instructionsScreen.classList.toggle("hidden", screen !== "instructions");
}

function startGame() {
  isGameStarted = true;
  isPaused = false;
  elements.startScreen.classList.add("hidden");
  elements.instructionsScreen.classList.add("hidden");
  elements.pauseScreen.classList.add("hidden");
  elements.gameShell.classList.remove("hidden");
  applyAudioSettings();
  showToast("Welcome to the pixel gym. Press E near stations.");
}

function togglePause() {
  if (!isGameStarted || isBusy) return;
  isPaused = !isPaused;
  elements.pauseScreen.classList.toggle("hidden", !isPaused);
}

function gameLoop(now) {
  const delta = Math.min(40, now - lastFrame) / 1000;
  lastFrame = now;

  if (isGameStarted && !isPaused && !isBusy) {
    updatePlayer(delta);
    updateNpcs(delta);
    updateNearestTarget();
  }

  drawEntities();
  requestAnimationFrame(gameLoop);
}

function updatePlayer(delta) {
  let dx = 0;
  let dy = 0;
  if (keys.has("w") || keys.has("arrowup")) dy -= 1;
  if (keys.has("s") || keys.has("arrowdown")) dy += 1;
  if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
  if (keys.has("d") || keys.has("arrowright")) dx += 1;

  const moving = dx !== 0 || dy !== 0;
  if (moving) {
    const length = Math.hypot(dx, dy);
    const speed = 168;
    movePlayer((dx / length) * speed * delta, (dy / length) * speed * delta);
  }
  playerEl.classList.toggle("walking", moving);
  playerEl.classList.toggle("idle", !moving);
}

function movePlayer(dx, dy) {
  const nextX = clampFloat(state.player.x + dx, PLAYER_RADIUS, WORLD_WIDTH - PLAYER_RADIUS);
  if (!collides(nextX, state.player.y, PLAYER_RADIUS, "player")) state.player.x = nextX;
  const nextY = clampFloat(state.player.y + dy, PLAYER_RADIUS, WORLD_HEIGHT - PLAYER_RADIUS);
  if (!collides(state.player.x, nextY, PLAYER_RADIUS, "player")) state.player.y = nextY;
}

function updateNpcs(delta) {
  npcs.forEach((npc) => {
    npc.wait -= delta * 1000;
    if (npc.wait <= 0) chooseNpcTarget(npc);

    const dx = npc.targetX - npc.x;
    const dy = npc.targetY - npc.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 5) {
      npc.el.classList.remove("npc-moving");
      npc.el.classList.add("npc-idle");
      npc.el.classList.toggle("working", npc.usingStation);
      return;
    }

    const step = Math.min(distance, 74 * delta);
    const nextX = npc.x + (dx / distance) * step;
    const nextY = npc.y + (dy / distance) * step;
    if (!collides(nextX, nextY, NPC_RADIUS, npc.id)) {
      npc.x = nextX;
      npc.y = nextY;
      npc.el.classList.add("npc-moving");
      npc.el.classList.remove("npc-idle", "working");
    } else {
      npc.wait = 0;
    }
  });
}

function chooseNpcTarget(npc) {
  const preferredStations = stations.filter((station) => npc.prefers.includes(station.group));
  const station = preferredStations[Math.floor(Math.random() * preferredStations.length)];
  const wander = Math.random() < 0.22 || !station;
  npc.usingStation = !wander;
  npc.targetX = wander ? 96 + Math.random() * 820 : station.x + (Math.random() * 90 - 45);
  npc.targetY = wander ? 160 + Math.random() * 360 : station.y + 70 + (Math.random() * 50 - 25);
  npc.wait = npc.prefers.includes("rest") ? 2400 + Math.random() * 2600 : 1500 + Math.random() * 2200;
}

function drawEntities() {
  playerEl.style.left = `${state.player.x}px`;
  playerEl.style.top = `${state.player.y}px`;
  const motionClass = playerEl.classList.contains("walking") ? "walking" : "idle";
  playerEl.className = `entity pixel-sprite player outfit-${state.equippedOutfit} buff-${state.level} ${motionClass}${isBusy ? " working" : ""}`;
  npcs.forEach((npc) => {
    npc.el.style.left = `${npc.x}px`;
    npc.el.style.top = `${npc.y}px`;
  });
}

function updateNearestTarget() {
  const targets = [
    ...stations.map((station) => ({ type: "station", x: station.x, y: station.y, data: station })),
    ...npcs.map((npc) => ({ type: "npc", x: npc.x, y: npc.y, data: npc })),
  ];
  nearestTarget = null;
  targets.forEach((target) => {
    const distance = Math.hypot(state.player.x - target.x, state.player.y - target.y);
    if (distance < 70 && (!nearestTarget || distance < nearestTarget.distance)) nearestTarget = { ...target, distance };
  });
  elements.interactionPrompt.classList.toggle("hidden", !nearestTarget);
}

function interact() {
  if (!nearestTarget || isBusy) return;
  if (nearestTarget.type === "npc") return talkToNpc(nearestTarget.data);
  useStation(nearestTarget.data);
}

function talkToNpc(npc) {
  const tipIndex = state.level >= 4 ? 2 : state.level >= 2 ? 1 : 0;
  elements.dialogueName.textContent = `${npc.name} (${npc.personality})`;
  elements.dialogueText.textContent = npc.tips[tipIndex] || npc.tips[0];
  elements.dialogueBox.classList.remove("hidden");
  if (!state.talkedTo.includes(npc.name)) state.talkedTo.push(npc.name);
  addXp(4);
  checkMissions();
  saveGame();
  render();
}

function useStation(station) {
  if (station.unlockLevel && state.level < station.unlockLevel) {
    showToast(`${station.label} unlocks at Level ${station.unlockLevel}.`);
    return;
  }
  if (station.dialogue && !station.effects && !station.restore) {
    elements.dialogueName.textContent = station.label;
    elements.dialogueText.textContent = station.dialogue;
    elements.dialogueBox.classList.remove("hidden");
    return;
  }
  if (station.energy && state.energy < station.energy) {
    showToast("Low energy. Rest or buy a smoothie.");
    return;
  }

  isBusy = true;
  keys.clear();
  playerEl.classList.add("working");
  elements.actionBanner.textContent = station.action;
  elements.actionBanner.classList.remove("hidden");
  elements.dialogueBox.classList.add("hidden");
  window.setTimeout(() => finishStation(station), WORKOUT_TIME);
}

function finishStation(station) {
  isBusy = false;
  playerEl.classList.remove("working");
  elements.actionBanner.classList.add("hidden");

  if (station.effects) {
    state.energy = clamp(state.energy - station.energy, 0, MAX_STAT);
    Object.entries(station.effects).forEach(([key, value]) => {
      state[key] = clamp(state[key] + value, 0, MAX_STAT);
    });
    state.workouts += 1;
    if (!state.usedStations.includes(station.group)) state.usedStations.push(station.group);
    state.coins += station.coins;
    addXp(station.xp);
    showFloatingText(`+${station.xp} XP +${station.coins}c`, station.x, station.y - 42);
    playSfx(elements.workoutSfx);
  }

  if (station.restore) {
    state.energy = clamp(state.energy + station.restore.energy, 0, MAX_STAT);
    state.mood = clamp(state.mood + station.restore.mood, 0, MAX_STAT);
    state.coins += station.coins || 0;
    if (station.xp) addXp(station.xp);
    showFloatingText("Recovered", station.x, station.y - 42);
  }

  checkMissions();
  saveGame();
  render();
}

function addXp(amount) {
  const oldLevel = state.level;
  state.xp += amount;
  state.level = getLevelForXp(state.xp);
  if (state.level > oldLevel) {
    showToast(`Level Up! ${getLevelInfo().title}`);
    showFloatingText("LEVEL UP", state.player.x, state.player.y - 60);
    playSfx(elements.levelSfx);
  }
}

function checkMissions() {
  const mission = getActiveMission();
  if (!mission || !mission.complete(state)) return;
  state.completedMissions.push(mission.text);
  state.xp += mission.xp;
  state.coins += mission.coins;
  state.level = getLevelForXp(state.xp);
  showToast(`Mission complete! +${mission.xp} XP +${mission.coins} coins`);
  checkMissions();
}

function buyOutfit(id) {
  const outfit = outfits.find((item) => item.id === id);
  if (!outfit || state.ownedOutfits.includes(id)) return;
  if (state.level < outfit.level) return showToast(`${outfit.name} needs Level ${outfit.level}.`);
  if (state.coins < outfit.cost) return showToast(`Need ${outfit.cost} coins for ${outfit.name}.`);
  state.coins -= outfit.cost;
  state.ownedOutfits.push(id);
  state.equippedOutfit = id;
  playSfx(elements.buySfx);
  showToast(`${outfit.name} bought and equipped.`);
  saveGame();
  render();
}

function equipOutfit(id) {
  if (!state.ownedOutfits.includes(id)) return;
  state.equippedOutfit = id;
  showToast(`${getOutfit(id).name} equipped.`);
  saveGame();
  render();
}

function render() {
  const levelInfo = getLevelInfo();
  const currentXp = levelInfo.xp;
  const nextXp = getNextLevelXp();
  const xpPercent = state.level >= 5 ? 100 : ((state.xp - currentXp) / (nextXp - currentXp)) * 100;
  elements.xpValue.textContent = state.xp;
  elements.nextXpValue.textContent = state.level >= 5 ? "MAX" : nextXp;
  elements.xpBar.style.width = `${clamp(xpPercent, 0, 100)}%`;
  elements.energyValue.textContent = state.energy;
  elements.energyBar.style.width = `${state.energy}%`;
  elements.moodValue.textContent = state.mood;
  elements.moodBar.style.width = `${state.mood}%`;
  elements.coinsValue.textContent = state.coins;
  elements.levelValue.textContent = state.level;
  elements.titleText.textContent = `Level ${state.level} ${levelInfo.title}`;
  elements.titleValue.textContent = levelInfo.title;
  elements.strengthValue.textContent = state.strength;
  elements.cardioValue.textContent = state.cardio;
  elements.staminaValue.textContent = state.stamina;
  elements.currentOutfitValue.textContent = getOutfit(state.equippedOutfit).name;

  const mission = getActiveMission();
  elements.missionText.textContent = mission ? mission.text : "All missions complete";
  elements.missionReward.textContent = mission ? `Reward: +${mission.xp} XP, +${mission.coins} coins` : "Reward: Gym Star pride";

  stations.forEach((station) => {
    if (station.el) station.el.classList.toggle("locked-station", Boolean(station.unlockLevel && state.level < station.unlockLevel));
  });
  renderOutfits();
}

function renderOutfits() {
  elements.shopList.innerHTML = "";
  elements.wardrobeList.innerHTML = "";
  outfits.forEach((outfit) => {
    const owned = state.ownedOutfits.includes(outfit.id);
    const shopItem = document.createElement("div");
    shopItem.className = "outfit-item";
    shopItem.innerHTML = `
      <span><strong>${outfit.name}</strong><small>${outfit.cost} coins · Level ${outfit.level}</small></span>
      <button type="button">${owned ? "Owned" : "Buy"}</button>
    `;
    shopItem.querySelector("button").disabled = owned;
    shopItem.querySelector("button").addEventListener("click", () => buyOutfit(outfit.id));
    elements.shopList.appendChild(shopItem);

    if (owned) {
      const wardrobeItem = document.createElement("div");
      wardrobeItem.className = "outfit-item";
      wardrobeItem.innerHTML = `
        <span><strong>${outfit.name}</strong><small>${state.equippedOutfit === outfit.id ? "Equipped" : "Owned"}</small></span>
        <button type="button">${state.equippedOutfit === outfit.id ? "On" : "Equip"}</button>
      `;
      wardrobeItem.querySelector("button").disabled = state.equippedOutfit === outfit.id;
      wardrobeItem.querySelector("button").addEventListener("click", () => equipOutfit(outfit.id));
      elements.wardrobeList.appendChild(wardrobeItem);
    }
  });
}

function collides(x, y, radius, moverId) {
  if (x < 28 || x > WORLD_WIDTH - 28 || y < 28 || y > WORLD_HEIGHT - 28) return true;
  for (const station of stations) {
    if ((station.blocking || station.effects || station.restore) && circleHitsRect(x, y, radius, station)) return true;
  }
  if (moverId !== "player" && Math.hypot(x - state.player.x, y - state.player.y) < radius + PLAYER_RADIUS) return true;
  for (const npc of npcs) {
    if (npc.id !== moverId && Math.hypot(x - npc.x, y - npc.y) < radius + NPC_RADIUS) return true;
  }
  return false;
}

function circleHitsRect(cx, cy, radius, rect) {
  const left = rect.x - rect.width / 2;
  const right = rect.x + rect.width / 2;
  const top = rect.y - rect.height / 2;
  const bottom = rect.y + rect.height / 2;
  const nearestX = clampFloat(cx, left, right);
  const nearestY = clampFloat(cy, top, bottom);
  return Math.hypot(cx - nearestX, cy - nearestY) < radius;
}

function updateMusicSetting() {
  state.music.enabled = elements.musicToggle.checked;
  applyAudioSettings();
  saveGame();
}

function updateVolumeSetting() {
  state.music.volume = Number(elements.volumeControl.value);
  applyAudioSettings();
  saveGame();
}

function applyAudioSettings() {
  elements.musicToggle.checked = state.music.enabled;
  elements.volumeControl.value = state.music.volume;
  [elements.musicTrack, elements.workoutSfx, elements.levelSfx, elements.buySfx].forEach((audio) => {
    audio.volume = state.music.volume;
  });
  if (state.music.enabled && isGameStarted) {
    elements.musicTrack.play().catch(() => {});
  } else {
    elements.musicTrack.pause();
  }
}

function playSfx(audio) {
  if (!state.music.enabled) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function getActiveMission() {
  return missions.find((mission) => !state.completedMissions.includes(mission.text));
}

function getOutfit(id) {
  return outfits.find((outfit) => outfit.id === id) || outfits[0];
}

function getLevelForXp(xp) {
  return levelThresholds.reduce((level, threshold) => (xp >= threshold.xp ? threshold.level : level), 1);
}

function getLevelInfo() {
  return levelThresholds.find((item) => item.level === state.level) || levelThresholds[0];
}

function getNextLevelXp() {
  const next = levelThresholds.find((item) => item.level === state.level + 1);
  return next ? next.xp : levelThresholds[levelThresholds.length - 1].xp;
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);
  try {
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      player: { ...defaultState.player, ...parsed.player },
      music: { ...defaultState.music, ...parsed.music },
      completedMissions: parsed.completedMissions || [],
      talkedTo: parsed.talkedTo || [],
      usedStations: parsed.usedStations || [],
      ownedOutfits: parsed.ownedOutfits || ["basic"],
      equippedOutfit: parsed.equippedOutfit || "basic",
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveAndToast() {
  saveGame();
  showToast("Game saved.");
}

function resetGame() {
  if (!window.confirm("Reset Kiki's Mini Gym?")) return;
  state = structuredClone(defaultState);
  localStorage.removeItem(STORAGE_KEY);
  isPaused = false;
  isBusy = false;
  elements.pauseScreen.classList.add("hidden");
  elements.dialogueBox.classList.add("hidden");
  applyAudioSettings();
  render();
  showToast("New save started.");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => elements.toast.classList.add("hidden"), 2200);
}

function showFloatingText(text, x, y) {
  const float = document.createElement("div");
  float.className = "float-xp";
  float.textContent = text;
  float.style.left = `${x}px`;
  float.style.top = `${y}px`;
  elements.floatLayer.appendChild(float);
  window.setTimeout(() => float.remove(), 920);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function clampFloat(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
