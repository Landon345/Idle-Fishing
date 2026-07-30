<script lang="ts">
  import type { Fishing } from "src/classes.svelte";
  import { isAlive } from "src/functions";
  import {
    getFishingDifficulty,
    getFishBehavior,
    grantActiveFishingReward,
    ACTIVE_FISHING_BITE_DELAY_MIN_MS,
    ACTIVE_FISHING_BITE_DELAY_MAX_MS,
    ACTIVE_FISHING_GRAVITY,
    ACTIVE_FISHING_THRUST,
    ACTIVE_FISHING_MAX_BAR_SPEED,
    ACTIVE_FISHING_BAR_HEIGHT_EASY,
    ACTIVE_FISHING_BAR_HEIGHT_HARD,
    ACTIVE_FISHING_FISH_SPEED_EASY,
    ACTIVE_FISHING_FISH_SPEED_HARD,
    ACTIVE_FISHING_FISH_RETARGET_EASY_MS,
    ACTIVE_FISHING_FISH_RETARGET_HARD_MS,
    ACTIVE_FISHING_METER_START,
    ACTIVE_FISHING_FILL_RATE_EASY,
    ACTIVE_FISHING_FILL_RATE_HARD,
    ACTIVE_FISHING_DRAIN_RATE_EASY,
    ACTIVE_FISHING_DRAIN_RATE_HARD,
    ACTIVE_FISHING_REWARD_BASE_SECONDS,
    ACTIVE_FISHING_QUALITY_PAR_SECONDS,
  } from "src/gameData.svelte";
  import Coins from "src/components/Coins.svelte";

  interface Props {
    fish: Fishing;
    onClose: () => void;
  }

  let { fish, onClose }: Props = $props();

  const lerp = (easy: number, hard: number, t: number) => easy + (hard - easy) * t;

  // fish never actually changes on a live instance (Sidebar only mounts a
  // fresh modal, never reassigns the prop), but $derived reads it correctly
  // regardless rather than capturing just its initial value.
  const difficulty = $derived(getFishingDifficulty(fish));
  const barHeight = $derived(lerp(ACTIVE_FISHING_BAR_HEIGHT_EASY, ACTIVE_FISHING_BAR_HEIGHT_HARD, difficulty));
  const fishSpeed = $derived(lerp(ACTIVE_FISHING_FISH_SPEED_EASY, ACTIVE_FISHING_FISH_SPEED_HARD, difficulty));
  const fishRetargetMs = $derived(lerp(
    ACTIVE_FISHING_FISH_RETARGET_EASY_MS,
    ACTIVE_FISHING_FISH_RETARGET_HARD_MS,
    difficulty,
  ));
  const fillRate = $derived(lerp(ACTIVE_FISHING_FILL_RATE_EASY, ACTIVE_FISHING_FILL_RATE_HARD, difficulty));
  const drainRate = $derived(lerp(ACTIVE_FISHING_DRAIN_RATE_EASY, ACTIVE_FISHING_DRAIN_RATE_HARD, difficulty));
  // Per-species movement personality on top of the difficulty-driven pace
  // above - see getFishBehavior's own comment for why this is a separate axis
  // from difficulty rather than folded into it.
  const behavior = $derived(getFishBehavior(fish));

  type Phase = "waiting" | "reeling" | "success" | "fail";
  let phase: Phase = $state("waiting");

  let barPosition = $state(50);
  let barVelocity = $state(0);
  let fishPosition = $state(50);
  let fishTarget = $state(50);
  let meter = $state(ACTIVE_FISHING_METER_START);
  let held = $state(false);
  let reelStartTime = $state(0);
  let lastEarned = $state(0);

  // Phase 1: wait for a bite, then start reeling. No input needed yet.
  $effect(() => {
    if (phase !== "waiting") return;
    const delay =
      ACTIVE_FISHING_BITE_DELAY_MIN_MS +
      Math.random() * (ACTIVE_FISHING_BITE_DELAY_MAX_MS - ACTIVE_FISHING_BITE_DELAY_MIN_MS);
    const id = window.setTimeout(() => {
      phase = "reeling";
    }, delay);
    return () => window.clearTimeout(id);
  });

  // Phase 2: the actual minigame - hold to rise, fish drifts, meter tracks
  // overlap. Re-initializes every time this phase is (re-)entered, including
  // on Retry after a fail, matching "no punishment, retry immediately."
  $effect(() => {
    if (phase !== "reeling") return;
    const { speedMultiplier, retargetMultiplier, dashChance, dashSpeedMultiplier } = behavior;
    const effectiveRetargetMs = fishRetargetMs * retargetMultiplier;
    // Set on every retarget below - a dash briefly moves at dashSpeedMultiplier
    // instead of this fish's normal pace, then reverts on the next retarget.
    let currentFishSpeed = fishSpeed * speedMultiplier;

    barPosition = 50;
    barVelocity = 0;
    fishPosition = 50;
    fishTarget = Math.random() * 100;
    meter = ACTIVE_FISHING_METER_START;
    reelStartTime = performance.now();
    let lastRetarget = performance.now();
    let lastFrame = performance.now();
    let cancelled = false;

    const frame = (now: number) => {
      if (cancelled) return;
      // Clamp dt so a backgrounded tab can't dump a huge catch-up jump.
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;

      if (now - lastRetarget >= effectiveRetargetMs) {
        fishTarget = Math.random() * 100;
        const dashing = Math.random() < dashChance;
        currentFishSpeed = fishSpeed * speedMultiplier * (dashing ? dashSpeedMultiplier : 1);
        lastRetarget = now;
      }
      const fishStep = currentFishSpeed * dt;
      const fishDelta = fishTarget - fishPosition;
      fishPosition += Math.sign(fishDelta) * Math.min(Math.abs(fishDelta), fishStep);

      const accel = ACTIVE_FISHING_GRAVITY + (held ? ACTIVE_FISHING_THRUST : 0);
      barVelocity = Math.max(
        -ACTIVE_FISHING_MAX_BAR_SPEED,
        Math.min(ACTIVE_FISHING_MAX_BAR_SPEED, barVelocity + accel * dt),
      );
      const nextBarPosition = barPosition + barVelocity * dt;
      // Clamping position alone isn't enough: gravity keeps accelerating
      // barVelocity further negative every frame the bar sits at the floor,
      // building up to -MAX_BAR_SPEED even though it's visibly not moving.
      // Holding then has to cancel all of that built-up velocity before the
      // bar visibly rises, which read as "it keeps falling and takes forever
      // to come back up." Zeroing the velocity component pushing into
      // whichever wall was hit (same idea at the ceiling) fixes it.
      if (nextBarPosition <= 0) {
        barPosition = 0;
        barVelocity = Math.max(0, barVelocity);
      } else if (nextBarPosition >= 100 - barHeight) {
        barPosition = 100 - barHeight;
        barVelocity = Math.min(0, barVelocity);
      } else {
        barPosition = nextBarPosition;
      }

      const overlapping =
        fishPosition >= barPosition && fishPosition <= barPosition + barHeight;
      meter = Math.max(
        0,
        Math.min(100, meter + (overlapping ? fillRate : -drainRate) * dt),
      );

      if (!isAlive()) {
        phase = "fail";
        return;
      }
      if (meter >= 100) {
        const reelSeconds = (now - reelStartTime) / 1000;
        const quality = Math.max(
          0.5,
          Math.min(2, ACTIVE_FISHING_QUALITY_PAR_SECONDS / Math.max(reelSeconds, 0.5)),
        );
        lastEarned = grantActiveFishingReward(fish, ACTIVE_FISHING_REWARD_BASE_SECONDS * quality);
        phase = "success";
        return;
      }
      if (meter <= 0) {
        phase = "fail";
        return;
      }
      requestId = requestAnimationFrame(frame);
    };
    let requestId = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(requestId);
    };
  });

  // Always on (not phase-guarded) so Escape works no matter what's happening,
  // matching Reincarnation.svelte's ascension popup.
  $effect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  // Space held = same as holding pointerdown on the track. Only takes effect
  // while reeling; releasing on cleanup means a phase change mid-press can't
  // strand the bar rising.
  $effect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (phase === "reeling") held = true;
    };
    const onKeyup = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      held = false;
    };
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("keyup", onKeyup);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("keyup", onKeyup);
      held = false;
    };
  });

  const retry = () => {
    phase = "reeling";
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -- the backdrop is
     click-to-dismiss for mouse users only; keyboard dismissal goes through
     the global Escape listener above. -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
  role="presentation"
  onclick={onClose}
>
  <div
    class="flex w-full max-w-sm flex-col gap-4 rounded-xl border-2 border-sky-500/70 bg-slate-900 p-6 shadow-xl"
    role="dialog"
    aria-modal="true"
    aria-labelledby="active-fishing-title"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Kept a mystery until the catch actually lands - part of the fun is
         not knowing what's on the line, so the name only appears in the
         success panel below, never here (including on a fail: if it gets
         away, you never find out what it was). -->
    <p id="active-fishing-title" class="text-xl font-bold text-sky-300">
      🎣 {phase === "success" ? fish.name : "???"}
    </p>

    {#if phase === "waiting"}
      <p class="py-8 text-center text-slate-400">Waiting for a bite...</p>
    {:else if phase === "reeling" || phase === "success" || phase === "fail"}
      <!-- svelte-ignore a11y_no_static_element_interactions -- pointer hold
           drives the bar; this is the minigame's core control surface, not
           an accessible action - Space bar (window-level) is the keyboard
           equivalent. -->
      <div
        class="relative h-72 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950 select-none"
        onpointerdown={() => phase === "reeling" && (held = true)}
        onpointerup={() => (held = false)}
        onpointerleave={() => (held = false)}
        onpointercancel={() => (held = false)}
      >
        <div
          class="absolute left-0 w-full rounded bg-sky-600/70 border border-sky-300/50"
          style={`bottom: ${barPosition}%; height: ${barHeight}%;`}
        ></div>
        <div
          class="absolute left-1/2 -translate-x-1/2 text-2xl"
          style={`bottom: ${fishPosition}%; transform: translate(-50%, 50%);`}
        >
          🐟
        </div>
      </div>

      <div class="h-4 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          class="h-full bg-emerald-500 transition-[width]"
          style={`width: ${meter}%`}
        ></div>
      </div>

      {#if phase === "reeling"}
        <p class="text-center text-sm text-slate-400">
          Hold (click or Space) to reel up, release to let it fall.
        </p>
      {:else if phase === "success"}
        <div class="flex flex-col items-center gap-2">
          <p class="font-bold text-emerald-300">You caught a {fish.name}!</p>
          <Coins amount={lastEarned} negative={false} />
        </div>
        <button
          class="btn w-fit self-end rounded-lg bg-sky-600 font-bold text-white hover:bg-sky-500"
          onclick={onClose}
        >
          Nice!
        </button>
      {:else if phase === "fail"}
        <p class="text-center font-bold text-rose-400">It got away.</p>
        <div class="flex justify-end gap-2">
          <button
            class="btn rounded-lg border-2 border-slate-600 bg-slate-800 font-medium text-slate-300 hover:bg-slate-700"
            onclick={onClose}
          >
            Close
          </button>
          <button
            class="btn rounded-lg bg-sky-600 font-bold text-white hover:bg-sky-500"
            onclick={retry}
          >
            Try Again
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>
