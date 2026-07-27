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

  table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    border-spacing: 0 0.5em;
    width: 100%;
  }
</style>
