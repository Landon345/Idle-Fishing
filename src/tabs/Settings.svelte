<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import { GameData, hardReset } from "src/gameData";

  let data_value: GameDataType;

  GameData.subscribe((data) => {
    data_value = data;
  });
</script>

<div class="bg-gray-white w-full h-full">
  <p class="p-10 bg-gray-500 text-white text-xl font-bold w-full">Settings!</p>
  <button
    class="btn bg-gray-800 border-red-500 border-2 text-red-500 font-bold"
    on:click={hardReset}>Reset Full Game</button
  >
</div>
