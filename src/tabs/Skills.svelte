<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import ProgressTable from "src/components/ProgressTable.svelte";
  import type { Skill } from "src/classes";
  import { GameData, skillCategories } from "src/gameData";
  import SkillBars from "src/components/SkillBars.svelte";
  import { onMount } from "svelte";
  import { filtered, getRequiredString, needRequirements } from "src/functions";
  import RequiredBar from "src/components/RequiredBar.svelte";

  let data_value: GameDataType;
  let commonHeaders: string[] = [
    "Level",
    "Effect",
    "Xp/day",
    "Xp left",
    "Max Level",
  ];

  let allHeaders: string[][] = [[]];

  onMount(() => {
    Object.keys(skillCategories).forEach((key) => {
      allHeaders.push([key, ...commonHeaders]);
    });
  });

  GameData.subscribe((data) => {
    data_value = data;
  });

  const getSkills = (skills: Map<string, Skill>, category: string): Skill[] => {
    let skillArr: Skill[] = [];
    skills.forEach((skill) => {
      if (skill.baseData.category == category) {
        skillArr.push(skill);
      }
    });
    return skillArr;
  };
</script>

<div class="w-full h-full bg-gray-700 p-2 mt-2">
  {#each allHeaders as headers}
    <div class="mb-3">
      <ProgressTable {headers}>
        <SkillBars skills={getSkills(data_value.skillsData, headers[0])} />
      </ProgressTable>
      {#each filtered(data_value, getSkills(data_value.skillsData, headers[0])) as skill}
        {#if needRequirements(data_value, skill)}
          <RequiredBar taskOrItem={skill} />
        {/if}
      {/each}
    </div>
  {/each}
</div>
