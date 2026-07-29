<script lang="ts">
  import type { Boat, Item } from "src/classes.svelte";
  import {
    gameState,
    buyTackleSlot,
    getTackleSlots,
    getTackleSlotPrice,
    getEquippedItemCount,
    tackleSlotsMaxed,
  } from "src/gameData.svelte";
  import { filtered, needRequirements } from "src/functions";
  import BoatBars from "src/components/BoatBars.svelte";
  import ItemBars from "src/components/ItemBars.svelte";
  import RequiredBar from "src/components/RequiredBar.svelte";
  import Coins from "src/components/Coins.svelte";

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

  const slots = $derived(getTackleSlots());
  const equipped = $derived(getEquippedItemCount());
  const slotPrice = $derived(getTackleSlotPrice());
  const maxed = $derived(tackleSlotsMaxed());
  const canAffordSlot = $derived(slotPrice <= gameState.coins);
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

    <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-800/40 p-4">
      <div class="flex flex-col gap-1">
        <span class="text-slate-200">
          Tackle box:
          <span class={`font-bold ${equipped >= slots ? "text-amber-300" : "text-emerald-300"}`}>
            {equipped}/{slots}
          </span>
          equipped
        </span>
        <span class="text-sm text-slate-400">
          {#if maxed}
            Every slot bought &mdash; carry whatever you like.
          {:else if equipped >= slots}
            Your box is full. Unequip something, or buy another slot.
          {:else}
            Only what fits in the box earns its keep.
          {/if}
        </span>
      </div>
      {#if !maxed}
        <button
          class={`btn flex items-center justify-center gap-1 rounded-lg text-sm font-medium ${canAffordSlot ? "cursor-pointer bg-sky-700 text-white hover:bg-sky-600" : "cursor-not-allowed bg-slate-700 text-slate-500"}`}
          onclick={buyTackleSlot}
        >
          Buy a slot &mdash; <Coins amount={slotPrice} />
        </button>
      {/if}
    </div>

    <ItemBars {items} />
    {#each visibleItems as item}
      {#if needRequirements(gameState, item)}
        <RequiredBar taskOrItem={item} />
      {/if}
    {/each}
  </div>
</div>
