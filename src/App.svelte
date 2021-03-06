<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import Achievements from "src/tabs/Achievements.svelte";
  import GoneFishing from "src/tabs/GoneFishing.svelte";
  import Shop from "src/tabs/Shop.svelte";
  import Skills from "src/tabs/Skills.svelte";
  import Settings from "src/tabs/Settings.svelte";
  import Coins from "src/components/Coins.svelte";

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
    setCurrentSkill,
    setCurrentlyFishing,
  } from "./gameData";
  import Sidebar from "src/Sidebar.svelte";
  import Reincarnation from "src/tabs/Reincarnation.svelte";

  type Tab =
    | "goneFishing"
    | "skills"
    | "shop"
    | "achievements"
    | "settings"
    | "reincarnation";
  let selectedTab: Tab = "skills";

  let data_value: GameDataType;
  let coins: number;

  GameData.subscribe((data) => {
    data_value = data;
    coins = data.coins;
  });

  createData(data_value.fishingData, fishBaseData);
  createData(data_value.skillsData, skillBaseData);
  createData(data_value.itemData, itemBaseData);
  createData(data_value.boatData, boatBaseData);

  loadGameData();

  const setCurrents = () => {
    if (!data_value.currentSkill) {
      setCurrentSkill("Strength");
    }
    if (!data_value.currentlyFishing) {
      setCurrentlyFishing("Sun Fish");
    }
  };

  setCurrents();
  const updateGame = () => {
    update(data_value.paused, data_value.autoTrain, data_value.autoFish);
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
</script>

<main class="bg-gray-600 min-h-screen text-white">
  <h1 class="text-6xl text-center p-6">Idle Fishing</h1>
  <div class="flex flex-row">
    <Sidebar />

    <div class="flex flex-col mr-2 w-3/4 overflow-x-auto">
      <div class="flex flex-row bg-gray-800 text-white justify-between">
        <div class="flex flex-row">
          <button
            class={`btn ${selectedTab == "skills" && "bg-blue-900"}`}
            on:click={() => selectTab("skills")}>Skills</button
          >
          <button
            class={`btn ${selectedTab == "goneFishing" && "bg-blue-900"}`}
            on:click={() => selectTab("goneFishing")}>Gone Fishing</button
          >
          <button
            class={`btn ${selectedTab == "achievements" && "bg-blue-900"}`}
            on:click={() => selectTab("achievements")}>Achievements</button
          >
          <button
            class={`btn ${selectedTab == "shop" && "bg-blue-900"}`}
            on:click={() => selectTab("shop")}>Shop</button
          >
          {#if data_value.day > 365 * 50}
            <button
              class={`btn ${selectedTab == "reincarnation" && "bg-blue-900"}`}
              on:click={() => selectTab("reincarnation")}>Reincarnation</button
            >
          {/if}
        </div>
        <button
          class={`btn ${selectedTab == "settings" && "bg-blue-900"}`}
          on:click={() => selectTab("settings")}>Settings</button
        >
      </div>

      <div class="flex flex-col">
        {#if selectedTab == "skills"}
          <Skills />
        {:else if selectedTab == "goneFishing"}
          <GoneFishing />
        {:else if selectedTab == "achievements"}
          <Achievements />
        {:else if selectedTab == "shop"}
          <Shop />
        {:else if selectedTab == "reincarnation"}
          <Reincarnation />
        {:else}
          <Settings />
        {/if}
      </div>
    </div>
  </div>
</main>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  * {
    transition: all 0.1s linear;
  }
  .btn {
    @apply hover:bg-gray-900 py-5 px-10;
  }
  tr {
    border-bottom: 1px solid #666;
  }
  td {
    padding: 12px 0px 12px 10px;
  }
</style>
