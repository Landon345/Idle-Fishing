<script lang="ts">
  import type { Fishing } from "src/classes.svelte";
  import { gameState, setCurrentlyFishing } from "src/gameData.svelte";
  import { formatNumber, needRequirements } from "src/functions";
  import XpBar from "src/components/XpBar.svelte";
  import Coins from "src/components/Coins.svelte";

  interface Props {
    // Already run through `filtered()` by the caller — shared with the
    // required-progress row rendered alongside this table, instead of
    // recomputing the same O(n) scan a second time here.
    allFish?: Fishing[];
  }

  let { allFish = [] }: Props = $props();

  const setCurrent = (name: string) => {
    setCurrentlyFishing(name);
  };

  const getValues = (fish: Fishing): any[] => {
    // ["Level", "Income/day", "Effect", "Xp/day", "Xp left", "Max Level"]

    return [
      fish.level,
      fish.income,
      fish.effectDescription,
      formatNumber(fish.xpGain),
      formatNumber(fish.xpLeft),
      fish.maxLevel,
    ];
  };
</script>

{#each allFish as fish}
  {#if !needRequirements(gameState, fish)}
    <tr
      class="cursor-pointer hover:bg-slate-700/40"
      onclick={() => setCurrent(fish.name)}
    >
      <td>
        <XpBar
          name={fish.name}
          width={fish.barWidth}
          selected={gameState.currentlyFishing?.name === fish.name}
        />
      </td>
      {#each getValues(fish) as value, idx}
        {#if idx == 1}
          <td><Coins amount={value} /></td>
        {:else}
          <td>{value}</td>
        {/if}
      {/each}
    </tr>
  {/if}
{/each}
