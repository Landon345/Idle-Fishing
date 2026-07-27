<script lang="ts">
  import { capitalize } from "src/functions";
  import type { Snippet } from "svelte";

  interface Props {
    headers?: string[];
    headerColor?: string;
    children?: Snippet;
  }

  let { headers = ["Unknown"], headerColor = "#0891b2", children }: Props = $props();
</script>

<table class="w-full overflow-hidden rounded-lg">
  <thead>
    <tr>
      {#each headers as header}
        <th style="background-color: {headerColor}">{capitalize(header)}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {@render children?.()}
  </tbody>
</table>

<style>
  th {
    padding: 12px 8px;
    text-align: left;
    color: white;
  }

  /* The name/XpBar column needs guaranteed room (XpBar itself has
     min-width: 260px) - without this, fixed layout would split width
     evenly across every column, squeezing it in tables with 6-7 columns. */
  th:first-child,
  :global(table td:first-child) {
    width: 300px;
  }

  table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    border-spacing: 0 0.5em;
    width: 100%;
    /* Without this, column widths auto-recalculate from cell content on
       every tick, and formatted numbers (e.g. "999.9" -> "1.00k") change
       length constantly - causing a visible layout "wiggle". Fixed layout
       sizes columns once (from the header row) and never reflows them. */
    table-layout: fixed;
  }

  :global(table td),
  :global(table th) {
    /* Keeps digit widths consistent so numbers don't shift within their
       own (now fixed-width) column as they change either. */
    font-variant-numeric: tabular-nums;
  }
</style>
