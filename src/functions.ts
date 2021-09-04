import type {
  Bases,
  BoatBaseData,
  Classes,
  FishBaseData,
  GameDataType,
  ItemBaseData,
  SkillBaseData,
} from "src/Entities";
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
  Boat,
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
  boatBaseData,
  updateSpeed,
} from "./gameData";

export const daysToYears = (days: number) => Math.floor(days / 365);
export const days = (day) => Math.floor(day % 365);

export function calculatedAge(day: number): string {
  return `${14 + daysToYears(day)} years and ${days(day)} days`;
}

export function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

export function applySkillData(skill: Skill): any {
  let barInfo: any = {};
  barInfo.xpBar = { name: skill.name, width: skill.xp / skill.maxXp };
  barInfo.level = skill.level;
  barInfo.effect = skill.effectDescription;
  barInfo.xpPerDay = skill.xpGain;
  barInfo.xpLeft = skill.xpLeft;
  barInfo.maxLevel = skill.maxLevel;
  console.log(`barInfo`, barInfo);
  return barInfo;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function applySpeed(value: number) {
  return value / updateSpeed;
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

export function coinAmounts(coins: number): {
  p: number;
  g: number;
  s: number;
  c: number;
} {
  let coinsObj: any = {};

  let tiers = ["p", "g", "s"];
  let leftOver = coins;
  let i = 0;
  for (let tier of tiers) {
    let x = Math.floor(leftOver / Math.pow(10, (tiers.length - i) * 2));
    leftOver = Math.floor(leftOver - x * Math.pow(10, (tiers.length - i) * 2));
    coinsObj[tier] = x;
    i += 1;
  }
  coinsObj["c"] = leftOver;
  return coinsObj;
}

export function replaceSaveDict(dict, saveDict) {
  let requirements;
  GameData.subscribe((data) => {
    requirements = data.requirements;
  });
  for (let key in dict) {
    if (!(key in saveDict)) {
      saveDict[key] = dict[key];
    } else if (dict == requirements) {
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

export function replaceSavedItems(
  map: Map<string, Item>,
  saveMap: Map<string, Item>
) {
  map.forEach((val, key) => {
    let { baseData, expenseMultipliers } = saveMap.get(key);
    saveMap.set(key, new Item(baseData, expenseMultipliers));
  });
  return saveMap;
}
export function replaceSavedBoats(
  map: Map<string, Boat>,
  saveMap: Map<string, Boat>
) {
  map.forEach((val, key) => {
    let { baseData } = saveMap.get(key);
    saveMap.set(key, new Boat(baseData));
  });
  return saveMap;
}

export function replaceSavedFishing(
  map: Map<string, Fishing>,
  saveMap: Map<string, Fishing>
) {
  map.forEach((val, key) => {
    let { baseData, level, maxLevel, xp, xpMultipliers, incomeMultipliers } =
      saveMap.get(key);
    saveMap.set(
      key,
      new Fishing(
        baseData,
        level,
        maxLevel,
        xp,
        xpMultipliers,
        incomeMultipliers
      )
    );
  });
  return saveMap;
}
export function replaceSavedSkills(
  map: Map<string, Skill>,
  saveMap: Map<string, Skill>
) {
  map.forEach((val, key) => {
    let { baseData, level, maxLevel, xp, xpMultipliers } = saveMap.get(key);
    saveMap.set(key, new Skill(baseData, level, maxLevel, xp, xpMultipliers));
  });
  return saveMap;
}

export function createData(
  data: Map<string, Classes>,
  baseData: Map<string, Bases>
) {
  baseData.forEach((base: Bases, key) => {
    createEntity(data, base);
  });
}

export function createEntity(data: Map<string, Classes>, entity: Bases) {
  if ("income" in entity) {
    data.set(entity.name, new Fishing(entity));
  } else if ("maxXp" in entity) {
    data.set(entity.name, new Skill(entity));
  } else if ("bought" in entity) {
    data.set(entity.name, new Boat(entity));
  } else {
    data.set(entity.name, new Item(entity));
  }
}

function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}
function reviver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}

export function saveGameData(data_value) {
  if (!data_value.paused) {
    localStorage.setItem("GameDataSave", JSON.stringify(data_value, replacer));
  }
}

export function loadGameData() {
  let GameDataSave = JSON.parse(localStorage.getItem("GameDataSave"), reviver);

  if (GameDataSave !== null) {
    let data_value: GameDataType;
    let requirements;
    let fishingData;
    let skillsData;
    let itemData;

    GameData.subscribe((data) => {
      data_value = data;
      requirements = data.requirements;
      fishingData = data.fishingData;
      skillsData = data.skillsData;
      itemData = data.itemData;
    });
    replaceSaveDict(data_value, GameDataSave);
    replaceSaveDict(requirements, GameDataSave.requirements);
    replaceSavedFishing(fishingData, GameDataSave.fishingData);
    replaceSavedSkills(skillsData, GameDataSave.skillsData);
    GameDataSave.itemData = replaceSavedItems(itemData, GameDataSave.itemData);

    console.log(`GameDataSave`, GameDataSave);

    setGameData(GameDataSave);
  }
}

export function resetGameData() {
  localStorage.clear();
  location.reload();
}
