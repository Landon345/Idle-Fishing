<script lang="ts">

    export let barInfo: any;

</script>

<tr >
    {#each Object.values(barInfo) as value, idx }
        {#if idx == 1}
            <td>
                
            </td>
        {:else}
            <td>{value}</td>
        {/if}
    {/each}
</tr>


<style>
    tr{ 
        border-bottom: 1px solid #ddd
    }
	td{
		border: 1px solid #ddd;
        padding: 8px;;
	}
</style>