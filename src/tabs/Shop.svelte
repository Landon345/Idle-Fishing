<script lang="ts">
  import ProgressTable from "src/components/ProgressTable.svelte";
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

<div class="flex w-full flex-col gap-6 p-2">
  <div>
    <ProgressTable headers={["Boats", "Price"]}>
      <BoatBars {boats} />
    </ProgressTable>
    {#each visibleBoats as boat}
      {#if needRequirements(gameState, boat)}
        <div class="w-full">
          <RequiredBar taskOrItem={boat} />
        </div>
      {/if}
    {/each}
  </div>

  <div>
    <ProgressTable headers={["Item", "Upgrade", "Effect", "Level", "Expense/Day"]}>
      <ItemBars {items} />
    </ProgressTable>
    {#each visibleItems as item}
      {#if needRequirements(gameState, item)}
        <RequiredBar taskOrItem={item} />
      {/if}
    {/each}
  </div>
</div>
