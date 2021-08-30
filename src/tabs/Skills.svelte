<script lang="ts">
    import type {GameDataType, SkillBaseData} from "src/Entities";
    import ProgressTable from "src/components/ProgressTable.svelte";
    import {applySkillData} from "src/functions";
    import type { Boat, Item, Skill } from "src/classes";
    export let gameData: GameDataType;


    const makeTableInfo = (skillData: Map<string, Skill>) => {
        let table: SkillBaseData[] = [];
        skillData.forEach((skillData, id) => {
            let baseData = applySkillData(skillData.baseData);
            table.push(baseData)
        })
        return table;
    }

    let tableInfo = makeTableInfo(gameData.skillsData)
    let tableInfo1 = tableInfo.filter(data => data.category == "fundamentals");

</script>

<div class="bg-gray-white w-full h-full">
    <p class="p-10 bg-green-500 text-white text-xl font-bold w-full">Skills!</p>
    <ProgressTable gameData={{...gameData}} tableInfo={tableInfo1} />
    
</div>