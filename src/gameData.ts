import {
  FishingRequirement,
  SkillRequirement,
  EvilRequirement,
  CoinRequirement,
  AgeRequirement,
  Fishing,
} from "./classes";

import { applySpeed } from "src/functions";

import type {
  BoatBaseData,
  FishBaseData,
  GameDataType,
  ItemBaseData,
  SkillBaseData,
} from "src/Entities";

import { writable, Writable } from "svelte/store";

export let GameData: Writable<GameDataType> = writable({
  day: 0,
  coins: 0,
  fishingData: new Map(),
  skillsData: new Map(),
  itemData: new Map(),
  boatData: new Map(),
  requirements: new Map(),
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
    // fish.increaseXp();
    data.fishingData.get(fish.name).increaseXp();
    return { ...data, fishingData: data.fishingData, currentlyFishing: fish };
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

export const fishBaseData: Map<string, FishBaseData> = new Map([
  [
    "Black Drum",
    {
      name: "Black Drum",
      maxXp: 50,
      income: 5,
      effect: 0.01,
      description: "Coins/day",
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
      description: "Coins/day",
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
      description: "Coins/day",
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
      description: "Coins/day",
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
      description: "Fishing Effects",
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
      description: "Coins/day",
    },
  ],
  [
    "Book",
    {
      name: "Book",
      expense: 50,
      effect: 1.5,
      description: "Skill xp",
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

// tempData["requirements"] = {};
// for (let key in GameData.requirements) {
//   var requirement = GameData.requirements[key];
//   tempData["requirements"][key] = requirement;
// }
