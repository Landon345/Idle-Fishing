<script lang="ts">
  interface Props {
    name?: string;
    width?: number;
    level?: number;
    selected?: boolean;
  }

  let { name = "", width = 10, level = undefined, selected = false }: Props = $props();
</script>

<td>
  <div class="bar rounded-md bg-slate-700 p-2">
    <div class="text-top">
      {name}
      {#if level}
        {` lvl ${level}`}
      {/if}
    </div>
    <div
      class={`progress rounded-md ${selected ? "bg-sky-600" : "bg-slate-500"}`}
      style="width: {width}%; height: 100%;"
    ></div>
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
