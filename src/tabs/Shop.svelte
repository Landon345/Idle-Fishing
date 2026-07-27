<script lang="ts">
  import type { Boat, Item } from "src/classes.svelte";
  import { gameState } from "src/gameData.svelte";
  import { filtered, needRequirements } from "src/functions";
  import BoatBars from "src/components/BoatBars.svelte";
  import ItemBars from "src/components/ItemBars.svelte";
  import RequiredBar from "src/components/RequiredBar.svelte";

  const getBoats = (boatData: Map<string, Boat>): Boat[] => {
    let boatArr: Boat[] = [];
    boatData.forEach((boat) => {
      boatArr.push(boat);
    });
    return boatArr;
  };
  const getItems = (itemData: Map<string, Item>): Item[] => {
    let itemArr: Item[] = [];
    itemData.forEach((item) => {
      itemArr.push(item);
    });
    return itemArr;
  };

  // Computed once instead of separately for the bars and the required-
  // progress row below them (filtered()/getBoats()/getItems() are O(n) scans).
  const boats = $derived(getBoats(gameState.boatData));
  const visibleBoats = $derived(filtered(gameState, boats));
  const items = $derived(getItems(gameState.itemData));
  const visibleItems = $derived(filtered(gameState, items));
</script>

<div class="flex w-full flex-col gap-8 p-2">
  <div class="flex flex-col gap-3">
    <h2 class="text-lg font-bold text-sky-200">🚤 Boats</h2>
    <BoatBars {boats} />
    {#each visibleBoats as boat}
      {#if needRequirements(gameState, boat)}
        <div class="w-full">
          <RequiredBar taskOrItem={boat} />
        </div>
      {/if}
    {/each}
  </div>

  <div class="flex flex-col gap-3">
    <h2 class="text-lg font-bold text-sky-200">🎒 Items</h2>
    <ItemBars {items} />
    {#each visibleItems as item}
      {#if needRequirements(gameState, item)}
        <RequiredBar taskOrItem={item} />
      {/if}
    {/each}
  </div>
</div>
