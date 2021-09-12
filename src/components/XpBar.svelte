<script lang="ts">
  export let name = "";
  export let width = 10;
  export let level: number = undefined;
  export let selected: boolean = false;
</script>

<td>
  <div class={`bar ${selected ? "bg-purple-800" : "bg-purple-800"} p-2`}>
    <div class="text-top">
      {name}
      {#if level}
        {` lvl ${level}`}
      {/if}
    </div>
    <div
      class={`progress ${selected ? "bg-pink-900" : "bg-purple-500"}`}
      style="width: {width}%; height: 100%;"
    />
  </div>
</td>

<style>
  .bar {
    position: relative;
    min-width: 160px;
    max-width: 350px;
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
