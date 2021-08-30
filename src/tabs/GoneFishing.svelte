<script lang="ts">
    import type {GameDataType} from "src/Entities";
    import ProgressTable from "src/components/ProgressTable.svelte";
    import type { Boat, Fishing, Item, Skill } from "src/classes";
    import type { FishBaseData } from "src/Entities";
    export let gameData: GameDataType;


    const makeTableInfo = (fishingData: Map<string, Fishing>) => {
        let table: FishBaseData[] = [];
        fishingData.forEach((fishData, id) => {
            let baseData = fishData.baseData;
            table.push(baseData)
        })
        return table;
    }

    let tableInfo = makeTableInfo(gameData.fishingData)
    let tableInfo1 = tableInfo.filter(data => data.category == "ocean");
    let tableInfo2 = tableInfo.filter(data => data.category == "lake")
    let tableInfo3 = tableInfo.filter(data => data.category == "river")

</script>

<div class="bg-gray-white w-full h-full">
    <p class="p-10 bg-blue-500 text-white text-xl font-bold w-full">Gone Fishing!</p>
    <ProgressTable gameData={{...gameData}} tableInfo={tableInfo1} />
    <ProgressTable gameData={{...gameData}} tableInfo={tableInfo2} />
    <ProgressTable gameData={{...gameData}} tableInfo={tableInfo3} />
    
</div>