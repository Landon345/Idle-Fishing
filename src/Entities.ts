import type { Fishing, Item, Boat, Skill, Requirement } from "src/classes";

export interface BoatBaseData {
  name: string;
  price: number;
  bought: boolean;
}

export interface ItemBaseData {
  name: string;
  expense: number;
  effect: number;
  description: string;
}

export interface FishBaseData {
  name: string;
  maxXp: number;
  income: number;
  effect: number;
  description: string;
  category: string;
}

export interface SkillBaseData {
  name: string;
  maxXp: number;
  effect: number;
  description: string;
  category: string;
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
  requirements: Map<string, Requirement>;
  paused: boolean;

  rebirthOneCount: number;
  rebirthTwoCount: number;

  currentlyFishing: Fishing | null;
  currentSkill: Skill | null;
  currentProperty: string | null;
  currentMisc: any[];
  evil: number;
}
