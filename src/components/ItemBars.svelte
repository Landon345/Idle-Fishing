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
            class="cursor-pointer bg-gray-600 text-white"
            class:bg-purple-400={item.selected}
            on:click={() => item.select()}>{value}</td
          >
        {:else if idx == 1}
          <td
            class="cursor-pointer bg-gray-600 text-white hover:bg-gray-800"
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
