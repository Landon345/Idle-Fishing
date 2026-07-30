import {
  applySpeed,
  daysToYears,
  getTotalExpenses,
  highestTierFishPerCategory,
  lowestLevelSkill,
  needRequirements,
  roundRobinFish,
} from "src/functions";
import { updateAchievements } from "src/achievements";
import type { Fishing } from "src/classes.svelte";

import type {
  AscensionResult,
  BoatBaseData,
  CrewMember,
  Description,
  FishBaseData,
  GameDataType,
  ItemBaseData,
  MasteryBaseData,
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
// Xp every task earns per in-game day before any multipliers. Halved back to
// 10 per balance feedback: the multiplier stack (crew, Mastery, boating
// skills all landing on top of each other now) had grown enough that the
// doubled base was compounding into levels far faster than the xp curves
// were tuned to expect.
export const BASE_XP_PER_DAY = 10;
// How long autoFish spends on one region before rotating to the next. At the
// base game speed of 10 days/second this is ~3 real seconds per region.
export const AUTO_FISH_ROTATION_DAYS = 30;

// ─── Active fishing minigame ────────────────────────────────────────────────
// A Stardew-style optional minigame: cast, wait for a bite, then hold to keep a
// bar overlapping a drifting fish icon until a catch meter fills. Positions are
// percent of track height (0 = bottom, 100 = top), matching the percentage
// convention XpBar.svelte already uses for its fill. A win pays out
// ACTIVE_FISHING_REWARD_BASE_SECONDS (scaled by catch quality) worth of the
// target fish's *existing* xpGain/income rates - see grantActiveFishingReward -
// so a harder/deeper fish already pays more per catch for free, without a
// separate difficulty-to-reward multiplier.
export const ACTIVE_FISHING_BITE_DELAY_MIN_MS = 1000;
export const ACTIVE_FISHING_BITE_DELAY_MAX_MS = 3000;

export const ACTIVE_FISHING_GRAVITY = -110; // %/s², always applied
export const ACTIVE_FISHING_THRUST = 230; // %/s², added while held
export const ACTIVE_FISHING_MAX_BAR_SPEED = 90; // %/s, clamp

// Easy/hard pairs below are lerp'd by getFishingDifficulty()'s 0..1 result.
export const ACTIVE_FISHING_BAR_HEIGHT_EASY = 30; // % of track
export const ACTIVE_FISHING_BAR_HEIGHT_HARD = 16;

export const ACTIVE_FISHING_FISH_SPEED_EASY = 18; // %/s
export const ACTIVE_FISHING_FISH_SPEED_HARD = 48;
export const ACTIVE_FISHING_FISH_RETARGET_EASY_MS = 1800;
export const ACTIVE_FISHING_FISH_RETARGET_HARD_MS = 700;

// How far a single fish's difficulty can swing from its depth-based baseline
// (see getFishingDifficulty), in either direction - the reason two fish at
// the same depth aren't identically hard.
export const ACTIVE_FISHING_DIFFICULTY_JITTER = 0.12;

// Training a fish's matching fishing/boating technique subtracts
// ln(1 + level) * this from its difficulty - see getFishingDifficulty. At
// 0.12: level 10 -> -0.29, level 100 -> -0.55, level 500 -> -0.75, level
// 900 -> -0.82 - big early gains that keep taper off rather than a flat
// per-level discount, matching "logarithmic scale."
export const ACTIVE_FISHING_SKILL_DIFFICULTY_LOG_SCALE = 0.12;
// Difficulty never drops below this, no matter how easy the fish or how
// trained the matching skill - always some challenge left, never literally 0.
export const ACTIVE_FISHING_MIN_DIFFICULTY = 0.1;

// Per-species personality, layered on top of the depth-based difficulty
// above rather than replacing it - two fish at the same depth still swim
// differently. Deterministic per fish (see getFishBehavior/hashFraction
// below, keyed on the fish's name), so it's stable across rounds without
// needing a new persisted field. speedMultiplier/retargetMultiplier jitter
// every fish's baseline pace up or down; dashChance is how often a species
// suddenly bursts at dashSpeedMultiplier'x speed on a retarget rather than
// drifting normally - a "smooth" fish rolls near 0, a "mixed"/erratic one
// rolls high, mirroring the range of movement styles Stardew's fish have.
export const ACTIVE_FISHING_SPEED_JITTER_MIN = 0.75;
export const ACTIVE_FISHING_SPEED_JITTER_MAX = 1.35;
export const ACTIVE_FISHING_RETARGET_JITTER_MIN = 0.7;
export const ACTIVE_FISHING_RETARGET_JITTER_MAX = 1.5;
export const ACTIVE_FISHING_MAX_DASH_CHANCE = 0.35; // per-retarget probability
export const ACTIVE_FISHING_DASH_SPEED_MULTIPLIER = 2.2;

// Starts above 0 so a slow first input doesn't insta-fail the round.
export const ACTIVE_FISHING_METER_START = 25; // %
// Fill halved twice over per balance feedback (originally 55/40, then
// 27.5/20): a perfectly-tracked catch at the original rate filled in
// ~1.4-1.9s, which read as "catching way too quickly" rather than a real
// minigame. Halving roughly doubles time-to-catch at any given overlap ratio
// each time. Drain halved once alongside it, to bring fill back above drain
// at every difficulty (two fill halvings with a fixed drain had tipped hard
// fish to 5x drain-over-fill, punishing a brief lapse far harder than an
// on-target moment paid off).
export const ACTIVE_FISHING_FILL_RATE_EASY = 13.75; // %/s while overlapping
export const ACTIVE_FISHING_FILL_RATE_HARD = 10;
export const ACTIVE_FISHING_DRAIN_RATE_EASY = 14; // %/s while not overlapping
export const ACTIVE_FISHING_DRAIN_RATE_HARD = 25;

// rewardSeconds = this * quality, where quality is
// clamp(ACTIVE_FISHING_QUALITY_PAR_SECONDS / reelSeconds, 0.5, 2.0) - a par
// catch is 1.0x; faster/cleaner catches pay more, a slow grind still floors at
// 0.5x rather than dropping further.
export const ACTIVE_FISHING_REWARD_BASE_SECONDS = 30;
// Raised alongside the fill-rate halvings above so "par" still means a normal
// catch, not one that's now finishing well under the old cap.
export const ACTIVE_FISHING_QUALITY_PAR_SECONDS = 24;

// ─── Categories ────────────────────────────────────────────────────────────
// These strings key both the base-data tables and the per-category multiplier
// switches in functions.ts, and are used as UI section headers.
export const CATEGORY = {
  LAKE: "lake",
  RIVER: "river",
  OCEAN: "ocean",
  FUNDAMENTALS: "fundamentals",
  // Renamed from FISHING/"fishing": the Skills tab table header is this
  // string, capitalized (see ProgressTable.svelte) - "Technique" reads
  // better next to "Boating" than "Fishing" did, and matches the "Technique
  // Xp" broad-effect name already used elsewhere for this same skill group.
  TECHNIQUE: "technique",
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
  TECHNIQUE_XP: "Technique Xp",
  BOATING_XP: "Boating Xp",
  // Region xp.
  LAKE_XP: "Lake Xp",
  RIVER_XP: "River Xp",
  OCEAN_XP: "Ocean Xp",
  // Single-skill xp. Owned by the fish whose capture builds that quality -
  // see fishBaseData. Only the six fundamentals have a fish pointing at them;
  // fishing/boating skills no longer do (fish target fundamentals now), so
  // their per-skill kinds (Jigging Xp, Docking Xp, etc.) were removed rather
  // than left as dead entries nothing has as a description.
  STRENGTH_XP: "Strength Xp",
  CONCENTRATION_XP: "Concentration Xp",
  INTELLIGENCE_XP: "Intelligence Xp",
  COMMUNICATION_XP: "Communication Xp",
  AMBITION_XP: "Ambition Xp",
  PATIENCE_XP: "Patience Xp",
  // Netting and Whaling are each boosted by one boat (Airboat, Whaling Ship
  // respectively) rather than a fish or an item - items are broad-only, see
  // the comment above the ITEMS table. Casting Xp and Hooking Xp were removed
  // alongside the other per-skill kinds below: Rod and Hook were their sole
  // owners, and both moved to a broad target when items stopped targeting
  // single skills.
  NETTING_XP: "Netting Xp",
  WHALING_XP: "Whaling Xp",
  // Single-fish xp. Fishing skills each own one river fish's kind, one to one
  // (Casting->Pirana, Jigging->Salmon, ... Gaffing->Payara, matching the seven
  // skills to the seven river fish in order); boating skills each own one
  // ocean fish's kind the same way - Docking->Cod, ..., Stability->Barracuda,
  // then Whaling on Whale as a capstone. Every ocean fish now has one: Bluefin
  // Tuna/Blue Marlin/Swordfish/Shark, the four with no boating skill of their
  // own, were removed outright rather than left dangling on the broad Ocean
  // Xp/Ocean Pay/All Xp effects.
  // Bass Xp keeps a single owner (Bass Boat) even though Casting moved off it.
  BASS_XP: "Bass Xp",
  PIRANA_XP: "Pirana Xp",
  SALMON_XP: "Salmon Xp",
  SILVER_DRUM_XP: "Silver Drum Xp",
  ARMOURED_CATFISH_XP: "Armoured Catfish Xp",
  ELECTRIC_EEL_XP: "Electric Eel Xp",
  PACU_XP: "Pacu Xp",
  PAYARA_XP: "Payara Xp",
  COD_XP: "Cod Xp",
  MACKEREL_XP: "Mackerel Xp",
  ANGLE_FISH_XP: "Angle Fish Xp",
  GROUPER_XP: "Grouper Xp",
  STINGRAY_XP: "Stingray Xp",
  BARRACUDA_XP: "Barracuda Xp",
  WHALE_XP: "Whale Xp",
  // Income. Effects generally avoid stacking more than a few owners deep, so
  // that no two things the player is choosing between do the same job - but
  // OCEAN_PAY is deliberately the exception, carried by Communication and the
  // Yacht at once (Docking moved to Cod Xp, and Shark - its third owner - was
  // removed outright, see fishBaseData). The ocean is late game, and it is
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
  GAFFING: "Gaffing",
  DOCKING: "Docking",
  TURNING: "Turning",
  ANCHORING: "Anchoring",
  SAILING: "Sailing",
  NAVIGATION: "Navigation",
  STABILITY: "Stability",
  WHALING: "Whaling",
  IMMORTALITY: "Immortality",
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
  // Boating skills, per balance feedback: lowered on their own rather than as
  // part of the ocean-fish tiering below, even though the two used to share a
  // rate.
  BOATING: 0.03,
  // Every ocean fish, Cod through Whale. Previously staged across four bands
  // (DEEP/DEEPER/ABYSSAL/APEX, 0.05 up to 0.5, escalating with depth so late
  // fish paid off more than early ones); flattened to a single rate per
  // balance feedback, so a Whale level is worth the same payoff as a Cod one.
  OCEAN: 0.03,
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
//
// The ocean base used to be 250,000, which made Cod a wall rather than an
// opening: Cod has no fish prerequisite, so it is commonly reached straight
// from Lake Sturgeon (3,200) - a 78x step, and still 4x the deepest river
// fish a player is likely to have levelled. Entry now sits near the middle of
// the river instead, and the slightly gentler ramp carries the reduction
// through the whole region rather than only the first fish.
const REGION_XP: Record<string, { base: number; growth: number }> = {
  [CATEGORY.LAKE]: { base: 50, growth: 2 },
  [CATEGORY.RIVER]: { base: 100, growth: 5 },
  [CATEGORY.OCEAN]: { base: 60_000, growth: 2.8 },
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
  [CATEGORY.TECHNIQUE]: 300,
  [CATEGORY.BOATING]: 500,
  // Raised per balance feedback: Immortality/Time Warping used to share the
  // cheapest (fundamentals) tier, which was left alone
  // specifically because slowing the skill line that grants lifespan - and so
  // gates Ascension - would have stalled progression outright. The Ageing
  // Stone (buyable in Reincarnation) now covers exactly that gap: a player
  // behind on Immortality can pay gold for the years instead of waiting on
  // levels, so a real cost here no longer risks a hard stall.
  [CATEGORY.IMMORTALITY]: 400,
  // Unchanged: still drives the ascension reset loop, and the legend-point
  // economy (getLegendPointGain) is tuned separately from this base.
  [CATEGORY.LEGEND]: 100,
};

// ─── Unlock gates ──────────────────────────────────────────────────────────
// Level a fish must reach before the next fish in its region unlocks.
const NEXT_FISH_LEVEL = 10;

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
// Picks stack: taking the same Mastery again raises its multiplier rather than
// being wasted, so pouring every choice into one target is a real strategy.
// Additive rather than compounding - at one pick per 200 levels a run yields
// enough choices that compounding would run away.
//
// This is the rate for the entity Masteries, which are bound to a single fish
// or skill and so can afford to be steep: one stack is x2, two x3, three x4.
// The broad Masteries below carry their own, much smaller rates.
export const MASTERY_EFFECT_PER_STACK = 1;

// An entity Mastery targets one fish or skill and multiplies its xp. The
// description is always "<target> Xp", which the generic per-entity rule in
// functions.ts resolves without any switch case - so the cast is safe by
// construction: `target` always comes from the FISH/SKILL tables, never a
// hand-typed string.
const masteryXpOf = (target: string) => `${target} Xp` as Description;

// Masteries bound to no single entity. They hit one of the broad effects
// instead, so they are always on offer - there is no target that could be
// locked - and each carries its own per-stack rate, well under the entity
// rate: x2 on one fish is a nudge, x2 on everything is a different game.
const MASTERY_BROAD: {
  name: string;
  description: Description;
  effectPerStack: number;
}[] = [
  { name: "Sea Change", description: DESC.ALL_XP, effectPerStack: 0.15 },
  { name: "Quick Study", description: DESC.SKILL_XP, effectPerStack: 0.4 },
  {
    name: "Fisher's Instinct",
    description: DESC.FISHING_XP,
    effectPerStack: 0.4,
  },
  { name: "Good Haul", description: DESC.FISHING_PAY, effectPerStack: 0.5 },
];

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
  [SKILL.GAFFING]: "Gaff Strike",
  [SKILL.DOCKING]: "Tight Berth",
  [SKILL.TURNING]: "Hard Rudder",
  [SKILL.ANCHORING]: "Sure Hold",
  [SKILL.SAILING]: "Wind Sense",
  [SKILL.NAVIGATION]: "Dead Reckoning",
  [SKILL.STABILITY]: "Sea Legs",
  [SKILL.WHALING]: "Harpoon Form",
  [SKILL.IMMORTALITY]: "Old Salt",
  [SKILL.TIME_WARPING]: "Tide Bender",
  [SKILL.SEA_LEGEND]: "Living Legend",
  [SKILL.TIDAL_FOCUS]: "Moon Pull",
  [SKILL.OLD_HAGGLER]: "Sharp Tongue",
  [SKILL.WEATHERED_INSTINCT]: "Storm Sense",
  [SKILL.DEEP_MEDITATION]: "Silent Depths",
  [SKILL.SUNKEN_FORTUNE]: "Treasure Sense",
};

// ─── Tackle box ────────────────────────────────────────────────────────────
// A cap on how many items can be equipped at once. Without it you simply
// equip everything the moment you can afford it, which is why running costs
// stopped meaning anything - the choice was never "which items", only "how
// soon". Slots are bought with gold, so the cap loosens as you get richer.
//
// The price climbs an order of magnitude a slot because it is competing with
// exponential income: 100k, 1M, 10M and so on. This is a mid-game sink by
// design - nothing priced in flat coins stays relevant against late income.
export const TACKLE_SLOTS_BASE = 2;
const TACKLE_SLOT_PRICE_BASE = 100_000;
const TACKLE_SLOT_PRICE_GROWTH = 10;

// ─── Ageing Stone ──────────────────────────────────────────────────────────
// Ascension needs gameState.day >= ageToDay(200), which is otherwise pure
// calendar time: nothing buys it faster, so a player who has pushed every
// other system to an absurd height still has to sit and wait for the clock.
// An Ageing Stone instantly adds AGING_STONE_YEARS to `day`, letting gold
// substitute for the wait once there is enough of it to spend.
export const AGING_STONE_YEARS = 20;
// Priced to read as the single most expensive purchase in the game: 500M
// clears every boat (Whaling Ship, the top one, is 180M after the later 3x
// boat-price pass) and the first upgrade on every item (House, the top one,
// is 80M) outright. Growth of 5x/stone
// means the run of stones needed to cross the whole gate - roughly six, from
// the natural Age 70 wall to Age 200 - totals about 9.8T, on the order of a
// few days of late-game income (Whale plus a full build was measured at
// ~3.2e12/day). A steep but reachable ask for the "upgraded everything"
// player this is aimed at, not a casual one.
const AGING_STONE_BASE_PRICE = 500_000_000;
const AGING_STONE_PRICE_GROWTH = 5;

// ─── Crew ──────────────────────────────────────────────────────────────────
// Three candidates turn up at each rebirth and you may keep one. Crew carry
// across rebirths - they are the thing that persists while everything else
// resets - but ascension pays them off along with maxLevel.
//
// Each draws a daily wage set as a *share* of your best fish income rather
// than a fixed sum. A flat price would be outrun by exponential income within
// a couple of days, which is exactly why every other gold sink in the game
// stops mattering.
export const CREW_MAX = 3;
export const CREW_OFFER_SIZE = 3;
export const CREW_UPGRADE_COUNT = 3;
// Perk sizes: x1.5 to x3.00 in x0.25 steps - for a perk bound to one fish or
// skill, same as an entity Mastery is allowed to be steep.
const CREW_EFFECT_MIN = 1.5;
const CREW_EFFECT_MAX = 3;
const CREW_EFFECT_STEP = 0.25;
// Broad perks (All Xp, Skill Xp, Fishing Xp, Fishing Pay) hit every task of
// their kind at once rather than one target, so they get the same treatment
// as the broad Masteries above: a much smaller range than an entity perk,
// x1.10 to x1.70 in x0.05 steps, so a lucky roll on a hire's perk can't do
// what should take several roguelite picks to earn.
const CREW_BROAD_EFFECT_MIN = 1.1;
const CREW_BROAD_EFFECT_MAX = 1.7;
const CREW_BROAD_EFFECT_STEP = 0.05;
// Daily wage, as a fraction of the best available fish income.
const CREW_WAGE_MIN = 0.1;
const CREW_WAGE_MAX = 0.3;

const CREW_FIRST_NAMES = [
  "Abe",
  "Bess",
  "Cal",
  "Dot",
  "Eli",
  "Fen",
  "Gus",
  "Hank",
  "Ida",
  "Jonah",
  "Kit",
  "Lars",
  "Mabel",
  "Ned",
  "Ola",
  "Rusty",
  "Sal",
  "Tess",
  "Vera",
  "Zeb",
];

const CREW_LAST_NAMES = [
  "Ashby",
  "Barlow",
  "Creel",
  "Dunmore",
  "Ebbs",
  "Fisk",
  "Gale",
  "Harrow",
  "Ives",
  "Jessop",
  "Keel",
  "Lowe",
  "Marsh",
  "Netherby",
  "Orme",
  "Quimby",
  "Rooke",
  "Salter",
  "Tarrow",
  "Vance",
];

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
const BOATS: {
  name: string;
  price: number;
  effect: number;
  description: Description;
}[] = [
  //  name                    price        effect  target
  // Row Boat and Silver Bullet raised 10x (600 -> 6,000; 3,000 -> 30,000) per
  // earlier balance feedback: the earliest boats should be a bigger
  // commitment. Bass Boat was left alone at the time rather than scaled the
  // same way - a 10x bump there would have pushed it past Canoe/River
  // Skiff's prices despite gating earlier (lake, not river) content,
  // breaking the ladder's price order. Every price below is additionally
  // 3x'd per the most recent balance pass, applied uniformly across the
  // whole ladder so that ordering is preserved.
  {
    name: BOAT.ROW_BOAT,
    price: 18_000,
    effect: 1.25,
    description: DESC.LAKE_XP,
  },
  {
    name: BOAT.SILVER_BULLET,
    price: 90_000,
    effect: 1.5,
    description: DESC.LAKE_PAY,
  },
  {
    name: BOAT.BASS_BOAT,
    price: 180_000,
    effect: 1.5,
    description: DESC.BASS_XP,
  },
  {
    name: BOAT.CANOE,
    price: 600_000,
    effect: 1.75,
    description: DESC.RIVER_XP,
  },
  {
    name: BOAT.RIVER_SKIFF,
    price: 1_800_000,
    effect: 2,
    description: DESC.RIVER_PAY,
  },
  {
    name: BOAT.AIRBOAT,
    price: 5_400_000,
    effect: 2,
    description: DESC.NETTING_XP,
  },
  {
    name: BOAT.SAIL_BOAT,
    price: 16_200_000,
    effect: 2.5,
    description: DESC.OCEAN_XP,
  },
  {
    name: BOAT.YACHT,
    price: 48_600_000,
    effect: 3,
    description: DESC.OCEAN_PAY,
  },
  // The ship is where you learn the trade; the skill is what lands the whale.
  {
    name: BOAT.WHALING_SHIP,
    price: 180_000_000,
    effect: 3,
    description: DESC.WHALING_XP,
  },
];

// ─── Items ─────────────────────────────────────────────────────────────────
// `expense` is charged per day while the item is selected. Every item targets
// a broad kind - a whole region or category - rather than one fish or skill:
// gear should feel like general-purpose equipment, not a tool for one specific
// catch. No two items share a target - previously Book, Pliers and Fish
// Finder all bought "Skill Xp", which made Fish Finder strictly dominated
// (10x the cost of Pliers for a *smaller* multiplier on the same thing)
// rather than a choice.
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
  {
    name: ITEM.ROD,
    expense: 5,
    effect: 2,
    description: DESC.LAKE_XP,
    revealAt: 500,
  },
  {
    name: ITEM.BOOK,
    expense: 40,
    effect: 1.75,
    description: DESC.SKILL_XP,
    revealAt: 3_000,
  },
  {
    name: ITEM.NET,
    expense: 200,
    effect: 1.75,
    description: DESC.FISHING_XP,
    revealAt: 30_000,
  },
  {
    name: ITEM.HOOK,
    expense: 1_200,
    effect: 2,
    description: DESC.RIVER_XP,
    revealAt: 50_000,
  },
  {
    name: ITEM.BAIT,
    expense: 6_000,
    effect: 2.25,
    description: DESC.TECHNIQUE_XP,
    revealAt: 300_000,
  },
  {
    name: ITEM.HAM_SANDWICH,
    expense: 30_000,
    effect: 2.5,
    description: DESC.BOATING_XP,
    revealAt: 500_000,
  },
  {
    name: ITEM.PLIERS,
    expense: 200_000,
    effect: 2.75,
    description: DESC.OCEAN_XP,
    revealAt: 1_000_000,
  },
  {
    name: ITEM.FISH_FINDER,
    expense: 1_200_000,
    effect: 3,
    description: DESC.FISHING_PAY,
    revealAt: 5_000_000,
  },
  {
    name: ITEM.HOUSE,
    expense: 8_000_000,
    effect: 3,
    description: DESC.ALL_XP,
    revealAt: 10_000_000,
  },
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
    return (
      gameState.fishingData.get(requirement.name)!.level >=
      (requirement.requirement as number)
    );
  }
}

export class SkillRequirement extends Requirement {
  constructor(requirements: RequirementObj[]) {
    super(requirements, "skill");
  }
  getCondition(requirement: RequirementObj) {
    return (
      gameState.skillsData.get(requirement.name)!.level >=
      (requirement.requirement as number)
    );
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
    return (
      gameState.boatData.get(requirement.name)!.bought ==
      requirement.requirement
    );
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
  new SkillRequirement(
    gates.map(([name, requirement]) => ({ name, requirement })),
  );

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
  [
    FISH.TROUT,
    [afterFish(FISH.BASS), needSkills([SKILL.STRENGTH, GATE.DABBLING])],
  ],
  [
    FISH.WALEYE,
    [
      afterFish(FISH.TROUT),
      needSkills([SKILL.STRENGTH, GATE.APPRENTICE]),
      needBoat(BOAT.SILVER_BULLET),
    ],
  ],
  [
    FISH.NORTHERN_PIKE,
    [afterFish(FISH.WALEYE), needSkills([SKILL.AMBITION, GATE.PROFICIENT])],
  ],
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
  [
    FISH.SALMON,
    [afterFish(FISH.PIRANA), needSkills([SKILL.STRENGTH, GATE.APPRENTICE])],
  ],
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
  [
    FISH.PACU,
    [afterFish(FISH.ELECTRIC_EEL), needSkills([SKILL.TROLLING, GATE.EXPERT])],
  ],
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
      needSkills(
        [SKILL.PATIENCE, GATE.MASTER],
        [SKILL.CONCENTRATION, GATE.MASTER],
      ),
      needBoat(BOAT.SAIL_BOAT),
    ],
  ],
  // Netting used to also gate Mackerel, its own effect target - which meant
  // Netting had to unlock *before* Mackerel to ever reach the level Mackerel
  // demanded, no matter how the two skills' own gates were arranged. Dropped
  // so Netting's own unlock (below) can require Mackerel outright instead.
  [
    FISH.MACKEREL,
    [afterFish(FISH.COD), needSkills([SKILL.DOCKING, GATE.EXPERT])],
  ],
  // Second condition moved from Turning to Netting (freed up by the Mackerel
  // change above) at the same level: Turning is no longer available this
  // early, for the same reason it had to stop gating Barracuda below.
  [
    FISH.ANGLE_FISH,
    [
      afterFish(FISH.MACKEREL),
      needSkills([SKILL.DOCKING, GATE.MASTER], [SKILL.NETTING, GATE.EXPERT]),
    ],
  ],
  [
    FISH.GROUPER,
    [
      afterFish(FISH.ANGLE_FISH),
      needSkills([SKILL.ANCHORING, GATE.GRANDMASTER]),
    ],
  ],
  [
    FISH.STINGRAY,
    [afterFish(FISH.GROUPER), needSkills([SKILL.DOCKING, GATE.RENOWNED])],
  ],
  // Turning used to also gate Barracuda, its own effect target - the same
  // problem Netting/Mackerel had. Replaced with another step of Docking
  // (already escalating Mackerel -> Angle Fish -> Stingray) so Turning's own
  // unlock (below) can require Barracuda outright instead.
  [
    FISH.BARRACUDA,
    [afterFish(FISH.STINGRAY), needSkills([SKILL.DOCKING, GATE.LEGENDARY])],
  ],
  // Whaling gates the Whale. It previously gated nothing at all - the skill
  // was unlockable, trainable, and completely inert, and its "Whale Pay"
  // effect duplicated Navigation's. Anchored to Barracuda now that Bluefin
  // Tuna/Blue Marlin/Swordfish/Shark - the ocean fish with no boating skill
  // of their own - are gone (see skillBaseData/fishBaseData for why).
  [
    FISH.WHALE,
    [
      afterFish(FISH.BARRACUDA),
      needSkills(
        [SKILL.STABILITY, GATE.MYTHIC],
        [SKILL.WHALING, GATE.LEGENDARY],
      ),
      needBoat(BOAT.WHALING_SHIP),
    ],
  ],
  // ─── FUNDAMENTALS ────────────────────────────────────────────────────────
  [SKILL.STRENGTH, []],
  [SKILL.CONCENTRATION, []],
  [SKILL.INTELLIGENCE, [needSkills([SKILL.CONCENTRATION, GATE.DABBLING])]],
  [SKILL.PATIENCE, [needSkills([SKILL.CONCENTRATION, GATE.NOVICE])]],
  [SKILL.AMBITION, [needSkills([SKILL.INTELLIGENCE, GATE.APPRENTICE])]],
  // Matches Cod's own requirement exactly (see the ocean section below), so
  // the two unlock in the same instant - talking the trade up with other
  // sailors is a saltwater thing, not a lakeside one, and it's a genuinely
  // difficult gate rather than the early Intelligence/Strength check this
  // used to be.
  [
    SKILL.COMMUNICATION,
    [
      needSkills(
        [SKILL.PATIENCE, GATE.MASTER],
        [SKILL.CONCENTRATION, GATE.MASTER],
      ),
      needBoat(BOAT.SAIL_BOAT),
    ],
  ],
  // ─── FISHING SKILLS ──────────────────────────────────────────────────────
  // Each now targets one river fish's xp one to one, in order (see
  // skillBaseData) - Casting boosts Pirana, Jigging boosts Salmon, and so on
  // down to Gaffing boosting Payara. Their own unlock is anchored to the
  // river fish just *before* that target, so a skill is trainable a little
  // ahead of when it becomes useful rather than sitting inert for most of
  // the game (the fault with the old fundamental-based gates - Whaling, the
  // skill Gaffing replaced here, needed only Strength 250 and so could be
  // trained the length of the game before its target ever opened up).
  //
  // Checked every one of these against every OTHER place the same skill
  // gates something, not just its own target, so the new gate can't create a
  // cycle - none of these are also required by a fish earlier than their new
  // anchor, unlike Turning below.
  //
  // Pirana has no preceding river fish (it's the first), so Casting mirrors
  // Pirana's own requirement exactly instead - the same trick Communication
  // and Docking use below for Cod.
  //
  // The other six still anchor to the preceding river fish (kept in parallel
  // with river progression rather than decoupled onto a flat level/coin
  // gate), but at half the default afterFish() threshold (level 5, not 10)
  // per balance feedback - the techniques were sitting locked a little too
  // long relative to how quickly the river fish under them level.
  [SKILL.CASTING, [needSkills([SKILL.STRENGTH, GATE.DABBLING])]],
  [SKILL.JIGGING, [afterFish(FISH.PIRANA, 5)]],
  [SKILL.TROLLING, [afterFish(FISH.SALMON, 5)]],
  [SKILL.REELING, [afterFish(FISH.SILVER_DRUM, 5)]],
  [SKILL.HOOKING, [afterFish(FISH.ARMOURED_CATFISH, 5)]],
  [SKILL.NETTING, [afterFish(FISH.ELECTRIC_EEL, 5)]],
  [SKILL.GAFFING, [afterFish(FISH.PACU, 5)]],
  // ─── BOATING SKILLS ──────────────────────────────────────────────────────
  // Each now targets one ocean fish's xp one to one, the same way - the
  // first six in order, plus Whaling further down, anchored to Barracuda
  // rather than the next fish in line since its target moved to Whale (see
  // skillBaseData). Docking mirrors Cod's own requirement (Cod, like
  // Pirana, is the first fish in its region with nothing to anchor before
  // it) - the same "exact match" trick as Communication above.
  [
    SKILL.DOCKING,
    [
      needSkills(
        [SKILL.PATIENCE, GATE.MASTER],
        [SKILL.CONCENTRATION, GATE.MASTER],
      ),
      needBoat(BOAT.SAIL_BOAT),
    ],
  ],
  [SKILL.TURNING, [afterFish(FISH.COD)]],
  [SKILL.ANCHORING, [afterFish(FISH.MACKEREL)]],
  // Sailing used to stay on needBoat(SAIL_BOAT) specifically so its old
  // broad "Ocean Xp" effect could help Cod - the ocean's entry fish - as soon
  // as the boat was bought. That reasoning no longer applies now that
  // Sailing's effect targets Grouper alone, so it moves to the same
  // preceding-fish anchor as everything else here.
  [SKILL.SAILING, [afterFish(FISH.ANGLE_FISH)]],
  [SKILL.NAVIGATION, [afterFish(FISH.GROUPER)]],
  [SKILL.STABILITY, [afterFish(FISH.STINGRAY)]],
  // Whaling now targets Whale (see skillBaseData), so it's anchored to
  // Barracuda - the ocean fish just before Whale now that Bluefin Tuna/Blue
  // Marlin/Swordfish/Shark are gone - rather than Pacu, its old anchor from
  // when it was a river-fishing technique. Whale's own gate separately
  // requires Whaling at Legendary (below); anchoring the unlock itself to
  // Barracuda rather than Whale keeps that from being circular.
  [SKILL.WHALING, [afterFish(FISH.BARRACUDA)]],
  // ─── IMMORTALITY ─────────────────────────────────────────────────────────
  [SKILL.IMMORTALITY, [needSkills([SKILL.AMBITION, GATE.ACCOMPLISHED])]],
  // Deliberately left near its old level. Immortality is the engine that
  // buys the lifespan every other gate is measured against, so hardening it
  // would compound into a stall rather than a grind.
  [SKILL.TIME_WARPING, [needSkills([SKILL.IMMORTALITY, GATE.VETERAN])]],
  // ─── BOATS & ITEMS ───────────────────────────────────────────────────────
  ...BOATS.map((b): [string, Requirement[]] => [
    b.name,
    [needCoins(Math.round(b.price * BOAT_REVEAL_FRACTION))],
  ]),
  ...ITEMS.map((i): [string, Requirement[]] => [
    i.name,
    [needCoins(i.revealAt)],
  ]),
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

  crew: [],
  crewOffer: [],

  tackleSlotsBought: 0,
  agingStonesBought: 0,

  totalCoinsEarned: 0,
  totalCrewHired: 0,
  achievementsEarned: [],
});

export const update = (
  paused: boolean,
  autoTrain: boolean,
  autoFish: boolean,
  deltaSeconds: number,
) => {
  if (paused) {
    return;
  }
  increaseDay(deltaSeconds);
  updateCurrentFish(deltaSeconds);
  updateCurrentSkill(deltaSeconds);
  updateItemExpenses(deltaSeconds);
  enforceTackleCapacity();
  updateMasteryOffer();
  updateAchievements();
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
  let fish =
    gameState.currentlyFishing || gameState.fishingData.get(FISH.SUN_FISH)!;
  // Always resolve to the single canonical instance stored in fishingData
  // (currentlyFishing can otherwise end up as a distinct object after a
  // reload), and increase its xp exactly once.
  fish = gameState.fishingData.get(fish.name)!;
  fish.increaseXp(deltaSeconds);

  gameState.currentlyFishing = fish;
  const earned = applySpeed(fish.income, deltaSeconds);
  gameState.coins += earned;
  // Gross income, not net of expenses - "how much have you ever earned" is a
  // different question from "how much do you have," and unlike coins this
  // never resets, so achievements can ask about a whole career.
  gameState.totalCoinsEarned += earned;
};

// A win in the active-fishing minigame (see ActiveFishingModal.svelte) pays out
// rewardSeconds worth of the target fish's *current* xpGain/income - the same
// functions the passive per-tick loop above uses, just with a hand-picked
// rewardSeconds instead of real elapsed time. That means every existing
// multiplier (skills, Mastery, crew, items, boats) already applies for free,
// and a harder/deeper fish already pays more per catch without a separate
// difficulty-to-reward multiplier. Returns the coins earned so the modal can
// display it.
export const grantActiveFishingReward = (
  fish: Fishing,
  rewardSeconds: number,
): number => {
  // Re-resolve the canonical instance, same reason updateCurrentFish does -
  // safe even if a reload replaced fishingData's instances while the modal
  // was open (the fish is captured by reference when the player casts).
  fish = gameState.fishingData.get(fish.name)!;
  fish.increaseXp(rewardSeconds);
  const earned = applySpeed(fish.income, rewardSeconds);
  gameState.coins += earned;
  gameState.totalCoinsEarned += earned;
  return earned;
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
  let skill =
    gameState.currentSkill || gameState.skillsData.get(SKILL.STRENGTH)!;
  // Same canonical-instance fix as updateCurrentFish above.
  skill = gameState.skillsData.get(skill.name)!;
  skill.increaseXp(deltaSeconds);
  gameState.currentSkill = skill;
};

export const subtractCoins = (amount: number) => {
  gameState.coins -= amount;
};

// ─── Tackle box ────────────────────────────────────────────────────────────
// Capped at the number of items that exist, so the last slot buys the cap away
// entirely rather than leaving something permanently unequippable.
export const getMaxTackleSlots = (): number => itemBaseData.size;

export const getTackleSlots = (): number =>
  Math.min(
    TACKLE_SLOTS_BASE + gameState.tackleSlotsBought,
    getMaxTackleSlots(),
  );

export const getEquippedItemCount = (): number => {
  let equipped = 0;
  gameState.itemData.forEach((item) => {
    if (item.selected) equipped += 1;
  });
  return equipped;
};

export const hasFreeTackleSlot = (): boolean =>
  getEquippedItemCount() < getTackleSlots();

export const tackleSlotsMaxed = (): boolean =>
  getTackleSlots() >= getMaxTackleSlots();

export const getTackleSlotPrice = (): number =>
  TACKLE_SLOT_PRICE_BASE *
  Math.pow(TACKLE_SLOT_PRICE_GROWTH, gameState.tackleSlotsBought);

export const buyTackleSlot = () => {
  if (tackleSlotsMaxed()) return;
  const price = getTackleSlotPrice();
  if (price > gameState.coins) return;
  subtractCoins(price);
  gameState.tackleSlotsBought += 1;
};

// Deselects anything over the cap, newest first. Needed because a save written
// before the tackle box existed can have every item equipped against a base of
// two slots - and because reincarnation resets bought slots.
export const enforceTackleCapacity = () => {
  let overflow = getEquippedItemCount() - getTackleSlots();
  if (overflow <= 0) return;
  const equipped = [...gameState.itemData.values()].filter(
    (item) => item.selected,
  );
  for (const item of equipped.reverse()) {
    if (overflow <= 0) break;
    item.deselect();
    overflow -= 1;
  }
};

// ─── Ageing Stone ──────────────────────────────────────────────────────────
export const getAgingStonePrice = (): number =>
  AGING_STONE_BASE_PRICE *
  Math.pow(AGING_STONE_PRICE_GROWTH, gameState.agingStonesBought);

// No cap on how many can be bought, and no guard against overshooting
// getLifespan(): if that happens before day reaches ageToDay(200), the clock
// simply stops (isAlive() goes false, see getGameSpeed in functions.ts) the
// same way it would from natural old age - the player is not stuck, Rebirth
// is already available by then. The Reincarnation tab surfaces the risk
// before it happens rather than the data layer blocking it after the fact.
export const buyAgingStone = () => {
  const price = getAgingStonePrice();
  if (price > gameState.coins) return;
  subtractCoins(price);
  gameState.agingStonesBought += 1;
  gameState.day += AGING_STONE_YEARS * DAYS_PER_YEAR;
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
  getTotalLevels() >= MASTERY_LEVELS_PER_PICK ||
  gameState.masteryTaken.length > 0;

// How many times this Mastery has been picked this run.
export const getMasteryStacks = (name: string): number =>
  gameState.masteryTaken.filter((taken) => taken === name).length;

// The multiplier a given number of stacks is worth, at that Mastery's own
// rate. Zero stacks is x1, i.e. no effect at all, which is what an unpicked
// Mastery is.
export const masteryEffect = (base: MasteryBaseData, stacks: number): number =>
  1 + base.effectPerStack * stacks;

// One entry per *distinct* Mastery taken, with its stacks already folded into
// a single multiplier. It has to be aggregated rather than emitted per pick:
// the multiplier map in functions.ts is keyed by name, so three separate
// entries called "Pike Whisperer" would overwrite each other and apply once.
export const takenMasteries = (): MasteryData[] => {
  const stacks = new Map<string, number>();
  for (const name of gameState.masteryTaken) {
    stacks.set(name, (stacks.get(name) ?? 0) + 1);
  }

  const taken: MasteryData[] = [];
  stacks.forEach((count, name) => {
    const base = masteryData.get(name);
    if (!base) return;
    taken.push({
      name,
      effect: masteryEffect(base, count),
      stacks: count,
      baseData: base,
    });
  });
  return taken;
};

// Whether a Mastery could reasonably be offered right now: the broad ones
// (no target) always can, since there's nothing to gate; a targeted one needs
// its fish or skill actually unlocked. Shared by the Mastery offer roll and
// the Crew perk pool below, so a candidate can never dangle a multiplier for
// water the player hasn't reached yet - that read as "not unlocked yet" noise
// rather than a real choice, per balance feedback.
const isMasteryOfferable = (mastery: MasteryBaseData): boolean => {
  if (mastery.target === undefined) return true;
  const target =
    gameState.fishingData.get(mastery.target) ??
    gameState.skillsData.get(mastery.target);
  return !!target && !needRequirements(gameState, target);
};

// Drawn from whatever the player has actually unlocked, so an offer is never
// dead weight. Masteries already taken stay in the pool - offering one again
// is how stacking happens - but `splice` keeps a single offer from showing the
// same Mastery twice.
const rollMasteryOffer = (): string[] => {
  const candidates: string[] = [];
  masteryData.forEach((mastery, name) => {
    if (isMasteryOfferable(mastery)) candidates.push(name);
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
    masteryData.has(name),
  );
  gameState.masteryTaken = gameState.masteryTaken.filter((name) =>
    masteryData.has(name),
  );

  if (gameState.masteryOffer.length > 0) return;
  if (gameState.masteryTaken.length >= getMasteryPicksEarned()) return;
  gameState.masteryOffer = rollMasteryOffer();
};

// The ones not chosen are simply not taken: they stay in the pool and can be
// offered again later.
// ─── Crew ──────────────────────────────────────────────────────────────────
const randomOf = <T>(pool: T[]): T =>
  pool[Math.floor(Math.random() * pool.length)];

// The best income any fish available to you is earning. Taken from the deepest
// unlocked fish per region rather than a scan of all 25, because fish.income
// walks every effect source and doing that 25x per tick would be felt.
export const getHighestFishIncome = (): number => {
  let highest = 0;
  for (const fish of highestTierFishPerCategory(gameState)) {
    if (fish.income > highest) highest = fish.income;
  }
  return highest;
};

export const getCrewWage = (member: CrewMember): number =>
  member.wageFraction * getHighestFishIncome();

export const getTotalCrewWages = (): number =>
  gameState.crew.reduce((total, member) => total + getCrewWage(member), 0);

// Crew perks are drawn from the same pool Mastery is (every per-fish and
// per-skill target plus the broad ones), filtered by the same
// isMasteryOfferable rule - a hire should never dangle a multiplier for a
// fish or skill still locked, which read as noise rather than a real choice
// and broke the sense of a linear progression. Resolved on demand rather than
// as a module-level constant: masteryData is built further down this file,
// and reading it while this module body is still evaluating would throw, the
// same import-order trap the Requirement classes sit here to avoid.
//
// Kept as full MasteryBaseData (not just the description) so rollCrewMember
// below can tell a broad pick apart from an entity one and roll its effect
// from the right range.
const crewUpgradePool = (): MasteryBaseData[] =>
  [...masteryData.values()].filter(isMasteryOfferable);

const rollCrewMember = (): CrewMember => {
  // Distinct perks: a hire with the same effect twice would read as a bug.
  const pool = crewUpgradePool();
  const upgrades = Array.from({ length: CREW_UPGRADE_COUNT }, () => {
    const picked = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const broad = picked.target === undefined;
    const min = broad ? CREW_BROAD_EFFECT_MIN : CREW_EFFECT_MIN;
    const max = broad ? CREW_BROAD_EFFECT_MAX : CREW_EFFECT_MAX;
    const step = broad ? CREW_BROAD_EFFECT_STEP : CREW_EFFECT_STEP;
    const steps = Math.round((max - min) / step);
    return {
      description: picked.description,
      effect: min + Math.floor(Math.random() * (steps + 1)) * step,
    };
  });

  return {
    // Date.now() alone collides when three are rolled in the same millisecond.
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: `${randomOf(CREW_FIRST_NAMES)} ${randomOf(CREW_LAST_NAMES)}`,
    upgrades,
    wageFraction:
      CREW_WAGE_MIN + Math.random() * (CREW_WAGE_MAX - CREW_WAGE_MIN),
  };
};

// Rolled once and stored, so the three candidates survive a reload rather than
// being re-rolled - otherwise refreshing would be a free re-draw.
export const rollCrewOffer = () => {
  gameState.crewOffer = Array.from({ length: CREW_OFFER_SIZE }, rollCrewMember);
};

export const hireCrew = (id: string) => {
  if (gameState.crew.length >= CREW_MAX) return;
  const hired = gameState.crewOffer.find((member) => member.id === id);
  if (!hired) return;
  gameState.crew.push(hired);
  gameState.totalCrewHired += 1;
  // The candidates not taken are gone: the offer is the decision.
  gameState.crewOffer = [];
};

export const fireCrew = (id: string) => {
  gameState.crew = gameState.crew.filter((member) => member.id !== id);
};

// Flattened one entry per perk, since an effect source carries exactly one
// description. Keyed by id rather than name so two hires who happen to roll
// the same name cannot overwrite each other in the multiplier map.
export const crewEffectSources = () =>
  gameState.crew.flatMap((member) =>
    member.upgrades.map((upgrade) => ({
      name: `${member.name} (${upgrade.description})`,
      key: `${member.id}:${upgrade.description}`,
      effect: upgrade.effect,
      baseData: { description: upgrade.description },
    })),
  );

export const chooseMastery = (name: string) => {
  if (!gameState.masteryOffer.includes(name)) return;
  gameState.masteryTaken.push(name);
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
  // Bought tackle slots go with the boats and items they were paid for.
  gameState.tackleSlotsBought = 0;
  // Same reasoning: the years already came off gameState.day (reset to 0
  // below), so nothing would be gained by remembering the count.
  gameState.agingStonesBought = 0;
  // Mastery picks are per-run: reincarnation clears every stack earned.
  gameState.masteryTaken = [];
  gameState.masteryOffer = [];
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
// which boosts future xpGain via Task.maxLevelMultiplier. Existing crew carry
// over untouched, and someone new turns up looking for a berth.
export const rebirth = () => {
  applyBaseReset();
  rollCrewOffer();
  gameState.rebirthCount += 1;
};

// Which legend skills a legendPoints total of `total` would unlock, per their
// own LegendRequirement in gameState.requirements - read from there rather
// than duplicating the LEGEND_GATE thresholds here, so the two can't drift.
const legendSkillsUnlockedAt = (total: number): Set<string> => {
  const unlocked = new Set<string>();
  gameState.skillsData.forEach((skill) => {
    if (skill.baseData.category !== CATEGORY.LEGEND) return;
    const legendReq = (gameState.requirements.get(skill.name) ?? []).find(
      (r) => r.type === "legend"
    );
    const threshold = legendReq?.requirements[0]?.requirement as
      | number
      | undefined;
    if (threshold !== undefined && total >= threshold) {
      unlocked.add(skill.name);
    }
  });
  return unlocked;
};

// Tier 2 (big): also wipes maxLevel and pays off the crew, but grants
// legendPoints - a currency that's never reset and unlocks the permanent
// "legend" skill line. Returns a summary of what that grant actually
// unlocked, since legendPoints is the one thing ascension leaves standing -
// everything else resets, so it's the only thing worth reporting back.
export const ascend = (): AscensionResult => {
  const pointsGained = getLegendPointGain();
  const oldTotal = gameState.legendPoints;
  const newTotal = oldTotal + pointsGained;

  // Diffed before either total is mutated: a skill counts as "newly unlocked
  // by this ascension" only if the old total hadn't already reached it.
  const before = legendSkillsUnlockedAt(oldTotal);
  const after = legendSkillsUnlockedAt(newTotal);
  const newlyUnlockedLegendSkills = [...after].filter(
    (name) => !before.has(name)
  );

  gameState.legendPoints = newTotal;
  applyBaseReset();
  gameState.fishingData.forEach((fish) => {
    fish.maxLevel = 0;
  });
  gameState.skillsData.forEach((skill) => {
    skill.maxLevel = 0;
  });
  // Crew survive rebirth but not this: ascension starts the whole line over.
  gameState.crew = [];
  gameState.crewOffer = [];
  gameState.ascensionCount += 1;

  return { pointsGained, newTotal, newlyUnlockedLegendSkills };
};

export const hardReset = () => {
  window.localStorage.clear();
  window.location.reload();
};

// Mirrors Progress Knight: your actual lifespan is the base lifespan
// multiplied by the Immortality skill's effect, so investing in it (across
// ordinary Rebirths) is the only way to survive past the natural Age 70 wall
// and eventually reach Ascension.
export const getLifespan = (): number => {
  let immortality = gameState.skillsData.get(SKILL.IMMORTALITY)!;
  return baseLifespan * immortality.effect;
};

// ─── Base-data builders ────────────────────────────────────────────────────
const fish = (
  name: string,
  category: string,
  tier: number,
  income: number,
  effect: number,
  description: Description,
): [string, FishBaseData] => [
  name,
  {
    name,
    maxXp: regionXp(category, tier),
    income,
    effect,
    description,
    category,
  },
];

const skill = (
  name: string,
  category: string,
  effect: number,
  description: Description,
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
  fish(FISH.SUN_FISH, CATEGORY.LAKE, 0, 5, EFFECT.BASIC, DESC.LAKE_PAY), // the bread-and-butter panfish
  fish(FISH.PERCH, CATEGORY.LAKE, 1, 9, EFFECT.BASIC, DESC.CONCENTRATION_XP), // light biters, watch the tip
  fish(FISH.BASS, CATEGORY.LAKE, 2, 15, EFFECT.BASIC, DESC.STRENGTH_XP), // pound for pound, a brawler
  fish(FISH.TROUT, CATEGORY.LAKE, 3, 40, EFFECT.BASIC, DESC.PATIENCE_XP), // line-shy and finicky
  fish(FISH.WALEYE, CATEGORY.LAKE, 4, 80, EFFECT.BASIC, DESC.INTELLIGENCE_XP), // reading structure and failing light
  fish(
    FISH.NORTHERN_PIKE,
    CATEGORY.LAKE,
    5,
    150,
    EFFECT.BASIC,
    DESC.AMBITION_XP,
  ), // your first taste of a real predator
  fish(
    FISH.LAKE_STURGEON,
    CATEGORY.LAKE,
    6,
    300,
    EFFECT.BASIC,
    DESC.STRENGTH_XP,
  ), // enormous, and it fights the whole way

  fish(FISH.PIRANA, CATEGORY.RIVER, 0, 5, EFFECT.ADEPT, DESC.CONCENTRATION_XP), // keep your fingers about you
  fish(FISH.SALMON, CATEGORY.RIVER, 1, 50, EFFECT.ADEPT, DESC.STRENGTH_XP), // blistering upstream runs
  fish(
    FISH.SILVER_DRUM,
    CATEGORY.RIVER,
    2,
    120,
    EFFECT.ADEPT,
    DESC.INTELLIGENCE_XP,
  ), // they talk; you learn to listen
  fish(
    FISH.ARMOURED_CATFISH,
    CATEGORY.RIVER,
    3,
    300,
    EFFECT.ADEPT,
    DESC.PATIENCE_XP,
  ), // hours on the bottom, waiting
  fish(
    FISH.ELECTRIC_EEL,
    CATEGORY.RIVER,
    4,
    1000,
    EFFECT.ADEPT,
    DESC.CONCENTRATION_XP,
  ), // dangerous; stay sharp
  fish(FISH.PACU, CATEGORY.RIVER, 5, 3000, EFFECT.ADEPT, DESC.PATIENCE_XP), // slow, careful bait fishing
  fish(FISH.PAYARA, CATEGORY.RIVER, 6, 15000, EFFECT.ADEPT, DESC.RIVER_PAY), // the river trophy

  fish(FISH.COD, CATEGORY.OCEAN, 0, 100, EFFECT.OCEAN, DESC.COMMUNICATION_XP), // the fish that built the ports
  fish(
    FISH.MACKEREL,
    CATEGORY.OCEAN,
    1,
    1000,
    EFFECT.OCEAN,
    DESC.COMMUNICATION_XP,
  ), // sold by the crate, dockside
  fish(
    FISH.ANGLE_FISH,
    CATEGORY.OCEAN,
    2,
    7500,
    EFFECT.OCEAN,
    DESC.INTELLIGENCE_XP,
  ), // studying the deep
  fish(FISH.GROUPER, CATEGORY.OCEAN, 3, 50000, EFFECT.OCEAN, DESC.STRENGTH_XP), // hauled bodily off the reef
  fish(
    FISH.STINGRAY,
    CATEGORY.OCEAN,
    4,
    100000,
    EFFECT.OCEAN,
    DESC.PATIENCE_XP,
  ), // worked slowly over the flats
  fish(
    FISH.BARRACUDA,
    CATEGORY.OCEAN,
    5,
    200000,
    EFFECT.OCEAN,
    DESC.AMBITION_XP,
  ), // it takes what it wants
  // Bluefin Tuna, Blue Marlin, Swordfish and Shark used to fill tiers 6-9
  // here. Removed along with everything that only existed to gate them
  // (Yacht's needBoat, the Sailing/Navigation levels checked below) since
  // none of them had a boating skill of their own pointing at their xp -
  // every other ocean fish does, one to one (see skillBaseData). Whale drops
  // straight to tier 6 and its income to 400,000 (2x Barracuda, continuing
  // the ratio the two tiers before it already used) so neither the level
  // curve nor the payout jumps to cover the four missing tiers.
  fish(FISH.WHALE, CATEGORY.OCEAN, 6, 400000, EFFECT.OCEAN, DESC.ALL_XP), // the apex of the trade
]);

export const skillBaseData: Map<string, SkillBaseData> = new Map([
  //      name                       category                 effect            description
  // Fundamentals stay broad - they're qualities, not techniques.
  skill(SKILL.STRENGTH, CATEGORY.FUNDAMENTALS, EFFECT.BASIC, DESC.FISHING_PAY),
  skill(
    SKILL.CONCENTRATION,
    CATEGORY.FUNDAMENTALS,
    EFFECT.BASIC,
    DESC.SKILL_XP,
  ),
  skill(
    SKILL.INTELLIGENCE,
    CATEGORY.FUNDAMENTALS,
    EFFECT.BASIC,
    DESC.TECHNIQUE_XP,
  ),
  skill(SKILL.PATIENCE, CATEGORY.FUNDAMENTALS, EFFECT.BASIC, DESC.FISHING_XP),
  skill(SKILL.AMBITION, CATEGORY.FUNDAMENTALS, EFFECT.BASIC, DESC.RIVER_PAY),
  skill(
    SKILL.COMMUNICATION,
    CATEGORY.FUNDAMENTALS,
    EFFECT.BASIC,
    DESC.OCEAN_PAY,
  ),

  // Each fishing technique maps one-to-one onto the seven river fish, in
  // order: whatever you're training lands the river fish sitting at the same
  // depth. Whaling used to close out this list on Payara, but hunting whales
  // has nothing to do with a river - it's been replaced with Gaffing (landing
  // a fierce, toothy fish like Payara with a gaff) and moved to boating,
  // below, where it belongs.
  skill(SKILL.CASTING, CATEGORY.TECHNIQUE, EFFECT.ADEPT, DESC.PIRANA_XP),
  skill(SKILL.JIGGING, CATEGORY.TECHNIQUE, EFFECT.ADEPT, DESC.SALMON_XP),
  skill(SKILL.TROLLING, CATEGORY.TECHNIQUE, EFFECT.ADEPT, DESC.SILVER_DRUM_XP),
  skill(SKILL.REELING, CATEGORY.TECHNIQUE, EFFECT.ADEPT, DESC.ARMOURED_CATFISH_XP),
  skill(SKILL.HOOKING, CATEGORY.TECHNIQUE, EFFECT.ADEPT, DESC.ELECTRIC_EEL_XP),
  skill(SKILL.NETTING, CATEGORY.TECHNIQUE, EFFECT.ADEPT, DESC.PACU_XP),
  skill(SKILL.GAFFING, CATEGORY.TECHNIQUE, EFFECT.ADEPT, DESC.PAYARA_XP),

  // Boating skills map one-to-one onto every ocean fish - six in order, plus
  // Whaling as a capstone on Whale itself rather than the next fish in line:
  // Whale already requires Whaling at Legendary to unlock (see the
  // requirement graph below), so the skill's own effect now matches what it
  // gates instead of a river fish it has no business boosting. Bluefin
  // Tuna/Blue Marlin/Swordfish/Shark used to sit uncovered by a dedicated
  // skill between Barracuda and Whale; removed outright rather than left
  // relying only on the broad Ocean Xp/Ocean Pay/All Xp effects (see
  // fishBaseData).
  skill(SKILL.DOCKING, CATEGORY.BOATING, EFFECT.BOATING, DESC.COD_XP),
  skill(SKILL.TURNING, CATEGORY.BOATING, EFFECT.BOATING, DESC.MACKEREL_XP),
  skill(SKILL.ANCHORING, CATEGORY.BOATING, EFFECT.BOATING, DESC.ANGLE_FISH_XP),
  skill(SKILL.SAILING, CATEGORY.BOATING, EFFECT.BOATING, DESC.GROUPER_XP),
  skill(SKILL.NAVIGATION, CATEGORY.BOATING, EFFECT.BOATING, DESC.STINGRAY_XP),
  skill(SKILL.STABILITY, CATEGORY.BOATING, EFFECT.BOATING, DESC.BARRACUDA_XP),
  skill(SKILL.WHALING, CATEGORY.BOATING, EFFECT.BOATING, DESC.WHALE_XP),

  // Reachable through ordinary progression (unlike the legend line below) -
  // the only way to extend your lifespan past the natural Age 70 wall,
  // mirroring Progress Knight's Immortality skill.
  skill(
    SKILL.IMMORTALITY,
    CATEGORY.IMMORTALITY,
    EFFECT.LIFESPAN,
    DESC.LONGER_LIFESPAN,
  ),
  skill(
    SKILL.TIME_WARPING,
    CATEGORY.IMMORTALITY,
    EFFECT.UNUSED,
    DESC.GAMESPEED,
  ),

  // Unlocked by ascending at least once (legendPoints > 0). Mirrors Progress
  // Knight's "Dark magic" skill line, reskinned for fishing.
  skill(SKILL.SEA_LEGEND, CATEGORY.LEGEND, EFFECT.LEGEND, DESC.ALL_XP),
  skill(
    SKILL.TIDAL_FOCUS,
    CATEGORY.LEGEND,
    EFFECT.LEGEND,
    DESC.LEGEND_POINT_GAIN,
  ),
  skill(
    SKILL.OLD_HAGGLER,
    CATEGORY.LEGEND,
    EFFECT.EXPENSE_DECAY,
    DESC.EXPENSES,
  ),
  skill(
    SKILL.WEATHERED_INSTINCT,
    CATEGORY.LEGEND,
    EFFECT.LEGEND,
    DESC.OCEAN_XP,
  ),
  skill(
    SKILL.DEEP_MEDITATION,
    CATEGORY.LEGEND,
    EFFECT.LEGEND,
    DESC.LEGEND_POINT_GAIN,
  ),
  skill(
    SKILL.SUNKEN_FORTUNE,
    CATEGORY.LEGEND,
    EFFECT.LEGEND_PAY,
    DESC.FISHING_PAY,
  ),
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
  ]),
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
  ]),
);

// Static: the pool never changes. How many times each has been picked - and
// so what it is currently worth - lives in gameState.masteryTaken.
export const masteryData: Map<string, MasteryBaseData> = new Map([
  ...Object.entries(MASTERY_NAMES).map(
    ([target, name]): [string, MasteryBaseData] => [
      name,
      {
        name,
        target,
        effectPerStack: MASTERY_EFFECT_PER_STACK,
        description: masteryXpOf(target),
      },
    ],
  ),
  ...MASTERY_BROAD.map((broad): [string, MasteryBaseData] => [
    broad.name,
    { ...broad },
  ]),
]);

export const fishCategories: { [category: string]: string[] } = {};
fishBaseData.forEach((base) => {
  (fishCategories[base.category] ??= []).push(base.name);
});

// How hard a fish is to actively reel in (see ActiveFishingModal.svelte), 0..1.
// Derived from fishCategories rather than a new per-fish field: a fish's
// position in its category's array is already shallow-to-deep order, so no new
// data is needed to know Whale is harder than Cod. Lives here rather than in
// functions.ts because fishCategories is a module-eval-time value, and the
// functions.ts/gameData.svelte.ts import cycle is only safe when cross-module
// reads happen inside function bodies, not at top level (see the
// skillClassFor comment in functions.ts for the same rule).
const ACTIVE_FISHING_CATEGORY_BASE_DIFFICULTY: Record<string, number> = {
  [CATEGORY.LAKE]: 0,
  [CATEGORY.RIVER]: 0.35,
  [CATEGORY.OCEAN]: 0.7,
};

// Reverse of the fishing/boating skill -> fish effect mapping in
// skillBaseData (Casting -> Pirana Xp, Docking -> Cod Xp, etc.) - built by
// matching each skill's own "<Fish> Xp" description against a real fish name,
// rather than hand-listing the pairing a second time here. Lake fish have no
// technique of their own (fishing techniques target river fish, boating
// targets ocean), so they're simply absent from this map.
const SKILL_FOR_FISH: Record<string, string> = {};
skillBaseData.forEach((base, skillName) => {
  if (!base.description.endsWith(" Xp")) return;
  const target = base.description.slice(0, -3);
  if (fishBaseData.has(target)) SKILL_FOR_FISH[target] = skillName;
});

// FNV-1a: a small, dependency-free string hash, good enough for "give this
// fish a stable-but-unpredictable-looking number," not for anything
// security-sensitive.
const hashString = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};
// Re-hashes with a salt per trait so a fish's difficulty jitter isn't
// correlated with its dash chance etc. - two different-feeling traits
// shouldn't move together just because they're derived from the same name.
const hashFraction = (name: string, salt: string): number =>
  (hashString(`${name}:${salt}`) % 10_000) / 10_000;

// depthFraction/category set the overall progression trend (deeper/further
// out is harder on average), but without the jitter term every fish at the
// same position in its category would be identically hard - "each kind of
// fish has its own difficulty" needs the specific fish, not just its depth,
// to matter. ACTIVE_FISHING_DIFFICULTY_JITTER caps how far a single fish can
// swing from its depth-based baseline in either direction.
export const getFishingDifficulty = (fish: Fishing): number => {
  const category = fish.baseData.category;
  const names = fishCategories[category] ?? [fish.name];
  const depthFraction =
    names.length > 1 ? names.indexOf(fish.name) / (names.length - 1) : 0;
  const base = ACTIVE_FISHING_CATEGORY_BASE_DIFFICULTY[category] ?? 0;
  const jitter =
    (hashFraction(fish.name, "difficulty") - 0.5) *
    2 *
    ACTIVE_FISHING_DIFFICULTY_JITTER;
  const rawDifficulty = base + depthFraction * 0.3 + jitter;

  // Training the matching fishing/boating technique makes its one fish
  // easier to actively reel in, on a log scale: big early gains that taper
  // off rather than a flat per-level discount, so a heavily-trained skill
  // still feels earned even as the gains shrink (ln(1+level) keeps climbing,
  // but ever more slowly). Floored at ACTIVE_FISHING_MIN_DIFFICULTY rather
  // than 0 - an already-easy fish (a low base difficulty plus a modest
  // amount of training) would otherwise hit 0 within the first several
  // levels and stay there for the rest of the game, making the minigame
  // trivial rather than just easy.
  const skillName = SKILL_FOR_FISH[fish.name];
  const skillLevel = skillName ? (gameState.skillsData.get(skillName)?.level ?? 0) : 0;
  const skillReduction = Math.log(1 + skillLevel) * ACTIVE_FISHING_SKILL_DIFFICULTY_LOG_SCALE;

  return Math.max(
    ACTIVE_FISHING_MIN_DIFFICULTY,
    Math.min(1, rawDifficulty - skillReduction),
  );
};

export interface FishBehavior {
  speedMultiplier: number;
  retargetMultiplier: number;
  dashChance: number;
  dashSpeedMultiplier: number;
}

// Per-species movement personality, layered on top of getFishingDifficulty's
// depth-based baseline rather than replacing it - see the balance-constants
// comment above ACTIVE_FISHING_SPEED_JITTER_MIN for the intent. Deterministic
// per fish (same inputs every round), so no new persisted field is needed -
// the same reasoning getFishingDifficulty already uses.
export const getFishBehavior = (fish: Fishing): FishBehavior => {
  const speedT = hashFraction(fish.name, "speed");
  const retargetT = hashFraction(fish.name, "retarget");
  const dashT = hashFraction(fish.name, "dash");
  return {
    speedMultiplier:
      ACTIVE_FISHING_SPEED_JITTER_MIN +
      (ACTIVE_FISHING_SPEED_JITTER_MAX - ACTIVE_FISHING_SPEED_JITTER_MIN) * speedT,
    retargetMultiplier:
      ACTIVE_FISHING_RETARGET_JITTER_MIN +
      (ACTIVE_FISHING_RETARGET_JITTER_MAX - ACTIVE_FISHING_RETARGET_JITTER_MIN) * retargetT,
    dashChance: dashT * ACTIVE_FISHING_MAX_DASH_CHANCE,
    dashSpeedMultiplier: ACTIVE_FISHING_DASH_SPEED_MULTIPLIER,
  };
};

export const skillCategories: { [category: string]: string[] } = {};
skillBaseData.forEach((base) => {
  (skillCategories[base.category] ??= []).push(base.name);
});

export const itemCategories = {};

export const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];
