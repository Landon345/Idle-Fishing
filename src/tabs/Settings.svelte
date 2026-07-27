<script lang="ts">
  import { hardReset } from "src/gameData.svelte";
</script>

<div class="flex w-full flex-col gap-4 p-2">
  <p class="w-full rounded-lg bg-slate-600 p-6 text-xl font-bold text-white">Settings!</p>
  <button
    class="btn w-fit rounded-lg border-2 border-rose-500 bg-slate-800 font-bold text-rose-500"
    onclick={hardReset}>Reset Full Game</button
  >
</div>
