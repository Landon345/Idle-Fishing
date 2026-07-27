import type { Description } from "src/Entities";
import {
  applySpeed,
  applyMultipliers,
  getXpMultipliers,
  getIncomeMultipliers,
} from "./functions";
import { getGameData, subtractCoins } from "./gameData.svelte";

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
  level = $state(0);
  maxLevel = $state(0);
  xp = $state(0);
  // Recomputed fresh on every read inside the `xpGain` getter below, so this
  // is a plain cache field, not `$state`: reassigning it from a getter that
  // runs during rendering would otherwise trip Svelte's "unsafe mutation
  // during derivation" guard.
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
    return applyMultipliers(10, this.xpMultipliers) * this.maxLevelMultiplier;
  }

  get barWidth(): number {
    return ((this.maxXp - this.xpLeft) / this.maxXp) * 100;
  }

  increaseXp(deltaSeconds: number) {
    this.xp += applySpeed(this.xpGain, deltaSeconds);
    if (this.xp >= this.maxXp) {
      let excess = this.xp - this.maxXp;
      while (excess >= 0) {
        this.level += 1;
        excess -= this.maxXp;
      }
      this.xp = this.maxXp + excess;
    }
  }

  // `$state` class fields compile to non-enumerable accessors, so
  // JSON.stringify silently drops level/maxLevel/xp without this.
  toJSON() {
    return {
      baseData: this.baseData,
      name: this.name,
      level: this.level,
      maxLevel: this.maxLevel,
      xp: this.xp,
      xpMultipliers: this.xpMultipliers,
    };
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
    return (
      applyMultipliers(this.baseData.income, this.incomeMultipliers) *
      this.levelMultiplier
    );
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

  toJSON() {
    return { ...super.toJSON(), incomeMultipliers: this.incomeMultipliers };
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
  } = $state(undefined as any);
  level = $state(0);
  name: string;
  expenseMultipliers: { [key: string]: number } = $state({});
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
    if (this.upgradePrice <= getGameData().coins) {
      subtractCoins(this.upgradePrice);
      this.level += 1;
    }
  }

  // `$state` class fields compile to non-enumerable accessors, so
  // JSON.stringify silently drops baseData/level without this.
  toJSON() {
    return {
      baseData: this.baseData,
      name: this.name,
      level: this.level,
      expenseMultipliers: this.expenseMultipliers,
    };
  }
}

export class Boat {
  name: string;
  baseData: { name: string; price: number; bought: boolean } = $state(
    undefined as any
  );
  constructor(baseData) {
    this.baseData = baseData;
    this.name = baseData.name;
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

  // `$state` class fields compile to non-enumerable accessors, so
  // JSON.stringify silently drops baseData without this.
  toJSON() {
    return { baseData: this.baseData, name: this.name };
  }
}

// Requirement classes live in gameData.svelte.ts: they're constructed eagerly
// at module-evaluation time (inside the `requirements` map literal), so they
// can't depend on a class declared in a module that in turn imports back from
// here without risking a "cannot access before initialization" cycle.
