import type {
  Bases,
  BoatBaseData,
  Classes,
  FishBaseData,
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

export const togglePause = () => (GameData.paused = !GameData.paused);
export const daysToYears = (days: number) => Math.floor(days / 365);
export const days = (day) => Math.floor(day % 365);

export function calculatedAge(day: number): string {
  return `${14 + daysToYears(day)} years and ${days(day)} days`;
}

export function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

export function addMultipliers() {
  GameData.fishingData.forEach((task, id) => {});
  GameData.skillsData.forEach((skill, id) => {});
}

// export function selectCurrent(entity: Bases) {
//   if ("income" in entity) {
//     GameData.currentlyFishing = GameData.fishingData.get(entity.name);
//   } else if ("maxXp" in entity) {
//     GameData.currentSkill = GameData.skillsData.get(entity.name);
//   } else if ("bought" in entity) {
//     // check if able to purchase
//     // then set bought to true
//     let boat = GameData.boatData.get(entity.name).baseData;
//     if (boat.price < GameData.coins) {
//       GameData.coins -= boat.price;
//       boat.bought = true;
//       GameData.boatData.set(boat.name, new Boat(boat));
//     }
//   } else {
//     let misc = GameData.itemData.get(entity.name);
//     if (GameData.currentMisc.includes(misc)) {
//       for (let i = 0; i < GameData.currentMisc.length; i++) {
//         if (GameData.currentMisc[i] == misc) {
//           GameData.currentMisc.splice(i, 1);
//         }
//       }
//     } else {
//       GameData.currentMisc.push(misc);
//     }
//   }
// }

export function setSkill(skillName: string): void {
  GameData.currentSkill = GameData.skillsData.get(skillName);
}

export function setFishing(fishName: string): void {
  console.log(`fishName`, fishName);
  GameData.currentlyFishing = GameData.fishingData.get(fishName);
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

export function increaseDays() {
  let increase = applySpeed(1);
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

export function saveGameData() {
  if (!GameData.paused) {
    localStorage.setItem("GameDataSave", JSON.stringify(GameData, replacer));
  }
}

export function loadGameData() {
  let GameDataSave = JSON.parse(localStorage.getItem("GameDataSave"), reviver);

  if (GameDataSave !== null) {
    replaceSaveDict(GameData, GameDataSave);
    replaceSaveDict(GameData.requirements, GameDataSave.requirements);
    replaceSavedFishing(GameData.fishingData, GameDataSave.fishingData);
    replaceSavedSkills(GameData.skillsData, GameDataSave.skillsData);
    GameDataSave.itemData = replaceSavedItems(
      GameData.itemData,
      GameDataSave.itemData
    );

    console.log(`GameDataSave`, GameDataSave);

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
