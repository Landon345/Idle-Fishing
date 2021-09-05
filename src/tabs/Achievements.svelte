<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import { GameData } from "src/gameData";

  let data_value: GameDataType;

  GameData.subscribe((data) => {
    data_value = data;
  });
</script>

<div class="bg-red-300 w-full h-full">
  <p class="p-10 bg-yellow-500">Achievements!</p>
</div>

<style></style>
