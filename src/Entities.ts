import type { Fishing, Item, Boat, Skill } from "src/classes.svelte";
import type { Requirement } from "src/gameData.svelte";

export type Description =
  | "All Xp"
  // The fishing-skills category, i.e. the counterpart to "Boating Xp". Named
  // for what those skills are rather than "Fishing Skill Xp", which sat
  // between "Fishing Xp" (every fish) and "Skill Xp" (every skill) and was
  // unreadable next to either.
  | "Technique Xp"
  | "Fishing Xp"
  | "Skill Xp"
  | "Lake Xp"
  | "River Xp"
  | "Ocean Xp"
  | "Strength Xp"
  | "Concentration Xp"
  | "Intelligence Xp"
  | "Patience Xp"
  | "Ambition Xp"
  | "Communication Xp"
  | "Boating Xp"
  | "Netting Xp"
  | "Whaling Xp"
  // Per-fish xp. Each is owned by the skill (or tool) you'd actually use to
  // land that fish, so a technique makes its quarry easier to catch.
  | "Perch Xp"
  | "Bass Xp"
  | "Northern Pike Xp"
  | "Salmon Xp"
  | "Payara Xp"
  | "Mackerel Xp"
  | "Grouper Xp"
  | "Barracuda Xp"
  | "Bluefin Tuna Xp"
  | "Blue Marlin Xp"
  | "Whale Xp"
  | "Fishing Pay"
  | "Lake Pay"
  | "River Pay"
  | "Ocean Pay"
  | "Expenses"
  | "Legend Point Gain"
  | "Longer Lifespan"
  | "Gamespeed";
export interface BoatBaseData {
  name: string;
  price: number;
  bought: boolean;
  // Boats have no level, so this is a flat multiplier that applies once the
  // boat is bought - see Boat.effect in classes.svelte.ts.
  effect: number;
  description: Description;
}

export interface ItemBaseData {
  name: string;
  expense: number;
  effect: number;
  description: Description;
  selected: boolean;
  upgradePrice: number;
}

export interface FishBaseData {
  name: string;
  maxXp: number;
  income: number;
  effect: number;
  description: Description;
  category: string;
}

export interface SkillBaseData {
  name: string;
  maxXp: number;
  effect: number;
  description: Description;
  category: string;
}

// A roguelite Mastery pick, bound to exactly one fish or one skill.
// `description` is always "<target> Xp", which the generic per-entity rule in
// functions.ts already resolves - see masteryData.
export interface MasteryBaseData {
  name: string;
  // The single fish or skill this is bound to, absent on the broad Masteries
  // that hit a whole category. A Mastery with no target is never gated, since
  // there is nothing that could be locked.
  target?: string;
  // Per-stack rate. Kept per-Mastery rather than global because the broad ones
  // have to be far gentler than the single-entity ones.
  effectPerStack: number;
  description: Description;
}

// One taken Mastery, with its multiplier already folded across however many
// times it was picked. Built on demand rather than stored, since the stack
// count lives in gameState.masteryTaken.
//
// Deliberately a plain object rather than a class: these are produced inside
// gameData.svelte.ts, which cannot construct anything from classes.svelte.ts -
// that module imports back from gameData, the same cycle the Requirement
// classes are kept out of classes.svelte.ts to avoid. The shape matches what
// the multiplier walk in functions.ts needs.
export interface MasteryData {
  name: string;
  effect: number;
  stacks: number;
  baseData: MasteryBaseData;
}

// One of a crew member's three perks.
export interface CrewUpgrade {
  description: Description;
  effect: number;
}

// A hired hand. Rolled fresh at each rebirth and carried across them - crew
// are the one thing that persists between lives. Ascension clears them.
export interface CrewMember {
  // Stable across renames and duplicate names: used to key their effects in
  // the multiplier map, which must be unique per source.
  id: string;
  name: string;
  upgrades: CrewUpgrade[];
  // Their daily wage as a share of the best fish income available, rather than
  // a fixed number of coins. That is the whole point of crew as a gold sink:
  // a flat price would be outrun by exponential income within a couple of
  // days, so the wage tracks earning power instead.
  wageFraction: number;
}

// What a single ascend() call actually granted, so the UI can summarize it in
// a popup rather than the player having to notice the Legend Points counter
// ticked up and cross-reference which legend skills that happened to unlock.
export interface AscensionResult {
  pointsGained: number;
  newTotal: number;
  // Names of legend skills whose point threshold this ascension's gain
  // crossed - empty if the gain didn't reach a new one.
  newlyUnlockedLegendSkills: string[];
}

export interface RequirementObj {
  name: string;
  requirement: number | boolean;
}

export type Bases = SkillBaseData | FishBaseData | BoatBaseData | ItemBaseData;
export type Classes = Fishing | Item | Boat | Skill;

export interface GameDataType {
  day: number;
  coins: number;
  fishingData: Map<string, Fishing>;
  skillsData: Map<string, Skill>;
  boatData: Map<string, Boat>;
  itemData: Map<string, Item>;
  requirements: Map<string, Requirement[]>;
  paused: boolean;
  autoTrain: boolean;
  autoFish: boolean;
  timeWarpingEnabled: boolean;

  // rebirthCount: small reset (keeps maxLevel as a permanent record).
  // ascensionCount: big reset (also wipes maxLevel, grants legendPoints).
  rebirthCount: number;
  ascensionCount: number;

  currentlyFishing: Fishing | null;
  currentSkill: Skill | null;
  legendPoints: number;

  // Mastery (roguelite picks). Names index masteryData. Both reset on
  // reincarnation - the picks are per-run, unlike legendPoints.
  //   masteryTaken - every pick made this run, in order. A name appearing more
  //                  than once is stacked: each repeat raises its multiplier.
  //   masteryOffer - the choices on the table right now, empty if none pending
  masteryTaken: string[];
  masteryOffer: string[];

  // Crew. These survive rebirth - unlike everything else - but not ascension.
  //   crew      - hired, up to CREW_MAX, each drawing a daily wage
  //   crewOffer - the candidates presented at the last rebirth, empty once one
  //               is hired
  crew: CrewMember[];
  crewOffer: CrewMember[];

  // Extra tackle-box slots bought this run, on top of TACKLE_SLOTS_BASE. Reset
  // by reincarnation like every other gold purchase.
  tackleSlotsBought: number;

  // Ageing Stones bought this run - see AGING_STONE_* in gameData.svelte.ts.
  // Each instantly adds AGING_STONE_YEARS to gameState.day, so a rich enough
  // player can reach the Age 200 Ascension gate without waiting out the
  // calendar. Resets with everything else on reincarnation.
  agingStonesBought: number;
}
