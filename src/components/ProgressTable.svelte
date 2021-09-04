<script lang="ts">
  export let headers: string[] = ["Unknown"];

  // headers I need:
  // ["Fundamentals", "Level", "Effect", "Xp/day", "Xp left", "Max Level"]
  // ["Ocean", "Level", "Income/day", "Effect", "Xp/day", "Xp left", "Max Level"]
</script>

<table class="w-full mb-5">
  <tr class="mt-4 mb-1">
    {#each headers as header, idx}
      <th>{header}</th>
    {/each}
  </tr>
  <slot />
</table>

<style>
  th {
    border: 1px solid #ddd;
    padding: 12px 8px;
    text-align: left;
    background-color: #04aa6d;
    color: white;
  }

  tr {
    margin-bottom: 15px;
    width: 100%;
    border-bottom: 1px solid #ddd;
  }

  table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }
</style>
