<script lang="ts">
  import { gameState, rebirthReset } from "src/gameData.svelte";
</script>

<div class="flex w-full flex-col gap-4 p-2">
  <p class="w-full rounded-lg bg-indigo-500 p-6 text-xl font-bold text-white">Reincarnation!</p>
  {#if gameState.day > 365 * 60}
    <p class="text-slate-300">
      There is a glowing rock that is sparkling gold and silver. It is big enough to sit upon
      and wonder.
    </p>
  {/if}
  {#if gameState.day >= 365 * 70}
    <button
      class="btn w-fit rounded-lg border-2 border-yellow-400 bg-slate-800 font-bold text-yellow-200"
      onclick={rebirthReset}>Sit on the rock</button
    >
  {/if}
</div>
