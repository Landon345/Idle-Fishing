<script lang="ts">
    export let value;
</script>

<td class="bar bg-blue-400">
    <div class="text-top">
        {value}
    </div>
    <div class="progress bg-blue-800" style="width: {50}%; height: 100%;"></div>
</td>

<style>
    .bar{
        position: relative;
        width: 300px;
        color: white;
    }
    .progress {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
    }
    .text-top{
        position:relative;
        z-index: 3;
    }
</style>