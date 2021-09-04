<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import Achievements from "src/tabs/Achievements.svelte";
  import GoneFishing from "src/tabs/GoneFishing.svelte";
  import Shop from "src/tabs/Shop.svelte";
  import Skills from "src/tabs/Skills.svelte";
  import Settings from "src/tabs/Settings.svelte";

  import {
    calculatedAge,
    coinAmounts,
    createData,
    loadGameData,
    saveGameData,
  } from "./functions";
  import {
    boatBaseData,
    fishBaseData,
    GameData,
    itemBaseData,
    skillBaseData,
    updateSpeed,
    togglePause,
    update,
  } from "./gameData";
  import { onMount } from "svelte";

  type Tab = "goneFishing" | "skills" | "shop" | "achievements" | "settings";
  let selectedTab: Tab = "skills";

  let data_value: GameDataType;
  let coins;

  GameData.subscribe((data) => {
    data_value = data;
    coins = coinAmounts(data.coins);
  });

  const updateGame = () => {
    update(data_value.paused);
  };
  const masterInterval: number = window.setInterval(
    updateGame,
    1000 / updateSpeed
  );
  const saveInterval: number = window.setInterval(
    () => saveGameData(data_value),
    3000
  );

  const selectTab = (selected: Tab) => {
    selectedTab = selected;
  };

  createData(data_value.fishingData, fishBaseData);
  createData(data_value.skillsData, skillBaseData);
  createData(data_value.itemData, itemBaseData);
  createData(data_value.boatData, boatBaseData);

  loadGameData();

  GameData.update((data) => {
    return { ...data, currentlyFishing: data.fishingData.get("blackdrum") };
  });
  // GameData.currentlyFishing = GameData.fishingData.get("blackdrum");
  // GameData.currentSkill = GameData.skillsData.get("Concentration");
  // GameData.currentMisc = [];

  // GameData.requirements = new Map();
</script>

<main>
  <h1 class="text-6xl">Idle Fishing</h1>
  <div class="flex flex-row">
    <div class="flex flex-col w-1/4">
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
      </div>
    </div>

    <div class="flex flex-col mr-2 w-3/4 overflow-x-auto">
      <div class="flex flex-row bg-gray-800 text-white justify-between">
        <div class="flex flex-row">
          <button class="btn" on:click={() => selectTab("skills")}
            >Skills</button
          >
          <button class="btn" on:click={() => selectTab("goneFishing")}
            >Gone Fishing</button
          >
          <button class="btn" on:click={() => selectTab("achievements")}
            >Achievements</button
          >
          <button class="btn" on:click={() => selectTab("shop")}>Shop</button>
        </div>
        <button class="btn" on:click={() => selectTab("settings")}
          >Settings</button
        >
      </div>

      <div class="flex flex-col">
        {#if selectedTab == "skills"}
          <Skills />
        {:else if selectedTab == "goneFishing"}
          <GoneFishing />
          <!-- {:else if selectedTab == "achievements"}
					<Achievements/>
				{:else if selectedTab == "shop"}
					<Shop />
				{:else}
					<Settings /> -->
        {/if}
      </div>
    </div>
  </div>
</main>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  .btn {
    @apply hover:bg-gray-900 py-5 px-10;
  }

  tr {
    border-bottom: 1px solid #ddd;
  }
  td {
    border: 1px solid #ddd;
    padding: 8px;
  }
</style>
