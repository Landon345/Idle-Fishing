import { applyMultipliers, daysToYears } from "./functions";
import { GameData, itemCategories } from "./gameData";

export class Task {
  baseData: {
    maxXp: number;
    income: number;
    effect: number;
    description: string;
  };
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  xpMultipliers: number[];

  constructor(baseData) {
    this.baseData = baseData;
    this.name = baseData.name;
    this.level = 0;
    this.maxLevel = 0;
    this.xp = 0;

    this.xpMultipliers = [];
  }

  getMaxXp() {
    var maxXp = Math.round(
      this.baseData.maxXp * (this.level + 1) * Math.pow(1.01, this.level)
    );
    return maxXp;
  }

  getXpLeft() {
    return Math.round(this.getMaxXp() - this.xp);
  }

  getMaxLevelMultiplier() {
    var maxLevelMultiplier = 1 + this.maxLevel / 10;
    return maxLevelMultiplier;
  }

  getXpGain() {
    return applyMultipliers(10, this.xpMultipliers);
  }

  increaseXp() {
    this.xp += this.getXpGain();
    if (this.xp >= this.getMaxXp()) {
      var excess = this.xp - this.getMaxXp();
      while (excess >= 0) {
        this.level += 1;
        excess -= this.getMaxXp();
      }
      this.xp = this.getMaxXp() + excess;
    }
  }
}

export class Job extends Task {
  incomeMultipliers: number[];
  constructor(baseData) {
    super(baseData);
    this.incomeMultipliers = [];
  }

  getLevelMultiplier() {
    var levelMultiplier = 1 + Math.log10(this.level + 1);
    return levelMultiplier;
  }

  getIncome() {
    return applyMultipliers(this.baseData.income, this.incomeMultipliers);
  }
}

export class Skill extends Task {
  constructor(baseData) {
    super(baseData);
  }

  getEffect() {
    var effect = 1 + this.baseData.effect * this.level;
    return effect;
  }

  getEffectDescription() {
    var description = this.baseData.description;
    var text = "x" + String(this.getEffect().toFixed(2)) + " " + description;
    return text;
  }
}

export class Item {
  baseData: { effect: number; description: string; expense: number };
  name: string;
  expenseMultipliers: number[];
  constructor(baseData) {
    this.baseData = baseData;
    this.name = baseData.name;
    this.expenseMultipliers = [];
  }

  getEffect() {
    if (
      GameData.currentProperty != this &&
      !GameData.currentMisc.includes(this)
    )
      return 1;
    var effect = this.baseData.effect;
    return effect;
  }

  getEffectDescription() {
    var description = this.baseData.description;
    if (itemCategories["Properties"].includes(this.name))
      description = "Happiness";
    var text = "x" + this.baseData.effect.toFixed(1) + " " + description;
    return text;
  }

  getExpense() {
    return applyMultipliers(this.baseData.expense, this.expenseMultipliers);
  }
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

export class TaskRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "task";
  }

  getCondition(requirement) {
    return GameData.taskData[requirement.task].level >= requirement.requirement;
  }
}

export class CoinRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "coins";
  }

  getCondition(requirement) {
    return GameData.coins >= requirement.requirement;
  }
}

export class AgeRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "age";
  }

  getCondition(requirement) {
    return daysToYears(GameData.day) >= requirement.requirement;
  }
}

export class EvilRequirement extends Requirement {
  type: string;
  constructor(requirements) {
    super(requirements);
    this.type = "evil";
  }

  getCondition(requirement) {
    return GameData.evil >= requirement.requirement;
  }
}
