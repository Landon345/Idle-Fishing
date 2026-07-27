import {
  applySpeed,
  daysToYears,
  getTotalExpenses,
  highestTierFish,
  lowestLevelSkill,
} from "src/functions";

import type {
  Bases,
  BoatBaseData,
  FishBaseData,
  GameDataType,
  ItemBaseData,
  RequirementObj,
  SkillBaseData,
} from "src/Entities";

// These classes are constructed eagerly below (inside the `requirements` map
// literal), so they're defined here rather than in classes.svelte.ts: that
// module imports back from this one, and a class from a module still mid­-
// evaluation can't be used yet ("cannot access before initialization").
export class Requirement {
  requirements: RequirementObj[];
  // Not `$state`: `isCompleted()` below caches this as a side effect of a
  // read that regularly happens during template rendering (via
  // `needRequirements`/`filtered`), and mutating `$state` mid-render throws
  // "unsafe mutation" — repeatedly, once per newly-satisfied requirement,
  // which is a real source of the reported slowdown over long sessions.
  completed = false;
  type: string;
  constructor(requirements: RequirementObj[], type: string) {
    this.requirements = requirements;
    this.completed = false;
    this.type = type;
  }
  getCondition(requirement: RequirementObj) {
    return false;
  }

  isCompleted() {
    if (this.completed) {
      return true;
    }
    for (let requirement of this.requirements) {
      if (!this.getCondition(requirement)) {
        return false;
      }
    }
    this.completed = true;
    return true;
  }
}

export class FishingRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "fishing");
  }
  getCondition(requirement: RequirementObj) {
    return gameState.fishingData.get(requirement.name)!.level >= (requirement.requirement as number);
  }
}

export class SkillRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "skill");
  }
  getCondition(requirement: RequirementObj) {
    return gameState.skillsData.get(requirement.name)!.level >= (requirement.requirement as number);
  }
}

export class CoinRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "coins");
  }

  getCondition(requirement: RequirementObj) {
    return gameState.coins >= (requirement.requirement as number);
  }
}

export class AgeRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "age");
  }

  getCondition(requirement: RequirementObj) {
    return daysToYears(gameState.day) >= (requirement.requirement as number);
  }
}

export class BoatRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "boat");
  }

  getCondition(requirement: RequirementObj) {
    return gameState.boatData.get(requirement.name)!.bought == requirement.requirement;
  }
}

export class LegendRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "legend");
  }

  getCondition(requirement: RequirementObj) {
    return gameState.legendPoints >= (requirement.requirement as number);
  }
}

export const requirements = new Map<string, Requirement[]>([
  ["Sun Fish", []],
  ["Perch", [new FishingRequirement([{ name: "Sun Fish", requirement: 10 }])]],
  [
    "Bass",
    [
      new FishingRequirement([{ name: "Perch", requirement: 10 }]),
      new BoatRequirement([{ name: "Row Boat", requirement: true }]),
    ],
  ],
  [
    "Trout",
    [
      new FishingRequirement([{ name: "Bass", requirement: 10 }]),
      new SkillRequirement([{ name: "Strength", requirement: 10 }]),
    ],
  ],
  [
    "Waleye",
    [
      new FishingRequirement([{ name: "Trout", requirement: 10 }]),
      new SkillRequirement([{ name: "Strength", requirement: 30 }]),
      new BoatRequirement([{ name: "Silver Bullet", requirement: true }]),
    ],
  ],
  [
    "Northern Pike",
    [
      new FishingRequirement([{ name: "Waleye", requirement: 10 }]),
      new SkillRequirement([{ name: "Ambition", requirement: 50 }]),
    ],
  ],
  [
    "Lake Sturgeon",
    [
      new FishingRequirement([{ name: "Northern Pike", requirement: 10 }]),
      new SkillRequirement([{ name: "Patience", requirement: 80 }]),
      new BoatRequirement([{ name: "Bass Boat", requirement: true }]),
    ],
  ],
  // River
  // 1. Pirana
  // 2. Salmon
  // 2. Silver Drum
  // 3. Armoured Catfish
  // 4. Electric Eel
  // 5. Pacu
  // 6. Payara
  ["Pirana", [new SkillRequirement([{ name: "Strength", requirement: 10 }])]],
  [
    "Salmon",
    [
      new FishingRequirement([{ name: "Pirana", requirement: 10 }]),
      new SkillRequirement([{ name: "Strength", requirement: 30 }]),
    ],
  ],
  [
    "Silver Drum",
    [
      new FishingRequirement([{ name: "Salmon", requirement: 10 }]),
      new SkillRequirement([{ name: "Intelligence", requirement: 40 }]),
      new BoatRequirement([{ name: "Canoe", requirement: true }]),
    ],
  ],
  [
    "Armoured Catfish",
    [
      new FishingRequirement([{ name: "Silver Drum", requirement: 10 }]),
      new SkillRequirement([{ name: "Casting", requirement: 100 }]),
    ],
  ],
  [
    "Electric Eel",
    [
      new FishingRequirement([{ name: "Armoured Catfish", requirement: 10 }]),
      new SkillRequirement([{ name: "Strength", requirement: 300 }]),
      new BoatRequirement([{ name: "River Skiff", requirement: true }]),
    ],
  ],
  [
    "Pacu",
    [
      new FishingRequirement([{ name: "Electric Eel", requirement: 10 }]),
      new SkillRequirement([{ name: "Trolling", requirement: 500 }]),
    ],
  ],
  [
    "Payara",
    [
      new FishingRequirement([{ name: "Pacu", requirement: 10 }]),
      new SkillRequirement([{ name: "Reeling", requirement: 1000 }]),
      new BoatRequirement([{ name: "Airboat", requirement: true }]),
    ],
  ],
  // Ocean
  // 1. Cod
  // 2. Mackerel
  // 2. Angle Fish
  // 4. Grouper
  // Stingray
  // 6. Barracuda
  // 3. Bluefin tuna
  // 5. Blue Marlin
  // Swordfish
  // Shark
  // Whale
  [
    "Cod",
    [
      new SkillRequirement([
        { name: "Patience", requirement: 200 },
        { name: "Concentration", requirement: 200 },
      ]),
      new BoatRequirement([{ name: "Sail Boat", requirement: true }]),
    ],
  ],
  [
    "Mackerel",
    [
      new FishingRequirement([{ name: "Cod", requirement: 10 }]),
      new SkillRequirement([
        { name: "Docking", requirement: 400 },
        { name: "Netting", requirement: 200 },
      ]),
    ],
  ],
  [
    "Angle Fish",
    [
      new FishingRequirement([{ name: "Mackerel", requirement: 10 }]),
      new SkillRequirement([
        { name: "Docking", requirement: 700 },
        { name: "Turning", requirement: 600 },
      ]),
    ],
  ],
  [
    "Grouper",
    [
      new FishingRequirement([{ name: "Angle Fish", requirement: 10 }]),
      new SkillRequirement([{ name: "Anchoring", requirement: 1000 }]),
    ],
  ],
  [
    "Stingray",
    [
      new FishingRequirement([{ name: "Grouper", requirement: 10 }]),
      new SkillRequirement([{ name: "Docking", requirement: 1200 }]),
    ],
  ],
  [
    "Barracuda",
    [
      new FishingRequirement([{ name: "Stingray", requirement: 10 }]),
      new SkillRequirement([{ name: "Turning", requirement: 1400 }]),
    ],
  ],
  [
    "Bluefin Tuna",
    [
      new FishingRequirement([{ name: "Barracuda", requirement: 10 }]),
      new SkillRequirement([{ name: "Sailing", requirement: 1500 }]),
      new BoatRequirement([{ name: "Yacht", requirement: true }]),
    ],
  ],
  [
    "Blue Marlin",
    [
      new FishingRequirement([{ name: "Bluefin Tuna", requirement: 10 }]),
      new SkillRequirement([{ name: "Sailing", requirement: 1800 }]),
    ],
  ],
  [
    "Swordfish",
    [
      new FishingRequirement([{ name: "Blue Marlin", requirement: 10 }]),
      new SkillRequirement([{ name: "Navigation", requirement: 1900 }]),
    ],
  ],
  [
    "Shark",
    [
      new FishingRequirement([{ name: "Swordfish", requirement: 10 }]),
      new SkillRequirement([{ name: "Stability", requirement: 2000 }]),
    ],
  ],
  [
    "Whale",
    [
      new FishingRequirement([{ name: "Shark", requirement: 10 }]),
      new SkillRequirement([{ name: "Stability", requirement: 2500 }]),
      new BoatRequirement([{ name: "Whaling Ship", requirement: true }]),
    ],
  ],
  // FUNDAMENTALS //
  // Strength
  // Concentration
  // Intelligence
  // Patience
  // Ambition
  // Communication
  ["Strength", []],
  ["Concentration", []],
  [
    "Intelligence",
    [new SkillRequirement([{ name: "Concentration", requirement: 10 }])],
  ],
  [
    "Patience",
    [new SkillRequirement([{ name: "Concentration", requirement: 20 }])],
  ],
  [
    "Ambition",
    [new SkillRequirement([{ name: "Intelligence", requirement: 30 }])],
  ],
  [
    "Communication",
    [
      new SkillRequirement([
        { name: "Intelligence", requirement: 30 },
        { name: "Strength", requirement: 40 },
      ]),
    ],
  ],
  // FISHING SKILLS
  // Casting
  // Jigging
  // Trolling
  // Reeling
  // Hooking
  // Netting
  // Whaling
  ["Casting", []],
  ["Jigging", [new SkillRequirement([{ name: "Strength", requirement: 30 }])]],
  [
    "Trolling",
    [new SkillRequirement([{ name: "Concentration", requirement: 40 }])],
  ],
  ["Reeling", [new SkillRequirement([{ name: "Strength", requirement: 60 }])]],
  ["Hooking", [new SkillRequirement([{ name: "Jigging", requirement: 40 }])]],
  [
    "Netting",
    [new SkillRequirement([{ name: "Concentration", requirement: 120 }])],
  ],
  ["Whaling", [new SkillRequirement([{ name: "Strength", requirement: 250 }])]],
  // Boating Skills
  // Docking
  // Turning
  // Anchoring
  // Sailing
  // Navigation
  // Stability
  [
    "Docking",
    [
      new SkillRequirement([
        { name: "Concentration", requirement: 200 },
        { name: "Intelligence", requirement: 200 },
      ]),
    ],
  ],
  [
    "Turning",
    [
      new SkillRequirement([
        { name: "Concentration", requirement: 320 },
        { name: "Patience", requirement: 250 },
      ]),
    ],
  ],
  ["Anchoring", [new FishingRequirement([{ name: "Cod", requirement: 15 }])]],
  [
    "Sailing",
    [new FishingRequirement([{ name: "Angle Fish", requirement: 10 }])],
  ],
  [
    "Navigation",
    [new SkillRequirement([{ name: "Trolling", requirement: 400 }])],
  ],
  [
    "Stability",
    [new SkillRequirement([{ name: "Anchoring", requirement: 500 }])],
  ],
  // IMMORTALITY SKILLS //
  [
    "Immortality",
    [new SkillRequirement([{ name: "Ambition", requirement: 100 }])],
  ],
  [
    "Super Immortality",
    [new SkillRequirement([{ name: "Immortality", requirement: 500 }])],
  ],
  ["Row Boat", [new CoinRequirement([{ name: "Coins", requirement: 500 }])]],
  [
    "Silver Bullet",
    [new CoinRequirement([{ name: "Coins", requirement: 1000 }])],
  ],
  ["Bass Boat", [new CoinRequirement([{ name: "Coins", requirement: 50000 }])]],
  ["Canoe", [new CoinRequirement([{ name: "Coins", requirement: 500000 }])]],
  [
    "River Skiff",
    [new CoinRequirement([{ name: "Coins", requirement: 1000000 }])],
  ],
  ["Airboat", [new CoinRequirement([{ name: "Coins", requirement: 5000000 }])]],
  [
    "Sail Boat",
    [new CoinRequirement([{ name: "Coins", requirement: 10000000 }])],
  ],
  ["Yacht", [new CoinRequirement([{ name: "Coins", requirement: 50000000 }])]],
  [
    "Whaling Ship",
    [new CoinRequirement([{ name: "Coins", requirement: 500000000 }])],
  ],
  // ITEMS //
  // Rod
  // Book
  // Net
  // Hook
  // Bait
  // Ham Sandwich
  // Pliers
  // Fish Finder
  // House
  ["Rod", [new CoinRequirement([{ name: "Coins", requirement: 500 }])]],
  ["Book", [new CoinRequirement([{ name: "Coins", requirement: 3000 }])]],
  ["Net", [new CoinRequirement([{ name: "Coins", requirement: 30000 }])]],
  ["Hook", [new CoinRequirement([{ name: "Coins", requirement: 50000 }])]],
  ["Bait", [new CoinRequirement([{ name: "Coins", requirement: 300000 }])]],
  [
    "Ham Sandwich",
    [new CoinRequirement([{ name: "Coins", requirement: 500000 }])],
  ],
  ["Pliers", [new CoinRequirement([{ name: "Coins", requirement: 1000000 }])]],
  [
    "Fish Finder",
    [new CoinRequirement([{ name: "Coins", requirement: 5000000 }])],
  ],
  ["House", [new CoinRequirement([{ name: "Coins", requirement: 10000000 }])]],
  // LEGEND SKILLS //
  ["Sea Legend", [new LegendRequirement([{ name: "Legend Points", requirement: 1 }])]],
  ["Tidal Focus", [new LegendRequirement([{ name: "Legend Points", requirement: 1 }])]],
  ["Old Haggler", [new LegendRequirement([{ name: "Legend Points", requirement: 1 }])]],
  [
    "Weathered Instinct",
    [new LegendRequirement([{ name: "Legend Points", requirement: 25 }])],
  ],
  [
    "Deep Meditation",
    [new LegendRequirement([{ name: "Legend Points", requirement: 75 }])],
  ],
  [
    "Sunken Fortune",
    [new LegendRequirement([{ name: "Legend Points", requirement: 500 }])],
  ],
]);

export const gameState: GameDataType = $state({
  day: 0,
  coins: 0,
  fishingData: new Map(),
  skillsData: new Map(),
  itemData: new Map(),
  boatData: new Map(),
  requirements,
  paused: false,
  autoTrain: false,
  autoFish: false,

  rebirthCount: 0,
  ascensionCount: 0,

  currentlyFishing: null,
  currentSkill: null,
  legendPoints: 0,
});

export const update = (
  paused: boolean,
  autoTrain: boolean,
  autoFish: boolean,
  deltaSeconds: number
) => {
  if (paused) {
    return;
  }
  increaseDay(deltaSeconds);
  updateCurrentFish(deltaSeconds);
  updateCurrentSkill(deltaSeconds);
  updateItemExpenses(deltaSeconds);
  if (autoTrain) {
    autoSetCurrentSkill();
  }
  if (autoFish) {
    autoSetCurrentlyFishing();
  }
};
export const getGameData = (): GameDataType => gameState;

export const setGameData = (savedGameData: GameDataType) => {
  // Point current*/fishingData+skillsData at the *same* instance rather than
  // a separately-constructed copy: previously these were distinct objects
  // that both accrued xp independently every tick, silently doubling
  // progress and letting the two copies drift apart after a reload.
  let skillName: string = (savedGameData.currentSkill as any)?.name;
  let fishName: string = (savedGameData.currentlyFishing as any)?.name;
  Object.assign(gameState, savedGameData);
  gameState.currentSkill = gameState.skillsData.get(skillName)!;
  gameState.currentlyFishing = gameState.fishingData.get(fishName)!;
};

export const increaseDay = (deltaSeconds: number) => {
  gameState.day += applySpeed(1, deltaSeconds);
};
export const togglePause = () => {
  gameState.paused = !gameState.paused;
};
export const setCurrentlyFishing = (fishingKey: string) => {
  gameState.currentlyFishing = gameState.fishingData.get(fishingKey)!;
};
export const updateCurrentFish = (deltaSeconds: number) => {
  let fish = gameState.currentlyFishing || gameState.fishingData.get("Sun Fish")!;
  // Always resolve to the single canonical instance stored in fishingData
  // (currentlyFishing can otherwise end up as a distinct object after a
  // reload), and increase its xp exactly once.
  fish = gameState.fishingData.get(fish.name)!;
  fish.increaseXp(deltaSeconds);

  gameState.currentlyFishing = fish;
  gameState.coins += applySpeed(fish.income, deltaSeconds);
};

export const setCurrentSkill = (skillKey: string) => {
  let currentSkill = gameState.skillsData.get(skillKey)!;
  if (gameState.autoTrain) {
    currentSkill = lowestLevelSkill(gameState);
  }
  gameState.currentSkill = currentSkill;
};
export const autoSetCurrentSkill = () => {
  gameState.currentSkill = lowestLevelSkill(gameState);
};
export const autoSetCurrentlyFishing = () => {
  gameState.currentlyFishing = highestTierFish(gameState);
};

export const updateCurrentSkill = (deltaSeconds: number) => {
  let skill = gameState.currentSkill || gameState.skillsData.get("Strength")!;
  // Same canonical-instance fix as updateCurrentFish above.
  skill = gameState.skillsData.get(skill.name)!;
  skill.increaseXp(deltaSeconds);
  gameState.currentSkill = skill;
};

export const subtractCoins = (amount: number) => {
  gameState.coins -= amount;
};

export const updateItemExpenses = (deltaSeconds: number) => {
  if (gameState.coins <= 0) {
    gameState.itemData.forEach((item) => item.deselect());
    gameState.coins = 0;
    return;
  }
  gameState.coins -= applySpeed(getTotalExpenses(gameState), deltaSeconds);
};

const applyBaseReset = () => {
  gameState.fishingData.forEach((fish) => {
    if (fish.level > fish.maxLevel) {
      fish.maxLevel = fish.level;
    }
    fish.level = 0;
    fish.xp = 0;
  });
  gameState.skillsData.forEach((skill) => {
    if (skill.level > skill.maxLevel) {
      skill.maxLevel = skill.level;
    }
    skill.level = 0;
    skill.xp = 0;
  });
  gameState.boatData.forEach((boat) => {
    boat.baseData.bought = false;
  });
  gameState.itemData.forEach((item) => {
    item.level = 0;
    item.deselect();
  });
  // Re-lock everything: since levels/coins/boats reset above, anything still
  // genuinely gated (level/coin/boat requirements) needs re-earning again.
  // Requirements gated on legendPoints re-derive as completed immediately
  // (legendPoints itself is never reset), so the legend skill line stays
  // unlocked across rebirths/ascensions as intended.
  gameState.requirements.forEach((reqArr) => {
    reqArr.forEach((req) => {
      req.completed = false;
    });
  });
  gameState.coins = 0;
  // 0, not 365*14: calculatedAge() already displays 14 + years-elapsed, so a
  // fresh game (day: 0 in the initial gameState below) already shows "Age
  // 14". Setting day to 365*14 here double-counted that offset and reset to
  // "Age 28" instead.
  gameState.day = 0;
  gameState.currentlyFishing = gameState.fishingData.get("Sun Fish")!;
  gameState.currentSkill = gameState.skillsData.get("Strength")!;
};

// legendPoints gained per ascension, before it's added: Tidal Focus and Deep
// Meditation are the two "legend" skills that boost this (mirrors Progress
// Knight's Evil control x Blood meditation formula for evil gain).
export const getLegendPointGain = (): number => {
  let tidalFocus = gameState.skillsData.get("Tidal Focus")!;
  let deepMeditation = gameState.skillsData.get("Deep Meditation")!;
  return tidalFocus.effect * deepMeditation.effect;
};

// Tier 1 (small): resets progress but keeps maxLevel as a permanent record,
// which boosts future xpGain via Task.maxLevelMultiplier.
export const rebirth = () => {
  applyBaseReset();
  gameState.rebirthCount += 1;
};

// Tier 2 (big): also wipes maxLevel, but grants legendPoints - a currency
// that's never reset and unlocks the permanent "legend" skill line.
export const ascend = () => {
  gameState.legendPoints += getLegendPointGain();
  applyBaseReset();
  gameState.fishingData.forEach((fish) => {
    fish.maxLevel = 0;
  });
  gameState.skillsData.forEach((skill) => {
    skill.maxLevel = 0;
  });
  gameState.ascensionCount += 1;
};

export const hardReset = () => {
  window.localStorage.clear();
  window.location.reload();
};

// calculatedAge() displays 14 + years-elapsed, so 365*56 here is displayed
// "Age 70" - the natural, unmodified end of life.
export const baseLifespan = 365 * 56;

// Mirrors Progress Knight: your actual lifespan is the base lifespan
// multiplied by the Immortality/Super Immortality skills' effects, so
// investing in them (across ordinary Rebirths) is the only way to survive
// past the natural Age 70 wall and eventually reach Ascension.
export const getLifespan = (): number => {
  let immortality = gameState.skillsData.get("Immortality")!;
  let superImmortality = gameState.skillsData.get("Super Immortality")!;
  return baseLifespan * immortality.effect * superImmortality.effect;
};

export const baseGameSpeed = 10;

export const fishBaseData: Map<string, FishBaseData> = new Map(
  // Lake
  // 1. Sun Fish
  // 2. Perch
  // 3. Bass
  // 4. Trout
  // 4. Waleye
  // 5. Northern Pike
  // 6. Lake Sturgeon
  [
    [
      "Sun Fish",
      {
        name: "Sun Fish",
        maxXp: 50,
        income: 5,
        effect: 0.01,
        description: "Fishing Pay",
        category: "lake",
      },
    ],
    [
      "Perch",
      {
        name: "Perch",
        maxXp: 100,
        income: 9,
        effect: 0.01,
        description: "Jigging Xp",
        category: "lake",
      },
    ],
    [
      "Bass",
      {
        name: "Bass",
        maxXp: 200,
        income: 15,
        effect: 0.01,
        description: "Casting Xp",
        category: "lake",
      },
    ],
    [
      "Trout",
      {
        name: "Trout",
        maxXp: 400,
        income: 40,
        effect: 0.01,
        description: "Concentration Xp",
        category: "lake",
      },
    ],
    [
      "Waleye",
      {
        name: "Waleye",
        maxXp: 800,
        income: 80,
        effect: 0.01,
        description: "Hooking Xp",
        category: "lake",
      },
    ],
    [
      "Northern Pike",
      {
        name: "Northern Pike",
        maxXp: 1600,
        income: 150,
        effect: 0.01,
        description: "Trolling Xp",
        category: "lake",
      },
    ],
    [
      "Lake Sturgeon",
      {
        name: "Lake Sturgeon",
        maxXp: 3200,
        income: 300,
        effect: 0.01,
        description: "Fishing Pay",
        category: "lake",
      },
    ],
    // River
    // 1. Pirana
    // 2. Salmon
    // 2. Silver Drum
    // 3. Armoured Catfish
    // 4. Electric Eel
    // 5. Pacu
    // 6. Payara
    [
      "Pirana",
      {
        name: "Pirana",
        maxXp: 100,
        income: 5,
        effect: 0.01,
        description: "Ambition Xp",
        category: "river",
      },
    ],
    [
      "Salmon",
      {
        name: "Salmon",
        maxXp: 1000,
        income: 50,
        effect: 0.01,
        description: "Patience Xp",
        category: "river",
      },
    ],
    [
      "Silver Drum",
      {
        name: "Silver Drum",
        maxXp: 10000,
        income: 120,
        effect: 0.01,
        description: "Intelligence Xp",
        category: "river",
      },
    ],
    [
      "Armoured Catfish",
      {
        name: "Armoured Catfish",
        maxXp: 100000,
        income: 300,
        effect: 0.01,
        description: "Reeling Xp",
        category: "river",
      },
    ],
    [
      "Electric Eel",
      {
        name: "Electric Eel",
        maxXp: 1000000,
        income: 1000,
        effect: 0.01,
        description: "River Xp",
        category: "river",
      },
    ],
    [
      "Pacu",
      {
        name: "Pacu",
        maxXp: 7500000,
        income: 300,
        effect: 0.01,
        description: "Concentration Xp",
        category: "river",
      },
    ],
    [
      "Payara",
      {
        name: "Payara",
        maxXp: 4 * Math.pow(10, 7),
        income: 15000,
        effect: 0.01,
        description: "River Pay",
        category: "river",
      },
    ],
    // Ocean
    // 1. Cod
    // 2. Mackerel
    // 2. Angle Fish
    // 4. Grouper
    // Stingray
    // 6. Barracuda
    // 3. Bluefin tuna
    // 5. Blue Marlin
    // Swordfish
    // Shark
    // Whale
    [
      "Cod",
      {
        name: "Cod",
        maxXp: 100000,
        income: 100,
        effect: 0.01,
        description: "Hooking Xp",
        category: "ocean",
      },
    ],
    [
      "Mackerel",
      {
        name: "Mackerel",
        maxXp: Math.pow(10, 6),
        income: 1000,
        effect: 0.01,
        description: "Sailing Xp",
        category: "ocean",
      },
    ],
    [
      "Angle Fish",
      {
        name: "Angle Fish",
        maxXp: Math.pow(10, 7),
        income: 7500,
        effect: 0.01,
        description: "Payara Pay",
        category: "ocean",
      },
    ],
    [
      "Grouper",
      {
        name: "Grouper",
        maxXp: Math.pow(10, 8),
        income: 50000,
        effect: 0.01,
        description: "Strength Xp",
        category: "ocean",
      },
    ],
    [
      "Stingray",
      {
        name: "Stingray",
        maxXp: Math.pow(10, 9),
        income: 100000,
        effect: 0.01,
        description: "Reeling Xp",
        category: "ocean",
      },
    ],
    [
      "Barracuda",
      {
        name: "Barracuda",
        maxXp: Math.pow(10, 10),
        income: 200000,
        effect: 0.01,
        description: "Trolling Xp",
        category: "ocean",
      },
    ],
    [
      "Bluefin Tuna",
      {
        name: "Bluefin Tuna",
        maxXp: Math.pow(10, 11),
        income: 400000,
        effect: 0.01,
        description: "Patience Xp",
        category: "ocean",
      },
    ],
    [
      "Blue Marlin",
      {
        name: "Blue Marlin",
        maxXp: Math.pow(10, 12),
        income: 800000,
        effect: 0.01,
        description: "Communication Xp",
        category: "ocean",
      },
    ],
    [
      "Swordfish",
      {
        name: "Swordfish",
        maxXp: Math.pow(10, 13),
        income: 1600000,
        effect: 0.01,
        description: "Navigation Xp",
        category: "ocean",
      },
    ],
    [
      "Shark",
      {
        name: "Shark",
        maxXp: Math.pow(10, 13),
        income: 2400000,
        effect: 0.01,
        description: "All Xp",
        category: "ocean",
      },
    ],
    [
      "Whale",
      {
        name: "Whale",
        maxXp: Math.pow(10, 13),
        income: 3200000,
        effect: 0.01,
        description: "All Xp",
        category: "ocean",
      },
    ],
  ]
);

export const skillBaseData: Map<string, SkillBaseData> = new Map([
  // FUNDAMENTALS //
  // Strength
  // Concentration
  // Intelligence
  // Patience
  // Ambition
  // Communication
  [
    "Strength",
    {
      name: "Strength",
      maxXp: 100,
      effect: 0.01,
      description: "Fishing Xp",
      category: "fundamentals",
    },
  ],
  [
    "Concentration",
    {
      name: "Concentration",
      maxXp: 100,
      effect: 0.01,
      description: "Skill Xp",
      category: "fundamentals",
    },
  ],
  [
    "Intelligence",
    {
      name: "Intelligence",
      maxXp: 100,
      effect: 0.01,
      description: "River Xp",
      category: "fundamentals",
    },
  ],
  [
    "Patience",
    {
      name: "Patience",
      maxXp: 100,
      effect: 0.01,
      description: "Lake Pay",
      category: "fundamentals",
    },
  ],
  [
    "Ambition",
    {
      name: "Ambition",
      maxXp: 100,
      effect: 0.01,
      description: "River Pay",
      category: "fundamentals",
    },
  ],
  [
    "Communication",
    {
      name: "Communication",
      maxXp: 100,
      effect: 0.01,
      description: "Ocean Pay",
      category: "fundamentals",
    },
  ],
  // FISHING SKILLS
  // Casting
  // Jigging
  // Trolling
  // Reeling
  // Hooking
  // Netting
  // Whaling
  [
    "Casting",
    {
      name: "Casting",
      maxXp: 100,
      effect: 0.01,
      description: "Lake Xp",
      category: "fishing",
    },
  ],
  [
    "Jigging",
    {
      name: "Jigging",
      maxXp: 100,
      effect: 0.01,
      description: "Lake Pay",
      category: "fishing",
    },
  ],
  [
    "Trolling",
    {
      name: "Trolling",
      maxXp: 100,
      effect: 0.01,
      description: "Northern Pay",
      category: "fishing",
    },
  ],
  [
    "Reeling",
    {
      name: "Reeling",
      maxXp: 100,
      effect: 0.01,
      description: "Northern Pay",
      category: "fishing",
    },
  ],
  [
    "Hooking",
    {
      name: "Hooking",
      maxXp: 100,
      effect: 0.01,
      description: "River Pay",
      category: "fishing",
    },
  ],
  [
    "Netting",
    {
      name: "Netting",
      maxXp: 100,
      effect: 0.01,
      description: "Ocean Pay",
      category: "fishing",
    },
  ],
  [
    "Whaling",
    {
      name: "Whaling",
      maxXp: 100,
      effect: 0.01,
      description: "Whale Pay",
      category: "fishing",
    },
  ],
  // Boating Skills
  // Docking
  // Turning
  // Anchoring
  // Sailing
  // Navigation
  // Stability
  [
    "Docking",
    {
      name: "Docking",
      maxXp: 100,
      effect: 0.01,
      description: "Skill Xp",
      category: "boating",
    },
  ],
  [
    "Turning",
    {
      name: "Turning",
      maxXp: 100,
      effect: 0.01,
      description: "River Xp",
      category: "boating",
    },
  ],
  [
    "Anchoring",
    {
      name: "Anchoring",
      maxXp: 100,
      effect: 0.01,
      description: "Lake Xp",
      category: "boating",
    },
  ],
  [
    "Sailing",
    {
      name: "Sailing",
      maxXp: 100,
      effect: 0.01,
      description: "Ocean Xp",
      category: "boating",
    },
  ],
  [
    "Navigation",
    {
      name: "Navigation",
      maxXp: 100,
      effect: 0.01,
      description: "Whale Pay",
      category: "boating",
    },
  ],
  [
    "Stability",
    {
      name: "Stability",
      maxXp: 100,
      effect: 0.01,
      description: "Fishing Pay",
      category: "boating",
    },
  ],
  // IMMORTALITY SKILLS //
  // Reachable through ordinary progression (unlike the legend line below) -
  // these are the only way to extend your lifespan past the natural Age 70
  // wall, mirroring Progress Knight's Immortality/Super immortality skills.
  [
    "Immortality",
    {
      name: "Immortality",
      maxXp: 100,
      effect: 0.01,
      description: "Longer Lifespan",
      category: "immortality",
    },
  ],
  [
    "Super Immortality",
    {
      name: "Super Immortality",
      maxXp: 100,
      effect: 0.01,
      description: "Longer Lifespan",
      category: "immortality",
    },
  ],
  // LEGEND SKILLS //
  // Unlocked by ascending at least once (legendPoints > 0). Mirrors
  // Progress Knight's "Dark magic" skill line, reskinned for fishing.
  // Sea Legend
  // Tidal Focus
  // Old Haggler
  // Weathered Instinct
  // Deep Meditation
  // Sunken Fortune
  [
    "Sea Legend",
    {
      name: "Sea Legend",
      maxXp: 100,
      effect: 0.01,
      description: "All Xp",
      category: "legend",
    },
  ],
  [
    "Tidal Focus",
    {
      name: "Tidal Focus",
      maxXp: 100,
      effect: 0.01,
      description: "Legend Point Gain",
      category: "legend",
    },
  ],
  [
    "Old Haggler",
    {
      name: "Old Haggler",
      maxXp: 100,
      effect: -0.01,
      description: "Expenses",
      category: "legend",
    },
  ],
  [
    "Weathered Instinct",
    {
      name: "Weathered Instinct",
      maxXp: 100,
      effect: 0.01,
      description: "All Xp",
      category: "legend",
    },
  ],
  [
    "Deep Meditation",
    {
      name: "Deep Meditation",
      maxXp: 100,
      effect: 0.01,
      description: "Legend Point Gain",
      category: "legend",
    },
  ],
  [
    "Sunken Fortune",
    {
      name: "Sunken Fortune",
      maxXp: 100,
      effect: 0.002,
      description: "Fishing Pay",
      category: "legend",
    },
  ],
]);

// Boat prices doubled (2x) from their original values to make boats a
// bigger investment relative to items/income, per balance feedback.
export const boatBaseData: Map<string, BoatBaseData> = new Map([
  [
    "Row Boat",
    {
      name: "Row Boat",
      price: 600,
      bought: false,
    },
  ],
  [
    "Silver Bullet",
    {
      name: "Silver Bullet",
      price: 3000,
      bought: false,
    },
  ],
  [
    "Bass Boat",
    {
      name: "Bass Boat",
      price: 60000,
      bought: false,
    },
  ],
  [
    "Canoe",
    {
      name: "Canoe",
      price: 200000,
      bought: false,
    },
  ],
  [
    "River Skiff",
    {
      name: "River Skiff",
      price: 600000,
      bought: false,
    },
  ],
  [
    "Airboat",
    {
      name: "Airboat",
      price: 1800000,
      bought: false,
    },
  ],
  [
    "Sail Boat",
    {
      name: "Sail Boat",
      price: 5400000,
      bought: false,
    },
  ],
  [
    "Yacht",
    {
      name: "Yacht",
      price: 16200000,
      bought: false,
    },
  ],
  [
    "Whaling Ship",
    {
      name: "Whaling Ship",
      price: 60000000,
      bought: false,
    },
  ],
]);

// Item running expense and upgrade price both halved (0.5x) from their
// original values per balance feedback.
export const itemBaseData: Map<string, ItemBaseData> = new Map([
  // ITEMS //
  // Rod
  // Book
  // Net
  // Hook
  // Bait
  // Ham Sandwich
  // Pliers
  // Fish Finder
  // House
  [
    "Rod",
    {
      name: "Rod",
      expense: 5,
      effect: 1.5,
      description: "Strength Xp",
      selected: false,
      upgradePrice: 100,
    },
  ],
  [
    "Book",
    {
      name: "Book",
      expense: 25,
      effect: 1.5,
      description: "Skill Xp",
      selected: false,
      upgradePrice: 500,
    },
  ],
  [
    "Net",
    {
      name: "Net",
      expense: 100,
      effect: 2,
      description: "Fishing Xp",
      selected: false,
      upgradePrice: 1500,
    },
  ],
  [
    "Hook",
    {
      name: "Hook",
      expense: 500,
      effect: 2,
      description: "River Xp",
      selected: false,
      upgradePrice: 2500,
    },
  ],
  [
    "Bait",
    {
      name: "Bait",
      expense: 3750,
      effect: 1.5,
      description: "All Xp",
      selected: false,
      upgradePrice: 4000,
    },
  ],
  [
    "Ham Sandwich",
    {
      name: "Ham Sandwich",
      expense: 25000,
      effect: 3,
      description: "Boating Xp",
      selected: false,
      upgradePrice: 5000,
    },
  ],
  [
    "Pliers",
    {
      name: "Pliers",
      expense: 500000,
      effect: 2,
      description: "Skill Xp",
      selected: false,
      upgradePrice: 7500,
    },
  ],
  [
    "Fish Finder",
    {
      name: "Fish Finder",
      expense: Math.pow(10, 7) / 2,
      effect: 1.5,
      description: "Skill Xp",
      selected: false,
      upgradePrice: 10000,
    },
  ],
  [
    "House",
    {
      name: "House",
      expense: Math.pow(10, 8) / 2,
      effect: 3,
      description: "All Xp",
      selected: false,
      upgradePrice: 100000,
    },
  ],
]);

export const fishCategories: { [category: string]: string[] } = {};
fishBaseData.forEach((base) => {
  (fishCategories[base.category] ??= []).push(base.name);
});

export const skillCategories: { [category: string]: string[] } = {};
skillBaseData.forEach((base) => {
  (skillCategories[base.category] ??= []).push(base.name);
});

export const itemCategories = {};

export const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];
