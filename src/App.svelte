<script lang="ts">
  import { onMount } from "svelte";
  import Achievements from "src/tabs/Achievements.svelte";
  import GoneFishing from "src/tabs/GoneFishing.svelte";
  import Shop from "src/tabs/Shop.svelte";
  import Skills from "src/tabs/Skills.svelte";
  import Settings from "src/tabs/Settings.svelte";

  import { calculatedAge, createData, loadGameData, saveGameData } from "./functions";
  import {
    boatBaseData,
    fishBaseData,
    gameState,
    itemBaseData,
    skillBaseData,
    togglePause,
    update,
    setCurrentSkill,
    setCurrentlyFishing,
    masteryUnlocked,
  } from "./gameData.svelte";
  import Sidebar from "src/Sidebar.svelte";
  import Reincarnation from "src/tabs/Reincarnation.svelte";
  import Mastery from "src/tabs/Mastery.svelte";

  type Tab =
    | "goneFishing"
    | "skills"
    | "shop"
    | "achievements"
    | "settings"
    | "reincarnation"
    | "mastery";
  let selectedTab: Tab = $state("skills");

  createData(gameState.fishingData, fishBaseData);
  createData(gameState.skillsData, skillBaseData);
  createData(gameState.itemData, itemBaseData);
  createData(gameState.boatData, boatBaseData);

  loadGameData();

  if (!gameState.currentSkill) {
    setCurrentSkill("Strength");
  }
  if (!gameState.currentlyFishing) {
    setCurrentlyFishing("Sun Fish");
  }

  onMount(() => {
    let lastTick = performance.now();
    const updateGame = () => {
      const now = performance.now();
      const deltaSeconds = (now - lastTick) / 1000;
      lastTick = now;
      update(gameState.paused, gameState.autoTrain, gameState.autoFish, deltaSeconds);
    };
    const masterInterval = window.setInterval(updateGame, 50);
    const saveInterval = window.setInterval(() => saveGameData(gameState), 3000);

    return () => {
      window.clearInterval(masterInterval);
      window.clearInterval(saveInterval);
    };
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "skills", label: "Skills" },
    { key: "goneFishing", label: "Gone Fishing" },
    { key: "achievements", label: "Achievements" },
    { key: "shop", label: "Shop" },
  ];

  const selectTab = (selected: Tab) => {
    selectedTab = selected;
  };
</script>

<main class="min-h-screen bg-slate-900 text-slate-100">
  <header class="border-b border-slate-800 bg-slate-950/60 px-4 py-5 sm:px-8">
    <h1 class="text-center text-4xl font-bold tracking-tight text-sky-100 sm:text-5xl">
      🎣 Idle Fishing
    </h1>
    <p class="mt-1 text-center text-sm text-slate-400">{calculatedAge(gameState.day)}</p>
  </header>

  <div class="flex flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
    <Sidebar />

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-800/40 shadow-lg">
      <div class="flex flex-wrap items-center justify-between gap-1 border-b border-slate-800 bg-slate-950/40 px-2 py-2">
        <div class="flex flex-wrap gap-1">
          {#each tabs as tab}
            <button
              class={`btn rounded-lg text-sm font-medium ${selectedTab === tab.key ? "bg-sky-700 text-white" : "text-slate-300 hover:bg-slate-800"}`}
              onclick={() => selectTab(tab.key)}>{tab.label}</button
            >
          {/each}
          <!-- Opens at MASTERY_LEVELS_PER_PICK combined levels. The dot marks
               a choice waiting to be made. -->
          {#if masteryUnlocked()}
            <button
              class={`btn rounded-lg text-sm font-medium ${selectedTab === "mastery" ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
              onclick={() => selectTab("mastery")}
            >
              Mastery{#if gameState.masteryOffer.length > 0}<span
                  class="ml-1 inline-block h-2 w-2 rounded-full bg-amber-400 align-middle"
                ></span>{/if}
            </button>
          {/if}
          <!-- calculatedAge() displays 14 + years-elapsed, so 365*36 here is
               displayed "Age 50" (matches the Reincarnation tab's narrative). -->
          {#if gameState.day > 365 * 36}
            <button
              class={`btn rounded-lg text-sm font-medium ${selectedTab === "reincarnation" ? "bg-sky-700 text-white" : "text-slate-300 hover:bg-slate-800"}`}
              onclick={() => selectTab("reincarnation")}>Reincarnation</button
            >
          {/if}
        </div>
        <button
          class={`btn rounded-lg text-sm font-medium ${selectedTab === "settings" ? "bg-sky-700 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          onclick={() => selectTab("settings")}>Settings</button
        >
      </div>

      <div class="flex flex-1 flex-col overflow-x-auto p-2">
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
        {:else if selectedTab == "mastery"}
          <Mastery />
        {:else}
          <Settings />
        {/if}
      </div>
    </div>
  </div>
</main>
