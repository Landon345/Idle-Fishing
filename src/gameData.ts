import {
  FishingRequirement,
  SkillRequirement,
  EvilRequirement,
  CoinRequirement,
  AgeRequirement,
  Fishing,
  Requirement,
  Skill,
  Task,
  Item,
  BoatRequirement,
} from "./classes";

import {
  applySpeed,
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
  SkillBaseData,
} from "src/Entities";

import { writable, Writable } from "svelte/store";
import { trusted } from "svelte/internal";
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
]);

export let GameData: Writable<GameDataType> = writable({
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

  rebirthOneCount: 0,
  rebirthTwoCount: 0,

  currentlyFishing: null,
  currentSkill: null,
  evil: 0,
});

export const update = (
  paused: boolean,
  autoTrain: boolean,
  autoFish: boolean
) => {
  if (paused) {
    return;
  }
  increaseDay();
  updateCurrentFish();
  updateCurrentSkill();
  updateItemExpenses();
  if (autoTrain) {
    autoSetCurrentSkill();
  }
  if (autoFish) {
    autoSetCurrentlyFishing();
  }
};
export const getGameData = (): GameDataType => {
  let data_value;
  GameData.subscribe((data) => {
    data_value = data;
  });
  return data_value;
};
export const setGameData = (savedGameData) => {
  let skill = savedGameData.currentSkill;
  if (!skill) {
    skill = savedGameData.skillsData.get("Strength");
  }
  let fish = savedGameData.currentlyFishing;
  if (!fish) {
    fish = savedGameData.fishingData.get("Sun Fish");
  }
  GameData.set({
    ...savedGameData,
    currentSkill: new Skill(
      skill.baseData,
      skill.level,
      skill.maxLevel,
      skill.xp,
      skill.xpMultipliers
    ),
    currentlyFishing: new Fishing(
      fish.baseData,
      fish.level,
      fish.maxLevel,
      fish.xp,
      fish.xpMultipliers
    ),
  });
};

export const increaseDay = () => {
  GameData.update((data: GameDataType) => {
    return { ...data, day: data.day + applySpeed(1) };
  });
};
export const togglePause = () => {
  GameData.update((data: GameDataType) => {
    return { ...data, paused: !data.paused };
  });
};
export const setCurrentlyFishing = (fishingKey: string) => {
  GameData.update((data) => {
    return { ...data, currentlyFishing: data.fishingData.get(fishingKey) };
  });
};
export const updateCurrentFish = () => {
  GameData.update((data) => {
    let fish = data.currentlyFishing || data.fishingData.get("Sun Fish");
    data.fishingData.get(fish.name).increaseXp();
    fish.increaseXp();

    return {
      ...data,
      fishingData: data.fishingData,
      currentlyFishing: fish,
      coins: (data.coins += applySpeed(fish.income)),
    };
  });
};

export const setCurrentSkill = (skillKey: string) => {
  GameData.update((data) => {
    let currentSkill = data.skillsData.get(skillKey);
    if (data.autoTrain) {
      currentSkill = lowestLevelSkill(data);
    }
    return { ...data, currentSkill };
  });
};
export const autoSetCurrentSkill = () => {
  GameData.update((data) => {
    let currentSkill = lowestLevelSkill(data);
    return { ...data, currentSkill };
  });
};
export const autoSetCurrentlyFishing = () => {
  GameData.update((data) => {
    let currentlyFishing = highestTierFish(data);
    return { ...data, currentlyFishing };
  });
};

export const updateCurrentSkill = () => {
  GameData.update((data) => {
    let skill = data.currentSkill || data.skillsData.get("Strength");
    data.skillsData.get(skill.name).increaseXp();
    skill.increaseXp();

    return {
      ...data,
      skillsData: data.skillsData,
    };
  });
};

export const subtractCoins = (amount: number) => {
  GameData.update((data) => {
    return { ...data, coins: (data.coins -= amount) };
  });
};

export const updateItemExpenses = () => {
  GameData.update((data) => {
    if (data.coins <= 0) {
      data.itemData.forEach((item) => item.deselect());
      return { ...data, coins: 0, itemData: data.itemData };
    }
    return {
      ...data,
      coins: (data.coins -= applySpeed(getTotalExpenses(data))),
    };
  });
};

export const rebirthReset = () => {
  GameData.update((data) => {
    data.fishingData.forEach((fish) => {
      if (fish.level > fish.maxLevel) {
        fish.maxLevel = fish.level;
      }
      fish.level = 0;
      fish.xp = 0;
    });
    data.skillsData.forEach((skill) => {
      if (skill.level > skill.maxLevel) {
        skill.maxLevel = skill.level;
      }
      skill.level = 0;
      skill.xp = 0;
    });
    data.boatData.forEach((boat) => {
      boat.baseData.bought = false;
    });
    data.itemData.forEach((item) => {
      item.level = 0;
      item.deselect();
    });
    return {
      ...data,
      coins: 0,
      day: 365 * 14,
      currentlyFishing: data.fishingData.get("Black Drum"),
      currentSkill: data.skillsData.get("Strength"),
    };
  });
};

export const hardReset = () => {
  window.localStorage.clear();
  window.location.reload();
};

export const toggleTrain = () => {
  GameData.update((data: GameDataType) => {
    return { ...data, autoTrain: !data.autoTrain };
  });
};
export const toggleFish = () => {
  GameData.update((data: GameDataType) => {
    return { ...data, autoFish: !data.autoFish };
  });
};

export let tempData = {
  requirements: {},
};

export let skillWithLowestMaxXp = null;

export const updateSpeed = 20;

export const baseLifespan = 365 * 70;

export const baseGameSpeed = 4;

export const permanentUnlocks = [];

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
]);

export const boatBaseData: Map<string, BoatBaseData> = new Map([
  [
    "Row Boat",
    {
      name: "Row Boat",
      price: 300,
      bought: false,
    },
  ],
  [
    "Silver Bullet",
    {
      name: "Silver Bullet",
      price: 1500,
      bought: false,
    },
  ],
  [
    "Bass Boat",
    {
      name: "Bass Boat",
      price: 30000,
      bought: false,
    },
  ],
  [
    "Canoe",
    {
      name: "Canoe",
      price: 100000,
      bought: false,
    },
  ],
  [
    "River Skiff",
    {
      name: "River Skiff",
      price: 300000,
      bought: false,
    },
  ],
  [
    "Airboat",
    {
      name: "Airboat",
      price: 900000,
      bought: false,
    },
  ],
  [
    "Sail Boat",
    {
      name: "Sail Boat",
      price: 2700000,
      bought: false,
    },
  ],
  [
    "Yacht",
    {
      name: "Yacht",
      price: 8100000,
      bought: false,
    },
  ],
  [
    "Whaling Ship",
    {
      name: "Whaling Ship",
      price: 30000000,
      bought: false,
    },
  ],
  // BOATS //
  // Row Boat
  // Silver Bullet
  // Bass Boat
  // Canoe
  // River Skiff
  // Airboat
  // Sail Boat
  // Yacht
  // Whaling Ship
]);

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
      expense: 10,
      effect: 1.5,
      description: "Strength Xp",
      selected: false,
      upgradePrice: 200,
    },
  ],
  [
    "Book",
    {
      name: "Book",
      expense: 50,
      effect: 1.5,
      description: "Skill Xp",
      selected: false,
      upgradePrice: 1000,
    },
  ],
  [
    "Net",
    {
      name: "Net",
      expense: 200,
      effect: 2,
      description: "Fishing Xp",
      selected: false,
      upgradePrice: 3000,
    },
  ],
  [
    "Hook",
    {
      name: "Hook",
      expense: 1000,
      effect: 2,
      description: "River Xp",
      selected: false,
      upgradePrice: 5000,
    },
  ],
  [
    "Bait",
    {
      name: "Bait",
      expense: 7500,
      effect: 1.5,
      description: "All Xp",
      selected: false,
      upgradePrice: 8000,
    },
  ],
  [
    "Ham Sandwich",
    {
      name: "Ham Sandwich",
      expense: 50000,
      effect: 3,
      description: "Boating Xp",
      selected: false,
      upgradePrice: 10000,
    },
  ],
  [
    "Pliers",
    {
      name: "Pliers",
      expense: 1000000,
      effect: 2,
      description: "Skill Xp",
      selected: false,
      upgradePrice: 15000,
    },
  ],
  [
    "Fish Finder",
    {
      name: "Fish Finder",
      expense: Math.pow(10, 7),
      effect: 1.5,
      description: "Skill Xp",
      selected: false,
      upgradePrice: 20000,
    },
  ],
  [
    "House",
    {
      name: "House",
      expense: Math.pow(10, 8),
      effect: 3,
      description: "All Xp",
      selected: false,
      upgradePrice: 200000,
    },
  ],
]);

export const fishCategories = {
  lake: ["Sun Fish", "Perch"],
  river: ["Trout", "P"],
  ocean: ["Cod", "Mackerel"],
};

export const skillCategories = {
  fundamentals: ["Strength", "Concentration"],
  fishing: [],
  boating: [],
};

export const itemCategories = {};

export const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

export const jobTabButton = document.getElementById("jobTabButton");
