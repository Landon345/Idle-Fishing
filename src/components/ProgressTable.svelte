<script lang="ts">
  export let headers: string[] = ["Unknown"];
  export let headerColor: string = "#04aa6d";
  import { capitalize } from "src/functions";

  // headers I need:
  // ["Fundamentals", "Level", "Effect", "Xp/day", "Xp left", "Max Level"]
  // ["Ocean", "Level", "Income/day", "Effect", "Xp/day", "Xp left", "Max Level"]
</script>

<table class="w-full">
  <tr class="mt-4 mb-1">
    {#each headers as header, idx}
      <th style="background-color: {headerColor}">{capitalize(header)}</th>
    {/each}
  </tr>
  <slot />
</table>

<style>
  th {
    padding: 12px 8px;
    text-align: left;
    color: white;
  }

  tr {
    margin-bottom: 15px;
    width: 100%;
  }

  table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    border-spacing: 0 0.5em;
    width: 100%;
  }
</style>
