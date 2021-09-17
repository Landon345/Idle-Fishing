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

import { applySpeed, getTotalExpenses } from "src/functions";

import type {
  Bases,
  BoatBaseData,
  FishBaseData,
  GameDataType,
  ItemBaseData,
  SkillBaseData,
} from "src/Entities";

import { writable, Writable } from "svelte/store";
export const requirements = new Map<string, Requirement[]>([
  ["Sun Fish", []],
  ["Perch", [new FishingRequirement([{ name: "Sun Fish", requirement: 10 }])]],
  [
    "Bass",
    [
      new FishingRequirement([{ name: "Perch", requirement: 10 }]),
      new BoatRequirement([{ name: "Bass Boat", requirement: true }]),
    ],
  ],
  ["Trout", [new FishingRequirement([{ name: "Bass", requirement: 10 }])]],
  ["Waleye", [new FishingRequirement([{ name: "Trout", requirement: 10 }])]],
  [
    "Northern Pike",
    [new FishingRequirement([{ name: "Waleye", requirement: 10 }])],
  ],
  [
    "Lake Sturgeon",
    [new FishingRequirement([{ name: "Northern Pike", requirement: 10 }])],
  ],
  // River
  // 1. Pirana
  // 2. Salmon
  // 2. Silver Drum
  // 3. Armoured Catfish
  // 4. Electric Eel
  // 5. Pacu
  // 6. Payara
  ["Pirana", [new SkillRequirement([{ name: "Strength", requirement: 30 }])]],
  ["Salmon", [new FishingRequirement([{ name: "Pirana", requirement: 10 }])]],
  [
    "Silver Drum",
    [new FishingRequirement([{ name: "Salmon", requirement: 10 }])],
  ],
  [
    "Armoured Catfish",
    [new FishingRequirement([{ name: "Silver Drum", requirement: 10 }])],
  ],
  [
    "Electric Eel",
    [new FishingRequirement([{ name: "Armoured Catfish", requirement: 10 }])],
  ],
  [
    "Pacu",
    [new FishingRequirement([{ name: "Electric Eel", requirement: 10 }])],
  ],
  ["Payara", [new FishingRequirement([{ name: "Pacu", requirement: 10 }])]],
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
        { name: "Strength", requirement: 80 },
        { name: "Concentration", requirement: 80 },
      ]),
    ],
  ],
  ["Mackerel", [new FishingRequirement([{ name: "Cod", requirement: 10 }])]],
  [
    "Angle Fish",
    [new FishingRequirement([{ name: "Mackerel", requirement: 10 }])],
  ],
  [
    "Grouper",
    [new FishingRequirement([{ name: "Angle Fish", requirement: 10 }])],
  ],
  [
    "Stingray",
    [new FishingRequirement([{ name: "Grouper", requirement: 10 }])],
  ],
  [
    "Barracuda",
    [new FishingRequirement([{ name: "Stingray", requirement: 10 }])],
  ],
  [
    "Bluefin Tuna",
    [new FishingRequirement([{ name: "Barracuda", requirement: 10 }])],
  ],
  [
    "Blue Marlin",
    [new FishingRequirement([{ name: "Bluefin Tuna", requirement: 10 }])],
  ],
  [
    "Swordfish",
    [new FishingRequirement([{ name: "Blue Marlin", requirement: 10 }])],
  ],
  ["Shark", [new FishingRequirement([{ name: "Swordfish", requirement: 10 }])]],
  ["Whale", [new FishingRequirement([{ name: "Shark", requirement: 10 }])]],
  // FUNDAMENTALS //
  // Strength
  // Concentration
  // Intelligence
  // Patience
  // Ambition
  // Communication
  ["Strength", []],
  [
    "Concentration",
    [new SkillRequirement([{ name: "Strength", requirement: 5 }])],
  ],
  [
    "Intelligence",
    [new SkillRequirement([{ name: "Concentration", requirement: 10 }])],
  ],
  [
    "Patience",
    [new SkillRequirement([{ name: "Intelligence", requirement: 10 }])],
  ],
  ["Ambition", [new SkillRequirement([{ name: "Patience", requirement: 10 }])]],
  [
    "Communication",
    [new SkillRequirement([{ name: "Ambition", requirement: 10 }])],
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
    [new SkillRequirement([{ name: "Communication", requirement: 10 }])],
  ],
  ["Jigging", [new SkillRequirement([{ name: "Casting", requirement: 10 }])]],
  ["Trolling", [new SkillRequirement([{ name: "Jigging", requirement: 10 }])]],
  ["Reeling", [new SkillRequirement([{ name: "Trolling", requirement: 10 }])]],
  ["Hooking", [new SkillRequirement([{ name: "Reeling", requirement: 10 }])]],
  ["Netting", [new SkillRequirement([{ name: "Hooking", requirement: 10 }])]],
  ["Whaling", [new SkillRequirement([{ name: "Netting", requirement: 10 }])]],
  // Boating Skills
  // Docking
  // Turning
  // Anchoring
  // Sailing
  // Navigation
  // Stability
  ["Docking", [new SkillRequirement([{ name: "Whaling", requirement: 10 }])]],
  ["Turning", [new SkillRequirement([{ name: "Docking", requirement: 10 }])]],
  ["Anchoring", [new SkillRequirement([{ name: "Turning", requirement: 10 }])]],
  ["Sailing", [new SkillRequirement([{ name: "Anchoring", requirement: 10 }])]],
  [
    "Navigation",
    [new SkillRequirement([{ name: "Sailing", requirement: 10 }])],
  ],
  [
    "Stability",
    [new SkillRequirement([{ name: "Navigation", requirement: 10 }])],
  ],
  ["Row Boat", [new CoinRequirement([{ name: "Coins", requirement: 500 }])]],
  [
    "Silver Bullet",
    [new CoinRequirement([{ name: "Coins", requirement: 10000 }])],
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

  rebirthOneCount: 0,
  rebirthTwoCount: 0,

  currentlyFishing: null,
  currentSkill: null,
  evil: 0,
});

export const update = (paused: boolean) => {
  if (paused) {
    return;
  }
  increaseDay();
  updateCurrentFish();
  updateCurrentSkill();
  updateItemExpenses();
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
  let fish = savedGameData.currentlyFishing;
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
    return { ...data, currentSkill: data.skillsData.get(skillKey) };
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
      currentSkill: skill,
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
        maxXp: 100,
        income: 20,
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
        income: 50,
        effect: 0.01,
        description: "Jigging Xp",
        category: "lake",
      },
    ],
    [
      "Bass",
      {
        name: "Bass",
        maxXp: 100,
        income: 200,
        effect: 0.01,
        description: "Casting Xp",
        category: "lake",
      },
    ],
    [
      "Trout",
      {
        name: "Trout",
        maxXp: 100,
        income: 500,
        effect: 0.01,
        description: "Concentration Xp",
        category: "lake",
      },
    ],
    [
      "Waleye",
      {
        name: "Waleye",
        maxXp: 100,
        income: 1000,
        effect: 0.01,
        description: "Hooking Xp",
        category: "lake",
      },
    ],
    [
      "Northern Pike",
      {
        name: "Northern Pike",
        maxXp: 100,
        income: 1500,
        effect: 0.01,
        description: "Trolling Xp",
        category: "lake",
      },
    ],
    [
      "Lake Sturgeon",
      {
        name: "Lake Sturgeon",
        maxXp: 100,
        income: 2000,
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
        income: 30,
        effect: 0.01,
        description: "Ambition Xp",
        category: "river",
      },
    ],
    [
      "Salmon",
      {
        name: "Salmon",
        maxXp: 100,
        income: 60,
        effect: 0.01,
        description: "Patience Xp",
        category: "river",
      },
    ],
    [
      "Silver Drum",
      {
        name: "Silver Drum",
        maxXp: 100,
        income: 150,
        effect: 0.01,
        description: "Intelligence Xp",
        category: "river",
      },
    ],
    [
      "Armoured Catfish",
      {
        name: "Armoured Catfish",
        maxXp: 100,
        income: 400,
        effect: 0.01,
        description: "Reeling Xp",
        category: "river",
      },
    ],
    [
      "Electric Eel",
      {
        name: "Electric Eel",
        maxXp: 100,
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
        maxXp: 100,
        income: 2500,
        effect: 0.01,
        description: "Concentration Xp",
        category: "river",
      },
    ],
    [
      "Payara",
      {
        name: "Payara",
        maxXp: 100,
        income: 10000,
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
        maxXp: 100,
        income: 50,
        effect: 0.01,
        description: "Hooking Xp",
        category: "ocean",
      },
    ],
    [
      "Mackerel",
      {
        name: "Mackerel",
        maxXp: 100,
        income: 200,
        effect: 0.01,
        description: "Sailing Xp",
        category: "ocean",
      },
    ],
    [
      "Angle Fish",
      {
        name: "Angle Fish",
        maxXp: 100,
        income: 600,
        effect: 0.01,
        description: "Payara Pay",
        category: "ocean",
      },
    ],
    [
      "Grouper",
      {
        name: "Grouper",
        maxXp: 100,
        income: 1600,
        effect: 0.01,
        description: "Strength Xp",
        category: "ocean",
      },
    ],
    [
      "Stingray",
      {
        name: "Stingray",
        maxXp: 100,
        income: 3500,
        effect: 0.01,
        description: "Reeling Xp",
        category: "ocean",
      },
    ],
    [
      "Barracuda",
      {
        name: "Barracuda",
        maxXp: 100,
        income: 7500,
        effect: 0.01,
        description: "Trolling Xp",
        category: "ocean",
      },
    ],
    [
      "Bluefin Tuna",
      {
        name: "Bluefin Tuna",
        maxXp: 100,
        income: 7500,
        effect: 0.01,
        description: "Patience Xp",
        category: "ocean",
      },
    ],
    [
      "Blue Marlin",
      {
        name: "Blue Marlin",
        maxXp: 100,
        income: 17000,
        effect: 0.01,
        description: "Communication Xp",
        category: "ocean",
      },
    ],
    [
      "Swordfish",
      {
        name: "Swordfish",
        maxXp: 100,
        income: 38000,
        effect: 0.01,
        description: "Navigation Xp",
        category: "ocean",
      },
    ],
    [
      "Shark",
      {
        name: "Shark",
        maxXp: 100,
        income: 100000,
        effect: 0.01,
        description: "All Xp",
        category: "ocean",
      },
    ],
    [
      "Whale",
      {
        name: "Whale",
        maxXp: 100,
        income: 500000,
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
      expense: 15,
      effect: 1.5,
      description: "Fishing Pay",
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
      effect: 1.5,
      description: "Fishing Xp",
      selected: false,
      upgradePrice: 3000,
    },
  ],
  [
    "Hook",
    {
      name: "Hook",
      expense: 500,
      effect: 1.5,
      description: "Fishing Xp",
      selected: false,
      upgradePrice: 5000,
    },
  ],
  [
    "Bait",
    {
      name: "Bait",
      expense: 1000,
      effect: 1.5,
      description: "Jigging Xp",
      selected: false,
      upgradePrice: 8000,
    },
  ],
  [
    "Ham Sandwich",
    {
      name: "Ham Sandwich",
      expense: 5000,
      effect: 1.5,
      description: "All Xp",
      selected: false,
      upgradePrice: 10000,
    },
  ],
  [
    "Pliers",
    {
      name: "Pliers",
      expense: 30000,
      effect: 1.5,
      description: "Fishing Skill Xp",
      selected: false,
      upgradePrice: 15000,
    },
  ],
  [
    "Fish Finder",
    {
      name: "Fish Finder",
      expense: 100000,
      effect: 1.5,
      description: "Lake Pay",
      selected: false,
      upgradePrice: 20000,
    },
  ],
  [
    "House",
    {
      name: "House",
      expense: 400000,
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
