<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import type { Fishing } from "src/classes";
  import { GameData, setCurrentlyFishing } from "src/gameData";
  import {
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

  let selected: string = data_value.currentlyFishing?.name || "Black Drum";

  const setCurrent = (name: string) => {
    setCurrentlyFishing(name);
    selected = name;
  };
  setCurrent(selected);

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
  {#if !needRequirements(data_value, fish)}
    <tr
      class="cursor-pointer"
      class:bg-blue-200={selected === fish.name}
      on:click={() => setCurrent(fish.name)}
    >
      <XpBar name={fish.name} width={fish.barWidth} />
      {#each getValues(fish) as value, idx}
        {#if idx == 1}
          <td><Coins amount={value} /></td>
        {:else}
          <td>{value}</td>
        {/if}
      {/each}
    </tr>
  {/if}
  {#if needRequirements(data_value, fish)}
    <div class="w-full">
      {getRequiredString(data_value, fish)}
    </div>
  {/if}
{/each}
