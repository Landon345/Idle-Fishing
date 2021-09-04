import type { GameDataType } from "src/Entities";
import { applySpeed, daysToYears } from "./functions";
import { GameData, getGameData, itemCategories } from "./gameData";

export class Task {
  baseData: {
    name: string;
    income: number;
    maxXp: number;
    effect: number;
    description: string;
    category: string;
  };
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  xpMultipliers: number[];

  constructor(baseData, level = 0, maxLevel = 0, xp = 0, xpMultipliers = []) {
    this.baseData = baseData;
    this.name = baseData.name;
    this.level = level;
    this.maxLevel = maxLevel;
    this.xp = xp;

    this.xpMultipliers = xpMultipliers;
  }

  get maxXp(): number {
    let maxXp = Math.round(
      this.baseData.maxXp * (this.level + 1) * Math.pow(1.01, this.level)
    );
    return maxXp;
  }

  get xpLeft(): number {
    return Math.round(this.maxXp - this.xp);
  }

  get maxLevelMultiplier() {
    let maxLevelMultiplier = 1 + this.maxLevel / 10;
    return maxLevelMultiplier;
  }

  get xpGain() {
    // return applyMultipliers(10, this.xpMultipliers);
    return 10;
  }

  increaseXp() {
    this.xp += applySpeed(this.xpGain);
    if (this.xp >= this.maxXp) {
      let excess = this.xp - this.maxXp;
      while (excess >= 0) {
        this.level += 1;
        excess -= this.maxXp;
      }
      this.xp = this.maxXp + excess;
    }
  }
}

export class Fishing extends Task {
  incomeMultipliers: number[];
  constructor(
    baseData,
    level = 0,
    maxLevel = 0,
    xp = 0,
    xpMultipliers = [],
    incomeMultipliers = []
  ) {
    super(baseData, level, maxLevel, xp, xpMultipliers);
    this.incomeMultipliers = incomeMultipliers;
  }

  get levelMultiplier() {
    let levelMultiplier = 1 + Math.log10(this.level + 1);
    return levelMultiplier;
  }

  get income() {
    // return applyMultipliers(this.baseData.income, this.incomeMultipliers);
    return this.baseData.income;
  }

  get effect() {
    let effect = 1 + this.baseData.effect * this.level;
    return effect;
  }

  get effectDescription() {
    let description = this.baseData.description;
    let text = "x" + String(this.effect.toFixed(2)) + " " + description;
    return text;
  }
}

export class Skill extends Task {
  constructor(baseData, level = 0, maxLevel = 0, xp = 0, xpMultipliers = []) {
    super(baseData, level, maxLevel, xp, xpMultipliers);
  }

  get effect() {
    let effect = 1 + this.baseData.effect * this.level;
    return effect;
  }

  get effectDescription() {
    let description = this.baseData.description;
    let text = "x" + String(this.effect.toFixed(2)) + " " + description;
    return text;
  }
}

export class Item {
  baseData: {
    name: string;
    effect: number;
    description: string;
    expense: number;
  };
  name: string;
  expenseMultipliers: number[];
  constructor(baseData, expenseMultipliers = []) {
    this.baseData = baseData;
    this.name = baseData.name;
    this.expenseMultipliers = expenseMultipliers;
  }

  getEffect() {
    if (!getGameData().currentMisc.includes(this)) return 1;
    let effect = this.baseData.effect;
    return effect;
  }

  getEffectDescription() {
    let description = this.baseData.description;
    if (itemCategories["Properties"].includes(this.name))
      description = "Happiness";
    let text = "x" + this.baseData.effect.toFixed(1) + " " + description;
    return text;
  }

  getExpense() {
    // return applyMultipliers(this.baseData.expense, this.expenseMultipliers);
    return this.baseData.expense;
  }
}

export class Boat {
  baseData: { name: string; price: number; bought: boolean };
  constructor(baseData) {
    this.baseData = baseData;
  }

  buy() {}
}

export class Requirement {
  requirements: Object[];
  completed: boolean;
  constructor(requirements) {
    this.requirements = requirements;
    this.completed = false;
  }
  getCondition(requirement) {
    return false;
  }

  isCompleted() {
    if (this.completed) {
      return true;
    }
    for (let requirement of this.requirements) {
      if (!this.getCondition(requirement)) {
        return false;
      }
    }
    this.completed = true;
    return true;
  }
}

export class FishingRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "fishing";
  }
  getCondition(requirement) {
    return (
      getGameData().skillsData[requirement.fishing].level >=
      requirement.requirement
    );
  }
}

export class SkillRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "skill";
  }
  getCondition(requirement) {
    return (
      getGameData().skillsData[requirement.skill].level >=
      requirement.requirement
    );
  }
}

export class CoinRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "coins";
  }

  getCondition(requirement) {
    return getGameData().coins >= requirement.requirement;
  }
}

export class AgeRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "age";
  }

  getCondition(requirement) {
    return daysToYears(getGameData().day) >= requirement.requirement;
  }
}
export class BoatRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "boat";
  }

  getCondition(requirement) {
    return getGameData().boatData >= requirement.requirement;
  }
}

export class EvilRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "evil";
  }

  getCondition(requirement) {
    return getGameData().evil >= requirement.requirement;
  }
}
