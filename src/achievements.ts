import { needRequirements, daysToYears, ageToDay } from "src/functions";
import {
  gameState,
  fishCategories,
  skillCategories,
  boatBaseData,
  itemBaseData,
  masteryData,
  getEquippedItemCount,
  tackleSlotsMaxed,
  getTotalCrewWages,
  CATEGORY,
  FISH,
  SKILL,
  BOAT,
  STARTING_AGE,
} from "src/gameData.svelte";

// No reward for now - these are a pure record of what happened. Definitions
// are static code (like fishBaseData/skillBaseData); only the *earned* ids
// persist, in gameState.achievementsEarned.
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  // Reads gameState (and friends) only when actually called, at runtime
  // inside updateAchievements() - never at this file's own module-eval time.
  // gameData.svelte.ts imports this file, and this file imports back from
  // gameData.svelte.ts, so anything read eagerly at the top level here would
  // hit the same "cannot access before initialization" cycle the Requirement
  // classes are kept out of classes.svelte.ts to avoid.
  check: () => boolean;
}

const fish = (name: string) => gameState.fishingData.get(name)!;
const skill = (name: string) => gameState.skillsData.get(name)!;
const unlocked = (nameByCategory: { [c: string]: string[] }, category: string) =>
  nameByCategory[category].every((name) => {
    const entity = gameState.fishingData.get(name) ?? gameState.skillsData.get(name);
    return entity && !needRequirements(gameState, entity);
  });
const anyFish = (predicate: (level: number) => boolean) =>
  [...gameState.fishingData.values()].some((f) => predicate(f.level));
const anySkill = (predicate: (level: number) => boolean) =>
  [...gameState.skillsData.values()].some((s) => predicate(s.level));

export const achievements: AchievementDefinition[] = [
  // ─── Fish ──────────────────────────────────────────────────────────────
  {
    id: "first-catch",
    name: "First Catch",
    description: "Reach level 1 on Sun Fish.",
    check: () => fish(FISH.SUN_FISH).level >= 1,
  },
  {
    id: "lake-legend",
    name: "Lake Legend",
    description: "Reach level 10 on Lake Sturgeon, the last fish in the lake.",
    check: () => fish(FISH.LAKE_STURGEON).level >= 10,
  },
  {
    id: "river-rat",
    name: "River Rat",
    description: "Reach level 10 on Payara, the last fish in the river.",
    check: () => fish(FISH.PAYARA).level >= 10,
  },
  {
    id: "salt-in-the-air",
    name: "Salt in the Air",
    description: "Unlock Cod and enter the ocean.",
    check: () => !needRequirements(gameState, fish(FISH.COD)),
  },
  {
    id: "old-man-and-the-sea",
    name: "Old Man and the Sea",
    description: "Unlock the Whale, the largest catch in the game.",
    check: () => !needRequirements(gameState, fish(FISH.WHALE)),
  },
  {
    id: "whale-watcher",
    name: "Whale Watcher",
    description: "Reach level 10 on the Whale.",
    check: () => fish(FISH.WHALE).level >= 10,
  },
  {
    id: "barracuda-bite",
    name: "Barracuda Bite",
    description: "Reach level 10 on Barracuda.",
    check: () => fish(FISH.BARRACUDA).level >= 10,
  },
  {
    id: "shocking-development",
    name: "Shocking Development",
    description: "Catch your first Electric Eel.",
    check: () => fish(FISH.ELECTRIC_EEL).level >= 1,
  },
  {
    id: "reel-deal",
    name: "Reel Deal",
    description: "Reach level 100 on any single fish.",
    check: () => anyFish((level) => level >= 100),
  },
  {
    id: "full-house",
    name: "Full House",
    description: "Unlock every fish in the game.",
    check: () =>
      unlocked(fishCategories, CATEGORY.LAKE) &&
      unlocked(fishCategories, CATEGORY.RIVER) &&
      unlocked(fishCategories, CATEGORY.OCEAN),
  },

  // ─── Skills ────────────────────────────────────────────────────────────
  {
    id: "jack-of-all-trades",
    name: "Jack of All Trades",
    description: "Reach level 50 in every fundamental skill.",
    check: () =>
      skillCategories[CATEGORY.FUNDAMENTALS].every((name) => skill(name).level >= 50),
  },
  {
    id: "master-angler",
    name: "Master Angler",
    description: "Reach level 500 in any single skill.",
    check: () => anySkill((level) => level >= 500),
  },
  {
    id: "boat-school-graduate",
    name: "Boat School Graduate",
    description: "Unlock every boating skill.",
    check: () => unlocked(skillCategories, CATEGORY.BOATING),
  },
  {
    id: "technique-master",
    name: "Technique Master",
    description: "Unlock every fishing technique skill.",
    check: () => unlocked(skillCategories, CATEGORY.TECHNIQUE),
  },
  {
    id: "renaissance-angler",
    name: "Renaissance Angler",
    description: "Unlock every skill in the game, legend line included.",
    check: () =>
      unlocked(skillCategories, CATEGORY.FUNDAMENTALS) &&
      unlocked(skillCategories, CATEGORY.TECHNIQUE) &&
      unlocked(skillCategories, CATEGORY.BOATING) &&
      unlocked(skillCategories, CATEGORY.IMMORTALITY) &&
      unlocked(skillCategories, CATEGORY.LEGEND),
  },
  {
    id: "the-long-game",
    name: "The Long Game",
    description: "Reach level 500 in Immortality.",
    check: () => skill(SKILL.IMMORTALITY).level >= 500,
  },
  {
    id: "time-bender",
    name: "Time Bender",
    description: "Reach level 100 in Time Warping.",
    check: () => skill(SKILL.TIME_WARPING).level >= 100,
  },
  {
    id: "overachiever",
    name: "Overachiever",
    description: "Reach level 1000 in any single skill.",
    check: () => anySkill((level) => level >= 1000),
  },

  // ─── Economy ───────────────────────────────────────────────────────────
  {
    id: "first-hundred",
    name: "First Hundred",
    description: "Earn 100 coins in total.",
    check: () => gameState.totalCoinsEarned >= 100,
  },
  {
    id: "six-figures",
    name: "Six Figures",
    description: "Hold 1,000,000 coins at once.",
    check: () => gameState.coins >= 1_000_000,
  },
  {
    id: "billionaire-of-the-sea",
    name: "Billionaire of the Sea",
    description: "Hold 1,000,000,000 coins at once.",
    check: () => gameState.coins >= 1_000_000_000,
  },
  {
    id: "a-lifes-work",
    name: "A Life's Work",
    description: "Earn 1,000,000,000 coins in total.",
    check: () => gameState.totalCoinsEarned >= 1_000_000_000,
  },
  {
    id: "fleet-admiral",
    name: "Fleet Admiral",
    description: "Own every boat at once.",
    check: () => [...boatBaseData.keys()].every((name) => gameState.boatData.get(name)!.bought),
  },
  {
    id: "fully-geared",
    name: "Fully Geared",
    description: "Equip every item at once.",
    check: () => getEquippedItemCount() === itemBaseData.size,
  },
  {
    id: "penny-pincher",
    name: "Penny Pincher",
    description: "Reach level 100 on Old Haggler.",
    check: () => skill(SKILL.OLD_HAGGLER).level >= 100,
  },

  // ─── Boats & items ─────────────────────────────────────────────────────
  {
    id: "first-mate",
    name: "First Mate",
    description: "Buy your first boat.",
    check: () => [...gameState.boatData.values()].some((b) => b.bought),
  },
  {
    id: "tricked-out",
    name: "Tricked Out",
    description: "Upgrade any item to level 20.",
    check: () => [...gameState.itemData.values()].some((i) => i.level >= 20),
  },
  {
    id: "tackle-box-full",
    name: "Tackle Box Full",
    description: "Buy every tackle slot.",
    check: () => tackleSlotsMaxed(),
  },
  {
    id: "money-well-spent",
    name: "Money Well Spent",
    description: "Upgrade every item at least once in a single life.",
    check: () => [...gameState.itemData.values()].every((i) => i.level >= 1),
  },
  {
    id: "ahabs-dream",
    name: "Ahab's Dream",
    description: "Buy the Whaling Ship.",
    check: () => gameState.boatData.get(BOAT.WHALING_SHIP)!.bought,
  },

  // ─── Reincarnation ─────────────────────────────────────────────────────
  {
    id: "touch-of-youth",
    name: "Touch of Youth",
    description: "Rebirth for the first time.",
    check: () => gameState.rebirthCount >= 1,
  },
  {
    id: "old-soul",
    name: "Old Soul",
    description: "Rebirth 10 times.",
    check: () => gameState.rebirthCount >= 10,
  },
  {
    id: "ascended",
    name: "Ascended",
    description: "Ascend for the first time.",
    check: () => gameState.ascensionCount >= 1,
  },
  {
    id: "legend-of-the-sea",
    name: "Legend of the Sea",
    description: "Ascend 10 times.",
    check: () => gameState.ascensionCount >= 10,
  },
  {
    id: "point-collector",
    name: "Point Collector",
    description: "Reach 100 total Legend Points.",
    check: () => gameState.legendPoints >= 100,
  },
  {
    id: "living-legend",
    name: "Living Legend",
    description: "Unlock every legend skill.",
    check: () => unlocked(skillCategories, CATEGORY.LEGEND),
  },
  {
    id: "borrowed-time",
    name: "Borrowed Time",
    description: "Buy your first Ageing Stone.",
    check: () => gameState.agingStonesBought >= 1,
  },
  {
    id: "stone-cold",
    name: "Stone Cold",
    description: "Buy 10 Ageing Stones in a single life.",
    check: () => gameState.agingStonesBought >= 10,
  },
  {
    id: "ancient-mariner",
    name: "Ancient Mariner",
    description: "Reach Age 200, the gate to Ascension.",
    check: () => gameState.day >= ageToDay(200),
  },
  {
    id: "old-timer",
    name: "Old Timer",
    description: "Reach Age 100.",
    check: () => STARTING_AGE + daysToYears(gameState.day) >= 100,
  },

  // ─── Crew ──────────────────────────────────────────────────────────────
  {
    id: "not-alone",
    name: "Not Alone",
    description: "Hire your first crew member.",
    check: () => gameState.totalCrewHired >= 1,
  },
  {
    id: "full-crew",
    name: "Full Crew",
    description: "Have 3 crew members at once.",
    check: () => gameState.crew.length >= 3,
  },
  {
    id: "crew-turnover",
    name: "Crew Turnover",
    description: "Hire 10 crew members over your career.",
    check: () => gameState.totalCrewHired >= 10,
  },
  {
    id: "expensive-habit",
    name: "Expensive Habit",
    description: "Run a crew wage bill of 1,000,000 coins a day.",
    check: () => getTotalCrewWages() >= 1_000_000,
  },
  {
    id: "stacked-deck",
    name: "Stacked Deck",
    description: "Hire a crew member whose three perks are all x2.50 or higher.",
    check: () =>
      gameState.crew.some((member) => member.upgrades.every((u) => u.effect >= 2.5)),
  },

  // ─── Mastery ───────────────────────────────────────────────────────────
  {
    id: "first-upgrade",
    name: "First Upgrade",
    description: "Take your first Mastery pick.",
    check: () => gameState.masteryTaken.length >= 1,
  },
  {
    id: "specialist",
    name: "Specialist",
    description: "Stack the same Mastery 5 times in one run.",
    check: () => {
      const counts = new Map<string, number>();
      for (const name of gameState.masteryTaken) counts.set(name, (counts.get(name) ?? 0) + 1);
      return [...counts.values()].some((n) => n >= 5);
    },
  },
  {
    id: "well-rounded",
    name: "Well Rounded",
    description: "Take 10 different Masteries in one run.",
    check: () => new Set(gameState.masteryTaken).size >= 10,
  },
  {
    id: "mastery-marathon",
    name: "Mastery Marathon",
    description: "Take 20 total Mastery picks in one run.",
    check: () => gameState.masteryTaken.length >= 20,
  },
  {
    id: "broad-strokes",
    name: "Broad Strokes",
    description: "Take all four broad Masteries at least once in one run.",
    check: () => {
      const broad = [...masteryData.values()].filter((m) => m.target === undefined);
      return broad.every((m) => gameState.masteryTaken.includes(m.name));
    },
  },
];

// Only checks achievements not yet earned, so cost shrinks as more are
// unlocked instead of staying flat at 50 comparisons a tick forever.
export const updateAchievements = () => {
  if (gameState.achievementsEarned.length >= achievements.length) return;
  const earned = new Set(gameState.achievementsEarned);
  for (const achievement of achievements) {
    if (earned.has(achievement.id)) continue;
    if (achievement.check()) gameState.achievementsEarned.push(achievement.id);
  }
};
