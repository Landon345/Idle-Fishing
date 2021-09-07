<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import { GameData, rebirthReset } from "src/gameData";

  let data_value: GameDataType;
  let day: number;

  GameData.subscribe((data) => {
    data_value = data;
    day = data.day;
  });
</script>

<div class="bg-gray-white w-full h-full">
  <p class="p-10 bg-indigo-400 text-white text-xl font-bold w-full">
    Reincarnation!
  </p>
  {#if day > 365 * 60}
    <p>
      There is a glowing rock that is sparkling gold and silver. It is big
      enough to sit upon and wonder.
    </p>
  {/if}
  {#if day >= 365 * 70}
    <button
      class="btn bg-gray-800 border-yellow-400 border-2 text-yellow-200 font-bold"
      on:click={rebirthReset}>Sit on the rock</button
    >
  {/if}
</div>
