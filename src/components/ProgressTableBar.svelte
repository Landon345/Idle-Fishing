<script lang="ts">
    import {selectCurrent} from "src/functions";
    import XpBar from "src/components/XpBar.svelte";
    export let barInfo: any;

</script>

<tr class="cursor-pointer" on:click={() => selectCurrent(barInfo)}>
    {#each Object.values(barInfo) as value, idx }
        {#if idx == 0}
            <XpBar value={value}/>
        {:else}
            <td>{value}</td>
        {/if}
    {/each}
</tr>


<style>

    
    
</style>