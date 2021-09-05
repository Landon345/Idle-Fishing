<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import { GameData } from "src/gameData";

  let data_value: GameDataType;

  GameData.subscribe((data) => {
    data_value = data;
  });
</script>

<div class="bg-red-300 w-1/2 h-full">
  <p class="p-10 bg-gray-300">Settings!</p>
</div>
