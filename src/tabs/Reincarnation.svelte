<script lang="ts">
  import { gameState, rebirth, ascend, getLegendPointGain, getLifespan, baseLifespan } from "src/gameData.svelte";

  const legendGain = $derived(getLegendPointGain());
  const lifespan = $derived(getLifespan());
  // On a completely fresh life lifespan == baseLifespan (Immortality hasn't
  // been leveled), and day can't exceed lifespan (isAlive() freezes progress
  // there) - so without requiring lifespan to actually be *extended*,
  // Ascension would appear right alongside Rebirth at the very first death.
  // Requiring the extension keeps Rebirth as the only way out until the
  // player has invested in Immortality/Super Immortality across some prior
  // Rebirths, matching Progress Knight's Age-200 gate.
  const canAscend = $derived(gameState.day >= lifespan && lifespan > baseLifespan);
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
