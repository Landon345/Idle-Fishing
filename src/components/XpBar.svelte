<script lang="ts">
  export let name = "";
  export let width = 10;
  export let level: number = undefined;
</script>

<td class="bar bg-blue-400">
  <div class="text-top">
    {name}
    {#if level}
      {` lvl ${level}`}
    {/if}
  </div>
  <div class="progress bg-blue-800" style="width: {width}%; height: 100%;" />
</td>

<style>
  .bar {
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
  .text-top {
    position: relative;
    z-index: 3;
  }
</style>
