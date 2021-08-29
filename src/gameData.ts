import {
  FishingRequirement,
  SkillRequirement,
  EvilRequirement,
  CoinRequirement,
  AgeRequirement,
} from "./classes";

import type {
  BoatBaseData,
  FishBaseData,
  GameDataType,
  ItemBaseData,
  SkillBaseData,
} from "src/Entities";

export let GameData: GameDataType = {
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
};

export const setGameData = (savedGameData) => {
  GameData = savedGameData;
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
  ocean: ["blackDrum", "blueMarlin"],
  lake: ["sunFish", "waleye"],
};

export const skillCategories = {};

export const itemCategories = {};

export const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

export const jobTabButton = document.getElementById("jobTabButton");

tempData["requirements"] = {};
for (let key in GameData.requirements) {
  var requirement = GameData.requirements[key];
  tempData["requirements"][key] = requirement;
}
