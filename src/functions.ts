import {
  Job,
  Skill,
  TaskRequirement,
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
  jobBaseData,
  jobCategories,
  jobTabButton,
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

export function getBindedTaskEffect(taskName) {
  let task = GameData.taskData[taskName];
  return task.getEffect.bind(task);
}

export function getBindedItemEffect(itemName) {
  let item = GameData.itemData[itemName];
  return item.getEffect.bind(item);
}

export function addMultipliers() {
  for (let taskName in GameData.taskData) {
    let task = GameData.taskData[taskName];

    task.xpMultipliers = [];
    if (task instanceof Job) task.incomeMultipliers = [];

    task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task));
    task.xpMultipliers.push(getHappiness);
    task.xpMultipliers.push(getBindedTaskEffect("Dark influence"));
    task.xpMultipliers.push(getBindedTaskEffect("Demon training"));

    if (task instanceof Job) {
      task.incomeMultipliers.push(task.getLevelMultiplier.bind(task));
      task.incomeMultipliers.push(getBindedTaskEffect("Demon's wealth"));
      task.xpMultipliers.push(getBindedTaskEffect("Productivity"));
      task.xpMultipliers.push(getBindedItemEffect("Personal squire"));
    } else if (task instanceof Skill) {
      task.xpMultipliers.push(getBindedTaskEffect("Concentration"));
      task.xpMultipliers.push(getBindedItemEffect("Book"));
      task.xpMultipliers.push(getBindedItemEffect("Study desk"));
      task.xpMultipliers.push(getBindedItemEffect("Library"));
    }

    if (jobCategories["Military"].includes(task.name)) {
      task.incomeMultipliers.push(getBindedTaskEffect("Strength"));
      task.xpMultipliers.push(getBindedTaskEffect("Battle tactics"));
      task.xpMultipliers.push(getBindedItemEffect("Steel longsword"));
    } else if (task.name == "Strength") {
      task.xpMultipliers.push(getBindedTaskEffect("Muscle memory"));
      task.xpMultipliers.push(getBindedItemEffect("Dumbbells"));
    } else if (skillCategories["Magic"].includes(task.name)) {
      task.xpMultipliers.push(getBindedItemEffect("Sapphire charm"));
    } else if (jobCategories["The Arcane Association"].includes(task.name)) {
      task.xpMultipliers.push(getBindedTaskEffect("Mana control"));
    } else if (skillCategories["Dark magic"].includes(task.name)) {
      task.xpMultipliers.push(getEvil);
    }
  }

  for (let itemName in GameData.itemData) {
    let item = GameData.itemData[itemName];
    item.expenseMultipliers = [];
    item.expenseMultipliers.push(getBindedTaskEffect("Bargaining"));
    item.expenseMultipliers.push(getBindedTaskEffect("Intimidation"));
  }
}

export function setCustomEffects() {
  let bargaining = GameData.taskData["Bargaining"];
  bargaining.getEffect = function () {
    let multiplier = 1 - getBaseLog(7, bargaining.level + 1) / 10;
    if (multiplier < 0.1) {
      multiplier = 0.1;
    }
    return multiplier;
  };

  let intimidation = GameData.taskData["Intimidation"];
  intimidation.getEffect = function () {
    let multiplier = 1 - getBaseLog(7, intimidation.level + 1) / 10;
    if (multiplier < 0.1) {
      multiplier = 0.1;
    }
    return multiplier;
  };

  let timeWarping = GameData.taskData["Time warping"];
  timeWarping.getEffect = function () {
    let multiplier = 1 + getBaseLog(13, timeWarping.level + 1);
    return multiplier;
  };

  let immortality = GameData.taskData["Immortality"];
  immortality.getEffect = function () {
    let multiplier = 1 + getBaseLog(33, immortality.level + 1);
    return multiplier;
  };
}

export function getHappiness() {
  let meditationEffect = getBindedTaskEffect("Meditation");
  let butlerEffect = getBindedItemEffect("Butler");
  let happiness =
    meditationEffect() * butlerEffect() * GameData.currentProperty.getEffect();
  return happiness;
}

export function getEvil() {
  return GameData.evil;
}

export function applyMultipliers(value, multipliers) {
  let finalMultiplier = 1;
  multipliers.forEach(function (multiplierFunction) {
    let multiplier = multiplierFunction();
    finalMultiplier *= multiplier;
  });
  let finalValue = Math.round(value * finalMultiplier);
  return finalValue;
}

export function getEvilGain() {
  let evilControl = GameData.taskData["Evil control"];
  let bloodMeditation = GameData.taskData["Blood meditation"];
  let evil = evilControl.getEffect() * bloodMeditation.getEffect();
  return evil;
}

export function applyExpenses() {
  let coins = getExpense();
  GameData.coins -= coins;
  if (GameData.coins < 0) {
    goBankrupt();
  }
}

export function getExpense() {
  if (!GameData.currentProperty || !GameData.currentMisc) {
    return;
  }
  let expense = 0;
  expense += GameData.currentProperty.getExpense();
  for (let misc of GameData.currentMisc) {
    expense += misc.getExpense();
  }
  return expense;
}

export function goBankrupt() {
  GameData.coins = 0;
  GameData.currentProperty = GameData.itemData["Homeless"];
  GameData.currentMisc = [];
}

export function setTask(taskName) {
  let task = GameData.taskData[taskName];
  task instanceof Job
    ? (GameData.currentJob = task)
    : (GameData.currentSkill = task);
}

export function setProperty(propertyName) {
  let property = GameData.itemData[propertyName];
  GameData.currentProperty = property;
}

export function setMisc(miscName) {
  let misc = GameData.itemData[miscName];
  if (GameData.currentMisc.includes(misc)) {
    for (let i = 0; i < GameData.currentMisc.length; i++) {
      if (GameData.currentMisc[i] == misc) {
        GameData.currentMisc.splice(i, 1);
      }
    }
  } else {
    GameData.currentMisc.push(misc);
  }
}

export function createData(data, baseData) {
  for (let key in baseData) {
    let entity = baseData[key];
    createEntity(data, entity);
  }
}

export function createEntity(data, entity) {
  if ("income" in entity) {
    data[entity.name] = new Job(entity);
  } else if ("maxXp" in entity) {
    data[entity.name] = new Skill(entity);
  } else {
    data[entity.name] = new Item(entity);
  }
  data[entity.name].id = "row " + entity.name;
}

export function getNet() {
  let net = Math.abs(getIncome() - getExpense());
  return net;
}

export function createItemData(baseData) {
  for (let item of baseData) {
    GameData.itemData[item.name].id = "item " + item.name;
  }
}

export function doCurrentTask(task: Job) {
  if (!task) {
    return;
  }
  task.increaseXp();
  if (task instanceof Job) {
    increaseCoins();
  }
}

export function getIncome() {
  let income = 0;
  income += GameData.currentJob.getIncome();
  return income;
}

export function increaseCoins() {
  let coins = getIncome();
  GameData.coins += coins;
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

export function yearsToDays(years) {
  let days = years * 365;
  return days;
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

export function setLightDarkMode() {
  let body = document.getElementById("body");
  body.classList.contains("dark")
    ? body.classList.remove("dark")
    : body.classList.add("dark");
}

export function removeSpaces(str) {
  str = str.replace(/ /g, "");
  return str;
}

export function rebirthOne() {
  GameData.rebirthOneCount += 1;

  rebirthReset();
}

export function rebirthTwo() {
  GameData.rebirthTwoCount += 1;
  GameData.evil += getEvilGain();

  rebirthReset();

  for (let taskName in GameData.taskData) {
    let task = GameData.taskData[taskName];
    task.maxLevel = 0;
  }
}

export function rebirthReset() {
  GameData.coins = 0;
  GameData.day = 365 * 14;
  GameData.currentJob = GameData.taskData["Beggar"];
  GameData.currentSkill = GameData.taskData["Concentration"];
  GameData.currentProperty = GameData.itemData["Homeless"];
  GameData.currentMisc = [];

  for (let taskName in GameData.taskData) {
    let task = GameData.taskData[taskName];
    if (task.level > task.maxLevel) task.maxLevel = task.level;
    task.level = 0;
    task.xp = 0;
  }

  for (let key in GameData.requirements) {
    let requirement = GameData.requirements[key];
    if (requirement.completed && permanentUnlocks.includes(key)) continue;
    requirement.completed = false;
  }
}

export function getLifespan() {
  let immortality = GameData.taskData["Immortality"];
  let superImmortality = GameData.taskData["Super immortality"];
  let lifespan =
    baseLifespan * immortality.getEffect() * superImmortality.getEffect();
  return lifespan;
}

export function isAlive() {
  let condition = GameData.day < getLifespan();
  let deathText = document.getElementById("deathText");
  if (!condition) {
    GameData.day = getLifespan();
    deathText.classList.remove("hidden");
  } else {
    deathText.classList.add("hidden");
  }
  return condition;
}

export function assignMethods() {
  for (let key in GameData.taskData) {
    let task = GameData.taskData[key];
    if (task.baseData.income) {
      task.baseData = jobBaseData[task.name];
      task = Object.assign(new Job(jobBaseData[task.name]), task);
    } else {
      task.baseData = skillBaseData[task.name];
      task = Object.assign(new Skill(skillBaseData[task.name]), task);
    }
    GameData.taskData[key] = task;
  }

  for (let key in GameData.itemData) {
    let item = GameData.itemData[key];
    item.baseData = itemBaseData[item.name];
    item = Object.assign(new Item(itemBaseData[item.name]), item);
    GameData.itemData[key] = item;
  }

  for (let key in GameData.requirements) {
    let requirement = GameData.requirements[key];
    if (requirement.type == "task") {
      requirement = Object.assign(
        new TaskRequirement(requirement.requirements),
        requirement
      );
    } else if (requirement.type == "coins") {
      requirement = Object.assign(
        new CoinRequirement(requirement.requirements),
        requirement
      );
    } else if (requirement.type == "age") {
      requirement = Object.assign(
        new AgeRequirement(requirement.requirements),
        requirement
      );
    } else if (requirement.type == "evil") {
      requirement = Object.assign(
        new EvilRequirement(requirement.requirements),
        requirement
      );
    }

    let tempRequirement = tempData["requirements"][key];
    requirement.elements = tempRequirement.elements;
    requirement.requirements = tempRequirement.requirements;
    GameData.requirements[key] = requirement;
  }

  //   GameData.currentJob = GameData.taskData[GameData.currentJob.name];
  //   GameData.currentSkill = GameData.taskData[GameData.currentSkill.name];
  //   GameData.currentProperty = GameData.itemData[GameData.currentProperty.name];
  let newArray = [];
  for (let misc of GameData.currentMisc) {
    newArray.push(GameData.itemData[misc.name]);
  }
  GameData.currentMisc = newArray;
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

export function saveGameData() {
  localStorage.setItem("GameDataSave", JSON.stringify(GameData));
}

export function loadGameData() {
  let GameDataSave = JSON.parse(localStorage.getItem("GameDataSave"));

  if (GameDataSave !== null) {
    replaceSaveDict(GameData, GameDataSave);
    replaceSaveDict(GameData.requirements, GameDataSave.requirements);
    replaceSaveDict(GameData.taskData, GameDataSave.taskData);
    replaceSaveDict(GameData.itemData, GameDataSave.itemData);

    setGameData(GameDataSave);
  }

  assignMethods();
}

export function update() {
  increaseDays();
  doCurrentTask(GameData.currentJob);
  doCurrentTask(GameData.currentSkill);
  applyExpenses();
}

export function resetGameData() {
  localStorage.clear();
  location.reload();
}
