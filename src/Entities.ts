import type { Fishing, Item, Boat, Skill } from "src/classes.svelte";
import type { Requirement } from "src/gameData.svelte";

export type Description =
  | "All Xp"
  | "Fishing Skill Xp"
  | "Fishing Xp"
  | "Skill Xp"
  | "Lake Xp"
  | "River Xp"
  | "Ocean Xp"
  | "Jigging Xp"
  | "Casting Xp"
  | "Hooking Xp"
  | "Trolling Xp"
  | "Reeling Xp"
  | "Strength Xp"
  | "Concentration Xp"
  | "Intelligence Xp"
  | "Patience Xp"
  | "Boating Xp"
  | "Netting Xp"
  | "Whaling Xp"
  | "Docking Xp"
  | "Turning Xp"
  | "Anchoring Xp"
  | "Sailing Xp"
  | "Navigation Xp"
  | "Stability Xp"
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

// A roguelite Mastery pick: a flat multiplier bound to exactly one fish or one
// skill. `description` is always "<target> Xp", which the generic per-entity
// rule in functions.ts already resolves - see masteryBaseData.
export interface MasteryBaseData {
  name: string;
  target: string;
  description: Description;
}

// Deliberately a plain object rather than a class: masteryData is built during
// gameData.svelte.ts's module body, and anything constructed there cannot come
// from classes.svelte.ts, which imports back from gameData - the same cycle
// that the Requirement classes are kept out of classes.svelte.ts to avoid.
// The shape matches what the multiplier walk in functions.ts needs.
export interface MasteryData {
  name: string;
  effect: number;
  baseData: MasteryBaseData;
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

  // Mastery (roguelite picks). Names index masteryBaseData. All three reset on
  // reincarnation - the picks are per-run, unlike legendPoints.
  //   masteryTaken  - chosen, and currently applying their multiplier
  //   masteryOffer  - the three on the table right now, empty if none pending
  //   masteryPassed - the ones turned down, locked out for the rest of the run
  masteryTaken: string[];
  masteryOffer: string[];
  masteryPassed: string[];
}
