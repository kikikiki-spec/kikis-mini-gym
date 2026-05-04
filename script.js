const STORAGE_KEY = "kikis-mini-gym-save-v1";
const MAX_ENERGY = 100;

const levelThresholds = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 900 },
];

const workouts = {
  treadmill: {
    label: "Treadmill",
    points: 5,
    coins: 3,
    xp: 5,
    energy: 5,
    unlockLevel: 1,
  },
  dumbbells: {
    label: "Dumbbells",
    points: 10,
    coins: 5,
    xp: 10,
    energy: 10,
    unlockLevel: 1,
  },
  squats: {
    label: "Squats",
    points: 15,
    coins: 8,
    xp: 15,
    energy: 15,
    unlockLevel: 1,
  },
  boxing: {
    label: "Boxing Bag",
    points: 25,
    coins: 12,
    xp: 25,
    energy: 25,
    unlockLevel: 3,
  },
};

const upgrades = [
  {
    id: "betterShoes",
    name: "Better Shoes",
    cost: 50,
    description: "+2 bonus points per workout",
  },
  {
    id: "proteinShake",
    name: "Protein Shake",
    cost: 80,
    description: "Rest gives +10 extra energy",
  },
  {
    id: "personalTrainer",
    name: "Personal Trainer",
    cost: 150,
    description: "+5 bonus points per workout",
  },
  {
    id: "newMirrors",
    name: "New Mirrors",
    cost: 120,
    description: "+1 Gym Rating",
  },
  {
    id: "neonLights",
    name: "Neon Lights",
    cost: 200,
    description: "Neon background and +2 Gym Rating",
  },
];

const challengeTemplates = [
  {
    id: "workouts",
    text: "Do 5 workouts",
    goal: 5,
    getValue: (state) => state.challenge.progress,
  },
  {
    id: "points",
    text: "Earn 100 points",
    goal: 100,
    getValue: (state) => state.challenge.progress,
  },
  {
    id: "energy",
    text: "Reach full energy",
    goal: 100,
    getValue: (state) => state.energy,
  },
];

const defaultState = {
  points: 0,
  coins: 0,
  xp: 0,
  level: 1,
  energy: 100,
  gymRating: 1,
  purchased: {},
  challenge: {
    id: "workouts",
    progress: 0,
  },
};

let state = loadState();

const elements = {
  gameShell: document.getElementById("gameShell"),
  points: document.getElementById("pointsValue"),
  coins: document.getElementById("coinsValue"),
  xp: document.getElementById("xpValue"),
  nextXp: document.getElementById("nextXpValue"),
  level: document.getElementById("levelValue"),
  rating: document.getElementById("ratingValue"),
  energy: document.getElementById("energyValue"),
  energyFill: document.getElementById("energyFill"),
  xpFill: document.getElementById("xpFill"),
  status: document.getElementById("statusMessage"),
  character: document.getElementById("character"),
  coinLayer: document.getElementById("coinLayer"),
  levelFlash: document.getElementById("levelFlash"),
  restButton: document.getElementById("restButton"),
  restAmount: document.getElementById("restAmountValue"),
  resetButton: document.getElementById("resetButton"),
  shopList: document.getElementById("shopList"),
  challengeText: document.getElementById("challengeText"),
  challengeFill: document.getElementById("challengeFill"),
  challengeProgress: document.getElementById("challengeProgress"),
  challengePanel: document.getElementById("challengePanel"),
  boxingHint: document.getElementById("boxingHint"),
  dumbbellsVisual: document.getElementById("dumbbellsVisual"),
  boxingVisual: document.getElementById("boxingVisual"),
  mirrorVisual: document.getElementById("mirrorVisual"),
};

document.querySelectorAll("[data-workout]").forEach((button) => {
  button.addEventListener("click", () => doWorkout(button.dataset.workout, button));
});

elements.restButton.addEventListener("click", rest);
elements.resetButton.addEventListener("click", resetGame);

renderShop();
render();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return structuredClone(defaultState);
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      purchased: {
        ...defaultState.purchased,
        ...parsed.purchased,
      },
      challenge: {
        ...defaultState.challenge,
        ...parsed.challenge,
      },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function doWorkout(id, button) {
  const workout = workouts[id];

  if (state.level < workout.unlockLevel) {
    showStatus(`${workout.label} unlocks at Level ${workout.unlockLevel}.`, true);
    return;
  }

  if (state.energy < workout.energy) {
    showStatus("Too tired, rest first!", true);
    return;
  }

  const bonusPoints = getWorkoutBonus();
  state.energy -= workout.energy;
  state.points += workout.points + bonusPoints;
  state.coins += workout.coins;
  state.xp += workout.xp;

  updateChallengeAfterWorkout(workout.points + bonusPoints);
  const leveledUp = updateLevel();

  animateButton(button);
  animateCharacter();
  popCoins(`+${workout.coins} coins`);
  showStatus(
    `${workout.label}! +${workout.points + bonusPoints} points, +${workout.xp} XP.`
  );

  if (leveledUp) {
    showLevelUp();
  }

  checkChallengeCompletion();
  saveState();
  render();
  // Sound placeholder: play a short workout tap sound here.
}

function rest() {
  const before = state.energy;
  const amount = getRestAmount();
  state.energy = Math.min(MAX_ENERGY, state.energy + amount);

  animateButton(elements.restButton);
  showStatus(`Rested! Energy +${state.energy - before}.`);
  checkChallengeCompletion();
  saveState();
  render();
  // Sound placeholder: play a soft rest/recharge sound here.
}

function buyUpgrade(id, button) {
  const upgrade = upgrades.find((item) => item.id === id);

  if (!upgrade || state.purchased[id]) {
    return;
  }

  if (state.coins < upgrade.cost) {
    showStatus("Need more coins for that upgrade!", true);
    animateButton(button);
    return;
  }

  state.coins -= upgrade.cost;
  state.purchased[id] = true;

  if (id === "newMirrors") {
    state.gymRating += 1;
  }

  if (id === "neonLights") {
    state.gymRating += 2;
  }

  button.classList.add("purchased");
  window.setTimeout(() => button.classList.remove("purchased"), 650);
  showStatus(`${upgrade.name} purchased!`);
  saveState();
  render();
  // Sound placeholder: play an upgrade purchase sparkle sound here.
}

function getWorkoutBonus() {
  let bonus = 0;

  if (state.purchased.betterShoes) {
    bonus += 2;
  }

  if (state.purchased.personalTrainer) {
    bonus += 5;
  }

  return bonus;
}

function getRestAmount() {
  return 20 + (state.purchased.proteinShake ? 10 : 0);
}

function updateLevel() {
  const previousLevel = state.level;
  state.level = levelThresholds.reduce((currentLevel, threshold) => {
    return state.xp >= threshold.xp ? threshold.level : currentLevel;
  }, 1);

  return state.level > previousLevel;
}

function getCurrentLevelXp() {
  return levelThresholds.find((item) => item.level === state.level)?.xp ?? 0;
}

function getNextLevelXp() {
  const next = levelThresholds.find((item) => item.level === state.level + 1);
  return next?.xp ?? levelThresholds[levelThresholds.length - 1].xp;
}

function getXpPercent() {
  const current = getCurrentLevelXp();
  const next = getNextLevelXp();

  if (state.level >= 5) {
    return 100;
  }

  return Math.max(0, Math.min(100, ((state.xp - current) / (next - current)) * 100));
}

function updateChallengeAfterWorkout(pointsEarned) {
  if (state.challenge.id === "workouts") {
    state.challenge.progress += 1;
  }

  if (state.challenge.id === "points") {
    state.challenge.progress += pointsEarned;
  }
}

function getChallenge() {
  return (
    challengeTemplates.find((challenge) => challenge.id === state.challenge.id) ||
    challengeTemplates[0]
  );
}

function checkChallengeCompletion() {
  const challenge = getChallenge();
  const value = Math.min(challenge.goal, challenge.getValue(state));

  if (value < challenge.goal) {
    return;
  }

  state.coins += 50;
  popCoins("+50 challenge");
  showStatus(`Challenge complete! +50 coins.`);
  generateNewChallenge();
  // Sound placeholder: play a challenge complete fanfare here.
}

function generateNewChallenge() {
  const currentIndex = challengeTemplates.findIndex(
    (challenge) => challenge.id === state.challenge.id
  );
  const nextChallenge = challengeTemplates[(currentIndex + 1) % challengeTemplates.length];

  state.challenge = {
    id: nextChallenge.id,
    progress: 0,
  };
}

function render() {
  elements.points.textContent = state.points;
  elements.coins.textContent = state.coins;
  elements.xp.textContent = state.xp;
  elements.level.textContent = state.level;
  elements.rating.textContent = state.gymRating;
  elements.energy.textContent = state.energy;
  elements.restAmount.textContent = getRestAmount();

  const nextXp = getNextLevelXp();
  elements.nextXp.textContent = state.level >= 5 ? "MAX" : nextXp;
  elements.energyFill.style.width = `${state.energy}%`;
  elements.xpFill.style.width = `${getXpPercent()}%`;

  renderUnlocks();
  renderChallenge();
  renderShop();
}

function renderUnlocks() {
  const workoutButtons = document.querySelectorAll("[data-workout]");

  workoutButtons.forEach((button) => {
    const workout = workouts[button.dataset.workout];
    button.classList.toggle("locked", state.level < workout.unlockLevel);
  });

  elements.boxingHint.textContent =
    state.level >= 3 ? "+25 pts · +12 coins · -25 energy" : "Unlocks at Level 3";
  elements.dumbbellsVisual.classList.toggle("active", state.level >= 2);
  elements.boxingVisual.classList.toggle("active", state.level >= 3);
  elements.mirrorVisual.classList.toggle("active", Boolean(state.purchased.newMirrors));
  elements.gameShell.classList.toggle("level-four", state.level >= 4);
  elements.gameShell.classList.toggle("vip", state.level >= 5);
  elements.gameShell.classList.toggle("neon", Boolean(state.purchased.neonLights));
}

function renderChallenge() {
  const challenge = getChallenge();
  const value = Math.min(challenge.goal, challenge.getValue(state));
  const percent = (value / challenge.goal) * 100;

  elements.challengeText.textContent = challenge.text;
  elements.challengeFill.style.width = `${percent}%`;
  elements.challengeProgress.textContent = `${value}/${challenge.goal}`;
}

function renderShop() {
  elements.shopList.innerHTML = "";

  upgrades.forEach((upgrade) => {
    const button = document.createElement("button");
    button.className = "shop-button";
    button.type = "button";
    button.classList.toggle("bought", Boolean(state.purchased[upgrade.id]));
    button.classList.toggle(
      "cant-afford",
      state.coins < upgrade.cost && !state.purchased[upgrade.id]
    );
    button.innerHTML = `
      <span>
        <strong>${upgrade.name}</strong>
        <small>${upgrade.description}</small>
      </span>
      <span class="shop-cost">${state.purchased[upgrade.id] ? "Bought" : `${upgrade.cost}c`}</span>
    `;
    button.addEventListener("click", () => buyUpgrade(upgrade.id, button));
    elements.shopList.appendChild(button);
  });
}

function showStatus(message, warning = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("warning", warning);

  if (warning) {
    window.setTimeout(() => elements.status.classList.remove("warning"), 450);
  }
}

function animateCharacter() {
  elements.character.classList.remove("workout");
  void elements.character.offsetWidth;
  elements.character.classList.add("workout");
}

function animateButton(button) {
  button.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.94)" },
      { transform: "scale(1)" },
    ],
    {
      duration: 180,
      easing: "ease-out",
    }
  );
}

function popCoins(text) {
  const coin = document.createElement("div");
  coin.className = "coin-pop";
  coin.textContent = text;
  coin.style.left = `${46 + Math.random() * 18}%`;
  coin.style.top = `${44 + Math.random() * 18}%`;
  elements.coinLayer.appendChild(coin);

  window.setTimeout(() => coin.remove(), 950);
}

function showLevelUp() {
  elements.levelFlash.classList.remove("show");
  void elements.levelFlash.offsetWidth;
  elements.levelFlash.classList.add("show");
  showStatus(`LEVEL UP! Welcome to Level ${state.level}.`);
  // Sound placeholder: play a level-up glow sound here.
}

function resetGame() {
  const confirmed = window.confirm("Reset Kiki's Mini Gym and start over?");

  if (!confirmed) {
    return;
  }

  state = structuredClone(defaultState);
  localStorage.removeItem(STORAGE_KEY);
  showStatus("Fresh gym, fresh start!");
  render();
}
