<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import ProgressTable from "src/components/ProgressTable.svelte";
  import type { Fishing } from "src/classes";
  import { GameData, fishCategories } from "src/gameData";
  import FishBars from "src/components/FishBars.svelte";
  import { onMount } from "svelte";
  import { filtered, getRequiredString, needRequirements } from "src/functions";
  import RequiredBar from "src/components/RequiredBar.svelte";

  let data_value: GameDataType;
  let fishingData;
  let commonHeaders: string[] = [
    "Level",
    "Income/day",
    "Effect",
    "Xp/day",
    "Xp left",
    "Max Level",
  ];
  let allHeaders: string[][] = [[]];

  onMount(() => {
    Object.keys(fishCategories).forEach((key) => {
      allHeaders.push([key, ...commonHeaders]);
    });
  });

  GameData.subscribe((data) => {
    data_value = data;
  });

  const getAllFish = (
    fishingData: Map<string, Fishing>,
    cateogry: string
  ): Fishing[] => {
    let fishArr = [];
    fishingData.forEach((fish) => {
      if (fish.baseData.category == cateogry) {
        fishArr.push(fish);
      }
    });
    return fishArr;
  };
</script>

<div class="w-full h-full bg-gray-700 p-2 mt-2">
  {#each allHeaders as headers}
    <div class="mb-3">
      <ProgressTable {headers}>
        <FishBars allFish={getAllFish(data_value.fishingData, headers[0])} />
      </ProgressTable>
      {#each filtered(data_value, getAllFish(data_value.fishingData, headers[0])) as fish, idx}
        {#if needRequirements(data_value, fish)}
          <RequiredBar taskOrItem={fish} />
        {/if}
      {/each}
    </div>
  {/each}
</div>
