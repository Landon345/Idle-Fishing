import { daysToYears } from "./functions";
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
    let maxXp = Math.round(
      this.baseData.maxXp * (this.level + 1) * Math.pow(1.01, this.level)
    );
    return maxXp;
  }

  getXpLeft() {
    return Math.round(this.getMaxXp() - this.xp);
  }

  getMaxLevelMultiplier() {
    let maxLevelMultiplier = 1 + this.maxLevel / 10;
    return maxLevelMultiplier;
  }

  getXpGain() {
    // return applyMultipliers(10, this.xpMultipliers);
    return 10;
  }

  increaseXp() {
    this.xp += this.getXpGain();
    if (this.xp >= this.getMaxXp()) {
      let excess = this.xp - this.getMaxXp();
      while (excess >= 0) {
        this.level += 1;
        excess -= this.getMaxXp();
      }
      this.xp = this.getMaxXp() + excess;
    }
  }
}

export class Fishing extends Task {
  incomeMultipliers: number[];
  constructor(baseData) {
    super(baseData);
    this.incomeMultipliers = [];
  }

  getLevelMultiplier() {
    let levelMultiplier = 1 + Math.log10(this.level + 1);
    return levelMultiplier;
  }

  getIncome() {
    // return applyMultipliers(this.baseData.income, this.incomeMultipliers);
    return this.baseData.income;
  }
}

export class Skill extends Task {
  constructor(baseData) {
    super(baseData);
  }

  getEffect() {
    let effect = 1 + this.baseData.effect * this.level;
    return effect;
  }

  getEffectDescription() {
    let description = this.baseData.description;
    let text = "x" + String(this.getEffect().toFixed(2)) + " " + description;
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
    if (!GameData.currentMisc.includes(this)) return 1;
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
      GameData.skillsData[requirement.fishing].level >= requirement.requirement
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
      GameData.skillsData[requirement.skill].level >= requirement.requirement
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
