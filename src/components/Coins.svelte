<script lang="ts">
  import { coinAmounts } from "src/functions";
  import { beforeUpdate } from "svelte";

  export let amount: number;
  export let large: boolean = false;
  export let negative: boolean = undefined;
  let coins;
  beforeUpdate(() => {
    coins = coinAmounts(amount);
  });
</script>

<span
  class={`flex justify-start items-center ${large ? "text-2xl" : "text-lg"}`}
>
  {#if negative}
    <p class="text-red-500 text-xl">-</p>
  {:else if negative == false}
    <p class="text-green-500 text-xl">+</p>
  {/if}
  {#if coins.p > 0}
    <p class="text-blue-500 w-1/4">{coins.p}p</p>
  {/if}
  {#if coins.g > 0 || coins.p > 0}
    <p class="text-yellow-400 w-1/4">{coins.g}g</p>
  {/if}
  {#if coins.s > 0 || coins.g > 0 || coins.p > 0}
    <p class="text-gray-300 w-1/4">{coins.s}s</p>
  {/if}
  <p class="text-yellow-800 w-1/4">{coins.c}c</p>
</span>
