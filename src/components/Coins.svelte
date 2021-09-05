<script lang="ts">
  import { coinAmounts } from "src/functions";
  import { GameData } from "src/gameData";
  import { beforeUpdate } from "svelte";

  export let amount: number;
  let coins;
  beforeUpdate(() => {
    coins = coinAmounts(amount);
  });
</script>

<span class="flex">
  {#if coins.p > 0}
    <p class="text-lg text-blue-500 w-1/4">{coins.p}g</p>
  {/if}
  {#if coins.g > 0}
    <p class="text-lg text-yellow-400 w-1/4">{coins.g}g</p>
  {/if}
  {#if coins.s > 0}
    <p class="text-lg text-gray-300 w-1/4">{coins.s}s</p>
  {/if}
  <p class="text-lg text-yellow-800 w-1/4">{coins.c}c</p>
</span>
