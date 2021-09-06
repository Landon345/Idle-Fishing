<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import type { Skill } from "src/classes";
  import { GameData, setCurrentSkill } from "src/gameData";
  import XpBar from "src/components/XpBar.svelte";
  import {
    formatNumber,
    getRequiredString,
    needRequirements,
  } from "src/functions";

  let data_value: GameDataType;
  export let skills: Skill[] = [];

  GameData.subscribe((data) => {
    data_value = data;
  });

  let selected: string = data_value.currentSkill?.name || "Strength";

  const setCurrent = (name: string) => {
    setCurrentSkill(name);
    selected = name;
  };
  setCurrent(selected);

  const getValues = (skill: Skill): any[] => {
    // ["Level", "Income/day", "Effect", "Xp/day", "Xp left", "Max Level"]

    return [
      skill.level,
      skill.effectDescription,
      formatNumber(skill.xpGain),
      formatNumber(skill.xpLeft),
      skill.maxLevel,
    ];
  };
</script>

{#each skills as skill}
  {#if !needRequirements(data_value, skill)}
    <tr
      class="cursor-pointer"
      class:bg-green-200={selected === skill.name}
      on:click={() => setCurrent(skill.name)}
    >
      <XpBar name={skill.name} width={skill.barWidth} />
      {#each getValues(skill) as value}
        <td>{value}</td>
      {/each}
    </tr>
  {/if}
  {#if needRequirements(data_value, skill)}
    <div class="w-full">
      {getRequiredString(data_value, skill)}
    </div>
  {/if}
{/each}
