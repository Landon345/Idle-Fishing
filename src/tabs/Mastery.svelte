<script lang="ts">
  import {
    gameState,
    masteryData,
    chooseMastery,
    getTotalLevels,
    getLevelsUntilNextMastery,
    MASTERY_LEVELS_PER_PICK,
  } from "src/gameData.svelte";

  const totalLevels = $derived(getTotalLevels());
  const untilNext = $derived(getLevelsUntilNextMastery());
  // How far through the current 200-level stretch the player is.
  const progress = $derived(
    ((MASTERY_LEVELS_PER_PICK - untilNext) / MASTERY_LEVELS_PER_PICK) * 100
  );

  const offer = $derived(
    gameState.masteryOffer.map((name) => masteryData.get(name)!).filter(Boolean)
  );
  const taken = $derived(
    gameState.masteryTaken.map((name) => masteryData.get(name)!).filter(Boolean)
  );
  const passed = $derived(
    gameState.masteryPassed.map((name) => masteryData.get(name)!).filter(Boolean)
  );
</script>

<div class="flex w-full flex-col gap-4 p-2">
  <p class="w-full rounded-lg bg-amber-600 p-6 text-xl font-bold text-white">Mastery</p>

  <div class="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-800/40 p-4">
    <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-slate-200">
      <span>Total levels: <span class="font-bold text-amber-300">{totalLevels}</span></span>
      <span>Chosen: <span class="font-bold">{taken.length}</span></span>
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-slate-700">
      <div class="h-full bg-amber-500 transition-[width]" style={`width: ${progress}%`}></div>
    </div>
    <p class="text-sm text-slate-400">
      {untilNext} more level{untilNext === 1 ? "" : "s"} until your next Mastery.
    </p>
  </div>

  {#if offer.length > 0}
    <div class="flex flex-col gap-3">
      <p class="font-bold text-amber-200">Choose one &mdash; the other two are lost for this life.</p>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each offer as mastery}
          <button
            class="btn flex flex-col items-start gap-2 rounded-xl border-2 border-amber-600/70 bg-slate-800/60 p-4 text-left hover:border-amber-400 hover:bg-slate-800"
            onclick={() => chooseMastery(mastery.name)}
          >
            <span class="text-lg font-bold text-amber-200">{mastery.name}</span>
            <span class="text-sm text-emerald-300">
              x{mastery.effect.toFixed(2)} {mastery.baseData.description}
            </span>
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <p class="text-slate-300">
      Keep levelling. Every {MASTERY_LEVELS_PER_PICK} combined levels earns another choice.
    </p>
  {/if}

  {#if taken.length > 0}
    <div class="flex flex-col gap-2">
      <p class="font-bold text-slate-200">Your Masteries</p>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {#each taken as mastery}
          <div class="flex flex-col gap-1 rounded-lg border border-emerald-700 bg-emerald-950/30 p-3">
            <span class="font-semibold text-emerald-200">{mastery.name}</span>
            <span class="text-sm text-emerald-300">
              x{mastery.effect.toFixed(2)} {mastery.baseData.description}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if passed.length > 0}
    <div class="flex flex-col gap-2">
      <p class="font-bold text-slate-400">Passed over</p>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {#each passed as mastery}
          <div class="flex flex-col gap-1 rounded-lg border border-slate-700 bg-slate-900/40 p-3 opacity-50">
            <span class="font-semibold text-slate-400 line-through">{mastery.name}</span>
            <span class="text-sm text-slate-500">
              x{mastery.effect.toFixed(2)} {mastery.baseData.description}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
