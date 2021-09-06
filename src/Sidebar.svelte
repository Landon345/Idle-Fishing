<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import type { Fishing, Skill } from "src/classes";

  import {
    calculatedAge,
    getIncomeMultipliers,
    getTotalExpenses,
  } from "src/functions";
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

  const getNet = (income, expense): number => {
    if (negative(income, expense)) {
      return expense - income;
    }
    return income - expense;
  };
  const negative = (income, expense) => {
    if (income - expense < 0) {
      return true;
    }
    return false;
  };
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
    <p class="text-xl">Coins</p>
    <Coins amount={coins} large={true} />
  </div>
  <div class="m-3 flex flex-col">
    {#if currentlyFishing}
      <span class="text-blue-400"
        >Net/day:

        <Coins
          amount={getNet(currentlyFishing.income, getTotalExpenses(data_value))}
          negative={negative(
            currentlyFishing.income,
            getTotalExpenses(data_value)
          )}
        /></span
      >
      <span class="text-green-400"
        >Income/day: <Coins amount={currentlyFishing.income} /></span
      >
    {/if}
    <span class="text-red-500"
      >Expense/day: <Coins amount={getTotalExpenses(data_value)} /></span
    >
  </div>

  <div class="m-3 flex flex-col">
    {#if currentlyFishing}
      <XpBar
        name={currentlyFishing.name}
        width={currentlyFishing.barWidth}
        level={currentlyFishing.level}
      />
      <p class="text-lg text-gray-400">Currently Fishing</p>
    {/if}
  </div>
  <div class="m-3 flex flex-col">
    {#if currentSkill}
      <XpBar
        name={currentSkill.name}
        width={currentSkill.barWidth}
        level={currentSkill.level}
      />
    {/if}
    <p class="text-lg text-gray-400">Current Skill</p>
  </div>
</div>
