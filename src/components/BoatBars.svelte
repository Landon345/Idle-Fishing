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
</script>

{#each boats as boat}
  {#if !needRequirements(gameState, boat)}
    <tr class="cursor-pointer hover:bg-slate-700/40" onclick={() => boat.buy()}>
      <td
        >{boat.baseData.name}
        <span class="text-emerald-400">{boat.bought ? "Purchased" : ""}</span></td
      >
      <td><Coins amount={boat.baseData.price} /></td>
    </tr>
  {/if}
{/each}
