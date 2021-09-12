<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import type { Fishing, Requirement } from "src/classes";
  import { fishBaseData, GameData, setCurrentlyFishing } from "src/gameData";
  import {
    filtered,
    formatNumber,
    getRequiredString,
    needRequirements,
  } from "src/functions";
  import XpBar from "src/components/XpBar.svelte";
  import Coins from "src/components/Coins.svelte";

  let data_value: GameDataType;
  export let allFish: Fishing[] = [];

  GameData.subscribe((data) => {
    data_value = data;
  });

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

{#each filtered(data_value, allFish) as fish, idx}
  {#if !needRequirements(data_value, fish)}
    <tr class="cursor-pointer" on:click={() => setCurrent(fish.name)}>
      <XpBar
        name={fish.name}
        width={fish.barWidth}
        selected={data_value.currentlyFishing.name === fish.name}
      />
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
