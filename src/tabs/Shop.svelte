<script lang="ts">
  import type { GameDataType } from "src/Entities";
  import ProgressTable from "src/components/ProgressTable.svelte";
  import type { Boat, Item } from "src/classes";
  import { GameData } from "src/gameData";
  import Coins from "src/components/Coins.svelte";
  import { getRequiredString, needRequirements } from "src/functions";
  import BoatBars from "src/components/BoatBars.svelte";
  import ItemBars from "src/components/ItemBars.svelte";

  let data_value: GameDataType;

  GameData.subscribe((data) => {
    data_value = data;
  });

  const getBoats = (boatData: Map<string, Boat>): Boat[] => {
    let boatArr: Boat[] = [];
    boatData.forEach((boat) => {
      boatArr.push(boat);
    });
    return boatArr;
  };
  const getItems = (itemData: Map<string, Item>): Item[] => {
    let itemArr: Item[] = [];
    itemData.forEach((item) => {
      itemArr.push(item);
    });
    return itemArr;
  };
</script>

<div class="bg-gray-white w-full h-full">
  <p class="p-10 bg-red-700 text-white text-xl font-bold w-full">Shop!</p>
  <ProgressTable headers={["Boats", "Price"]}>
    <BoatBars boats={getBoats(data_value.boatData)} />
  </ProgressTable>
  <ProgressTable
    headers={["Item", "Upgrade", "Effect", "Level", "Expense/Day"]}
  >
    <ItemBars items={getItems(data_value.itemData)} />
  </ProgressTable>
</div>
