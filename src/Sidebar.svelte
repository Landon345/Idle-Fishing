<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import type { Fishing, Skill } from "src/classes";

  import { calculatedAge } from "src/functions";
  import { togglePause, GameData } from "src/gameData";

  import Coins from "src/components/Coins.svelte";
  import XpBar from "src/components/XpBar.svelte";

  let data_value: GameDataType;
  let coins: number;
  let currentlyFishing: Fishing;
  let currentSkill: Skill;
  GameData.subscribe((data) => {
    data_value = data;
    coins = data.coins;
    currentlyFishing = data.currentlyFishing;
    currentSkill = data.currentSkill;
  });
</script>

<div class="flex flex-col w-1/4 bg-gray-900 text-white mx-2">
  <div class="m-3 flex">
    <p class="text-lg">{calculatedAge(data_value.day)}</p>
  </div>
  <div class="m-3 flex flex-col">
    <button
      class="px-9 py-4 bg-gray-700 hover:bg-gray-800 text-white"
      on:click={togglePause}>{data_value.paused ? "Play" : "Pause"}</button
    >
  </div>
  <div class="m-3 flex flex-col">
    <p class="text-lg">Coins</p>
    <Coins amount={coins} />
  </div>
  <div class="m-3 flex flex-col">
    <p class="text-lg">Currently Fishing</p>
    {#if currentlyFishing}
      <XpBar
        name={currentlyFishing.name}
        width={currentlyFishing.barWidth}
        level={currentlyFishing.level}
      />
    {/if}
  </div>
  <div class="m-3 flex flex-col">
    <p class="text-lg">Current Skill</p>
    {#if currentSkill}
      <XpBar
        name={currentSkill.name}
        width={currentSkill.barWidth}
        level={currentSkill.level}
      />
    {/if}
  </div>
</div>
