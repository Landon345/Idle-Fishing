import type { Description } from "src/Entities";
import {
  applySpeed,
  applyMultipliers,
  getBaseLog,
  getXpMultipliers,
  getIncomeMultipliers,
  getExpenseMultipliers,
} from "./functions";
import {
  getGameData,
  subtractCoins,
  hasFreeTackleSlot,
  BASE_XP_PER_DAY,
  CATEGORY,
  LEGEND_POINT_XP_BONUS,
  FISH_INCOME_LEVEL_EXPONENT,
  FISH_INCOME_LEVEL_SCALE,
  ITEM_EFFECT_GROWTH_PER_LEVEL,
  ITEM_EXPENSE_GROWTH_PER_LEVEL,
  ITEM_UPGRADE_PRICE_GROWTH_PER_LEVEL,
} from "./gameData.svelte";

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
    // 0.75x = xp requirements are ~25% lower than the base curve, i.e.
    // leveling is ~25% faster, per balance feedback. Applies to both
    // Fishing and Skill (both extend Task).
    let maxXp = Math.round(
      this.baseData.maxXp * 0.75 * (this.level + 1) * Math.pow(1.01, this.level)
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

  // Legend points are the only thing ascension never resets, so they - not
  // maxLevel, which ascension wipes - are what makes each ascension cycle
  // faster than the last. Applies to the legend line only, which is exactly
  // what re-grinding after an ascension costs you.
  get legendPointMultiplier(): number {
    if (this.baseData.category != CATEGORY.LEGEND) return 1;
    return 1 + getGameData().legendPoints * LEGEND_POINT_XP_BONUS;
  }

  get xpGain() {
    this.xpMultipliers = getXpMultipliers(this);
    return (
      applyMultipliers(BASE_XP_PER_DAY, this.xpMultipliers) *
      this.maxLevelMultiplier *
      this.legendPointMultiplier
    );
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

  // Income scales with a root of the fish's level rather than its logarithm.
  // log10 gave only 3x at level 100 and 4x at level 1000, so a fish's income
  // was set almost entirely by *which* fish it was - "stay here and earn
  // versus push to the next fish" was never a real question. The tier gap
  // still dwarfs this (Sun Fish pays 5/day, Whale 3.2M), so levelling is now
  // worth doing without ever making a shallow fish out-earn a deep one.
  get levelMultiplier() {
    return (
      1 + Math.pow(this.level, FISH_INCOME_LEVEL_EXPONENT) * FISH_INCOME_LEVEL_SCALE
    );
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

// Mirrors Progress Knight's "Time warping" skill: a deliberately slow,
// logarithmic (not linear) game-speed multiplier, since a normal +1%/level
// effect would run away exponentially applied to speed itself.
export class TimeWarping extends Skill {
  get effect() {
    return 1 + getBaseLog(13, this.level + 1);
  }
}

// "Old Haggler" discounts expenses, so its effect has to decay towards zero
// rather than grow. The standard `1 + effect * level` with a negative effect
// hit exactly 0 at level 100 - every item permanently free, and negative
// beyond that - which the Math.max(0, ...) in Item.expense only papered over.
// Compounding decay asymptotes instead, so the discount is always worth more
// but never total.
export class ExpenseDiscount extends Skill {
  get effect() {
    return Math.pow(this.baseData.effect, this.level);
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
  // Recomputed fresh on every read inside the `expense` getter below, so
  // this is a plain cache field, not `$state` (same reasoning as
  // Task.xpMultipliers above).
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

  // Unequipping is always allowed; equipping needs a free tackle slot. The
  // guard lives here rather than in the UI so every caller is covered.
  select() {
    if (!this.selected && !hasFreeTackleSlot()) return;
    this.baseData.selected = !this.baseData.selected;
  }

  deselect() {
    this.baseData.selected = false;
  }

  get upgradePrice() {
    return (
      this.baseData.upgradePrice *
      Math.pow(ITEM_UPGRADE_PRICE_GROWTH_PER_LEVEL, this.level)
    );
  }

  get effect() {
    if (!this.selected) return 1;
    // Exponential compounding per level instead of the old flat +1% per
    // level, so upgrades keep paying off at higher levels instead of
    // flattening out relative to the exponential upgradePrice curve above.
    let effect =
      this.baseData.effect * Math.pow(ITEM_EFFECT_GROWTH_PER_LEVEL, this.level);
    return effect;
  }

  get effectDescription() {
    let description = this.baseData.description;
    let text = "x" + String(this.effect.toFixed(2)) + " " + description;
    return text;
  }

  get expense() {
    this.expenseMultipliers = getExpenseMultipliers();
    // Running cost rises with the item's level, more slowly than `effect`
    // above does (1.015 vs 1.02). Previously expense ignored level entirely,
    // so an upgrade was pure upside for a one-off cost and the answer was
    // always "yes, when affordable" - not a decision. Now upgrading a big
    // item pressures your income and can force you to switch another off.
    let expense =
      this.baseData.expense *
      Math.pow(ITEM_EXPENSE_GROWTH_PER_LEVEL, this.level);
    // Floored at 0: "Old Haggler" discounts expenses by a flat amount per
    // level and would otherwise flip expenses negative (i.e. pay you to
    // hold items) at very high levels.
    return Math.max(0, applyMultipliers(expense, this.expenseMultipliers));
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
  baseData: {
    name: string;
    price: number;
    bought: boolean;
    effect: number;
    description: Description;
  } = $state(undefined as any);
  constructor(baseData) {
    this.baseData = baseData;
    this.name = baseData.name;
  }

  get bought() {
    return this.baseData.bought;
  }

  // Unlike Task and Item, a boat has no level: its multiplier is flat, and
  // applies only once the boat is actually bought. Boats used to carry no
  // effect at all, which made them pure paywalls.
  get effect() {
    return this.bought ? this.baseData.effect : 1;
  }

  get effectDescription() {
    return "x" + String(this.effect.toFixed(2)) + " " + this.baseData.description;
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
