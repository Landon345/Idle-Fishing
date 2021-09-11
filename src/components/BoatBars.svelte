<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import type { Boat } from "src/classes";
  import { GameData } from "src/gameData";
  import Coins from "src/components/Coins.svelte";
  import { filtered, getRequiredString, needRequirements } from "src/functions";

  let data_value: GameDataType;
  export let boats: Boat[] = [];

  GameData.subscribe((data) => {
    data_value = data;
  });
</script>

{#each filtered(data_value, boats) as boat}
  {#if !needRequirements(data_value, boat)}
    <tr class="cursor-pointer" on:click={() => boat.buy()}>
      <td
        >{boat.baseData.name}
        <span class="text-green-400">{boat.bought ? "Purchased" : ""}</span></td
      >
      <td><Coins amount={boat.baseData.price} /></td>
    </tr>
  {/if}
{/each}
