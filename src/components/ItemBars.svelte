<script lang="ts">
  import type { Item } from "src/classes.svelte";
  import { gameState } from "src/gameData.svelte";
  import Coins from "src/components/Coins.svelte";
  import { needRequirements } from "src/functions";

  interface Props {
    // Already run through `filtered()` by the caller — see FishBars.svelte.
    items?: Item[];
  }

  let { items = [] }: Props = $props();

  const canAfford = (price: number) => price <= gameState.coins;
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
  {#each items as item}
    {#if !needRequirements(gameState, item)}
      <div
        class={`flex flex-col gap-2 rounded-xl border p-4 transition-colors ${item.selected ? "border-emerald-600 bg-emerald-950/30" : "border-slate-700 bg-slate-800/40"}`}
      >
        <div class="flex items-start justify-between gap-2">
          <button
            class={`text-left font-semibold hover:underline ${item.selected ? "text-emerald-300" : "text-slate-200"}`}
            onclick={() => item.select()}>{item.name}</button
          >
          <span
            class={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${item.selected ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400"}`}
          >
            {item.selected ? "Equipped" : "Unequipped"}
          </span>
        </div>

        <p class="text-sm text-sky-300">{item.effectDescription}</p>

        <div class="flex items-center justify-between text-sm text-slate-400">
          <span>Level {item.level}</span>
          <span class="flex items-center gap-1">Expense/day <Coins amount={item.expense} /></span>
        </div>

        <button
          class={`btn mt-1 flex items-center justify-center gap-1 rounded-lg text-sm font-medium ${canAfford(item.upgradePrice) ? "bg-sky-700 text-white hover:bg-sky-600" : "cursor-not-allowed bg-slate-700 text-slate-500"}`}
          onclick={() => item.upgrade()}
        >
          Upgrade &mdash; <Coins amount={item.upgradePrice} />
        </button>
      </div>
    {/if}
  {/each}
</div>
