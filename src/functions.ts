import type {
  Bases,
  BoatBaseData,
  Classes,
  Description,
  FishBaseData,
  GameDataType,
  ItemBaseData,
  RequirementObj,
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
  Requirement,
  BoatRequirement,
} from "./classes";
import {
  baseLifespan,
  GameData,
  getGameData,
  units,
  tempData,
  setGameData,
  boatBaseData,
  updateSpeed,
  baseGameSpeed,
} from "./gameData";

export const daysToYears = (days: number) => Math.floor(days / 365);
export const days = (day) => Math.floor(day % 365);

export function calculatedAge(day: number): string {
  return `Age ${14 + daysToYears(day)} Day ${days(day)}`;
}

export const getTotalExpenses = (game_data: GameDataType): number => {
  let totalExpense = 0;
  game_data.itemData.forEach((item) => {
    if (item.selected) {
      totalExpense += item.expense;
    }
  });
  return totalExpense;
};

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
  return barInfo;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function applySpeed(value: number) {
  // Make sure to divide by updateSpeed
  return (value * getGameSpeed()) / updateSpeed;
}

export function getGameSpeed() {
  return baseGameSpeed * +!getGameData().paused * +isAlive();
}

export function isAlive() {
  return getGameData().day < baseLifespan;
}

export const needRequirements = (
  data_value: GameDataType,
  requiredFor: any // Class Fish or Skill
): boolean => {
  let reqs = data_value.requirements.get(requiredFor.name);
  // Reqs is an array of requirements
  if (reqs == undefined) {
    return false;
  }
  for (let i = 0; i < reqs.length; i++) {
    if (!reqs[i].isCompleted()) {
      return true;
    }
  }
  return false;
};

export const filtered = (
  data_value: GameDataType,
  allRequiredFor: any[]
): any[] => {
  // returns all Fish that have completed requirements + 1 that doesn't.
  const filteredTasks = [];
  for (let i = 0; i < allRequiredFor.length; i++) {
    if (!needRequirements(data_value, allRequiredFor[i])) {
      filteredTasks.push(allRequiredFor[i]);
    } else {
      filteredTasks.push(allRequiredFor[i]);
      break;
    }
  }
  return filteredTasks;
};

export const getRequiredString = (
  data_value: GameDataType,
  requiredFor: any
): string => {
  let reqs: Requirement[] = data_value.requirements.get(requiredFor.name);
  let requiredString = `Required: `;
  for (let i = 0; i < reqs.length; i++) {
    let sameTypeReqs: RequirementObj[] = reqs[i].requirements;
    let type = reqs[i].type;
    for (let j = 0; j < sameTypeReqs.length; j++) {
      if (["fishing", "skill"].includes(type)) {
        let name = sameTypeReqs[j].name;
        let levelNow =
          type == "skill"
            ? data_value.skillsData.get(name).level
            : data_value.fishingData.get(name).level;
        requiredString += `${name} level ${levelNow}/${sameTypeReqs[j].requirement}, `;
      } else if (type == "age") {
        requiredString += `${daysToYears(data_value.day)} years old, `;
      } else if (type == "boat") {
        requiredString += `${sameTypeReqs[j].name}, `;
      } else if (type == "coin") {
        requiredString += `${sameTypeReqs[j].requirement} coins, `;
      }
    }
  }
  let endIndex = requiredString.length - 1;
  requiredString = requiredString.slice(0, endIndex - 1);
  return requiredString;
};

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

export function formatNumber(number): string {
  // what tier? (determines SI symbol)
  if (number < 1000) {
    return number.toFixed(1);
  }
  let tier = (Math.log10(number) / 3) | 0;

  // if zero, we don't need a suffix
  if (tier == 0) return number;

  // get suffix and determine scale
  let suffix = units[tier];
  let scale = Math.pow(10, tier * 3);

  // scale the number
  let scaled = number / scale;
  // format number and add suffix
  return scaled.toFixed(2) + suffix;
}

export function lowestLevelSkill(data_value: GameDataType): Skill {
  let xpDict = new Map<string, number>();
  const skills = data_value.skillsData;
  skills.forEach((s) => {
    if (!needRequirements(data_value, s)) {
      xpDict.set(s.name, s.level);
    }
  });

  if (xpDict.size == 0) {
    return skills.get("Strength");
  }

  let lowest = new Map([...xpDict.entries()].sort((a, b) => a[1] - b[1]));
  return skills.get(lowest.entries().next().value[0]);
}

export function highestTierFish(data_value: GameDataType): Fishing {
  const fish = data_value.fishingData;
  let availableFish = new Map<string, Fishing>();
  fish.forEach((f) => {
    if (!needRequirements(data_value, f)) {
      availableFish.set(f.name, f);
    }
  });
  if (availableFish.size == 0) {
    return fish.get("Sun Fish");
  }
  let highest = Array.from(availableFish.values()).pop();
  return highest;
}

export function applyMultipliers(
  value: number,
  multipliers: { [key: string]: number }
): number {
  let totalAfter = Object.values(multipliers).reduce(
    (num, total) => (total *= num),
    value
  );
  return totalAfter;
}

export const getIncomeMultipliers = (task: Task): { [key: string]: number } => {
  let multipliers = {};
  getGameData().fishingData.forEach((fish) => {
    let effect = kind(task, fish.baseData.description, fish.effect);
    if (effect != 1) {
      multipliers[fish.name] = effect;
    }
  });
  getGameData().skillsData.forEach((skill) => {
    let effect = kind(task, skill.baseData.description, skill.effect);
    if (effect != 1) {
      multipliers[skill.name] = effect;
    }
  });
  getGameData().itemData.forEach((item) => {
    let effect = kind(task, item.baseData.description, item.effect);
    if (effect != 1) {
      multipliers[item.name] = effect;
    }
  });

  function kind(task: Task, description: Description, effect: number): number {
    switch (description) {
      case "Fishing Pay":
        return effect;
      case "Lake Pay":
        if (task.baseData.category == "lake") return effect;
        break;
      case "River Pay":
        if (task.baseData.category == "river") return effect;
        break;
      case "Ocean Pay":
        if (task.baseData.category == "ocean") return effect;
        break;
      case "Payara Pay":
        if (task.name == "Payara") return effect;
        break;
      case "Northern Pay":
        if (task.name == "Northern") return effect;
        break;
      case "Whale Pay":
        if (task.name == "Whale") return effect;
        break;
      default:
        return 1;
    }
    return 1;
  }

  return multipliers;
};

export const getXpMultipliers = (task: Task): { [key: string]: number } => {
  let multipliers = {};
  getGameData().fishingData.forEach((fish) => {
    let effect = kind(task, fish.baseData.description, fish.effect);
    if (effect != 1) {
      multipliers[fish.name] = effect;
    }
  });
  getGameData().skillsData.forEach((skill) => {
    let effect = kind(task, skill.baseData.description, skill.effect);
    if (effect != 1) {
      multipliers[skill.name] = effect;
    }
  });
  getGameData().itemData.forEach((item) => {
    let effect = kind(task, item.baseData.description, item.effect);
    if (effect != 1) {
      multipliers[item.name] = effect;
    }
  });
  function kind(task: Task, description: string, effect: number) {
    switch (description) {
      case "All Xp":
        return effect;
      case "Fishing Skill Xp":
        if (task instanceof Skill && task.baseData.category == "fishing")
          return effect;
        break;
      case "Boating Skill Xp":
        if (task instanceof Skill && task.baseData.category == "boating")
          return effect;
        break;
      case "Fishing Xp":
        if (task instanceof Fishing) return effect;
        break;
      case "Skill Xp":
        if (task instanceof Skill) return effect;
        break;
      case "Lake Xp":
        if (task.baseData.category == "lake") return effect;
        break;
      case "River Xp":
        if (task.baseData.category == "river") return effect;
        break;
      case "Ocean Xp":
        if (task.baseData.category == "ocean") return effect;
        break;
      case "Jigging Xp":
        if (task.name == "Jigging") return effect;
        break;
      case "Casting Xp":
        if (task.name == "Casting") return effect;
        break;
      case "Hooking Xp":
        if (task.name == "Hooking") return effect;
        break;
      case "Trolling Xp":
        if (task.name == "Trolling") return effect;
        break;
      case "Reeling Xp":
        if (task.name == "Reeling") return effect;
        break;
      case "Strength Xp":
        if (task.name == "Strength") return effect;
        break;
      case "Concentration Xp":
        if (task.name == "Concentration") return effect;
        break;
      case "Intelligence Xp":
        if (task.name == "Intelligence") return effect;
        break;
      case "Patience Xp":
        if (task.name == "Patience") return effect;
        break;
      case "Communication Xp":
        if (task.name == "Communication") return effect;
        break;
      case "Ambition Xp":
        if (task.name == "Ambition") return effect;
        break;
      case "Sailing Xp":
        if (task.name == "Sailing") return effect;
        break;
      case "Navigation Xp":
        if (task.name == "Navigation") return effect;
        break;
      default:
        return 1;
    }
    return 1;
  }

  return multipliers;
};

export function coinAmounts(coins: number): {
  p: number;
  g: number;
  s: number;
  c: number;
} {
  let coinsObj: any = {};
  if (coins < 0) {
    return { p: 0, g: 0, s: 0, c: 0 };
  }

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
    let { baseData, expenseMultipliers, level } = saveMap.get(key);
    saveMap.set(key, new Item(baseData, expenseMultipliers, level));
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

export function replaceSavedRequirements(
  map: Map<string, Requirement[]>,
  saveMap: Map<string, Requirement[]>
) {
  map.forEach((val, key) => {
    let reqArr = saveMap.get(key);
    let newReqArr = reqArr.map((req: Requirement) => {
      let requirements = req.requirements as RequirementObj[];
      if (req.type == "fishing") {
        return new FishingRequirement(requirements);
      } else if (req.type == "skill") {
        return new SkillRequirement(requirements);
      } else if (req.type == "coins") {
        return new CoinRequirement(requirements);
      } else if (req.type == "evil") {
        return new EvilRequirement(requirements);
      } else if (req.type == "boat") {
        return new BoatRequirement(requirements);
      } else if (req.type == "age") {
        return new AgeRequirement(requirements);
      } else {
        return new Requirement(requirements, "Unknown");
      }
    });
    saveMap.set(key, newReqArr);
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
    let boatData;

    GameData.subscribe((data) => {
      data_value = data;
      requirements = data.requirements;
      fishingData = data.fishingData;
      skillsData = data.skillsData;
      itemData = data.itemData;
      boatData = data.boatData;
    });
    replaceSaveDict(data_value, GameDataSave);
    replaceSavedRequirements(requirements, GameDataSave.requirements);
    replaceSavedFishing(fishingData, GameDataSave.fishingData);
    replaceSavedSkills(skillsData, GameDataSave.skillsData);
    replaceSavedItems(itemData, GameDataSave.itemData);
    replaceSavedBoats(boatData, GameDataSave.boatData);
    setGameData(GameDataSave);
  }
}

export function resetGameData() {
  localStorage.clear();
  location.reload();
}
