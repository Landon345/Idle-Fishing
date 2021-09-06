import type { Description, RequirementObj } from "src/Entities";
import {
  applySpeed,
  daysToYears,
  applyMultipliers,
  getXpMultipliers,
  getIncomeMultipliers,
} from "./functions";
import { getGameData, subtractCoins } from "./gameData";

export class Task {
  baseData: {
    name: string;
    income: number;
    maxXp: number;
    effect: number;
    description: Description;
    category: string;
  };
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  xpMultipliers: { [key: string]: number }; // {"Book": 1.5, "Concentration": 1.02}

  constructor(baseData, level = 0, maxLevel = 0, xp = 0, xpMultipliers = {}) {
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
    this.xpMultipliers = getXpMultipliers(this);
    return applyMultipliers(10, this.xpMultipliers);
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
  incomeMultipliers: { [key: string]: number }; // {"Black Drum": 1.05, "Blue Marlin": 1.01}
  constructor(
    baseData,
    level = 0,
    maxLevel = 0,
    xp = 0,
    xpMultipliers = {},
    incomeMultipliers = {}
  ) {
    super(baseData, level, maxLevel, xp, xpMultipliers);
    this.incomeMultipliers = incomeMultipliers;
  }

  get levelMultiplier() {
    let levelMultiplier = 1 + Math.log10(this.level + 1);
    return levelMultiplier;
  }

  get income() {
    this.incomeMultipliers = getIncomeMultipliers(this);
    return applyMultipliers(this.baseData.income, this.incomeMultipliers);
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
  constructor(baseData, level = 0, maxLevel = 0, xp = 0, xpMultipliers = {}) {
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
    description: Description;
    expense: number;
    selected: boolean;
    upgradePrice: number;
  };
  level: number;
  name: string;
  expenseMultipliers: { [key: string]: number };
  constructor(baseData, expenseMultipliers = {}, level = 0) {
    this.baseData = baseData;
    this.name = baseData.name;
    this.expenseMultipliers = expenseMultipliers;
    this.level = level;
  }

  get selected() {
    return this.baseData.selected;
  }

  select() {
    this.baseData.selected = !this.baseData.selected;
  }

  deselect() {
    this.baseData.selected = false;
  }

  get upgradePrice() {
    return this.baseData.upgradePrice * Math.pow(2, 0.5 * this.level);
  }

  get effect() {
    if (!this.selected) return 1;
    let effect = this.baseData.effect * (1 + this.level / 100);
    return effect;
  }

  get effectDescription() {
    let description = this.baseData.description;
    let text = "x" + String(this.effect.toFixed(2)) + " " + description;
    return text;
  }

  get expense() {
    return applyMultipliers(this.baseData.expense, this.expenseMultipliers);
  }

  upgrade() {
    if (this.baseData.upgradePrice <= getGameData().coins) {
      subtractCoins(this.upgradePrice);
      this.level += 1;
    }
  }
}

export class Boat {
  baseData: { name: string; price: number; bought: boolean };
  constructor(baseData) {
    this.baseData = baseData;
  }

  get bought() {
    return this.baseData.bought;
  }

  buy() {
    if (this.bought) {
      return;
    }
    if (this.baseData.price <= getGameData().coins) {
      subtractCoins(this.baseData.price);
      this.baseData.bought = true;
    }
  }
}

export class Requirement {
  requirements: RequirementObj[];
  completed: boolean;
  type: string;
  constructor(requirements, type) {
    this.requirements = requirements;
    this.completed = false;
    this.type = type;
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
  constructor(requirements: RequirementObj[]) {
    super(requirements, "fishing");
  }
  getCondition(requirement) {
    return (
      getGameData().fishingData.get(requirement.name).level >=
      requirement.requirement
    );
  }
}

export class SkillRequirement extends Requirement {
  constructor(requirements) {
    super(requirements, "skill");
  }
  getCondition(requirement) {
    return (
      getGameData().skillsData.get(requirement.name).level >=
      requirement.requirement
    );
  }
}

export class CoinRequirement extends Requirement {
  constructor(requirements) {
    super(requirements, "coins");
  }

  getCondition(requirement) {
    return getGameData().coins >= requirement.requirement;
  }
}

export class AgeRequirement extends Requirement {
  constructor(requirements) {
    super(requirements, "age");
  }

  getCondition(requirement) {
    return daysToYears(getGameData().day) >= requirement.requirement;
  }
}
export class BoatRequirement extends Requirement {
  constructor(requirements) {
    super(requirements, "boat");
  }

  getCondition(requirement) {
    return getGameData().boatData >= requirement.requirement;
  }
}

export class EvilRequirement extends Requirement {
  constructor(requirements) {
    super(requirements, "evil");
  }

  getCondition(requirement) {
    return getGameData().evil >= requirement.requirement;
  }
}
