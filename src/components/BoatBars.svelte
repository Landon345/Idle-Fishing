<script lang="ts">
  import type { Boat } from "src/classes.svelte";
  import { gameState } from "src/gameData.svelte";
  import Coins from "src/components/Coins.svelte";
  import { needRequirements } from "src/functions";

  interface Props {
    // Already run through `filtered()` by the caller — see FishBars.svelte.
    boats?: Boat[];
  }

  let { boats = [] }: Props = $props();

  const canAfford = (price: number) => price <= gameState.coins;
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
  {#each boats as boat}
    {#if !needRequirements(gameState, boat)}
      <div
        class={`flex flex-col gap-2 rounded-xl border p-4 transition-colors ${boat.bought ? "border-emerald-600 bg-emerald-950/30" : "border-slate-700 bg-slate-800/40"}`}
      >
        <div class="flex items-start justify-between gap-2">
          <span class="font-semibold text-slate-200">{boat.baseData.name}</span>
          {#if boat.bought}
            <span class="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
              Purchased
            </span>
          {/if}
        </div>

        <!-- `boat.effect` is 1 until bought, so show what buying it *would*
             give rather than the currently-inactive x1.00. -->
        <span class={`text-sm ${boat.bought ? "text-emerald-300" : "text-slate-400"}`}>
          x{boat.baseData.effect.toFixed(2)} {boat.baseData.description}
        </span>

        {#if !boat.bought}
          <button
            class={`btn mt-1 flex items-center justify-center gap-1 rounded-lg text-sm font-medium ${canAfford(boat.baseData.price) ? "bg-sky-700 text-white hover:bg-sky-600" : "cursor-not-allowed bg-slate-700 text-slate-500"}`}
            onclick={() => boat.buy()}
          >
            Buy &mdash; <Coins amount={boat.baseData.price} />
          </button>
        {/if}
      </div>
    {/if}
  {/each}
</div>
