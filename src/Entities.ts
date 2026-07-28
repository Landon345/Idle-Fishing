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
  | "Silver Drum Xp"
  | "Strength Xp"
  | "Concentration Xp"
  | "Intelligence Xp"
  | "Patience Xp"
  | "Communication Xp"
  | "Ambition Xp"
  | "Boating Xp"
  | "Netting Xp"
  | "Whaling Xp"
  | "Docking Xp"
  | "Turning Xp"
  | "Anchoring Xp"
  | "Sailing Xp"
  | "Navigation Xp"
  | "Stability Xp"
  | "Fishing Pay"
  | "Lake Pay"
  | "River Pay"
  | "Ocean Pay"
  | "Payara Pay"
  | "Northern Pike Pay"
  | "Whale Pay"
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
}
