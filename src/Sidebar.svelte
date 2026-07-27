<script lang="ts">
  import { calculatedAge, daysToYears, getTotalExpenses, isAlive, needRequirements } from "src/functions";
  import { togglePause, gameState, getLifespan } from "src/gameData.svelte";

  import Coins from "src/components/Coins.svelte";
  import XpBar from "src/components/XpBar.svelte";

  const getNet = (income: number, expense: number): number =>
    negative(income, expense) ? expense - income : income - expense;
  const negative = (income: number, expense: number) => income - expense < 0;

  const expenses = $derived(getTotalExpenses(gameState));
  const alive = $derived(isAlive());
  const lifespanYears = $derived(daysToYears(getLifespan()));
  const timeWarpingUnlocked = $derived.by(() => {
    const timeWarping = gameState.skillsData.get("Time Warping");
    return !!timeWarping && !needRequirements(gameState, timeWarping);
  });
</script>

<aside class="flex w-full flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-lg md:w-72 md:shrink-0">
  <div>
    <p class="text-lg text-slate-300">{calculatedAge(gameState.day)}</p>
    <p class="text-xs text-slate-500">Lifespan: {lifespanYears + 14} years</p>
  </div>

  {#if !alive}
    <p class="rounded-lg border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
      You've reached the end of this life. Visit Reincarnation to continue.
    </p>
  {/if}

  <button
    class="rounded-lg bg-slate-800 px-6 py-3 font-medium text-white hover:bg-slate-700"
    onclick={togglePause}>{gameState.paused ? "▶ Play" : "⏸ Pause"}</button
  >

  <div class="flex flex-col gap-1">
    <p class="text-xl text-slate-200">Coins</p>
    <Coins amount={gameState.coins} large={true} />
  </div>

  <div class="flex flex-col gap-1">
    {#if gameState.currentlyFishing}
      <span class="text-blue-400">
        Net/day:
        <Coins
          amount={getNet(gameState.currentlyFishing.income, expenses)}
          negative={negative(gameState.currentlyFishing.income, expenses)}
        />
      </span>
      <span class="text-emerald-400">
        Income/day: <Coins amount={gameState.currentlyFishing.income} />
      </span>
    {/if}
    <span class="text-rose-500">
      Expense/day: <Coins amount={expenses} />
    </span>
  </div>

  <div class="flex flex-col gap-2">
    {#if gameState.currentlyFishing}
      <XpBar
        name={gameState.currentlyFishing.name}
        width={gameState.currentlyFishing.barWidth}
        level={gameState.currentlyFishing.level}
        selected={true}
      />
      <p class="text-sm text-slate-400">Currently Fishing</p>
    {/if}
  </div>
  <div class="flex flex-col gap-2">
    {#if gameState.currentSkill}
      <XpBar
        name={gameState.currentSkill.name}
        width={gameState.currentSkill.barWidth}
        level={gameState.currentSkill.level}
        selected={true}
      />
    {/if}
    <p class="text-sm text-slate-400">Current Skill</p>
  </div>
  <div class="flex flex-col gap-2 text-white">
    <label class="flex items-center gap-3">
      <input class="h-5 w-5 accent-sky-600" type="checkbox" bind:checked={gameState.autoTrain} />
      Auto Train
    </label>
    <label class="flex items-center gap-3">
      <input class="h-5 w-5 accent-sky-600" type="checkbox" bind:checked={gameState.autoFish} />
      Auto Promote Fish
    </label>
    {#if timeWarpingUnlocked}
      <label class="flex items-center gap-3">
        <input
          class="h-5 w-5 accent-sky-600"
          type="checkbox"
          bind:checked={gameState.timeWarpingEnabled}
        />
        Time Warping
      </label>
    {/if}
  </div>
</aside>
