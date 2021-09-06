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
  [
    "Blue Marlin",
    [
      new FishingRequirement([{ name: "Black Drum", requirement: 5 }]),
      new SkillRequirement([{ name: "Strength", requirement: 5 }]),
    ],
  ],
  [
    "Concentration",
    [new SkillRequirement([{ name: "Strength", requirement: 10 }])],
  ],
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
  currentProperty: null,
  currentMisc: null,
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
  GameData.set(savedGameData);
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
    let fish = data.currentlyFishing || data.fishingData.get("Black Drum");
    data.fishingData.get(fish.name).increaseXp();

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

export let tempData = {
  requirements: {},
};

export let skillWithLowestMaxXp = null;

export const updateSpeed = 60;

export const baseLifespan = 365 * 70;

export const baseGameSpeed = 4;

export const permanentUnlocks = [];

export const fishBaseData: Map<string, FishBaseData> = new Map([
  [
    "Black Drum",
    {
      name: "Black Drum",
      maxXp: 50,
      income: 5,
      effect: 0.01,
      description: "Fishing Pay",
      category: "ocean",
    },
  ],
  [
    "Blue Marlin",
    {
      name: "Blue Marlin",
      maxXp: 100,
      income: 9,
      effect: 0.01,
      description: "Fishing Pay",
      category: "ocean",
    },
  ],
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
    "Waleye",
    {
      name: "Waleye",
      maxXp: 100,
      income: 9,
      effect: 0.01,
      description: "Fishing Pay",
      category: "lake",
    },
  ],
]);

export const skillBaseData: Map<string, SkillBaseData> = new Map([
  [
    "Strength",
    {
      name: "Strength",
      maxXp: 100,
      effect: 0.01,
      description: "Ocean Xp",
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
]);

export const itemBaseData: Map<string, ItemBaseData> = new Map([
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
    "House",
    {
      name: "House",
      expense: 300,
      effect: 2,
      description: "All Xp",
      selected: false,
      upgradePrice: 20000,
    },
  ],
]);

export const fishCategories = {
  ocean: ["Black Drum", "Blue Marlin"],
  lake: ["Sun Fish", "Waleye"],
};

export const skillCategories = {
  fundamentals: ["Strength", "Concentration"],
};

export const itemCategories = {};

export const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

export const jobTabButton = document.getElementById("jobTabButton");
