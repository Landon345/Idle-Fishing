<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import ProgressTable from "src/components/ProgressTable.svelte";
  import TableBar from "src/components/ProgressTableBar.svelte";
  import type { Fishing, Skill } from "src/classes";
  import type { FishBaseData } from "src/Entities";
  import { GameData, setCurrentlyFishing, setCurrentSkill } from "src/gameData";
  import XpBar from "src/components/XpBar.svelte";
  import FishingBar from "src/components/FishingBar.svelte";
  import { get } from "svelte/store";

  let data_value: GameDataType;
  let strength: Skill;
  let concentration: Skill;

  GameData.subscribe((data) => {
    data_value = data;
    strength = data.skillsData.get("Strength");
    concentration = data.skillsData.get("Concentration");
  });

  let selected: string = data_value.currentSkill?.name || "Strength";
  let commonHeaders: string[] = [
    "Level",
    "Effect",
    "Xp/day",
    "Xp left",
    "Max Level",
  ];
  let fundamentalHeaders: string[] = ["Fundamentals", ...commonHeaders];
  let fishingHeaders: string[] = ["Fishing", ...commonHeaders];

  const setCurrent = (name: string) => {
    setCurrentSkill(name);
    selected = name;
  };

  const getValues = (skill: Skill): any[] => {
    // ["Level", "Income/day", "Effect", "Xp/day", "Xp left", "Max Level"]

    return [
      skill.level,
      skill.effectDescription,
      skill.xpGain,
      skill.xpLeft,
      skill.maxLevel,
    ];
  };

  const findWidth = (skill: Skill): number => {
    return ((skill.maxXp - skill.xpLeft) / skill.maxXp) * 100;
  };
</script>

<div class="bg-gray-white w-full h-full">
  <p class="p-10 bg-green-500 text-white text-xl font-bold w-full">Skills</p>
  <ProgressTable headers={fundamentalHeaders}>
    <tr
      class="cursor-pointer"
      class:bg-green-200={selected === "Strength"}
      on:click={() => setCurrent("Strength")}
    >
      <XpBar name={"Strength"} width={findWidth(strength)} />
      {#each getValues(strength) as value, idx}
        <td>{value}</td>
      {/each}
    </tr>
    <tr
      class="cursor-pointer"
      class:bg-green-200={selected === "Concentration"}
      on:click={() => setCurrent("Concentration")}
    >
      <XpBar name={"Concentration"} width={findWidth(concentration)} />
      {#each getValues(concentration) as value}
        <td>{value}</td>
      {/each}
    </tr>
  </ProgressTable>
</div>
