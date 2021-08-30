<script lang="ts">
    import type {GameDataType, SkillBaseData} from "src/Entities";
    import ProgressTable from "src/components/ProgressTable.svelte";
    import {applySkillData, capitalize} from "src/functions";
    import type { Skill } from "src/classes";
    import { skillCategories } from "src/gameData";

    export let gameData: GameDataType;
    export let currentSkill: Skill;

    const makeTableInfo = (skillData: Map<string, Skill>) => {
        let table: any[] = [];
        skillData.forEach((skill: Skill, id) => {
            let rowObj = applySkillData(skill);
            table.push(rowObj)
        })
        return table;
    }

    const tableInfo = makeTableInfo(gameData.skillsData)
    const tableInfo1 = tableInfo.filter(data => skillCategories.fundamentals.some((element) => element == capitalize(data.xpBar.name)));

</script>

<div class="bg-gray-white w-full h-full">
    <p class="p-10 bg-green-500 text-white text-xl font-bold w-full">Skills!</p>
    <ProgressTable gameData={{...gameData}} tableInfo={tableInfo1} firstHeader="Fundamentals" currentSkill={currentSkill}/>
    
</div>