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

// A roguelite Mastery pick, bound to exactly one fish or one skill.
// `description` is always "<target> Xp", which the generic per-entity rule in
// functions.ts already resolves - see masteryData.
export interface MasteryBaseData {
  name: string;
  target: string;
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
}
