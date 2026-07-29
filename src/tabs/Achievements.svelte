<script lang="ts">
  import { achievements } from "src/achievements";
  import { gameState } from "src/gameData.svelte";

  const earnedSet = $derived(new Set(gameState.achievementsEarned));
  const earnedCount = $derived(earnedSet.size);
</script>

<div class="flex w-full flex-col gap-4 p-2">
  <p class="w-full rounded-lg bg-sky-700 p-6 text-xl font-bold text-white">🏆 Achievements</p>

  <div class="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-800/40 p-4">
    <span class="text-slate-200">
      Unlocked: <span class="font-bold text-amber-300">{earnedCount}</span> / {achievements.length}
    </span>
    <div class="h-2 w-full overflow-hidden rounded-full bg-slate-700">
      <div
        class="h-full bg-amber-500 transition-[width]"
        style={`width: ${(earnedCount / achievements.length) * 100}%`}
      ></div>
    </div>
  </div>

  <!-- Descriptions stay visible even locked, matching how the rest of the app
       (Mastery, Crew) shows full info upfront rather than hiding it behind a
       "???" - the point is to give the player a goal to read, not a mystery. -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {#each achievements as achievement}
      {@const earned = earnedSet.has(achievement.id)}
      <div
        class={`flex flex-col gap-1 rounded-xl border p-4 transition-colors ${earned ? "border-amber-500/70 bg-amber-950/30" : "border-slate-700 bg-slate-800/40"}`}
      >
        <div class="flex items-start justify-between gap-2">
          <span class={`font-semibold ${earned ? "text-amber-200" : "text-slate-300"}`}>
            {achievement.name}
          </span>
          <span
            class={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${earned ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400"}`}
          >
            {earned ? "Unlocked" : "Locked"}
          </span>
        </div>
        <span class={`text-sm ${earned ? "text-amber-300/80" : "text-slate-500"}`}>
          {achievement.description}
        </span>
      </div>
    {/each}
  </div>
</div>
