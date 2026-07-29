<script lang="ts">
  import {
    gameState,
    hireCrew,
    fireCrew,
    getCrewWage,
    getTotalCrewWages,
    CREW_MAX,
  } from "src/gameData.svelte";
  import Coins from "src/components/Coins.svelte";

  const crew = $derived(gameState.crew);
  const offer = $derived(gameState.crewOffer);
  const atCapacity = $derived(crew.length >= CREW_MAX);
  const wages = $derived(getTotalCrewWages());
</script>

<div class="flex w-full flex-col gap-4 p-2">
  <p class="w-full rounded-lg bg-teal-700 p-6 text-xl font-bold text-white">Crew</p>

  <div class="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg border border-slate-800 bg-slate-800/40 p-4 text-slate-200">
    <span>Berths: <span class="font-bold text-teal-300">{crew.length}/{CREW_MAX}</span></span>
    <span class="flex items-center gap-1">Total wages/day <Coins amount={wages} /></span>
  </div>

  {#if offer.length > 0}
    <div class="flex flex-col gap-3">
      <p class="text-slate-300">
        A passer by noticed your past life and wants to join you in this one.
      </p>
      {#if atCapacity}
        <p class="rounded-lg border border-amber-700/60 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
          Your boat is full. Let someone go below to make room &mdash; or leave them on the dock.
        </p>
      {/if}
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {#each offer as candidate}
          <div class="flex flex-col gap-3 rounded-xl border-2 border-teal-600/70 bg-slate-800/60 p-4">
            <div class="flex flex-col gap-1">
              <span class="text-lg font-bold text-teal-200">{candidate.name}</span>
              <span class="flex items-center gap-1 text-sm text-rose-300">
                Wants <Coins amount={getCrewWage(candidate)} /> / day
              </span>
            </div>
            <ul class="flex flex-col gap-1">
              {#each candidate.upgrades as upgrade}
                <li class="text-sm text-emerald-300">
                  x{upgrade.effect.toFixed(2)} {upgrade.description}
                </li>
              {/each}
            </ul>
            <button
              disabled={atCapacity}
              class={`btn mt-auto rounded-lg text-sm font-medium ${atCapacity ? "cursor-not-allowed bg-slate-700 text-slate-500" : "cursor-pointer bg-teal-700 text-white hover:bg-teal-600"}`}
              onclick={() => hireCrew(candidate.id)}
            >
              Sign them on
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if crew.length > 0}
    <div class="flex flex-col gap-2">
      <p class="font-bold text-slate-200">Aboard</p>
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {#each crew as member}
          <div class="flex flex-col gap-3 rounded-xl border border-emerald-700 bg-emerald-950/30 p-4">
            <div class="flex flex-col gap-1">
              <span class="text-lg font-bold text-emerald-200">{member.name}</span>
              <span class="flex items-center gap-1 text-sm text-rose-300">
                <Coins amount={getCrewWage(member)} /> / day
              </span>
            </div>
            <ul class="flex flex-col gap-1">
              {#each member.upgrades as upgrade}
                <li class="text-sm text-emerald-300">
                  x{upgrade.effect.toFixed(2)} {upgrade.description}
                </li>
              {/each}
            </ul>
            <button
              class="btn mt-auto cursor-pointer rounded-lg bg-slate-700 text-sm font-medium text-rose-300 hover:bg-rose-900/60"
              onclick={() => fireCrew(member.id)}
            >
              Let them go
            </button>
          </div>
        {/each}
      </div>
    </div>
  {:else if offer.length === 0}
    <p class="text-slate-300">
      No one aboard. Touch the amulet and someone may come looking for a berth.
    </p>
  {/if}

  <p class="text-sm text-slate-500">
    Crew stay with you through rebirth, but wages are owed every day and cannot be
    switched off the way gear can. Ascending pays them all off.
  </p>
</div>
