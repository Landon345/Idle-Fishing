<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import type { Skill } from "src/classes";
  import { GameData, setCurrentSkill } from "src/gameData";
  import XpBar from "src/components/XpBar.svelte";
  import {
    filtered,
    formatNumber,
    getRequiredString,
    needRequirements,
  } from "src/functions";

  let data_value: GameDataType;
  export let skills: Skill[] = [];

  GameData.subscribe((data) => {
    data_value = data;
  });

  const setCurrent = (name: string) => {
    setCurrentSkill(name);
  };

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

{#each filtered(data_value, skills) as skill}
  {#if !needRequirements(data_value, skill)}
    <tr class="cursor-pointer" on:click={() => setCurrent(skill.name)}>
      <XpBar
        name={skill.name}
        width={skill.barWidth}
        selected={data_value.currentSkill.name === skill.name}
      />
      {#each getValues(skill) as value}
        <td>{value}</td>
      {/each}
    </tr>
  {/if}
{/each}
