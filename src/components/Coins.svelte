<script lang="ts">
  import { coinAmounts } from "src/functions";

  interface Props {
    amount: number;
    large?: boolean;
    negative?: boolean;
  }

  let { amount, large = false, negative = undefined }: Props = $props();

  const coins = $derived(coinAmounts(amount));
</script>

<span class={`flex items-center justify-start gap-0.5 ${large ? "text-2xl" : "text-lg"}`}>
  {#if negative}
    <span class="text-rose-500">-</span>
  {:else if negative == false}
    <span class="text-emerald-500">+</span>
  {/if}
  {#if coins.r > 0}
    <span class="font-bold text-red-500">{coins.r}r</span>
  {/if}
  {#if coins.p > 0 || coins.r > 0}
    <span class="text-blue-400">{coins.p}p</span>
  {/if}
  {#if coins.g > 0 || coins.p > 0 || coins.r > 0}
    <span class="text-yellow-400">{coins.g}g</span>
  {/if}
  {#if coins.s > 0 || coins.g > 0 || coins.p > 0 || coins.r > 0}
    <span class="text-slate-300">{coins.s}s</span>
  {/if}
  <span class="text-amber-700">{coins.c}c</span>
</span>
