<script lang="ts">
     import type {GameDataType} from "src/Entities";
    import Table from "src/components/Table.svelte";
    export let gameData: GameDataType;

    let tableInfo1 = [
        {"Fundamentals": "strength", level: 0, effect: 1.01, "Xp/Day": 1, "Xp Left": 15, "Max Level": 0},
        {"Fundamentals": "strength", level: 0, effect: 1.01, "Xp/Day": 1, "Xp Left": 15, "Max Level": 0},
        {"Fundamentals": "strength", level: 0, effect: 1.01, "Xp/Day": 1, "Xp Left": 15, "Max Level": 0},
    ]
    let tableInfo2 = [

    ]
    let tableInfo3 = [

    ]

</script>

<div class="bg-red-300 w-1/2 h-full">
    <p class="p-10 bg-white">Gone Fishing!</p>
    <Table gameData={{...gameData}} tableInfo={tableInfo1} />
    <Table gameData={{...gameData}} tableInfo={tableInfo1} />
    <Table gameData={{...gameData}} tableInfo={tableInfo1} />
    
</div>