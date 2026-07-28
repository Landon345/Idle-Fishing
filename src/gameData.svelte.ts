import {
  applySpeed,
  daysToYears,
  getTotalExpenses,
  lowestLevelSkill,
  roundRobinFish,
} from "src/functions";

import type {
  BoatBaseData,
  Description,
  FishBaseData,
  GameDataType,
  ItemBaseData,
  RequirementObj,
  SkillBaseData,
} from "src/Entities";

// ═══════════════════════════════════════════════════════════════════════════
//  BALANCE CONSTANTS
//
//  Every tunable value lives in this block. The data tables further down are
//  *built* from these, so a balance pass means editing here rather than
//  hunting literals through a thousand lines of map entries.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Time & lifespan ───────────────────────────────────────────────────────
export const DAYS_PER_YEAR = 365;
// calculatedAge() displays STARTING_AGE + years-elapsed, so a fresh game
// (day: 0) already reads "Age 14".
export const STARTING_AGE = 14;
const BASE_LIFESPAN_YEARS = 56;
// The natural, unmodified end of life: displayed "Age 70".
export const baseLifespan = DAYS_PER_YEAR * BASE_LIFESPAN_YEARS;
export const baseGameSpeed = 10;
// How long autoFish spends on one region before rotating to the next. At the
// base game speed of 10 days/second this is ~3 real seconds per region.
export const AUTO_FISH_ROTATION_DAYS = 30;

// ─── Categories ────────────────────────────────────────────────────────────
// These strings key both the base-data tables and the per-category multiplier
// switches in functions.ts, and are used as UI section headers.
export const CATEGORY = {
  LAKE: "lake",
  RIVER: "river",
  OCEAN: "ocean",
  FUNDAMENTALS: "fundamentals",
  FISHING: "fishing",
  BOATING: "boating",
  IMMORTALITY: "immortality",
  LEGEND: "legend",
} as const;

// ─── Effect descriptions ───────────────────────────────────────────────────
// Each string is matched by the `kind()` helpers in functions.ts to decide what
// an entity's effect actually multiplies. A typo here silently produces an
// entity whose effect does nothing, which is why they're named.
//
// The strings are structured, not arbitrary: a trailing " Xp"/" Pay" marks what
// is multiplied, and the text before it names either a region (matched against
// a task's category) or one entity. Adding a "<Skill> Xp" therefore needs an
// entry here and in the Description union - no switch case.
const DESC = {
  // Broad - the four special cases in getXpMultipliers.
  ALL_XP: "All Xp",
  FISHING_XP: "Fishing Xp",
  SKILL_XP: "Skill Xp",
  FISHING_SKILL_XP: "Fishing Skill Xp",
  BOATING_XP: "Boating Xp",
  // Region xp.
  LAKE_XP: "Lake Xp",
  RIVER_XP: "River Xp",
  OCEAN_XP: "Ocean Xp",
  // Single-skill xp. Every skill that gates a fish has one, so each fish can
  // point forward at whatever unlocks the fish after it.
  STRENGTH_XP: "Strength Xp",
  CONCENTRATION_XP: "Concentration Xp",
  INTELLIGENCE_XP: "Intelligence Xp",
  PATIENCE_XP: "Patience Xp",
  AMBITION_XP: "Ambition Xp",
  COMMUNICATION_XP: "Communication Xp",
  CASTING_XP: "Casting Xp",
  JIGGING_XP: "Jigging Xp",
  TROLLING_XP: "Trolling Xp",
  REELING_XP: "Reeling Xp",
  HOOKING_XP: "Hooking Xp",
  NETTING_XP: "Netting Xp",
  WHALING_XP: "Whaling Xp",
  DOCKING_XP: "Docking Xp",
  TURNING_XP: "Turning Xp",
  ANCHORING_XP: "Anchoring Xp",
  SAILING_XP: "Sailing Xp",
  NAVIGATION_XP: "Navigation Xp",
  STABILITY_XP: "Stability Xp",
  // Single-fish xp.
  SILVER_DRUM_XP: "Silver Drum Xp",
  // Income.
  FISHING_PAY: "Fishing Pay",
  LAKE_PAY: "Lake Pay",
  RIVER_PAY: "River Pay",
  OCEAN_PAY: "Ocean Pay",
  PAYARA_PAY: "Payara Pay",
  NORTHERN_PIKE_PAY: "Northern Pike Pay",
  WHALE_PAY: "Whale Pay",
  // Everything else.
  EXPENSES: "Expenses",
  LEGEND_POINT_GAIN: "Legend Point Gain",
  LONGER_LIFESPAN: "Longer Lifespan",
  GAMESPEED: "Gamespeed",
} as const satisfies Record<string, Description>;

// ─── Entity names ──────────────────────────────────────────────────────────
// Names are the join key between the base-data tables, the requirement graph,
// and every `.get(...)` lookup in the codebase, so they're named rather than
// repeated as bare strings.
export const FISH = {
  SUN_FISH: "Sun Fish",
  PERCH: "Perch",
  BASS: "Bass",
  TROUT: "Trout",
  WALEYE: "Waleye",
  NORTHERN_PIKE: "Northern Pike",
  LAKE_STURGEON: "Lake Sturgeon",
  PIRANA: "Pirana",
  SALMON: "Salmon",
  SILVER_DRUM: "Silver Drum",
  ARMOURED_CATFISH: "Armoured Catfish",
  ELECTRIC_EEL: "Electric Eel",
  PACU: "Pacu",
  PAYARA: "Payara",
  COD: "Cod",
  MACKEREL: "Mackerel",
  ANGLE_FISH: "Angle Fish",
  GROUPER: "Grouper",
  STINGRAY: "Stingray",
  BARRACUDA: "Barracuda",
  BLUEFIN_TUNA: "Bluefin Tuna",
  BLUE_MARLIN: "Blue Marlin",
  SWORDFISH: "Swordfish",
  SHARK: "Shark",
  WHALE: "Whale",
} as const;

export const SKILL = {
  STRENGTH: "Strength",
  CONCENTRATION: "Concentration",
  INTELLIGENCE: "Intelligence",
  PATIENCE: "Patience",
  AMBITION: "Ambition",
  COMMUNICATION: "Communication",
  CASTING: "Casting",
  JIGGING: "Jigging",
  TROLLING: "Trolling",
  REELING: "Reeling",
  HOOKING: "Hooking",
  NETTING: "Netting",
  WHALING: "Whaling",
  DOCKING: "Docking",
  TURNING: "Turning",
  ANCHORING: "Anchoring",
  SAILING: "Sailing",
  NAVIGATION: "Navigation",
  STABILITY: "Stability",
  IMMORTALITY: "Immortality",
  SUPER_IMMORTALITY: "Super Immortality",
  TIME_WARPING: "Time Warping",
  SEA_LEGEND: "Sea Legend",
  TIDAL_FOCUS: "Tidal Focus",
  OLD_HAGGLER: "Old Haggler",
  WEATHERED_INSTINCT: "Weathered Instinct",
  DEEP_MEDITATION: "Deep Meditation",
  SUNKEN_FORTUNE: "Sunken Fortune",
} as const;

export const BOAT = {
  ROW_BOAT: "Row Boat",
  SILVER_BULLET: "Silver Bullet",
  BASS_BOAT: "Bass Boat",
  CANOE: "Canoe",
  RIVER_SKIFF: "River Skiff",
  AIRBOAT: "Airboat",
  SAIL_BOAT: "Sail Boat",
  YACHT: "Yacht",
  WHALING_SHIP: "Whaling Ship",
} as const;

export const ITEM = {
  ROD: "Rod",
  BOOK: "Book",
  NET: "Net",
  HOOK: "Hook",
  BAIT: "Bait",
  HAM_SANDWICH: "Ham Sandwich",
  PLIERS: "Pliers",
  FISH_FINDER: "Fish Finder",
  HOUSE: "House",
} as const;

// Display labels for the two currency requirements. Not entity names - the
// requirement machinery only reads `requirement`, but RequiredBar renders
// these.
const COIN_LABEL = "Coins";
const LEGEND_LABEL = "Legend Points";

// ─── Effect magnitudes ─────────────────────────────────────────────────────
// `effect = 1 + EFFECT * level` (see Task.effect). Previously *every* fish and
// skill shared 0.01, so a Whale level (base xp 10^13) paid exactly what a
// Strength level (base xp 100) paid. These bands scale the payoff with the
// xp cost band the entity sits in, so deep content is worth grinding.
const EFFECT = {
  // Fundamentals + lake: the tutorial band. Cheap levels, small effects.
  BASIC: 0.01,
  // Fishing skills + river: ~3x the xp cost of BASIC, ~2x the payoff.
  ADEPT: 0.02,
  // Boating skills + early ocean: ~5x the xp cost, ~5x the payoff.
  DEEP: 0.05,
  // Mid ocean.
  DEEPER: 0.1,
  // Late ocean.
  ABYSSAL: 0.25,
  // Apex (Shark, Whale): the "All Xp" payoff that carries the endgame.
  APEX: 0.5,
  // Lifespan and legend lines deliberately keep the old 0.01 band: retuning
  // them means retuning the rebirth/ascension economy alongside, which is a
  // separate pass.
  LIFESPAN: 0.01,
  LEGEND: 0.01,
  LEGEND_PAY: 0.002,
  EXPENSE_DISCOUNT: -0.01,
  // Time Warping overrides `effect` with a logarithmic formula (see
  // TimeWarping in classes.svelte.ts), so its base value is never read.
  UNUSED: 0,
};

// ─── Fish xp curves ────────────────────────────────────────────────────────
// A fish's base maxXp is `base * growth^tier` within its region, replacing
// three inconsistent hand-written curves (lake stepped 2x/tier, river and
// ocean stepped 10x/tier, and the last three ocean fish were all flat at
// 10^13). 10x/tier over 11 ocean fish put Shark/Whale beyond any reachable
// xp total; a regular ~3x keeps the endgame steep but finite.
const REGION_XP: Record<string, { base: number; growth: number }> = {
  [CATEGORY.LAKE]: { base: 50, growth: 2 },
  [CATEGORY.RIVER]: { base: 100, growth: 5 },
  [CATEGORY.OCEAN]: { base: 250_000, growth: 3 },
};

const regionXp = (region: string, tier: number): number => {
  const { base, growth } = REGION_XP[region];
  return Math.round(base * Math.pow(growth, tier));
};

// ─── Skill xp curves ───────────────────────────────────────────────────────
// Previously every skill shared a base of 100 regardless of how deep in the
// tree it sat. Tiering the base is what lets the level *gates* below come
// down without making the skills themselves trivial.
const SKILL_XP: Record<string, number> = {
  [CATEGORY.FUNDAMENTALS]: 100,
  [CATEGORY.FISHING]: 300,
  [CATEGORY.BOATING]: 500,
  // Unchanged: these two lines drive the reset loop itself, and slowing them
  // without reworking rebirth/ascension would stall progression.
  [CATEGORY.IMMORTALITY]: 100,
  [CATEGORY.LEGEND]: 100,
};

// ─── Unlock gates ──────────────────────────────────────────────────────────
// Level a fish must reach before the next fish in its region unlocks.
const NEXT_FISH_LEVEL = 10;
// A deeper fish gate, used where a skill unlocks off fishing progress.
const FISH_ADEPT_LEVEL = 15;

// Skill level gates, as one deliberate ladder rather than ad-hoc numbers.
// Task.maxXp carries a 1.01^level term, so cost per level roughly triples
// every +100 levels past ~200: the old ocean gates of 1000-2500 cost upwards
// of 10^16 xp for a *single* level and were unreachable in any number of
// lives. The ladder therefore tops out at MYTHIC (500).
const GATE = {
  DABBLING: 10,
  NOVICE: 20,
  APPRENTICE: 30,
  COMPETENT: 40,
  PROFICIENT: 50,
  SKILLED: 60,
  PRACTISED: 80,
  ACCOMPLISHED: 100,
  SEASONED: 120,
  VETERAN: 150,
  EXPERT: 200,
  MASTER: 250,
  GRANDMASTER: 300,
  RENOWNED: 350,
  ELITE: 400,
  LEGENDARY: 450,
  MYTHIC: 500,
};

// Legend-point thresholds for the legend skill line. Left at their original
// values - the legend-point *economy* (flat 1 point per ascension) needs
// fixing before these thresholds mean anything.
const LEGEND_GATE = {
  INITIATE: 1,
  VETERAN: 25,
  DEEP: 75,
  APEX: 500,
};

// ─── Boats ─────────────────────────────────────────────────────────────────
// `revealAt` is the coin total that makes the boat visible in the shop;
// `price` is what it costs. From Canoe onward revealAt currently sits well
// *above* price, so those boats only appear once already affordable - a
// separate pass.
const BOATS: { name: string; price: number; revealAt: number }[] = [
  { name: BOAT.ROW_BOAT, price: 600, revealAt: 500 },
  { name: BOAT.SILVER_BULLET, price: 3_000, revealAt: 1_000 },
  { name: BOAT.BASS_BOAT, price: 60_000, revealAt: 50_000 },
  { name: BOAT.CANOE, price: 200_000, revealAt: 500_000 },
  { name: BOAT.RIVER_SKIFF, price: 600_000, revealAt: 1_000_000 },
  { name: BOAT.AIRBOAT, price: 1_800_000, revealAt: 5_000_000 },
  { name: BOAT.SAIL_BOAT, price: 5_400_000, revealAt: 10_000_000 },
  { name: BOAT.YACHT, price: 16_200_000, revealAt: 50_000_000 },
  { name: BOAT.WHALING_SHIP, price: 60_000_000, revealAt: 500_000_000 },
];

// ─── Items ─────────────────────────────────────────────────────────────────
// `expense` is charged per day while the item is selected. The ladder runs
// narrow-and-cheap to broad-and-expensive, and no two items share a target -
// previously Book, Pliers and Fish Finder all bought "Skill Xp", which made
// Fish Finder strictly dominated (10x the cost of Pliers for a *smaller*
// multiplier on the same thing) rather than a choice.
//
// Item.upgradePrice compounds from a base of ITEM_UPGRADE_PRICE_DAYS days of
// the item's own expense, so the upgrade ladder stays proportional to what the
// item costs to run instead of being hand-set per item.
export const ITEM_UPGRADE_PRICE_DAYS = 10;
// Effect grows faster per upgrade than expense (see Item in classes.svelte.ts),
// so upgrading still pays off long-term - but it now eats into income rather
// than being pure upside, which is what made "upgrade whenever affordable" the
// only decision available.
export const ITEM_EFFECT_GROWTH_PER_LEVEL = 1.02;
export const ITEM_EXPENSE_GROWTH_PER_LEVEL = 1.015;
// Each successive upgrade costs sqrt(2)x the last.
export const ITEM_UPGRADE_PRICE_GROWTH_PER_LEVEL = Math.SQRT2;

const ITEMS: {
  name: string;
  expense: number;
  effect: number;
  description: Description;
  revealAt: number;
}[] = [
  //  name                 expense/day  effect  target                    revealed at
  { name: ITEM.ROD,          expense: 5,          effect: 2,    description: DESC.STRENGTH_XP,      revealAt: 500 },
  { name: ITEM.BOOK,         expense: 40,         effect: 1.75, description: DESC.SKILL_XP,         revealAt: 3_000 },
  { name: ITEM.NET,          expense: 200,        effect: 1.75, description: DESC.FISHING_XP,       revealAt: 30_000 },
  { name: ITEM.HOOK,         expense: 1_200,      effect: 2,    description: DESC.RIVER_XP,         revealAt: 50_000 },
  { name: ITEM.BAIT,         expense: 6_000,      effect: 2.25, description: DESC.FISHING_SKILL_XP, revealAt: 300_000 },
  { name: ITEM.HAM_SANDWICH, expense: 30_000,     effect: 2.5,  description: DESC.BOATING_XP,       revealAt: 500_000 },
  { name: ITEM.PLIERS,       expense: 200_000,    effect: 2.75, description: DESC.OCEAN_XP,         revealAt: 1_000_000 },
  { name: ITEM.FISH_FINDER,  expense: 1_200_000,  effect: 3,    description: DESC.OCEAN_PAY,        revealAt: 5_000_000 },
  { name: ITEM.HOUSE,        expense: 8_000_000,  effect: 3,    description: DESC.ALL_XP,           revealAt: 10_000_000 },
];

// These classes are constructed eagerly below (inside the `requirements` map
// literal), so they're defined here rather than in classes.svelte.ts: that
// module imports back from this one, and a class from a module still mid­-
// evaluation can't be used yet ("cannot access before initialization").
export class Requirement {
  requirements: RequirementObj[];
  // Not `$state`: `isCompleted()` below caches this as a side effect of a
  // read that regularly happens during template rendering (via
  // `needRequirements`/`filtered`), and mutating `$state` mid-render throws
  // "unsafe mutation" — repeatedly, once per newly-satisfied requirement,
  // which is a real source of the reported slowdown over long sessions.
  completed = false;
  type: string;
  constructor(requirements: RequirementObj[], type: string) {
    this.requirements = requirements;
    this.completed = false;
    this.type = type;
  }
  getCondition(requirement: RequirementObj) {
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
  getCondition(requirement: RequirementObj) {
    return gameState.fishingData.get(requirement.name)!.level >= (requirement.requirement as number);
  }
}

export class SkillRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "skill");
  }
  getCondition(requirement: RequirementObj) {
    return gameState.skillsData.get(requirement.name)!.level >= (requirement.requirement as number);
  }
}

export class CoinRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "coins");
  }

  getCondition(requirement: RequirementObj) {
    return gameState.coins >= (requirement.requirement as number);
  }
}

export class AgeRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "age");
  }

  getCondition(requirement: RequirementObj) {
    return daysToYears(gameState.day) >= (requirement.requirement as number);
  }
}

export class BoatRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "boat");
  }

  getCondition(requirement: RequirementObj) {
    return gameState.boatData.get(requirement.name)!.bought == requirement.requirement;
  }
}

export class LegendRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "legend");
  }

  getCondition(requirement: RequirementObj) {
    return gameState.legendPoints >= (requirement.requirement as number);
  }
}

// ─── Requirement builders ──────────────────────────────────────────────────
// Thin wrappers so the requirement graph below reads as a table of unlocks
// rather than a wall of nested object literals.
const afterFish = (name: string, level: number = NEXT_FISH_LEVEL) =>
  new FishingRequirement([{ name, requirement: level }]);

const needSkills = (...gates: [string, number][]) =>
  new SkillRequirement(gates.map(([name, requirement]) => ({ name, requirement })));

const needBoat = (name: string) =>
  new BoatRequirement([{ name, requirement: true }]);

const needCoins = (amount: number) =>
  new CoinRequirement([{ name: COIN_LABEL, requirement: amount }]);

const needLegendPoints = (points: number) =>
  new LegendRequirement([{ name: LEGEND_LABEL, requirement: points }]);

export const requirements = new Map<string, Requirement[]>([
  // ─── LAKE ────────────────────────────────────────────────────────────────
  [FISH.SUN_FISH, []],
  [FISH.PERCH, [afterFish(FISH.SUN_FISH)]],
  [FISH.BASS, [afterFish(FISH.PERCH), needBoat(BOAT.ROW_BOAT)]],
  [FISH.TROUT, [afterFish(FISH.BASS), needSkills([SKILL.STRENGTH, GATE.DABBLING])]],
  [
    FISH.WALEYE,
    [
      afterFish(FISH.TROUT),
      needSkills([SKILL.STRENGTH, GATE.APPRENTICE]),
      needBoat(BOAT.SILVER_BULLET),
    ],
  ],
  [FISH.NORTHERN_PIKE, [afterFish(FISH.WALEYE), needSkills([SKILL.AMBITION, GATE.PROFICIENT])]],
  [
    FISH.LAKE_STURGEON,
    [
      afterFish(FISH.NORTHERN_PIKE),
      needSkills([SKILL.PATIENCE, GATE.PRACTISED]),
      needBoat(BOAT.BASS_BOAT),
    ],
  ],
  // ─── RIVER ───────────────────────────────────────────────────────────────
  [FISH.PIRANA, [needSkills([SKILL.STRENGTH, GATE.DABBLING])]],
  [FISH.SALMON, [afterFish(FISH.PIRANA), needSkills([SKILL.STRENGTH, GATE.APPRENTICE])]],
  [
    FISH.SILVER_DRUM,
    [
      afterFish(FISH.SALMON),
      needSkills([SKILL.INTELLIGENCE, GATE.COMPETENT]),
      needBoat(BOAT.CANOE),
    ],
  ],
  [
    FISH.ARMOURED_CATFISH,
    [afterFish(FISH.SILVER_DRUM), needSkills([SKILL.CASTING, GATE.ACCOMPLISHED])],
  ],
  [
    FISH.ELECTRIC_EEL,
    [
      afterFish(FISH.ARMOURED_CATFISH),
      needSkills([SKILL.STRENGTH, GATE.GRANDMASTER]),
      needBoat(BOAT.RIVER_SKIFF),
    ],
  ],
  // Trolling MASTER, down from 500: at the fishing-skill xp base of 300, a
  // 500 gate costs ~1.6e9 xp for a fish sitting mid-river.
  [FISH.PACU, [afterFish(FISH.ELECTRIC_EEL), needSkills([SKILL.TROLLING, GATE.MASTER])]],
  // Reeling RENOWNED, down from 1000 (~10^11 xp at the old flat base of 100).
  [
    FISH.PAYARA,
    [
      afterFish(FISH.PACU),
      needSkills([SKILL.REELING, GATE.RENOWNED]),
      needBoat(BOAT.AIRBOAT),
    ],
  ],
  // ─── OCEAN ───────────────────────────────────────────────────────────────
  // The whole ocean chain drops from 200-2500 to 120-500. Boating skills now
  // carry a 500 xp base (5x fundamentals) and a 0.05 effect (5x), so each
  // level is worth 5x more and costs 5x more - the gates come down to match.
  [
    FISH.COD,
    [
      needSkills([SKILL.PATIENCE, GATE.EXPERT], [SKILL.CONCENTRATION, GATE.EXPERT]),
      needBoat(BOAT.SAIL_BOAT),
    ],
  ],
  [
    FISH.MACKEREL,
    [
      afterFish(FISH.COD),
      needSkills([SKILL.DOCKING, GATE.VETERAN], [SKILL.NETTING, GATE.SEASONED]),
    ],
  ],
  [
    FISH.ANGLE_FISH,
    [
      afterFish(FISH.MACKEREL),
      needSkills([SKILL.DOCKING, GATE.MASTER], [SKILL.TURNING, GATE.EXPERT]),
    ],
  ],
  [FISH.GROUPER, [afterFish(FISH.ANGLE_FISH), needSkills([SKILL.ANCHORING, GATE.MASTER])]],
  [FISH.STINGRAY, [afterFish(FISH.GROUPER), needSkills([SKILL.DOCKING, GATE.RENOWNED])]],
  [FISH.BARRACUDA, [afterFish(FISH.STINGRAY), needSkills([SKILL.TURNING, GATE.RENOWNED])]],
  [
    FISH.BLUEFIN_TUNA,
    [
      afterFish(FISH.BARRACUDA),
      needSkills([SKILL.SAILING, GATE.RENOWNED]),
      needBoat(BOAT.YACHT),
    ],
  ],
  [FISH.BLUE_MARLIN, [afterFish(FISH.BLUEFIN_TUNA), needSkills([SKILL.SAILING, GATE.ELITE])]],
  [FISH.SWORDFISH, [afterFish(FISH.BLUE_MARLIN), needSkills([SKILL.NAVIGATION, GATE.ELITE])]],
  [FISH.SHARK, [afterFish(FISH.SWORDFISH), needSkills([SKILL.STABILITY, GATE.LEGENDARY])]],
  // Whaling gates the Whale. It previously gated nothing at all - the skill
  // was unlockable, trainable, and completely inert, and its "Whale Pay"
  // effect duplicated Navigation's.
  [
    FISH.WHALE,
    [
      afterFish(FISH.SHARK),
      needSkills([SKILL.STABILITY, GATE.MYTHIC], [SKILL.WHALING, GATE.RENOWNED]),
      needBoat(BOAT.WHALING_SHIP),
    ],
  ],
  // ─── FUNDAMENTALS ────────────────────────────────────────────────────────
  [SKILL.STRENGTH, []],
  [SKILL.CONCENTRATION, []],
  [SKILL.INTELLIGENCE, [needSkills([SKILL.CONCENTRATION, GATE.DABBLING])]],
  [SKILL.PATIENCE, [needSkills([SKILL.CONCENTRATION, GATE.NOVICE])]],
  [SKILL.AMBITION, [needSkills([SKILL.INTELLIGENCE, GATE.APPRENTICE])]],
  [
    SKILL.COMMUNICATION,
    [needSkills([SKILL.INTELLIGENCE, GATE.APPRENTICE], [SKILL.STRENGTH, GATE.COMPETENT])],
  ],
  // ─── FISHING SKILLS ──────────────────────────────────────────────────────
  [SKILL.CASTING, []],
  [SKILL.JIGGING, [needSkills([SKILL.STRENGTH, GATE.APPRENTICE])]],
  [SKILL.TROLLING, [needSkills([SKILL.CONCENTRATION, GATE.COMPETENT])]],
  [SKILL.REELING, [needSkills([SKILL.STRENGTH, GATE.SKILLED])]],
  [SKILL.HOOKING, [needSkills([SKILL.JIGGING, GATE.COMPETENT])]],
  [SKILL.NETTING, [needSkills([SKILL.CONCENTRATION, GATE.SEASONED])]],
  [SKILL.WHALING, [needSkills([SKILL.STRENGTH, GATE.MASTER])]],
  // ─── BOATING SKILLS ──────────────────────────────────────────────────────
  [
    SKILL.DOCKING,
    [needSkills([SKILL.CONCENTRATION, GATE.EXPERT], [SKILL.INTELLIGENCE, GATE.EXPERT])],
  ],
  [
    SKILL.TURNING,
    [needSkills([SKILL.CONCENTRATION, GATE.GRANDMASTER], [SKILL.PATIENCE, GATE.MASTER])],
  ],
  [SKILL.ANCHORING, [afterFish(FISH.COD, FISH_ADEPT_LEVEL)]],
  [SKILL.SAILING, [afterFish(FISH.ANGLE_FISH)]],
  // Both down from 400/500: these are prerequisites for skills that are
  // themselves gates, so stacking two 400+ grinds compounded badly.
  [SKILL.NAVIGATION, [needSkills([SKILL.TROLLING, GATE.GRANDMASTER])]],
  [SKILL.STABILITY, [needSkills([SKILL.ANCHORING, GATE.GRANDMASTER])]],
  // ─── IMMORTALITY ─────────────────────────────────────────────────────────
  [SKILL.IMMORTALITY, [needSkills([SKILL.AMBITION, GATE.ACCOMPLISHED])]],
  [SKILL.SUPER_IMMORTALITY, [needSkills([SKILL.IMMORTALITY, GATE.ELITE])]],
  [SKILL.TIME_WARPING, [needSkills([SKILL.IMMORTALITY, GATE.EXPERT])]],
  // ─── BOATS & ITEMS ───────────────────────────────────────────────────────
  ...BOATS.map((b): [string, Requirement[]] => [b.name, [needCoins(b.revealAt)]]),
  ...ITEMS.map((i): [string, Requirement[]] => [i.name, [needCoins(i.revealAt)]]),
  // ─── LEGEND SKILLS ───────────────────────────────────────────────────────
  [SKILL.SEA_LEGEND, [needLegendPoints(LEGEND_GATE.INITIATE)]],
  [SKILL.TIDAL_FOCUS, [needLegendPoints(LEGEND_GATE.INITIATE)]],
  [SKILL.OLD_HAGGLER, [needLegendPoints(LEGEND_GATE.INITIATE)]],
  [SKILL.WEATHERED_INSTINCT, [needLegendPoints(LEGEND_GATE.VETERAN)]],
  [SKILL.DEEP_MEDITATION, [needLegendPoints(LEGEND_GATE.DEEP)]],
  [SKILL.SUNKEN_FORTUNE, [needLegendPoints(LEGEND_GATE.APEX)]],
]);

export const gameState: GameDataType = $state({
  day: 0,
  coins: 0,
  fishingData: new Map(),
  skillsData: new Map(),
  itemData: new Map(),
  boatData: new Map(),
  requirements,
  paused: false,
  autoTrain: false,
  autoFish: false,
  timeWarpingEnabled: true,

  rebirthCount: 0,
  ascensionCount: 0,

  currentlyFishing: null,
  currentSkill: null,
  legendPoints: 0,
});

export const update = (
  paused: boolean,
  autoTrain: boolean,
  autoFish: boolean,
  deltaSeconds: number
) => {
  if (paused) {
    return;
  }
  increaseDay(deltaSeconds);
  updateCurrentFish(deltaSeconds);
  updateCurrentSkill(deltaSeconds);
  updateItemExpenses(deltaSeconds);
  if (autoTrain) {
    autoSetCurrentSkill();
  }
  if (autoFish) {
    autoSetCurrentlyFishing();
  }
};
export const getGameData = (): GameDataType => gameState;

export const setGameData = (savedGameData: GameDataType) => {
  // Point current*/fishingData+skillsData at the *same* instance rather than
  // a separately-constructed copy: previously these were distinct objects
  // that both accrued xp independently every tick, silently doubling
  // progress and letting the two copies drift apart after a reload.
  let skillName: string = (savedGameData.currentSkill as any)?.name;
  let fishName: string = (savedGameData.currentlyFishing as any)?.name;
  Object.assign(gameState, savedGameData);
  gameState.currentSkill = gameState.skillsData.get(skillName)!;
  gameState.currentlyFishing = gameState.fishingData.get(fishName)!;
};

export const increaseDay = (deltaSeconds: number) => {
  gameState.day += applySpeed(1, deltaSeconds);
};
export const togglePause = () => {
  gameState.paused = !gameState.paused;
};
export const setCurrentlyFishing = (fishingKey: string) => {
  gameState.currentlyFishing = gameState.fishingData.get(fishingKey)!;
};
export const updateCurrentFish = (deltaSeconds: number) => {
  let fish = gameState.currentlyFishing || gameState.fishingData.get(FISH.SUN_FISH)!;
  // Always resolve to the single canonical instance stored in fishingData
  // (currentlyFishing can otherwise end up as a distinct object after a
  // reload), and increase its xp exactly once.
  fish = gameState.fishingData.get(fish.name)!;
  fish.increaseXp(deltaSeconds);

  gameState.currentlyFishing = fish;
  gameState.coins += applySpeed(fish.income, deltaSeconds);
};

export const setCurrentSkill = (skillKey: string) => {
  let currentSkill = gameState.skillsData.get(skillKey)!;
  if (gameState.autoTrain) {
    currentSkill = lowestLevelSkill(gameState);
  }
  gameState.currentSkill = currentSkill;
};
export const autoSetCurrentSkill = () => {
  gameState.currentSkill = lowestLevelSkill(gameState);
};
export const autoSetCurrentlyFishing = () => {
  gameState.currentlyFishing = roundRobinFish(gameState);
};

export const updateCurrentSkill = (deltaSeconds: number) => {
  let skill = gameState.currentSkill || gameState.skillsData.get(SKILL.STRENGTH)!;
  // Same canonical-instance fix as updateCurrentFish above.
  skill = gameState.skillsData.get(skill.name)!;
  skill.increaseXp(deltaSeconds);
  gameState.currentSkill = skill;
};

export const subtractCoins = (amount: number) => {
  gameState.coins -= amount;
};

export const updateItemExpenses = (deltaSeconds: number) => {
  if (gameState.coins <= 0) {
    gameState.itemData.forEach((item) => item.deselect());
    gameState.coins = 0;
    return;
  }
  gameState.coins -= applySpeed(getTotalExpenses(gameState), deltaSeconds);
};

const applyBaseReset = () => {
  gameState.fishingData.forEach((fish) => {
    if (fish.level > fish.maxLevel) {
      fish.maxLevel = fish.level;
    }
    fish.level = 0;
    fish.xp = 0;
  });
  gameState.skillsData.forEach((skill) => {
    if (skill.level > skill.maxLevel) {
      skill.maxLevel = skill.level;
    }
    skill.level = 0;
    skill.xp = 0;
  });
  gameState.boatData.forEach((boat) => {
    boat.baseData.bought = false;
  });
  gameState.itemData.forEach((item) => {
    item.level = 0;
    item.deselect();
  });
  // Re-lock everything: since levels/coins/boats reset above, anything still
  // genuinely gated (level/coin/boat requirements) needs re-earning again.
  // Requirements gated on legendPoints re-derive as completed immediately
  // (legendPoints itself is never reset), so the legend skill line stays
  // unlocked across rebirths/ascensions as intended.
  gameState.requirements.forEach((reqArr) => {
    reqArr.forEach((req) => {
      req.completed = false;
    });
  });
  gameState.coins = 0;
  // 0, not DAYS_PER_YEAR * STARTING_AGE: calculatedAge() already displays
  // STARTING_AGE + years-elapsed, so a fresh game (day: 0 in the initial
  // gameState above) already shows "Age 14". Setting day to the offset here
  // double-counted it and reset to "Age 28" instead.
  gameState.day = 0;
  gameState.currentlyFishing = gameState.fishingData.get(FISH.SUN_FISH)!;
  gameState.currentSkill = gameState.skillsData.get(SKILL.STRENGTH)!;
};

// legendPoints gained per ascension, before it's added: Tidal Focus and Deep
// Meditation are the two "legend" skills that boost this (mirrors Progress
// Knight's Evil control x Blood meditation formula for evil gain).
export const getLegendPointGain = (): number => {
  let tidalFocus = gameState.skillsData.get(SKILL.TIDAL_FOCUS)!;
  let deepMeditation = gameState.skillsData.get(SKILL.DEEP_MEDITATION)!;
  return tidalFocus.effect * deepMeditation.effect;
};

// Tier 1 (small): resets progress but keeps maxLevel as a permanent record,
// which boosts future xpGain via Task.maxLevelMultiplier.
export const rebirth = () => {
  applyBaseReset();
  gameState.rebirthCount += 1;
};

// Tier 2 (big): also wipes maxLevel, but grants legendPoints - a currency
// that's never reset and unlocks the permanent "legend" skill line.
export const ascend = () => {
  gameState.legendPoints += getLegendPointGain();
  applyBaseReset();
  gameState.fishingData.forEach((fish) => {
    fish.maxLevel = 0;
  });
  gameState.skillsData.forEach((skill) => {
    skill.maxLevel = 0;
  });
  gameState.ascensionCount += 1;
};

export const hardReset = () => {
  window.localStorage.clear();
  window.location.reload();
};

// Mirrors Progress Knight: your actual lifespan is the base lifespan
// multiplied by the Immortality/Super Immortality skills' effects, so
// investing in them (across ordinary Rebirths) is the only way to survive
// past the natural Age 70 wall and eventually reach Ascension.
export const getLifespan = (): number => {
  let immortality = gameState.skillsData.get(SKILL.IMMORTALITY)!;
  let superImmortality = gameState.skillsData.get(SKILL.SUPER_IMMORTALITY)!;
  return baseLifespan * immortality.effect * superImmortality.effect;
};

// ─── Base-data builders ────────────────────────────────────────────────────
const fish = (
  name: string,
  category: string,
  tier: number,
  income: number,
  effect: number,
  description: Description
): [string, FishBaseData] => [
  name,
  { name, maxXp: regionXp(category, tier), income, effect, description, category },
];

const skill = (
  name: string,
  category: string,
  effect: number,
  description: Description
): [string, SkillBaseData] => [
  name,
  { name, maxXp: SKILL_XP[category], effect, description, category },
];

// Insertion order matters: roundRobinFish() (autoFish) takes the last unlocked
// entry per region and rotates regions in this order, and the UI renders
// categories in this order too.
// Every fish's effect points *forward*, at a skill that gates a later fish, so
// whatever you are currently catching is always shortening the next unlock.
// Previously several pointed backwards or nowhere: Angle Fish (ocean) buffed
// Payara's income, a river fish long since abandoned by the time you catch it.
// The trailing comment on each line is what that effect is buying you.
export const fishBaseData: Map<string, FishBaseData> = new Map([
  //     name                    region           tier  income     effect         description
  fish(FISH.SUN_FISH,         CATEGORY.LAKE,      0,        5, EFFECT.BASIC,   DESC.FISHING_PAY),      // the starter farm
  fish(FISH.PERCH,            CATEGORY.LAKE,      1,        9, EFFECT.BASIC,   DESC.STRENGTH_XP),      // Trout, Waleye
  fish(FISH.BASS,             CATEGORY.LAKE,      2,       15, EFFECT.BASIC,   DESC.AMBITION_XP),      // Northern Pike
  fish(FISH.TROUT,            CATEGORY.LAKE,      3,       40, EFFECT.BASIC,   DESC.PATIENCE_XP),      // Lake Sturgeon, Cod
  fish(FISH.WALEYE,           CATEGORY.LAKE,      4,       80, EFFECT.BASIC,   DESC.CONCENTRATION_XP), // Cod, Docking, Turning
  fish(FISH.NORTHERN_PIKE,    CATEGORY.LAKE,      5,      150, EFFECT.BASIC,   DESC.CASTING_XP),       // Armoured Catfish
  fish(FISH.LAKE_STURGEON,    CATEGORY.LAKE,      6,      300, EFFECT.BASIC,   DESC.JIGGING_XP),       // Hooking

  fish(FISH.PIRANA,           CATEGORY.RIVER,     0,        5, EFFECT.ADEPT,   DESC.INTELLIGENCE_XP),  // Silver Drum, Docking
  fish(FISH.SALMON,           CATEGORY.RIVER,     1,       50, EFFECT.ADEPT,   DESC.TROLLING_XP),      // Pacu, Navigation
  fish(FISH.SILVER_DRUM,      CATEGORY.RIVER,     2,      120, EFFECT.ADEPT,   DESC.REELING_XP),       // Payara
  fish(FISH.ARMOURED_CATFISH, CATEGORY.RIVER,     3,      300, EFFECT.ADEPT,   DESC.RIVER_PAY),        // River Skiff, Airboat
  fish(FISH.ELECTRIC_EEL,     CATEGORY.RIVER,     4,     1000, EFFECT.ADEPT,   DESC.RIVER_XP),         // the rest of the river
  fish(FISH.PACU,             CATEGORY.RIVER,     5,     3000, EFFECT.ADEPT,   DESC.HOOKING_XP),
  fish(FISH.PAYARA,           CATEGORY.RIVER,     6,    15000, EFFECT.ADEPT,   DESC.NETTING_XP),       // Mackerel

  fish(FISH.COD,              CATEGORY.OCEAN,     0,      100, EFFECT.DEEP,    DESC.DOCKING_XP),       // Mackerel, Angle Fish, Stingray
  fish(FISH.MACKEREL,         CATEGORY.OCEAN,     1,     1000, EFFECT.DEEP,    DESC.TURNING_XP),       // Angle Fish, Barracuda
  fish(FISH.ANGLE_FISH,       CATEGORY.OCEAN,     2,     7500, EFFECT.DEEP,    DESC.ANCHORING_XP),     // Grouper, Stability
  fish(FISH.GROUPER,          CATEGORY.OCEAN,     3,    50000, EFFECT.DEEPER,  DESC.SAILING_XP),       // Bluefin Tuna, Blue Marlin
  fish(FISH.STINGRAY,         CATEGORY.OCEAN,     4,   100000, EFFECT.DEEPER,  DESC.NAVIGATION_XP),    // Swordfish
  fish(FISH.BARRACUDA,        CATEGORY.OCEAN,     5,   200000, EFFECT.DEEPER,  DESC.STABILITY_XP),     // Shark, Whale
  fish(FISH.BLUEFIN_TUNA,     CATEGORY.OCEAN,     6,   400000, EFFECT.ABYSSAL, DESC.WHALING_XP),       // Whale
  fish(FISH.BLUE_MARLIN,      CATEGORY.OCEAN,     7,   800000, EFFECT.ABYSSAL, DESC.COMMUNICATION_XP),
  fish(FISH.SWORDFISH,        CATEGORY.OCEAN,     8,  1600000, EFFECT.ABYSSAL, DESC.BOATING_XP),
  fish(FISH.SHARK,            CATEGORY.OCEAN,     9,  2400000, EFFECT.APEX,    DESC.OCEAN_PAY),
  fish(FISH.WHALE,            CATEGORY.OCEAN,    10,  3200000, EFFECT.APEX,    DESC.ALL_XP),
]);

export const skillBaseData: Map<string, SkillBaseData> = new Map([
  //      name                       category                 effect            description
  skill(SKILL.STRENGTH,           CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.FISHING_XP),
  skill(SKILL.CONCENTRATION,      CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.SKILL_XP),
  skill(SKILL.INTELLIGENCE,       CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.FISHING_SKILL_XP),
  skill(SKILL.PATIENCE,           CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.LAKE_PAY),
  skill(SKILL.AMBITION,           CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.RIVER_PAY),
  skill(SKILL.COMMUNICATION,      CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.OCEAN_PAY),

  skill(SKILL.CASTING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.LAKE_XP),
  skill(SKILL.JIGGING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.NORTHERN_PIKE_PAY),
  skill(SKILL.TROLLING,           CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.PAYARA_PAY),
  skill(SKILL.REELING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.SILVER_DRUM_XP),
  skill(SKILL.HOOKING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.RIVER_XP),
  skill(SKILL.NETTING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.FISHING_PAY),
  skill(SKILL.WHALING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.WHALE_PAY),

  skill(SKILL.DOCKING,            CATEGORY.BOATING,      EFFECT.DEEP,             DESC.BOATING_XP),
  skill(SKILL.TURNING,            CATEGORY.BOATING,      EFFECT.DEEP,             DESC.FISHING_SKILL_XP),
  skill(SKILL.ANCHORING,          CATEGORY.BOATING,      EFFECT.DEEP,             DESC.LAKE_XP),
  skill(SKILL.SAILING,            CATEGORY.BOATING,      EFFECT.DEEP,             DESC.OCEAN_XP),
  skill(SKILL.NAVIGATION,         CATEGORY.BOATING,      EFFECT.DEEP,             DESC.FISHING_XP),
  skill(SKILL.STABILITY,          CATEGORY.BOATING,      EFFECT.DEEP,             DESC.SKILL_XP),

  // Reachable through ordinary progression (unlike the legend line below) -
  // these are the only way to extend your lifespan past the natural Age 70
  // wall, mirroring Progress Knight's Immortality/Super immortality skills.
  skill(SKILL.IMMORTALITY,        CATEGORY.IMMORTALITY,  EFFECT.LIFESPAN,         DESC.LONGER_LIFESPAN),
  skill(SKILL.SUPER_IMMORTALITY,  CATEGORY.IMMORTALITY,  EFFECT.LIFESPAN,         DESC.LONGER_LIFESPAN),
  skill(SKILL.TIME_WARPING,       CATEGORY.IMMORTALITY,  EFFECT.UNUSED,           DESC.GAMESPEED),

  // Unlocked by ascending at least once (legendPoints > 0). Mirrors Progress
  // Knight's "Dark magic" skill line, reskinned for fishing.
  skill(SKILL.SEA_LEGEND,         CATEGORY.LEGEND,       EFFECT.LEGEND,           DESC.ALL_XP),
  skill(SKILL.TIDAL_FOCUS,        CATEGORY.LEGEND,       EFFECT.LEGEND,           DESC.LEGEND_POINT_GAIN),
  skill(SKILL.OLD_HAGGLER,        CATEGORY.LEGEND,       EFFECT.EXPENSE_DISCOUNT, DESC.EXPENSES),
  skill(SKILL.WEATHERED_INSTINCT, CATEGORY.LEGEND,       EFFECT.LEGEND,           DESC.OCEAN_XP),
  skill(SKILL.DEEP_MEDITATION,    CATEGORY.LEGEND,       EFFECT.LEGEND,           DESC.LEGEND_POINT_GAIN),
  skill(SKILL.SUNKEN_FORTUNE,     CATEGORY.LEGEND,       EFFECT.LEGEND_PAY,       DESC.FISHING_PAY),
]);

export const boatBaseData: Map<string, BoatBaseData> = new Map(
  BOATS.map((b): [string, BoatBaseData] => [
    b.name,
    { name: b.name, price: b.price, bought: false },
  ])
);

export const itemBaseData: Map<string, ItemBaseData> = new Map(
  ITEMS.map((i): [string, ItemBaseData] => [
    i.name,
    {
      name: i.name,
      expense: i.expense,
      effect: i.effect,
      description: i.description,
      selected: false,
      upgradePrice: i.expense * ITEM_UPGRADE_PRICE_DAYS,
    },
  ])
);

export const fishCategories: { [category: string]: string[] } = {};
fishBaseData.forEach((base) => {
  (fishCategories[base.category] ??= []).push(base.name);
});

export const skillCategories: { [category: string]: string[] } = {};
skillBaseData.forEach((base) => {
  (skillCategories[base.category] ??= []).push(base.name);
});

export const itemCategories = {};

export const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];
