<script lang="ts">
  interface Props {
    name?: string;
    width?: number;
    level?: number;
    selected?: boolean;
  }

  let { name = "", width = 10, level = undefined, selected = false }: Props = $props();
</script>

<!--
  No wrapping <td> here on purpose: this component is used both inside
  table rows (FishBars/SkillBars, which supply their own <td>) and bare in
  the Sidebar. A <td> outside a real <table>/<tr> makes the browser
  auto-generate anonymous table wrapper boxes around it, which was the
  cause of the unwanted extra left offset in the Sidebar.
-->
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

<style>
  .bar {
    position: relative;
    min-width: 260px;
    max-width: 500px;
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
