<script lang="ts">
    import type {GameDataType} from "src/Entities";
    import Table from "src/components/Table.svelte";
    import type { Boat, Fishing, Item, Skill } from "src/classes";
    import type { FishBaseData } from "src/Entities";
    export let gameData: GameDataType;


    const makeTableInfo = (fishingData: Map<string, Fishing>) => {
        let table = [];
        fishingData.forEach((fishData, id) => {
            console.log(`fishData`, fishData)
            let baseData = fishData.baseData;
            table.push(baseData)
        })
        console.log(`table`, table)
        return table;
    }

    console.log(`gameData.fishingData`, gameData.fishingData)
    let tableInfo = makeTableInfo(gameData.fishingData)
    let tableInfo1 = tableInfo;
    let tableInfo2 = tableInfo.filter(data => data.category == "lake")
    let tableInfo3 = tableInfo.filter(data => data.category == "river")

</script>

<div class="bg-gray-white w-full h-full">
    <p class="p-10 bg-blue-500 text-white text-xl font-bold w-full">Gone Fishing!</p>
    <Table gameData={{...gameData}} tableInfo={tableInfo1} />
    <Table gameData={{...gameData}} tableInfo={tableInfo2} />
    <Table gameData={{...gameData}} tableInfo={tableInfo3} />
    
</div>