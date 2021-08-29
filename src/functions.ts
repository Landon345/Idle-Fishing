import type { CurrentlyFishing, CurrentSkill } from "src/Entities";
import {
  Fishing,
  Skill,
  SkillRequirement,
  FishingRequirement,
  AgeRequirement,
  CoinRequirement,
  EvilRequirement,
  Item,
  Task,
} from "./classes";
import {
  baseLifespan,
  GameData,
  itemBaseData,
  fishBaseData,
  fishCategories,
  permanentUnlocks,
  skillBaseData,
  skillCategories,
  units,
  tempData,
  setGameData,
} from "./gameData";

export function calculatedAge(day: number): string {
  return `${14 + Math.floor(day / 365)} years and ${day % 365} days`;
}

export function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

export function daysToYears(days) {
  let years = Math.floor(days / 365);
  return years;
}

export function getCategoryFromEntityName(categoryType, entityName) {
  for (let categoryName in categoryType) {
    let category = categoryType[categoryName];
    if (category.includes(entityName)) {
      return category;
    }
  }
}

export function getNextEntity(data, categoryType, entityName) {
  let category = getCategoryFromEntityName(categoryType, entityName);
  let nextIndex = category.indexOf(entityName) + 1;
  if (nextIndex > category.length - 1) return null;
  let nextEntityName = category[nextIndex];
  let nextEntity = data[nextEntityName];
  return nextEntity;
}

export function getDay() {
  let day = Math.floor(GameData.day - daysToYears(GameData.day) * 365);
  return day;
}

export function increaseDays() {
  let increase = 1;
  GameData.day += increase;
}

export function format(number) {
  // what tier? (determines SI symbol)
  let tier = (Math.log10(number) / 3) | 0;

  // if zero, we don't need a suffix
  if (tier == 0) return number;

  // get suffix and determine scale
  let suffix = units[tier];
  let scale = Math.pow(10, tier * 3);

  // scale the number
  let scaled = number / scale;

  // format number and add suffix
  return scaled.toFixed(1) + suffix;
}

export function formatCoins(coins) {
  let tiers = ["p", "g", "s"];
  let colors = {
    p: "#79b9c7",
    g: "#E5C100",
    s: "#a8a8a8",
    c: "#a15c2f",
  };
  let leftOver = coins;
  let i = 0;
  for (let tier of tiers) {
    let x = Math.floor(leftOver / Math.pow(10, (tiers.length - i) * 2));
    leftOver = Math.floor(leftOver - x * Math.pow(10, (tiers.length - i) * 2));
    let text = format(String(x)) + tier + " ";
    i += 1;
  }
  if (leftOver == 0 && coins > 0) {
    return;
  }
  let text = String(Math.floor(leftOver)) + "c";
}

export function replaceSaveDict(dict, saveDict) {
  for (let key in dict) {
    if (!(key in saveDict)) {
      saveDict[key] = dict[key];
    } else if (dict == GameData.requirements) {
      if (saveDict[key].type != tempData["requirements"][key].type) {
        saveDict[key] = tempData["requirements"][key];
      }
    }
  }

  for (let key in saveDict) {
    if (!(key in dict)) {
      delete saveDict[key];
    }
  }
}

export function createData(data, baseData) {
  for (let key in baseData) {
    var entity = baseData[key];
    createEntity(data, entity);
  }
}

export function createEntity(data, entity) {
  if ("income" in entity) {
    data[entity.name] = new Fishing(entity);
  } else if ("maxXp" in entity) {
    data[entity.name] = new Skill(entity);
  } else {
    data[entity.name] = new Item(entity);
  }
  data[entity.name].id = "row " + entity.name;
}

export function saveGameData() {
  localStorage.setItem("GameDataSave", JSON.stringify(GameData));
}

export function loadGameData() {
  let GameDataSave = JSON.parse(localStorage.getItem("GameDataSave"));

  if (GameDataSave !== null) {
    replaceSaveDict(GameData, GameDataSave);
    replaceSaveDict(GameData.requirements, GameDataSave.requirements);
    replaceSaveDict(GameData.fishingData, GameDataSave.fishingData);
    replaceSaveDict(GameData.skillsData, GameDataSave.skillsData);
    replaceSaveDict(GameData.itemData, GameDataSave.itemData);

    setGameData(GameDataSave);
  }
}

export function update() {
  increaseDays();
}

export function resetGameData() {
  localStorage.clear();
  location.reload();
}
