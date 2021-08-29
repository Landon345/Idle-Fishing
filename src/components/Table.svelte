<script lang="ts">
    import TableBar from "src/components/TableBar.svelte";
    import type {GameDataType} from "src/Entities";
import Achievements from "src/tabs/Achievements.svelte";

    let keys = {};
    export let gameData: GameDataType;

    export let tableInfo = [
        {"Fundamentals": "strength", level: 0, effect: 1.01, "Xp/Day": 1, "Xp Left": 15, "Max Level": 0},
        {"Fundamentals": "strength", level: 0, effect: 1.01, "Xp/Day": 1, "Xp Left": 15, "Max Level": 0},
        {"Fundamentals": "strength", level: 0, effect: 1.01, "Xp/Day": 1, "Xp Left": 15, "Max Level": 0},
    ]
    
    const grabHeaders = (): string[] => {
        let headers = [];
        let keys = Object.keys(tableInfo[0]);
        for(let i = 0; i<keys.length; i++){
            headers.push(keys[i])
        }
        return headers;
    }
</script>

<table>
    <tr>
        {#each grabHeaders() as header}
            <th>{header}</th>
        {/each}
    </tr>
    {#each tableInfo as bar}
        <TableBar barInfo={{...bar}}/>
    {/each}
</table>