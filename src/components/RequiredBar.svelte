<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import type { Requirement } from "src/classes";
  import { GameData } from "src/gameData";
  import Coins from "src/components/Coins.svelte";
  import { daysToYears } from "src/functions";
  import { beforeUpdate } from "svelte";

  export let taskOrItem: any;
  let data_value: GameDataType;
  GameData.subscribe((data) => {
    data_value = data;
  });
  let reqs: Requirement[] = data_value.requirements.get(taskOrItem.name);
  beforeUpdate(() => {
    reqs = data_value.requirements.get(taskOrItem.name);
  });

  const taskString = (requirement: any, type) => {
    let name = requirement.name;
    let levelNow =
      type == "skill"
        ? data_value.skillsData.get(name).level
        : data_value.fishingData.get(name).level;

    return `${name} level ${levelNow}/${requirement.requirement} `;
  };
  const ageString = (requirement: any) => {
    return `${daysToYears(requirement.requirement)} years old `;
  };
</script>

<div class="w-full mb-8 flex justify-between text-lg">
  <span class="font-bold">Required: </span>
  {#each reqs as req}
    {#each req.requirements as sameTypeReq}
      {#if ["fishing", "skill"].includes(req.type)}
        <span>{taskString(sameTypeReq, req.type)}</span>
      {:else if req.type == "age"}
        <span>{ageString(sameTypeReq)}</span>
      {:else if req.type == "boat"}
        <span>{sameTypeReq.name}</span>
      {:else if req.type == "coins"}
        <span class="w-1/4">
          <Coins amount={sameTypeReq.requirement} large={true} />
        </span>
      {:else}
        <span>Unknown</span>
      {/if}
    {/each}
  {/each}
</div>
