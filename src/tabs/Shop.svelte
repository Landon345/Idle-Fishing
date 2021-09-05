<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import ProgressTable from "src/components/ProgressTable.svelte";
  import type { Boat, Item } from "src/classes";
  import { GameData } from "src/gameData";
  import Coins from "src/components/Coins.svelte";
  import ProgressTableBar from "src/components/ProgressTableBar.svelte";
  import { SvelteComponentDev } from "svelte/internal";
  import { getRequiredString, needRequirements } from "src/functions";

  let data_value: GameDataType;
  let rowBoat: Boat;
  let silverBullet: Boat;
  let rod: Item;
  let book: Item;

  GameData.subscribe((data) => {
    data_value = data;
    rowBoat = data.boatData.get("Row Boat");
    silverBullet = data.boatData.get("Silver Bullet");
    rod = data.itemData.get("Rod");
    book = data.itemData.get("Book");
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

<div class="bg-gray-white w-full h-full">
  <p class="p-10 bg-red-700 text-white text-xl font-bold w-full">Shop!</p>
  <ProgressTable headers={["Boats", "Price"]}>
    <tr class="cursor-pointer" on:click={() => rowBoat.buy()}>
      <td
        >{rowBoat.baseData.name}
        <span class="text-green-400">{rowBoat.bought ? "Purchased" : ""}</span
        ></td
      >
      <td><Coins amount={rowBoat.baseData.price} /></td>
    </tr>
    <tr class="cursor-pointer" on:click={() => silverBullet.buy()}>
      <td
        >{silverBullet.baseData.name}
        <span class="text-green-400"
          >{silverBullet.bought ? "Purchased" : ""}</span
        ></td
      >
      <td><Coins amount={silverBullet.baseData.price} /></td>
    </tr>
  </ProgressTable>
  <ProgressTable
    headers={["Item", "Upgrade", "Effect", "Level", "Expense/Day"]}
  >
    <!-- Rod -->
    <tr>
      {#each getValues(rod) as value, idx}
        {#if idx == 0}
          <td
            class="cursor-pointer bg-gray-600 text-white"
            class:bg-purple-400={rod.selected}
            on:click={() => rod.select()}>{value}</td
          >
        {:else if idx == 1}
          <td
            class="cursor-pointer bg-gray-600 text-white hover:bg-gray-800"
            on:click={() => rod.upgrade()}><Coins amount={+value} /></td
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
    <!-- Book -->
    {#if !needRequirements(data_value, book)}
      <tr>
        {#each getValues(book) as value, idx}
          {#if idx == 0}
            <td
              class="cursor-pointer bg-gray-600 text-white"
              class:bg-purple-400={book.selected}
              on:click={() => book.select()}>{value}</td
            >
          {:else if idx == 1}
            <td
              class="cursor-pointer bg-gray-600 text-white hover:bg-gray-800"
              on:click={() => book.upgrade()}><Coins amount={+value} /></td
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
  </ProgressTable>
  {#if needRequirements(data_value, book)}
    <div class="w-full">
      {getRequiredString(data_value, book)}
    </div>
  {/if}
</div>
