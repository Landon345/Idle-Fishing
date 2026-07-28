import {
  applySpeed,
  daysToYears,
  getTotalExpenses,
  lowestLevelSkill,
  needRequirements,
  roundRobinFish,
} from "src/functions";

import type {
  BoatBaseData,
  Description,
  FishBaseData,
  GameDataType,
  ItemBaseData,
  MasteryData,
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
// Xp every task earns per in-game day before any multipliers.
export const BASE_XP_PER_DAY = 20;
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
  // Single-skill xp. Owned by the fish whose capture builds that quality or
  // trains that technique - see fishBaseData.
  STRENGTH_XP: "Strength Xp",
  CONCENTRATION_XP: "Concentration Xp",
  INTELLIGENCE_XP: "Intelligence Xp",
  PATIENCE_XP: "Patience Xp",
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
  // Single-fish xp. Owned by the skill or tool you'd actually use to land
  // that fish, so practising a technique makes its quarry easier to catch.
  PERCH_XP: "Perch Xp",
  BASS_XP: "Bass Xp",
  NORTHERN_PIKE_XP: "Northern Pike Xp",
  SALMON_XP: "Salmon Xp",
  PAYARA_XP: "Payara Xp",
  MACKEREL_XP: "Mackerel Xp",
  GROUPER_XP: "Grouper Xp",
  BARRACUDA_XP: "Barracuda Xp",
  BLUEFIN_TUNA_XP: "Bluefin Tuna Xp",
  BLUE_MARLIN_XP: "Blue Marlin Xp",
  WHALE_XP: "Whale Xp",
  // Income. Effects generally avoid stacking more than a few owners deep, so
  // that no two things the player is choosing between do the same job - but
  // OCEAN_PAY is deliberately the exception, carried by Communication,
  // Docking, Shark and the Yacht at once. The ocean is late game, and it is
  // meant to pay out disproportionately once you get there.
  FISHING_PAY: "Fishing Pay",
  LAKE_PAY: "Lake Pay",
  RIVER_PAY: "River Pay",
  OCEAN_PAY: "Ocean Pay",
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
  // Read by ExpenseDiscount (classes.svelte.ts) as a per-level *decay* factor,
  // not as the usual `1 + effect * level` slope: expenses fall by 1% of what
  // they were per level, approaching zero without ever reaching it.
  EXPENSE_DECAY: 0.99,
  // Time Warping overrides `effect` with a logarithmic formula (see
  // TimeWarping in classes.svelte.ts), so its base value is never read.
  UNUSED: 0,
};

// ─── Fish income curve ─────────────────────────────────────────────────────
// A fish's income is `base * multipliers * (1 + level^EXPONENT * SCALE)` - see
// Fishing.levelMultiplier. At 0.5/0.5 a fish is worth ~6x at level 100 and
// ~17x at level 1000, against the old logarithm's 3x and 4x.
export const FISH_INCOME_LEVEL_EXPONENT = 0.5;
export const FISH_INCOME_LEVEL_SCALE = 0.5;

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
//
// Task.maxXp carries a 1.01^level term, so a gate's cost is roughly
// `base * level * 1.01^level` - doubling a gate's level multiplies its xp by
// a few hundred. That non-linearity cuts both ways, and this ladder has been
// wrong in both directions:
//
//  - The original gates (up to Stability 2500) were not hard, they were
//    *unreachable*: ~1.1e18 xp, several thousand lifetimes of focused
//    training even at endgame xp rates.
//  - Correcting for that overshot into free. Measured against real xp rates,
//    a 500-level gate cost ~0% of a lifetime by the time you met it.
//
// The top of the ladder is now anchored to measurement: at each stage of the
// game there is a level reachable in one focused 56-year life (~816 at ocean
// entry, ~1276 mid-ocean, ~1723 late ocean), and the deep rungs sit at ~80%
// of that. So a late gate is a genuine project you can watch yourself climb,
// while the early rungs - which pace fine - are untouched.
const GATE = {
  // Early rungs: unchanged. These gate the lake and early river, where xp
  // rates are low and small numbers already mean real time.
  DABBLING: 10,
  NOVICE: 20,
  APPRENTICE: 30,
  COMPETENT: 40,
  PROFICIENT: 50,
  SKILLED: 60,
  PRACTISED: 80,
  ACCOMPLISHED: 100,
  // Deep rungs: stretched, because multipliers compound so steeply that the
  // old values had stopped costing anything by the time they were reached.
  //
  // These sit in the 10-25% band of a focused life at the stage they're met,
  // deliberately short of the ceiling. The band from "3% of a lifetime" to
  // "an entire lifetime" is only ~150 levels wide, so a gate placed near the
  // ceiling stops being a grind and becomes a wall for anyone whose boats,
  // items and maxLevels are behind the ideal - which is how the original
  // Stability 2500 ended up unreachable.
  SEASONED: 150,
  VETERAN: 200,
  EXPERT: 250,
  MASTER: 300,
  GRANDMASTER: 450,
  RENOWNED: 550,
  ELITE: 750,
  LEGENDARY: 850,
  MYTHIC: 900,
};

// ─── Ascension economy ─────────────────────────────────────────────────────
// Legend point gain used to be `tidalFocus.effect * deepMeditation.effect`
// alone. Both start at 1.0, so *every* early ascension granted exactly 1
// point regardless of how far the run got - there was nothing to optimise and
// nothing to compound. Worse, Deep Meditation (one of the two multipliers)
// was gated behind 75 points you could only earn one at a time.
//
// Gain now scales with how deep the run actually got, so "ascend now or push
// one more fish tier" is a real decision.
export const LEGEND_POINT_DEPTH_SCALE = 400;
// Floor, so a first ascension always unlocks the legend line - which is the
// entire point of ascending.
export const LEGEND_POINT_MIN_GAIN = 1;
// Ascension wipes maxLevel for everything, so the legend skills must be
// re-ground from scratch every cycle. Legend points are the one thing it never
// resets, so they are what makes each cycle faster than the last: this is the
// compounding loop. It speeds up the legend line only, which is precisely what
// ascending costs you.
export const LEGEND_POINT_XP_BONUS = 0.05;

// Retuned to match the gain curve above. At the old 1-point-per-ascension
// rate, Sunken Fortune's 500 would have taken 500 ascensions.
const LEGEND_GATE = {
  INITIATE: 1,
  VETERAN: 20,
  DEEP: 50,
  APEX: 150,
};

// ─── Mastery (roguelite picks) ─────────────────────────────────────────────
// The Mastery tab opens once total levels across every fish and skill reach
// MASTERY_LEVELS_PER_PICK, and offers another choice of MASTERY_OFFER_SIZE
// every time that total climbs by the same again. Picks are per-run: they
// reset on reincarnation, unlike legendPoints.
export const MASTERY_LEVELS_PER_PICK = 200;
export const MASTERY_OFFER_SIZE = 3;
// Each pick is bound to a single fish or skill, so it can afford to be strong.
export const MASTERY_EFFECT = 2;

// Every Mastery targets one entity and multiplies its xp. The description is
// always "<target> Xp", which the generic per-entity rule in functions.ts
// resolves without any switch case - so the cast is safe by construction:
// `target` always comes from the FISH/SKILL tables, never a hand-typed string.
const masteryXpOf = (target: string) => `${target} Xp` as Description;

// One named pick per fish and per skill. The name is the flavour; the key it
// maps from is the entity whose xp it doubles.
const MASTERY_NAMES: { [target: string]: string } = {
  [FISH.SUN_FISH]: "Pond Prodigy",
  [FISH.PERCH]: "Perch Hunter",
  [FISH.BASS]: "Bass Whisperer",
  [FISH.TROUT]: "Trout Stalker",
  [FISH.WALEYE]: "Golden Eye",
  [FISH.NORTHERN_PIKE]: "Pike Whisperer",
  [FISH.LAKE_STURGEON]: "Sturgeon Hauler",
  [FISH.PIRANA]: "Piranha Handler",
  [FISH.SALMON]: "Salmon Runner",
  [FISH.SILVER_DRUM]: "Drum Listener",
  [FISH.ARMOURED_CATFISH]: "Plate Breaker",
  [FISH.ELECTRIC_EEL]: "Insulated Hands",
  [FISH.PACU]: "Pacu Charmer",
  [FISH.PAYARA]: "Fang Wrangler",
  [FISH.COD]: "Cod Father",
  [FISH.MACKEREL]: "Shoal Reader",
  [FISH.ANGLE_FISH]: "Lantern Chaser",
  [FISH.GROUPER]: "Reef Wrestler",
  [FISH.STINGRAY]: "Barb Handler",
  [FISH.BARRACUDA]: "Cuda Catcher",
  [FISH.BLUEFIN_TUNA]: "Bluefin Specialist",
  [FISH.BLUE_MARLIN]: "Marlin Master",
  [FISH.SWORDFISH]: "Broadbill Hunter",
  [FISH.SHARK]: "Shark Baiter",
  [FISH.WHALE]: "Leviathan Seeker",

  [SKILL.STRENGTH]: "Iron Grip",
  [SKILL.CONCENTRATION]: "Deep Focus",
  [SKILL.INTELLIGENCE]: "Well Read",
  [SKILL.PATIENCE]: "Still Waters",
  [SKILL.AMBITION]: "Hungry Heart",
  [SKILL.COMMUNICATION]: "Dock Talk",
  [SKILL.CASTING]: "Perfect Arc",
  [SKILL.JIGGING]: "Twitch Timing",
  [SKILL.TROLLING]: "Spread Setter",
  [SKILL.REELING]: "Smooth Retrieve",
  [SKILL.HOOKING]: "Sharp Set",
  [SKILL.NETTING]: "Clean Scoop",
  [SKILL.WHALING]: "Harpoon Form",
  [SKILL.DOCKING]: "Tight Berth",
  [SKILL.TURNING]: "Hard Rudder",
  [SKILL.ANCHORING]: "Sure Hold",
  [SKILL.SAILING]: "Wind Sense",
  [SKILL.NAVIGATION]: "Dead Reckoning",
  [SKILL.STABILITY]: "Sea Legs",
  [SKILL.IMMORTALITY]: "Old Salt",
  [SKILL.SUPER_IMMORTALITY]: "Ageless Mariner",
  [SKILL.TIME_WARPING]: "Tide Bender",
  [SKILL.SEA_LEGEND]: "Living Legend",
  [SKILL.TIDAL_FOCUS]: "Moon Pull",
  [SKILL.OLD_HAGGLER]: "Sharp Tongue",
  [SKILL.WEATHERED_INSTINCT]: "Storm Sense",
  [SKILL.DEEP_MEDITATION]: "Silent Depths",
  [SKILL.SUNKEN_FORTUNE]: "Treasure Sense",
};

// ─── Boats ─────────────────────────────────────────────────────────────────
// `revealAt` is the coin total that makes the boat visible in the shop;
// `price` is what it costs. From Canoe onward revealAt currently sits well
// *above* price, so those boats only appear once already affordable - a
// separate pass.
// A boat becomes visible in the shop once you hold this fraction of its price,
// so it always reads as a savings goal. The thresholds used to be hand-set and
// inverted from the Canoe onward - the Whaling Ship only appeared once you held
// 8.3x its price, i.e. long after it stopped being a goal at all.
export const BOAT_REVEAL_FRACTION = 0.75;

// Boats are no longer pure paywalls. Each one carries a flat multiplier (they
// have no level) that boosts the water it opens up, so buying one is an upgrade
// rather than a toll booth. The three region-capstone boats instead point
// forward at the skill gating the next region's content.
const BOATS: { name: string; price: number; effect: number; description: Description }[] = [
  //  name                    price        effect  target
  { name: BOAT.ROW_BOAT,      price: 600,         effect: 1.25, description: DESC.LAKE_XP },
  { name: BOAT.SILVER_BULLET, price: 3_000,       effect: 1.5,  description: DESC.LAKE_PAY },
  { name: BOAT.BASS_BOAT,     price: 60_000,      effect: 1.5,  description: DESC.BASS_XP },
  { name: BOAT.CANOE,         price: 200_000,     effect: 1.75, description: DESC.RIVER_XP },
  { name: BOAT.RIVER_SKIFF,   price: 600_000,     effect: 2,    description: DESC.RIVER_PAY },
  { name: BOAT.AIRBOAT,       price: 1_800_000,   effect: 2,    description: DESC.NETTING_XP },
  { name: BOAT.SAIL_BOAT,     price: 5_400_000,   effect: 2.5,  description: DESC.OCEAN_XP },
  { name: BOAT.YACHT,         price: 16_200_000,  effect: 3,    description: DESC.OCEAN_PAY },
  // The ship is where you learn the trade; the skill is what lands the whale.
  { name: BOAT.WHALING_SHIP,  price: 60_000_000,  effect: 3,    description: DESC.WHALING_XP },
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
  { name: ITEM.ROD,          expense: 5,          effect: 2,    description: DESC.CASTING_XP,       revealAt: 500 },
  { name: ITEM.BOOK,         expense: 40,         effect: 1.75, description: DESC.SKILL_XP,         revealAt: 3_000 },
  { name: ITEM.NET,          expense: 200,        effect: 1.75, description: DESC.FISHING_XP,       revealAt: 30_000 },
  { name: ITEM.HOOK,         expense: 1_200,      effect: 2,    description: DESC.HOOKING_XP,       revealAt: 50_000 },
  { name: ITEM.BAIT,         expense: 6_000,      effect: 2.25, description: DESC.FISHING_SKILL_XP, revealAt: 300_000 },
  { name: ITEM.HAM_SANDWICH, expense: 30_000,     effect: 2.5,  description: DESC.BOATING_XP,       revealAt: 500_000 },
  // Pliers are what you reach for with a toothy fish alongside the boat.
  { name: ITEM.PLIERS,       expense: 200_000,    effect: 2.75, description: DESC.BARRACUDA_XP,     revealAt: 1_000_000 },
  { name: ITEM.FISH_FINDER,  expense: 1_200_000,  effect: 3,    description: DESC.FISHING_PAY,      revealAt: 5_000_000 },
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
    [afterFish(FISH.SILVER_DRUM), needSkills([SKILL.CASTING, GATE.VETERAN])],
  ],
  [
    FISH.ELECTRIC_EEL,
    [
      afterFish(FISH.ARMOURED_CATFISH),
      needSkills([SKILL.STRENGTH, GATE.MASTER]),
      needBoat(BOAT.RIVER_SKIFF),
    ],
  ],
  [FISH.PACU, [afterFish(FISH.ELECTRIC_EEL), needSkills([SKILL.TROLLING, GATE.EXPERT])]],
  // The river capstone: Reeling MASTER is ~1.6 lives of focused training at
  // the xp rates you actually have mid-river.
  [
    FISH.PAYARA,
    [
      afterFish(FISH.PACU),
      needSkills([SKILL.REELING, GATE.GRANDMASTER]),
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
      needSkills([SKILL.PATIENCE, GATE.MASTER], [SKILL.CONCENTRATION, GATE.MASTER]),
      needBoat(BOAT.SAIL_BOAT),
    ],
  ],
  [
    FISH.MACKEREL,
    [
      afterFish(FISH.COD),
      needSkills([SKILL.DOCKING, GATE.EXPERT], [SKILL.NETTING, GATE.VETERAN]),
    ],
  ],
  [
    FISH.ANGLE_FISH,
    [
      afterFish(FISH.MACKEREL),
      needSkills([SKILL.DOCKING, GATE.MASTER], [SKILL.TURNING, GATE.EXPERT]),
    ],
  ],
  [
    FISH.GROUPER,
    [afterFish(FISH.ANGLE_FISH), needSkills([SKILL.ANCHORING, GATE.GRANDMASTER])],
  ],
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
      needSkills([SKILL.STABILITY, GATE.MYTHIC], [SKILL.WHALING, GATE.LEGENDARY]),
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
    [needSkills([SKILL.CONCENTRATION, GATE.MASTER], [SKILL.PATIENCE, GATE.EXPERT])],
  ],
  [SKILL.ANCHORING, [afterFish(FISH.COD, FISH_ADEPT_LEVEL)]],
  [SKILL.SAILING, [afterFish(FISH.ANGLE_FISH)]],
  // Both down from 400/500: these are prerequisites for skills that are
  // themselves gates, so stacking two 400+ grinds compounded badly.
  [SKILL.NAVIGATION, [needSkills([SKILL.TROLLING, GATE.MASTER])]],
  [SKILL.STABILITY, [needSkills([SKILL.ANCHORING, GATE.GRANDMASTER])]],
  // ─── IMMORTALITY ─────────────────────────────────────────────────────────
  [SKILL.IMMORTALITY, [needSkills([SKILL.AMBITION, GATE.ACCOMPLISHED])]],
  // Deliberately left near their old levels. Immortality is the engine that
  // buys the lifespan every other gate is measured against, so hardening it
  // alongside them would compound into a stall rather than a grind.
  [SKILL.SUPER_IMMORTALITY, [needSkills([SKILL.IMMORTALITY, GATE.MASTER])]],
  [SKILL.TIME_WARPING, [needSkills([SKILL.IMMORTALITY, GATE.VETERAN])]],
  // ─── BOATS & ITEMS ───────────────────────────────────────────────────────
  ...BOATS.map((b): [string, Requirement[]] => [
    b.name,
    [needCoins(Math.round(b.price * BOAT_REVEAL_FRACTION))],
  ]),
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

  masteryTaken: [],
  masteryOffer: [],
  masteryPassed: [],
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
  updateMasteryOffer();
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

// ─── Mastery ───────────────────────────────────────────────────────────────
// Combined levels across every fish and skill - the currency Mastery picks are
// earned with.
export const getTotalLevels = (): number => {
  let total = 0;
  gameState.fishingData.forEach((fish) => (total += fish.level));
  gameState.skillsData.forEach((skill) => (total += skill.level));
  return total;
};

export const getMasteryPicksEarned = (): number =>
  Math.floor(getTotalLevels() / MASTERY_LEVELS_PER_PICK);

// Levels still to climb before the next choice appears.
export const getLevelsUntilNextMastery = (): number =>
  (getMasteryPicksEarned() + 1) * MASTERY_LEVELS_PER_PICK - getTotalLevels();

export const masteryUnlocked = (): boolean =>
  getTotalLevels() >= MASTERY_LEVELS_PER_PICK || gameState.masteryTaken.length > 0;

// Only the taken picks are handed to the multiplier walk - see Mastery in
// classes.svelte.ts for why they aren't tracked on the instances.
export const takenMasteries = (): MasteryData[] =>
  gameState.masteryTaken
    .map((name) => masteryData.get(name))
    .filter((mastery): mastery is MasteryData => mastery !== undefined);

// Three picks drawn from whatever the player has actually unlocked, so an
// offer is never dead weight. Anything already taken - or turned down earlier
// this run - is out of the pool for good.
const rollMasteryOffer = (): string[] => {
  const spent = new Set([...gameState.masteryTaken, ...gameState.masteryPassed]);
  const candidates: string[] = [];
  masteryData.forEach((mastery, name) => {
    if (spent.has(name)) return;
    const target =
      gameState.fishingData.get(mastery.baseData.target) ??
      gameState.skillsData.get(mastery.baseData.target);
    if (!target || needRequirements(gameState, target)) return;
    candidates.push(name);
  });

  const offer: string[] = [];
  while (offer.length < MASTERY_OFFER_SIZE && candidates.length > 0) {
    const index = Math.floor(Math.random() * candidates.length);
    offer.push(candidates.splice(index, 1)[0]);
  }
  return offer;
};

// Rolled once and stored, so the three on the table survive a reload rather
// than being re-rolled every time the page loads.
export const updateMasteryOffer = () => {
  // Drop names the pool no longer knows about. A Mastery renamed or removed
  // since a save was written would otherwise wedge this permanently: the offer
  // stays non-empty so it never re-rolls, while being unrenderable and
  // unchoosable. Stale taken picks are pruned for the same reason - they grant
  // nothing (takenMasteries skips them) but would still consume a pick.
  gameState.masteryOffer = gameState.masteryOffer.filter((name) =>
    masteryData.has(name)
  );
  gameState.masteryTaken = gameState.masteryTaken.filter((name) =>
    masteryData.has(name)
  );

  if (gameState.masteryOffer.length > 0) return;
  if (gameState.masteryTaken.length >= getMasteryPicksEarned()) return;
  gameState.masteryOffer = rollMasteryOffer();
};

export const chooseMastery = (name: string) => {
  if (!gameState.masteryOffer.includes(name)) return;
  gameState.masteryTaken.push(name);
  // The two not chosen are burned for the rest of the run.
  gameState.masteryPassed.push(
    ...gameState.masteryOffer.filter((offered) => offered !== name)
  );
  gameState.masteryOffer = [];
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
  // Mastery picks are per-run: reincarnation puts every one of them back in
  // the pool, including the ones that were turned down.
  gameState.masteryTaken = [];
  gameState.masteryOffer = [];
  gameState.masteryPassed = [];
  // 0, not DAYS_PER_YEAR * STARTING_AGE: calculatedAge() already displays
  // STARTING_AGE + years-elapsed, so a fresh game (day: 0 in the initial
  // gameState above) already shows "Age 14". Setting day to the offset here
  // double-counted it and reset to "Age 28" instead.
  gameState.day = 0;
  gameState.currentlyFishing = gameState.fishingData.get(FISH.SUN_FISH)!;
  gameState.currentSkill = gameState.skillsData.get(SKILL.STRENGTH)!;
};

// How far this run actually got. Each fish is weighted by its position in the
// chain, so a deeper run counts for more and grinding shallow fish is never a
// substitute for progressing - the chain can't be cheesed, since every fish
// needs the previous one at NEXT_FISH_LEVEL plus its own skill gates.
export const getRunDepth = (): number => {
  let depth = 0;
  let tier = 0;
  gameState.fishingData.forEach((fish) => {
    tier += 1;
    depth += fish.level * tier;
  });
  return depth;
};

// legendPoints gained per ascension, before it's added. Tidal Focus and Deep
// Meditation multiply it (mirrors Progress Knight's Evil control x Blood
// meditation), but the base now comes from run depth rather than being a flat
// 1 - see LEGEND_POINT_DEPTH_SCALE above. The square root keeps the reward
// growing while making each extra tier worth a little less than the last, so
// there's a point where ascending beats pushing on.
export const getLegendPointGain = (): number => {
  let tidalFocus = gameState.skillsData.get(SKILL.TIDAL_FOCUS)!;
  let deepMeditation = gameState.skillsData.get(SKILL.DEEP_MEDITATION)!;
  let fromDepth = Math.sqrt(getRunDepth() / LEGEND_POINT_DEPTH_SCALE);
  return (
    Math.max(LEGEND_POINT_MIN_GAIN, fromDepth) *
    tidalFocus.effect *
    deepMeditation.effect
  );
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
  fish(FISH.SUN_FISH,         CATEGORY.LAKE,      0,        5, EFFECT.BASIC,   DESC.LAKE_PAY),         // the bread-and-butter panfish
  fish(FISH.PERCH,            CATEGORY.LAKE,      1,        9, EFFECT.BASIC,   DESC.CONCENTRATION_XP), // light biters, watch the tip
  fish(FISH.BASS,             CATEGORY.LAKE,      2,       15, EFFECT.BASIC,   DESC.STRENGTH_XP),      // pound for pound, a brawler
  fish(FISH.TROUT,            CATEGORY.LAKE,      3,       40, EFFECT.BASIC,   DESC.PATIENCE_XP),      // line-shy and finicky
  fish(FISH.WALEYE,           CATEGORY.LAKE,      4,       80, EFFECT.BASIC,   DESC.TROLLING_XP),      // taken on a trolled crankbait
  fish(FISH.NORTHERN_PIKE,    CATEGORY.LAKE,      5,      150, EFFECT.BASIC,   DESC.HOOKING_XP),       // bony mouth, hard hooksets
  fish(FISH.LAKE_STURGEON,    CATEGORY.LAKE,      6,      300, EFFECT.BASIC,   DESC.REELING_XP),       // enormous, endless reeling

  fish(FISH.PIRANA,           CATEGORY.RIVER,     0,        5, EFFECT.ADEPT,   DESC.CASTING_XP),       // quick, accurate casts
  fish(FISH.SALMON,           CATEGORY.RIVER,     1,       50, EFFECT.ADEPT,   DESC.STRENGTH_XP),      // blistering upstream runs
  fish(FISH.SILVER_DRUM,      CATEGORY.RIVER,     2,      120, EFFECT.ADEPT,   DESC.NETTING_XP),       // schooling bottom fish, netted
  fish(FISH.ARMOURED_CATFISH, CATEGORY.RIVER,     3,      300, EFFECT.ADEPT,   DESC.ANCHORING_XP),     // worked from a held position
  fish(FISH.ELECTRIC_EEL,     CATEGORY.RIVER,     4,     1000, EFFECT.ADEPT,   DESC.CONCENTRATION_XP), // dangerous; stay sharp
  fish(FISH.PACU,             CATEGORY.RIVER,     5,     3000, EFFECT.ADEPT,   DESC.PATIENCE_XP),      // slow, careful bait fishing
  fish(FISH.PAYARA,           CATEGORY.RIVER,     6,    15000, EFFECT.ADEPT,   DESC.RIVER_PAY),        // the river trophy

  fish(FISH.COD,              CATEGORY.OCEAN,     0,      100, EFFECT.DEEP,    DESC.JIGGING_XP),       // classic cod jigging
  fish(FISH.MACKEREL,         CATEGORY.OCEAN,     1,     1000, EFFECT.DEEP,    DESC.DOCKING_XP),       // commercial catch, run to port
  fish(FISH.ANGLE_FISH,       CATEGORY.OCEAN,     2,     7500, EFFECT.DEEP,    DESC.INTELLIGENCE_XP),  // studying the deep
  fish(FISH.GROUPER,          CATEGORY.OCEAN,     3,    50000, EFFECT.DEEPER,  DESC.STABILITY_XP),     // brace, or it reaches the reef
  fish(FISH.STINGRAY,         CATEGORY.OCEAN,     4,   100000, EFFECT.DEEPER,  DESC.TURNING_XP),       // worked slowly over the flats
  fish(FISH.BARRACUDA,        CATEGORY.OCEAN,     5,   200000, EFFECT.DEEPER,  DESC.REELING_XP),       // savage runs
  fish(FISH.BLUEFIN_TUNA,     CATEGORY.OCEAN,     6,   400000, EFFECT.ABYSSAL, DESC.STRENGTH_XP),      // hours in the fighting chair
  fish(FISH.BLUE_MARLIN,      CATEGORY.OCEAN,     7,   800000, EFFECT.ABYSSAL, DESC.SAILING_XP),       // big-game offshore seamanship
  fish(FISH.SWORDFISH,        CATEGORY.OCEAN,     8,  1600000, EFFECT.ABYSSAL, DESC.NAVIGATION_XP),    // deep-drop marks, found at night
  fish(FISH.SHARK,            CATEGORY.OCEAN,     9,  2400000, EFFECT.APEX,    DESC.OCEAN_PAY),        // chummed, and it pays
  fish(FISH.WHALE,            CATEGORY.OCEAN,    10,  3200000, EFFECT.APEX,    DESC.ALL_XP),           // the apex of the trade
]);

export const skillBaseData: Map<string, SkillBaseData> = new Map([
  //      name                       category                 effect            description
  // Fundamentals stay broad - they're qualities, not techniques.
  skill(SKILL.STRENGTH,           CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.FISHING_PAY),
  skill(SKILL.CONCENTRATION,      CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.SKILL_XP),
  skill(SKILL.INTELLIGENCE,       CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.FISHING_SKILL_XP),
  skill(SKILL.PATIENCE,           CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.FISHING_XP),
  skill(SKILL.AMBITION,           CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.RIVER_PAY),
  skill(SKILL.COMMUNICATION,      CATEGORY.FUNDAMENTALS, EFFECT.BASIC,            DESC.OCEAN_PAY),

  // Each technique boosts the fish you'd actually use it on.
  skill(SKILL.CASTING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.BASS_XP),
  skill(SKILL.JIGGING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.PERCH_XP),
  skill(SKILL.TROLLING,           CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.NORTHERN_PIKE_XP),
  skill(SKILL.REELING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.SALMON_XP),
  skill(SKILL.HOOKING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.PAYARA_XP),
  skill(SKILL.NETTING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.MACKEREL_XP),
  skill(SKILL.WHALING,            CATEGORY.FISHING,      EFFECT.ADEPT,            DESC.WHALE_XP),

  // Boat handling: what the boat lets you hold, chase, or reach.
  skill(SKILL.DOCKING,            CATEGORY.BOATING,      EFFECT.DEEP,             DESC.OCEAN_PAY),
  skill(SKILL.TURNING,            CATEGORY.BOATING,      EFFECT.DEEP,             DESC.BARRACUDA_XP),
  skill(SKILL.ANCHORING,          CATEGORY.BOATING,      EFFECT.DEEP,             DESC.GROUPER_XP),
  skill(SKILL.SAILING,            CATEGORY.BOATING,      EFFECT.DEEP,             DESC.OCEAN_XP),
  skill(SKILL.NAVIGATION,         CATEGORY.BOATING,      EFFECT.DEEP,             DESC.BLUE_MARLIN_XP),
  skill(SKILL.STABILITY,          CATEGORY.BOATING,      EFFECT.DEEP,             DESC.BLUEFIN_TUNA_XP),

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
  skill(SKILL.OLD_HAGGLER,        CATEGORY.LEGEND,       EFFECT.EXPENSE_DECAY,    DESC.EXPENSES),
  skill(SKILL.WEATHERED_INSTINCT, CATEGORY.LEGEND,       EFFECT.LEGEND,           DESC.OCEAN_XP),
  skill(SKILL.DEEP_MEDITATION,    CATEGORY.LEGEND,       EFFECT.LEGEND,           DESC.LEGEND_POINT_GAIN),
  skill(SKILL.SUNKEN_FORTUNE,     CATEGORY.LEGEND,       EFFECT.LEGEND_PAY,       DESC.FISHING_PAY),
]);

export const boatBaseData: Map<string, BoatBaseData> = new Map(
  BOATS.map((b): [string, BoatBaseData] => [
    b.name,
    {
      name: b.name,
      price: b.price,
      bought: false,
      effect: b.effect,
      description: b.description,
    },
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

// Static: the pool never changes, and which picks are live is tracked by
// gameState.masteryTaken rather than on these entries.
export const masteryData: Map<string, MasteryData> = new Map(
  Object.entries(MASTERY_NAMES).map(([target, name]): [string, MasteryData] => [
    name,
    {
      name,
      effect: MASTERY_EFFECT,
      baseData: { name, target, description: masteryXpOf(target) },
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
