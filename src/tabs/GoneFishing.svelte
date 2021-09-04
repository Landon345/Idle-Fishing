<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import ProgressTable from "src/components/ProgressTable.svelte";
  import TableBar from "src/components/ProgressTableBar.svelte";
  import type { Fishing } from "src/classes";
  import type { FishBaseData } from "src/Entities";
  import { GameData, setCurrentlyFishing } from "src/gameData";
  import XpBar from "src/components/XpBar.svelte";

  let data_value: GameDataType;

  GameData.subscribe((data) => {
    data_value = data;
  });

  let selected: string = data_value.currentlyFishing?.name || "Black Drum";
  let commonHeaders: string[] = [
    "Level",
    "Income/day",
    "Effect",
    "Xp/day",
    "Xp left",
    "Max Level",
  ];
  let oceanHeaders: string[] = ["Ocean", ...commonHeaders];
  let lakeHeaders: string[] = ["Lake", ...commonHeaders];
  let riverHeaders: string[] = ["River", ...commonHeaders];

  let blackDrumValues: any[] = [];
  let blueMarlinValues: any[] = [];

  const setCurrent = (name: string) => {
    setCurrentlyFishing(name);
    console.log(`selected`, selected);
    selected = name;
  };

  const getValues = (name: string): any[] => {
    // ["Level", "Income/day", "Effect", "Xp/day", "Xp left", "Max Level"]
    const fish: Fishing = data_value.fishingData.get(name);

    return [
      fish.level,
      fish.income,
      fish.levelMultiplier + fish.baseData.description,
      fish.xpGain,
      fish.xpLeft,
      fish.maxLevel,
    ];
  };

  const findWidth = (name: string): number => {
    const fish: Fishing = data_value.fishingData.get(name);
    return (fish.xpLeft / fish.maxXp) * 100;
  };
</script>

<div class="bg-gray-white w-full h-full">
  <p class="p-10 bg-blue-500 text-white text-xl font-bold w-full">
    Gone Fishing!
  </p>
  <ProgressTable headers={oceanHeaders}>
    <tr
      class="cursor-pointer"
      class:bg-blue-200={selected === "Black Drum"}
      on:click={() => setCurrent("Black Drum")}
    >
      <XpBar name={"Black Drum"} width={findWidth("Black Drum")} />
      {#each getValues("Black Drum") as value, idx}
        <td>{value}</td>
      {/each}
    </tr>
    <tr
      class="cursor-pointer"
      class:bg-blue-200={selected === "Blue Marlin"}
      on:click={() => setCurrent("Blue Marlin")}
    >
      <XpBar name={"Blue Marlin"} width={findWidth("Blue Marlin")} />
      {#each getValues("Blue Marlin") as value}
        <td>{value}</td>
      {/each}
    </tr>
  </ProgressTable>
</div>
