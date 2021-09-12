<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import type { Item } from "src/classes";
  import { GameData } from "src/gameData";
  import Coins from "src/components/Coins.svelte";
  import { filtered, getRequiredString, needRequirements } from "src/functions";

  let data_value: GameDataType;
  export let items: Item[] = [];

  GameData.subscribe((data) => {
    data_value = data;
  });

  const getValues = (item: Item) => {
    return [
      item.name,
      item.upgradePrice,
      item.effectDescription,
      item.level,
      item.expense,
    ];
  };
</script>

{#each filtered(data_value, items) as item}
  {#if !needRequirements(data_value, item)}
    <tr>
      {#each getValues(item) as value, idx}
        {#if idx == 0}
          <td
            class="cursor-pointer bg-purple-400 text-white"
            class:bg-pink-900={item.selected}
            on:click={() => item.select()}>{value}</td
          >
        {:else if idx == 1}
          <td
            class="cursor-pointer bg-purple-700 text-white hover:bg-purple-800"
            on:click={() => item.upgrade()}><Coins amount={+value} /></td
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
