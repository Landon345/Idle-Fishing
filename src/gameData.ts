import { Writable, writable, Readable, readable, derived } from "svelte/store";

import {
  TaskRequirement,
  EvilRequirement,
  CoinRequirement,
  AgeRequirement,
} from "./classes";
import { getTaskElement, getItemElement } from "./functions";

export interface Coins {
  gold: number;
  silver: number;
  copper: number;
}

export interface GameData {
  coins: number;
  days: number;
  currentSkill: string | null;
  currentProperty: string | null;
  currentMisc: string | null;
}

export let GameData = {
  day: 0,
  coins: 0,
  taskData: { concentration: null },
  itemData: {},
  requirements: {},

  rebirthOneCount: 0,
  rebirthTwoCount: 0,

  currentJob: null,
  currentSkill: null,
  currentProperty: null,
  currentMisc: [],
  evil: 0,
};

export const setGameData = (savedGameData) => {
  GameData = savedGameData;
};

GameData.currentJob = GameData.taskData["Beggar"];
GameData.taskData["Concentration"];
GameData.currentProperty = GameData.itemData["Homeless"];
GameData.currentMisc = [];

GameData.requirements = {
  //Other
  "The Arcane Association": new TaskRequirement([
    { task: "Concentration", requirement: 200 },
    { task: "Meditation", requirement: 200 },
  ]),
  "Dark magic": new EvilRequirement([{ requirement: 1 }]),
  Shop: new CoinRequirement([
    { requirement: GameData.itemData["Tent"].getExpense() * 50 },
  ]),
  "Rebirth tab": new AgeRequirement([{ requirement: 25 }]),
  "Rebirth note 1": new AgeRequirement([{ requirement: 45 }]),
  "Rebirth note 2": new AgeRequirement([{ requirement: 65 }]),
  "Rebirth note 3": new AgeRequirement([{ requirement: 200 }]),
  "Evil info": new EvilRequirement([{ requirement: 1 }]),
  "Time warping info": new TaskRequirement([{ task: "Mage", requirement: 10 }]),
  Automation: new AgeRequirement([{ requirement: 20 }]),
  "Quick task display": new AgeRequirement([{ requirement: 20 }]),

  //Common work
  Beggar: new TaskRequirement([]),
  Farmer: new TaskRequirement([{ task: "Beggar", requirement: 10 }]),
  Fisherman: new TaskRequirement([{ task: "Farmer", requirement: 10 }]),
  Miner: new TaskRequirement([
    { task: "Strength", requirement: 10 },
    { task: "Fisherman", requirement: 10 },
  ]),
  Blacksmith: new TaskRequirement([
    { task: "Strength", requirement: 30 },
    { task: "Miner", requirement: 10 },
  ]),
  Merchant: new TaskRequirement([
    { task: "Bargaining", requirement: 50 },
    { task: "Blacksmith", requirement: 10 },
  ]),

  //Military
  Squire: new TaskRequirement([{ task: "Strength", requirement: 5 }]),
  Footman: new TaskRequirement([
    { task: "Strength", requirement: 20 },
    { task: "Squire", requirement: 10 },
  ]),
  "Veteran footman": new TaskRequirement([
    { task: "Battle tactics", requirement: 40 },
    { task: "Footman", requirement: 10 },
  ]),
  Knight: new TaskRequirement([
    { task: "Strength", requirement: 100 },
    { task: "Veteran footman", requirement: 10 },
  ]),
  "Veteran knight": new TaskRequirement([
    { task: "Battle tactics", requirement: 150 },
    { task: "Knight", requirement: 10 },
  ]),
  "Elite knight": new TaskRequirement([
    { task: "Strength", requirement: 300 },
    { task: "Veteran knight", requirement: 10 },
  ]),
  "Holy knight": new TaskRequirement([
    { task: "Mana control", requirement: 500 },
    { task: "Elite knight", requirement: 10 },
  ]),
  "Legendary knight": new TaskRequirement([
    { task: "Mana control", requirement: 1000 },
    { task: "Battle tactics", requirement: 1000 },
    { task: "Holy knight", requirement: 10 },
  ]),

  //The Arcane Association
  Student: new TaskRequirement([
    { task: "Concentration", requirement: 200 },
    { task: "Meditation", requirement: 200 },
  ]),
  "Apprentice mage": new TaskRequirement([
    { task: "Mana control", requirement: 400 },
    { task: "Student", requirement: 10 },
  ]),
  Mage: new TaskRequirement([
    { task: "Mana control", requirement: 700 },
    { task: "Apprentice mage", requirement: 10 },
  ]),
  Wizard: new TaskRequirement([
    { task: "Mana control", requirement: 1000 },
    { task: "Mage", requirement: 10 },
  ]),
  "Master wizard": new TaskRequirement([
    { task: "Mana control", requirement: 1500 },
    { task: "Wizard", requirement: 10 },
  ]),
  Chairman: new TaskRequirement([
    { task: "Mana control", requirement: 2000 },
    { task: "Master wizard", requirement: 10 },
  ]),

  //Fundamentals
  Concentration: new TaskRequirement([]),
  Productivity: new TaskRequirement([
    { task: "Concentration", requirement: 5 },
  ]),
  Bargaining: new TaskRequirement([{ task: "Concentration", requirement: 20 }]),
  Meditation: new TaskRequirement([
    { task: "Concentration", requirement: 30 },
    { task: "Productivity", requirement: 20 },
  ]),

  //Combat
  Strength: new TaskRequirement([]),
  "Battle tactics": new TaskRequirement([
    { task: "Concentration", requirement: 20 },
  ]),
  "Muscle memory": new TaskRequirement([
    { task: "Concentration", requirement: 30 },
    { task: "Strength", requirement: 30 },
  ]),

  //Magic
  "Mana control": new TaskRequirement([
    { task: "Concentration", requirement: 200 },
    { task: "Meditation", requirement: 200 },
  ]),
  Immortality: new TaskRequirement([
    { task: "Apprentice mage", requirement: 10 },
  ]),
  "Time warping": new TaskRequirement([{ task: "Mage", requirement: 10 }]),
  "Super immortality": new TaskRequirement([
    { task: "Chairman", requirement: 1000 },
  ]),

  //Dark magic
  "Dark influence": new EvilRequirement([{ requirement: 1 }]),
  "Evil control": new EvilRequirement([{ requirement: 1 }]),
  Intimidation: new EvilRequirement([{ requirement: 1 }]),
  "Demon training": new EvilRequirement([{ requirement: 25 }]),
  "Blood meditation": new EvilRequirement([{ requirement: 75 }]),
  "Demon's wealth": new EvilRequirement([{ requirement: 500 }]),

  //Properties
  Homeless: new CoinRequirement([{ requirement: 0 }]),
  Tent: new CoinRequirement([{ requirement: 0 }]),
  "Wooden hut": new CoinRequirement([
    { requirement: GameData.itemData["Wooden hut"].getExpense() * 100 },
  ]),
  Cottage: new CoinRequirement([
    { requirement: GameData.itemData["Cottage"].getExpense() * 100 },
  ]),
  House: new CoinRequirement([
    { requirement: GameData.itemData["House"].getExpense() * 100 },
  ]),
  "Large house": new CoinRequirement([
    { requirement: GameData.itemData["Large house"].getExpense() * 100 },
  ]),
  "Small palace": new CoinRequirement([
    { requirement: GameData.itemData["Small palace"].getExpense() * 100 },
  ]),
  "Grand palace": new CoinRequirement([
    { requirement: GameData.itemData["Grand palace"].getExpense() * 100 },
  ]),

  //Misc
  Book: new CoinRequirement([{ requirement: 0 }]),
  Dumbbells: new CoinRequirement([
    { requirement: GameData.itemData["Dumbbells"].getExpense() * 100 },
  ]),
  "Personal squire": new CoinRequirement([
    { requirement: GameData.itemData["Personal squire"].getExpense() * 100 },
  ]),
  "Steel longsword": new CoinRequirement([
    { requirement: GameData.itemData["Steel longsword"].getExpense() * 100 },
  ]),
  Butler: new CoinRequirement([
    { requirement: GameData.itemData["Butler"].getExpense() * 100 },
  ]),
  "Sapphire charm": new CoinRequirement([
    { requirement: GameData.itemData["Sapphire charm"].getExpense() * 100 },
  ]),
  "Study desk": new CoinRequirement([
    { requirement: GameData.itemData["Study desk"].getExpense() * 100 },
  ]),
  Library: new CoinRequirement([
    { requirement: GameData.itemData["Library"].getExpense() * 100 },
  ]),
};

export let tempData = {
  requirements: {},
};

export let skillWithLowestMaxXp = null;

export const updateSpeed = 20;

export const baseLifespan = 365 * 70;

export const baseGameSpeed = 4;

export const permanentUnlocks = [
  "Scheduling",
  "Shop",
  "Automation",
  "Quick task display",
];

export const jobBaseData = {
  Beggar: { name: "Beggar", maxXp: 50, income: 5 },
  Farmer: { name: "Farmer", maxXp: 100, income: 9 },
  Fisherman: { name: "Fisherman", maxXp: 200, income: 15 },
  Miner: { name: "Miner", maxXp: 400, income: 40 },
  Blacksmith: { name: "Blacksmith", maxXp: 800, income: 80 },
  Merchant: { name: "Merchant", maxXp: 1600, income: 150 },

  Squire: { name: "Squire", maxXp: 100, income: 5 },
  Footman: { name: "Footman", maxXp: 1000, income: 50 },
  "Veteran footman": { name: "Veteran footman", maxXp: 10000, income: 120 },
  Knight: { name: "Knight", maxXp: 100000, income: 300 },
  "Veteran knight": { name: "Veteran knight", maxXp: 1000000, income: 1000 },
  "Elite knight": { name: "Elite knight", maxXp: 7500000, income: 3000 },
  "Holy knight": { name: "Holy knight", maxXp: 40000000, income: 15000 },
  "Legendary knight": {
    name: "Legendary knight",
    maxXp: 150000000,
    income: 50000,
  },

  Student: { name: "Student", maxXp: 100000, income: 100 },
  "Apprentice mage": { name: "Apprentice mage", maxXp: 1000000, income: 1000 },
  Mage: { name: "Mage", maxXp: 10000000, income: 7500 },
  Wizard: { name: "Wizard", maxXp: 100000000, income: 50000 },
  "Master wizard": {
    name: "Master wizard",
    maxXp: 10000000000,
    income: 250000,
  },
  Chairman: { name: "Chairman", maxXp: 1000000000000, income: 1000000 },
};

export const skillBaseData = {
  Concentration: {
    name: "Concentration",
    maxXp: 100,
    effect: 0.01,
    description: "Skill xp",
  },
  Productivity: {
    name: "Productivity",
    maxXp: 100,
    effect: 0.01,
    description: "Job xp",
  },
  Bargaining: {
    name: "Bargaining",
    maxXp: 100,
    effect: -0.01,
    description: "Expenses",
  },
  Meditation: {
    name: "Meditation",
    maxXp: 100,
    effect: 0.01,
    description: "Happiness",
  },

  Strength: {
    name: "Strength",
    maxXp: 100,
    effect: 0.01,
    description: "Military pay",
  },
  "Battle tactics": {
    name: "Battle tactics",
    maxXp: 100,
    effect: 0.01,
    description: "Military xp",
  },
  "Muscle memory": {
    name: "Muscle memory",
    maxXp: 100,
    effect: 0.01,
    description: "Strength xp",
  },

  "Mana control": {
    name: "Mana control",
    maxXp: 100,
    effect: 0.01,
    description: "T.A.A. xp",
  },
  Immortality: {
    name: "Immortality",
    maxXp: 100,
    effect: 0.01,
    description: "Longer lifespan",
  },
  "Time warping": {
    name: "Time warping",
    maxXp: 100,
    effect: 0.01,
    description: "Gamespeed",
  },
  "Super immortality": {
    name: "Super immortality",
    maxXp: 100,
    effect: 0.01,
    description: "Longer lifespan",
  },

  "Dark influence": {
    name: "Dark influence",
    maxXp: 100,
    effect: 0.01,
    description: "All xp",
  },
  "Evil control": {
    name: "Evil control",
    maxXp: 100,
    effect: 0.01,
    description: "Evil gain",
  },
  Intimidation: {
    name: "Intimidation",
    maxXp: 100,
    effect: -0.01,
    description: "Expenses",
  },
  "Demon training": {
    name: "Demon training",
    maxXp: 100,
    effect: 0.01,
    description: "All xp",
  },
  "Blood meditation": {
    name: "Blood meditation",
    maxXp: 100,
    effect: 0.01,
    description: "Evil gain",
  },
  "Demon's wealth": {
    name: "Demon's wealth",
    maxXp: 100,
    effect: 0.002,
    description: "Job pay",
  },
};

export const itemBaseData = {
  Homeless: { name: "Homeless", expense: 0, effect: 1 },
  Tent: { name: "Tent", expense: 15, effect: 1.4 },
  "Wooden hut": { name: "Wooden hut", expense: 100, effect: 2 },
  Cottage: { name: "Cottage", expense: 750, effect: 3.5 },
  House: { name: "House", expense: 3000, effect: 6 },
  "Large house": { name: "Large house", expense: 25000, effect: 12 },
  "Small palace": { name: "Small palace", expense: 300000, effect: 25 },
  "Grand palace": { name: "Grand palace", expense: 5000000, effect: 60 },

  Book: { name: "Book", expense: 10, effect: 1.5, description: "Skill xp" },
  Dumbbells: {
    name: "Dumbbells",
    expense: 50,
    effect: 1.5,
    description: "Strength xp",
  },
  "Personal squire": {
    name: "Personal squire",
    expense: 200,
    effect: 2,
    description: "Job xp",
  },
  "Steel longsword": {
    name: "Steel longsword",
    expense: 1000,
    effect: 2,
    description: "Military xp",
  },
  Butler: {
    name: "Butler",
    expense: 7500,
    effect: 1.5,
    description: "Happiness",
  },
  "Sapphire charm": {
    name: "Sapphire charm",
    expense: 50000,
    effect: 3,
    description: "Magic xp",
  },
  "Study desk": {
    name: "Study desk",
    expense: 1000000,
    effect: 2,
    description: "Skill xp",
  },
  Library: {
    name: "Library",
    expense: 10000000,
    effect: 1.5,
    description: "Skill xp",
  },
};

export const jobCategories = {
  "Common work": [
    "Beggar",
    "Farmer",
    "Fisherman",
    "Miner",
    "Blacksmith",
    "Merchant",
  ],
  Military: [
    "Squire",
    "Footman",
    "Veteran footman",
    "Knight",
    "Veteran knight",
    "Elite knight",
    "Holy knight",
    "Legendary knight",
  ],
  "The Arcane Association": [
    "Student",
    "Apprentice mage",
    "Mage",
    "Wizard",
    "Master wizard",
    "Chairman",
  ],
};

export const skillCategories = {
  Fundamentals: ["Concentration", "Productivity", "Bargaining", "Meditation"],
  Combat: ["Strength", "Battle tactics", "Muscle memory"],
  Magic: ["Mana control", "Immortality", "Time warping", "Super immortality"],
  "Dark magic": [
    "Dark influence",
    "Evil control",
    "Intimidation",
    "Demon training",
    "Blood meditation",
    "Demon's wealth",
  ],
};

export const itemCategories = {
  Properties: [
    "Homeless",
    "Tent",
    "Wooden hut",
    "Cottage",
    "House",
    "Large house",
    "Small palace",
    "Grand palace",
  ],
  Misc: [
    "Book",
    "Dumbbells",
    "Personal squire",
    "Steel longsword",
    "Butler",
    "Sapphire charm",
    "Study desk",
    "Library",
  ],
};

export const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

export const jobTabButton = document.getElementById("jobTabButton");

// tempData["requirements"] = {}
// for (key in GameData.requirements) {
//     var requirement = GameData.requirements[key]
//     tempData["requirements"][key] = requirement
// }
