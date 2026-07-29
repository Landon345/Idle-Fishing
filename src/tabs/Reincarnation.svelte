<script lang="ts">
  import {
    gameState,
    rebirth,
    ascend,
    getLegendPointGain,
    getLifespan,
    getAgingStonePrice,
    buyAgingStone,
    STARTING_AGE,
    DAYS_PER_YEAR,
    AGING_STONE_YEARS,
  } from "src/gameData.svelte";
  import { ageToDay, daysToYears } from "src/functions";
  import Coins from "src/components/Coins.svelte";

  const legendGain = $derived(getLegendPointGain());
  // Matches Progress Knight's Age-200 gate: reaching day 200 requires
  // Immortality/Super Immortality to have already extended the base (Age 70)
  // lifespan far enough that isAlive() doesn't freeze the game before then.
  const canAscend = $derived(gameState.day >= ageToDay(200));

  const currentAge = $derived(STARTING_AGE + daysToYears(gameState.day));
  const yearsUntilAscend = $derived(Math.max(0, 200 - currentAge));
  const stonesNeeded = $derived(Math.ceil(yearsUntilAscend / AGING_STONE_YEARS));
  const stonePrice = $derived(getAgingStonePrice());
  const canAffordStone = $derived(stonePrice <= gameState.coins);
  // Buying one more would age past the current lifespan before reaching the
  // Ascension gate - the clock stops there (isAlive() goes false) rather than
  // anything breaking, but it's worth flagging before the player spends on it.
  const stoneWouldOutliveLifespan = $derived(
    gameState.day + AGING_STONE_YEARS * DAYS_PER_YEAR >= getLifespan()
  );
</script>

<div class="flex w-full flex-col gap-4 p-2">
  <p class="w-full rounded-lg bg-indigo-500 p-6 text-xl font-bold text-white">Reincarnation</p>

  <div class="flex flex-wrap gap-6 rounded-lg border border-slate-800 bg-slate-800/40 p-4 text-slate-200">
    <span>Legend Points: <span class="font-bold text-amber-300">{gameState.legendPoints.toFixed(2)}</span></span>
    <span>Rebirths: <span class="font-bold">{gameState.rebirthCount}</span></span>
    <span>Ascensions: <span class="font-bold">{gameState.ascensionCount}</span></span>
  </div>

  <p class="text-slate-300">
    There is a weathered old fishing amulet tangled in your line, pulled up from the deep on your
    50th birthday. It doesn't look like much, but something about it feels old &mdash; older than
    the lake itself.
  </p>

  <!-- calculatedAge() displays 14 + years-elapsed, so 365*36 here is
       displayed "Age 50" - same threshold as the tab itself in App.svelte. -->
  {#if gameState.day > 365 * 36}
    <div class="flex flex-col gap-3 rounded-lg border border-yellow-700/60 bg-slate-800/40 p-4">
      <p class="font-bold text-yellow-200">Rebirth</p>
      <p class="text-sm text-slate-300">
        The amulet grows warm. You could start your life over &mdash; you'll lose your coins,
        boats, items, and every skill/fish level, but each one's <b>highest level ever reached</b>
        is remembered forever, making you learn everything faster next time around.
      </p>
      <button
        class="btn w-fit rounded-lg border-2 border-yellow-400 bg-slate-800 font-bold text-yellow-200"
        onclick={rebirth}>Touch the amulet</button
      >
    </div>
  {/if}

  {#if !canAscend}
    <div class="flex flex-col gap-3 rounded-lg border border-stone-500/60 bg-slate-800/40 p-4">
      <p class="font-bold text-stone-300">Ageing Stone</p>
      <p class="text-sm text-slate-300">
        A heavy, cold stone sits at the bottom of your tackle box, pulled up from somewhere the
        light doesn't reach. Holding it steals <b>{AGING_STONE_YEARS} years</b> from you all at
        once &mdash; gold in exchange for the wait, for anyone who would rather not sit through it.
      </p>
      <p class="text-sm text-slate-400">
        Age {currentAge} of 200 &middot; about {stonesNeeded} more stone{stonesNeeded === 1
          ? ""
          : "s"} to reach the gate.
      </p>
      {#if stoneWouldOutliveLifespan}
        <p class="rounded-lg border border-amber-700/60 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
          This one will carry you past your current lifespan before you reach Age 200. Time will
          stop until you extend it further or choose to Rebirth.
        </p>
      {/if}
      <button
        disabled={!canAffordStone}
        class={`btn w-fit rounded-lg border-2 font-bold ${canAffordStone ? "cursor-pointer border-stone-400 bg-slate-800 text-stone-200 hover:bg-slate-700" : "cursor-not-allowed border-slate-600 bg-slate-800 text-slate-500"}`}
        onclick={buyAgingStone}
      >
        Hold the stone &mdash; <Coins amount={stonePrice} />
      </button>
    </div>
  {/if}

  {#if canAscend}
    <div class="flex flex-col gap-3 rounded-lg border border-rose-700/60 bg-slate-800/40 p-4">
      <p class="font-bold text-rose-300">Ascension</p>
      <p class="text-sm text-slate-300">
        You've reached the end of this life. The amulet cracks open, and it offers you one last
        choice: ascend, becoming a legend of the sea. Doing so resets <i>everything</i>, including
        your remembered max levels &mdash; but you'll permanently gain
        <b class="text-amber-300">{legendGain.toFixed(2)} Legend Points</b>, unlocking a permanent
        line of legendary skills that carry across every future life.
      </p>
      <button
        class="btn w-fit rounded-lg border-2 border-rose-500 bg-slate-800 font-bold text-rose-300"
        onclick={ascend}>Ascend</button
      >
    </div>
  {/if}
</div>
