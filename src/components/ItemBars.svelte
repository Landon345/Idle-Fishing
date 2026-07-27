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

  const getValues = (item: Item) => {
    return [item.name, item.upgradePrice, item.effectDescription, item.level, item.expense];
  };
</script>

{#each items as item}
  {#if !needRequirements(gameState, item)}
    <tr>
      {#each getValues(item) as value, idx}
        {#if idx == 0}
          <td
            class={`cursor-pointer text-white ${item.selected ? "bg-fuchsia-800" : "bg-fuchsia-600"}`}
            onclick={() => item.select()}>{value}</td
          >
        {:else if idx == 1}
          <td
            class="cursor-pointer bg-fuchsia-900 text-white hover:bg-fuchsia-800"
            onclick={() => item.upgrade()}><Coins amount={+value} /></td
          >
        {:else if idx == 4}
          <td>
            <Coins amount={+value} />
          </td>
        {:else}
          <td>{value}</td>
        {/if}
      {/each}
    </tr>
  {/if}
{/each}
