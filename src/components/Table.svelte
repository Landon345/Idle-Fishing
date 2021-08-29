<script lang="ts">
    import TableBar from "src/components/TableBar.svelte";
    import type {GameDataType} from "src/Entities";
import Achievements from "src/tabs/Achievements.svelte";

    let keys = {};
    export let gameData: GameDataType;

    export let tableInfo = []
    
    const grabHeaders = (): string[] => {
        return tableInfo.length == 0 ? [] : Object.keys(tableInfo[0]);
    }
</script>

<table class="w-full mb-5">
    <tr class="mt-4 mb-1">
        {#each grabHeaders() as header}
            <th>{header}</th>
        {/each}
    </tr>
    {#each tableInfo as bar}

        <TableBar barInfo={{...bar}}/>
        
    {/each}
</table>

<style>

    th{
		border: 1px solid #ddd;
        padding: 12px 8px;
        text-align: left;
        background-color: #04AA6D;
        color: white;
	}

    tr{
        margin-bottom: 15px;
		width: 100%;
        border-bottom: 1px solid #ddd
    }
    
    table{
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
    }
</style>