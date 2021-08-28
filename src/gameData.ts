import { Writable, writable, Readable, readable, derived } from "svelte/store";

import {
  TaskRequirement,
  EvilRequirement,
  CoinRequirement,
  AgeRequirement,
  Item,
} from "./classes";

export interface GameDataType {
  day: number;
  coins: number;
  taskData: any;
  itemData: any;
  requirements: any;
  paused: boolean;

  rebirthOneCount: number;
  rebirthTwoCount: number;

  currentJob: string | null;
  currentSkill: string | null;
  currentProperty: string | null;
  currentMisc: any[];
  evil: number;
}

export let GameData: GameDataType = {
  day: 0,
  coins: 0,
  taskData: {},
  itemData: {},
  requirements: {},
  paused: false,

  rebirthOneCount: 0,
  rebirthTwoCount: 0,

  currentJob: null,
  currentSkill: null,
  currentProperty: null,
  currentMisc: null,
  evil: 0,
};

export const setGameData = (savedGameData) => {
  GameData = savedGameData;
};

GameData.currentJob = GameData.taskData["Beggar"];
GameData.taskData["Concentration"];
GameData.currentProperty = GameData.itemData["Homeless"];
GameData.currentMisc = [];

GameData.requirements = {};

export let tempData = {
  requirements: {},
};

export let skillWithLowestMaxXp = null;

export const updateSpeed = 20;

export const baseLifespan = 365 * 70;

export const baseGameSpeed = 4;

export const permanentUnlocks = [];

export const jobBaseData = {};

export const skillBaseData = {};

export const itemBaseData = {};

export const jobCategories = {};

export const skillCategories = {};

export const itemCategories = {};

export const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

export const jobTabButton = document.getElementById("jobTabButton");

tempData["requirements"] = {};
for (let key in GameData.requirements) {
  var requirement = GameData.requirements[key];
  tempData["requirements"][key] = requirement;
}
