<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import ProgressTable from "src/components/ProgressTable.svelte";
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
  let blackDrum: Fishing;
  let blueMarlin: Fishing;

  GameData.subscribe((data) => {
    data_value = data;
    blackDrum = data.fishingData.get("Black Drum");
    blueMarlin = data.fishingData.get("Blue Marlin");
  });

  let selected: string = data_value.currentlyFishing?.name || "Black Drum";
  let commonHeaders: string[] = [
    "Level",
    "Income/day",
    "Effect",
    "Xp/day",
    "Xp left",
    "Max Level",
  ];
  let oceanHeaders: string[] = ["Ocean", ...commonHeaders];
  let lakeHeaders: string[] = ["Lake", ...commonHeaders];
  let riverHeaders: string[] = ["River", ...commonHeaders];

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

<div class="bg-gray-white w-full h-full">
  <p class="p-10 bg-blue-500 text-white text-xl font-bold w-full">
    Gone Fishing!
  </p>
  <ProgressTable headers={oceanHeaders}>
    <!-- BLACK DRUM -->
    <tr
      class="cursor-pointer"
      class:bg-blue-200={selected === "Black Drum"}
      on:click={() => setCurrent("Black Drum")}
    >
      <XpBar name={"Black Drum"} width={blackDrum.barWidth} />
      {#each getValues(blackDrum) as value, idx}
        {#if idx == 1}
          <td><Coins amount={value} /></td>
        {:else}
          <td>{value}</td>
        {/if}
      {/each}
    </tr>
    <!-- BLUE MARLIN -->
    {#if !needRequirements(data_value, blueMarlin)}
      <tr
        class="cursor-pointer"
        class:bg-blue-200={selected === "Blue Marlin"}
        on:click={() => setCurrent("Blue Marlin")}
      >
        <XpBar name={"Blue Marlin"} width={blueMarlin.barWidth} />
        {#each getValues(blueMarlin) as value, idx}
          {#if idx == 1}
            <td><Coins amount={value} /></td>
          {:else}
            <td>{value}</td>
          {/if}
        {/each}
      </tr>
    {/if}
  </ProgressTable>
  {#if needRequirements(data_value, blueMarlin)}
    <div class="w-full">
      {getRequiredString(data_value, blueMarlin)}
    </div>
  {/if}
</div>
