<script lang="ts">
    import type { GameDataType } from "src/Entities";
    import XpBar from "src/components/XpBar.svelte";
    import {setCurrentlyFishing} from "src/gameData";
    import type { Skill } from "src/classes";

    export let gameData: GameDataType;
    export let barInfo: any;
    export let currentSkill: Skill;

    let values:any = Object.values(barInfo);
    console.log(`currentSkill`, currentSkill)
    console.log(`values[0].name`, values[0].name)
    let current = currentSkill === values[0].name;

</script>

<tr class="cursor-pointer" class:bg-red-600="{current}" on:click={() => setCurrentlyFishing(barInfo.xpBar.name)}>
    <XpBar name={values[0].name} width={values[0].width}/>
    {#each values as value, idx }
        {#if idx > 0}
            <td>{value}</td>
        {/if}
    {/each}
</tr>


<style>

    
    
</style>