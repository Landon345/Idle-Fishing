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
import { Fishing, Skill, TimeWarping, Item, Task, Boat } from "./classes.svelte";
import {
  getLifespan,
  gameState,
  getGameData,
  units,
  setGameData,
  baseGameSpeed,
  Requirement,
  DAYS_PER_YEAR,
  STARTING_AGE,
  AUTO_FISH_ROTATION_DAYS,
  CATEGORY,
  FISH,
  SKILL,
} from "./gameData.svelte";

export const daysToYears = (days: number) => Math.floor(days / DAYS_PER_YEAR);
export const days = (day) => Math.floor(day % DAYS_PER_YEAR);

export function calculatedAge(day: number): string {
  return `Age ${STARTING_AGE + daysToYears(day)} Day ${days(day)}`;
}

// Inverse of calculatedAge's "STARTING_AGE + years elapsed" display: the raw
// `day` value at which a given displayed age is first reached.
export const ageToDay = (age: number) => (age - STARTING_AGE) * DAYS_PER_YEAR;

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

export function applySpeed(value: number, deltaSeconds: number) {
  return value * getGameSpeed() * deltaSeconds;
}

export function getGameSpeed() {
  let timeWarping = getGameData().skillsData.get(SKILL.TIME_WARPING);
  let warpMultiplier =
    getGameData().timeWarpingEnabled && timeWarping ? timeWarping.effect : 1;
  return baseGameSpeed * +!getGameData().paused * +isAlive() * warpMultiplier;
}

export function isAlive() {
  return getGameData().day < getLifespan();
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
  const filteredTasks: any[] = [];
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
  let reqs: Requirement[] = data_value.requirements.get(requiredFor.name)!;
  let requiredString = `Required: `;
  for (let i = 0; i < reqs.length; i++) {
    let sameTypeReqs: RequirementObj[] = reqs[i].requirements;
    let type = reqs[i].type;
    for (let j = 0; j < sameTypeReqs.length; j++) {
      if (["fishing", "skill"].includes(type)) {
        let name = sameTypeReqs[j].name;
        let levelNow =
          type == "skill"
            ? data_value.skillsData.get(name)!.level
            : data_value.fishingData.get(name)!.level;
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
    return skills.get(SKILL.STRENGTH)!;
  }

  let lowest = new Map([...xpDict.entries()].sort((a, b) => a[1] - b[1]));
  return skills.get(lowest.entries().next().value![0])!;
}

// The deepest unlocked fish in each region, in region order (lake, river,
// ocean). Regions with nothing unlocked yet are omitted rather than returned
// empty, so the rotation below only ever cycles through real choices.
export function highestTierFishPerCategory(data_value: GameDataType): Fishing[] {
  // A Map keyed by category keeps the *first* insertion position for each key
  // while `set` overwrites the value, so iterating fishingData in its natural
  // order leaves each entry holding that region's last unlocked fish.
  let deepestPerCategory = new Map<string, Fishing>();
  data_value.fishingData.forEach((f) => {
    if (!needRequirements(data_value, f)) {
      deepestPerCategory.set(f.baseData.category, f);
    }
  });
  return Array.from(deepestPerCategory.values());
}

// autoFish target: round-robins the deepest unlocked fish of each region,
// swapping every AUTO_FISH_ROTATION_DAYS in-game days.
//
// This replaces "always fish the single globally-deepest unlocked fish", which
// could strand a whole region permanently: Pirana unlocks off a Strength gate
// rather than off another fish, so autoFish would leave the lake the moment it
// appeared - and Bass needs Perch at level 10, which it would then never
// reach. Deriving the slot from `day` rather than a counter keeps this
// stateless, so it needs no new save field and resumes consistently on reload.
export function roundRobinFish(data_value: GameDataType): Fishing {
  const candidates = highestTierFishPerCategory(data_value);
  if (candidates.length == 0) {
    return data_value.fishingData.get(FISH.SUN_FISH)!;
  }
  const slot =
    Math.floor(data_value.day / AUTO_FISH_ROTATION_DAYS) % candidates.length;
  return candidates[slot];
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

// Effect descriptions are structured, not arbitrary: a trailing " Xp" or
// " Pay" marks what the effect multiplies, and the text before it names either
// a region (matching a task's category) or a single entity. The two `kind()`
// helpers below read that structure instead of enumerating one switch case per
// target, so adding a new "<Skill> Xp" effect needs no change here.
const XP_SUFFIX = " Xp";
const PAY_SUFFIX = " Pay";

// Anything that can carry an effect. Boats are in here too now that they're
// upgrades rather than pure paywalls - a Boat exposes `effect` (flat, and only
// once bought) and `baseData.description` just like a Task or an Item does.
type EffectSource = { name: string; effect: number; baseData: { description: Description } };

const effectSources = (): EffectSource[] => [
  ...getGameData().fishingData.values(),
  ...getGameData().skillsData.values(),
  ...getGameData().itemData.values(),
  ...getGameData().boatData.values(),
];

// The three collectors below differ only in how they resolve one source's
// description into a multiplier, so the walk over every source lives here once.
const collectMultipliers = (
  resolve: (description: Description, effect: number) => number
): { [key: string]: number } => {
  const multipliers: { [key: string]: number } = {};
  for (const source of effectSources()) {
    const effect = resolve(source.baseData.description, source.effect);
    if (effect != 1) {
      multipliers[source.name] = effect;
    }
  }
  return multipliers;
};

// Income descriptions come in three shapes: the global "Fishing Pay", a
// "<Region> Pay" whose first word is the task's category, and a
// "<Entity Name> Pay" naming exactly one fish. The latter two are rules rather
// than one case per entity, so adding a new target needs no edit here.
export const getIncomeMultipliers = (task: Task): { [key: string]: number } =>
  collectMultipliers((description, effect) => {
    if (description == "Fishing Pay") return effect;
    if (!description.endsWith(PAY_SUFFIX)) return 1;
    const target = description.slice(0, -PAY_SUFFIX.length);
    if (target.toLowerCase() == task.baseData.category) return effect;
    if (target == task.name) return effect;
    return 1;
  });

// The five broad kinds need their own handling; everything else is either
// "<Region> Xp" or "<Entity Name> Xp" and falls through to the rule below.
export const getXpMultipliers = (task: Task): { [key: string]: number } =>
  collectMultipliers((description, effect) => {
    switch (description) {
      case "All Xp":
        return effect;
      case "Fishing Xp":
        return task instanceof Fishing ? effect : 1;
      case "Skill Xp":
        return task instanceof Skill ? effect : 1;
      case "Fishing Skill Xp":
        return task instanceof Skill && task.baseData.category == CATEGORY.FISHING
          ? effect
          : 1;
      case "Boating Xp":
        return task instanceof Skill && task.baseData.category == CATEGORY.BOATING
          ? effect
          : 1;
    }
    if (!description.endsWith(XP_SUFFIX)) return 1;
    const target = description.slice(0, -XP_SUFFIX.length);
    if (target.toLowerCase() == task.baseData.category) return effect;
    if (target == task.name) return effect;
    return 1;
  });

// Applies uniformly to every item's running expense (there's no per-item
// targeting like the income/xp multipliers above), mirroring how Progress
// Knight's "Intimidation" skill discounts every item's expense.
export const getExpenseMultipliers = (): { [key: string]: number } =>
  collectMultipliers((description, effect) =>
    description == "Expenses" ? effect : 1
  );

export function coinAmounts(coins: number): {
  r: number;
  p: number;
  g: number;
  s: number;
  c: number;
} {
  let coinsObj: any = {};
  if (coins < 0) {
    return { r: 0, p: 0, g: 0, s: 0, c: 0 };
  }

  let tiers = ["r", "p", "g", "s"];
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
  for (let key in dict) {
    if (!(key in saveDict)) {
      saveDict[key] = dict[key];
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
    let saved = saveMap.get(key);
    if (!saved) {
      // Item didn't exist yet when this save was made - keep the fresh
      // default instance (already created from the current itemBaseData).
      saveMap.set(key, val);
      return;
    }
    let { expenseMultipliers, level } = saved;
    // `selected` is the one bit of real per-save state living on baseData;
    // everything else (expense, effect, description, upgradePrice) always
    // comes from the current code, not a potentially stale save, so
    // balance/data changes take effect without needing a save reset.
    let baseData = { ...val.baseData, selected: saved.baseData.selected };
    saveMap.set(key, new Item(baseData, expenseMultipliers, level));
  });
  return saveMap;
}
export function replaceSavedBoats(
  map: Map<string, Boat>,
  saveMap: Map<string, Boat>
) {
  map.forEach((val, key) => {
    let saved = saveMap.get(key);
    if (!saved) {
      saveMap.set(key, val);
      return;
    }
    // Same reasoning as replaceSavedItems above: `bought` is real save
    // state, price/name always come from the current code.
    let baseData = { ...val.baseData, bought: saved.baseData.bought };
    saveMap.set(key, new Boat(baseData));
  });
  return saveMap;
}

export function replaceSavedFishing(
  map: Map<string, Fishing>,
  saveMap: Map<string, Fishing>
) {
  map.forEach((val, key) => {
    let saved = saveMap.get(key);
    if (!saved) {
      saveMap.set(key, val);
      return;
    }
    let { level, maxLevel, xp, xpMultipliers, incomeMultipliers } = saved;
    // baseData comes from the live instance (current code), not the save,
    // so balance/data changes (income, maxXp, description, ...) take
    // effect without needing a save reset.
    saveMap.set(
      key,
      new Fishing(
        val.baseData,
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
    let saved = saveMap.get(key);
    if (!saved) {
      // Skill didn't exist yet when this save was made (e.g. Immortality,
      // Time Warping, the legend line) - keep the fresh default instance
      // instead of crashing on a missing save entry.
      saveMap.set(key, val);
      return;
    }
    let { level, maxLevel, xp, xpMultipliers } = saved;
    // Time Warping needs its logarithmic effect override (see
    // classes.svelte.ts) to survive a reload, not the plain Skill formula.
    let SkillClass = key === SKILL.TIME_WARPING ? TimeWarping : Skill;
    // baseData comes from the live instance (current code), not the save -
    // same reasoning as replaceSavedFishing above.
    saveMap.set(key, new SkillClass(val.baseData, level, maxLevel, xp, xpMultipliers));
  });
  return saveMap;
}

export function replaceSavedRequirements(
  map: Map<string, Requirement[]>,
  saveMap: Map<string, Requirement[]>
) {
  map.forEach((liveReqs, key) => {
    // Requirement *thresholds* always come from the current code, never from
    // the save - same reasoning as replaceSavedFishing/replaceSavedSkills
    // above, so balance changes to the unlock graph take effect without a
    // save reset. Previously this rebuilt each Requirement from the saved
    // `req.requirements`, which pinned every existing save to whatever gate
    // values were in force when it was written.
    //
    // `completed` is a pure cache over current game state (see
    // Requirement.isCompleted), so clearing it just makes the next read
    // re-derive it - which is also what the old code did, since the
    // constructors it called all reset `completed` to false.
    liveReqs.forEach((req) => {
      req.completed = false;
    });
    saveMap.set(key, liveReqs);
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
    // Time Warping needs its logarithmic effect override (see
    // classes.svelte.ts) instead of the plain Skill formula.
    data.set(
      entity.name,
      entity.name === SKILL.TIME_WARPING ? new TimeWarping(entity) : new Skill(entity)
    );
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
  let rawSave = localStorage.getItem("GameDataSave");
  let GameDataSave = rawSave ? JSON.parse(rawSave, reviver) : null;

  if (GameDataSave !== null) {
    replaceSaveDict(gameState, GameDataSave);
    replaceSavedRequirements(gameState.requirements, GameDataSave.requirements);
    replaceSavedFishing(gameState.fishingData, GameDataSave.fishingData);
    replaceSavedSkills(gameState.skillsData, GameDataSave.skillsData);
    replaceSavedItems(gameState.itemData, GameDataSave.itemData);
    replaceSavedBoats(gameState.boatData, GameDataSave.boatData);
    setGameData(GameDataSave);
  }
}

export function resetGameData() {
  localStorage.clear();
  location.reload();
}
