<script lang="ts">
  import ProgressTable from "src/components/ProgressTable.svelte";
  import type { Skill } from "src/classes.svelte";
  import { gameState, skillCategories } from "src/gameData.svelte";
  import SkillBars from "src/components/SkillBars.svelte";
  import { filtered, needRequirements } from "src/functions";
  import RequiredBar from "src/components/RequiredBar.svelte";

  const commonHeaders: string[] = ["Level", "Effect", "Xp/day", "Xp left", "Max Level"];

  const allHeaders: string[][] = Object.keys(skillCategories).map((key) => [
    key,
    ...commonHeaders,
  ]);

  const getSkills = (skills: Map<string, Skill>, category: string): Skill[] => {
    let skillArr: Skill[] = [];
    skills.forEach((skill) => {
      if (skill.baseData.category == category) {
        skillArr.push(skill);
      }
    });
    return skillArr;
  };

  // Computed once per category instead of separately for the bars and the
  // required-progress row below it (filtered()/getSkills() are O(n) scans).
  // The "legend" category stays hidden entirely until the player has
  // ascended at least once, matching Progress Knight's "Dark magic" reveal.
  const categories = $derived(
    allHeaders
      .filter((headers) => headers[0] != "legend" || gameState.legendPoints > 0)
      .map((headers) => {
        const skills = getSkills(gameState.skillsData, headers[0]);
        return { headers, skills, visible: filtered(gameState, skills) };
      })
  );
</script>

<div class="flex w-full flex-col gap-4 p-2">
  {#each categories as { headers, skills, visible }}
    <div>
      <ProgressTable {headers}>
        <SkillBars {skills} />
      </ProgressTable>
      {#each visible as skill}
        {#if needRequirements(gameState, skill)}
          <RequiredBar taskOrItem={skill} />
        {/if}
      {/each}
    </div>
  {/each}
</div>
