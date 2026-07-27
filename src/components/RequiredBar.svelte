<script lang="ts">
  import type { Requirement } from "src/gameData.svelte";
  import { gameState } from "src/gameData.svelte";
  import Coins from "src/components/Coins.svelte";
  import { daysToYears } from "src/functions";

  interface Props {
    taskOrItem: any;
  }

  let { taskOrItem }: Props = $props();

  const reqs = $derived(gameState.requirements.get(taskOrItem.name) as Requirement[]);

  const taskString = (requirement: any, type: string) => {
    let name = requirement.name;
    let levelNow =
      type == "skill"
        ? gameState.skillsData.get(name)!.level
        : gameState.fishingData.get(name)!.level;

    return `${name} level ${levelNow}/${requirement.requirement} `;
  };
  const ageString = (requirement: any) => {
    return `${daysToYears(requirement.requirement)} years old `;
  };
</script>

<div class="mb-8 flex w-full flex-wrap items-center gap-x-2 gap-y-1 text-base text-slate-300">
  <span class="font-bold text-slate-200">Required: </span>
  {#each reqs as req}
    {#each req.requirements as sameTypeReq}
      {#if ["fishing", "skill"].includes(req.type)}
        <span>{taskString(sameTypeReq, req.type)}</span>
      {:else if req.type == "age"}
        <span>{ageString(sameTypeReq)}</span>
      {:else if req.type == "boat"}
        <span>{sameTypeReq.name}</span>
      {:else if req.type == "coins"}
        <span>
          <Coins amount={sameTypeReq.requirement as number} large={true} />
        </span>
      {:else}
        <span>Unknown</span>
      {/if}
    {/each}
  {/each}
</div>
