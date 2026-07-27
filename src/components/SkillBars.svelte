<script lang="ts">
  import type { Skill } from "src/classes.svelte";
  import { gameState, setCurrentSkill } from "src/gameData.svelte";
  import XpBar from "src/components/XpBar.svelte";
  import { formatNumber, needRequirements } from "src/functions";

  interface Props {
    // Already run through `filtered()` by the caller — see FishBars.svelte.
    skills?: Skill[];
  }

  let { skills = [] }: Props = $props();

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

{#each skills as skill}
  {#if !needRequirements(gameState, skill)}
    <tr
      class="cursor-pointer hover:bg-slate-700/40"
      onclick={() => setCurrent(skill.name)}
    >
      <XpBar
        name={skill.name}
        width={skill.barWidth}
        selected={gameState.currentSkill?.name === skill.name}
      />
      {#each getValues(skill) as value}
        <td>{value}</td>
      {/each}
    </tr>
  {/if}
{/each}
