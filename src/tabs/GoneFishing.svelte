<script lang="ts">
  import ProgressTable from "src/components/ProgressTable.svelte";
  import type { Fishing } from "src/classes.svelte";
  import { gameState, fishCategories } from "src/gameData.svelte";
  import FishBars from "src/components/FishBars.svelte";
  import { filtered, needRequirements } from "src/functions";
  import RequiredBar from "src/components/RequiredBar.svelte";

  const commonHeaders: string[] = [
    "Level",
    "Income/day",
    "Effect",
    "Xp/day",
    "Xp left",
    "Max Level",
  ];

  const allHeaders: string[][] = Object.keys(fishCategories).map((key) => [
    key,
    ...commonHeaders,
  ]);

  const getAllFish = (fishingData: Map<string, Fishing>, category: string): Fishing[] => {
    let fishArr: Fishing[] = [];
    fishingData.forEach((fish) => {
      if (fish.baseData.category == category) {
        fishArr.push(fish);
      }
    });
    return fishArr;
  };

  // Computed once per category instead of separately for the bars and the
  // required-progress row below it (filtered()/getAllFish() are O(n) scans).
  const categories = $derived(
    allHeaders.map((headers) => {
      const allFish = getAllFish(gameState.fishingData, headers[0]);
      return { headers, allFish, visible: filtered(gameState, allFish) };
    })
  );
</script>

<div class="flex w-full flex-col gap-4 p-2">
  {#each categories as { headers, allFish, visible }}
    <div>
      <ProgressTable {headers}>
        <FishBars {allFish} />
      </ProgressTable>
      {#each visible as fish}
        {#if needRequirements(gameState, fish)}
          <RequiredBar taskOrItem={fish} />
        {/if}
      {/each}
    </div>
  {/each}
</div>
