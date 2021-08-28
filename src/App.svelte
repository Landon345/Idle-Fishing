<script lang="ts">
	import FishingBar from "./FishingBar.svelte";
	import { GameData } from "./gameData";
	import {calculatedAge, update} from "./functions";
	type Tab = "goneFishing" | "skills" | "shop" | "settings";
	let tab: Tab = "goneFishing";
	let selectedFish = "blackDrum";

	

	const selectTab = (selected: Tab) => {
		tab = selected;
	}
	const selectFish = (selected) => {
		selectedFish = selected;
	}
	let unlockedFish = [{type: "Black Drum", amount: 0, level: 0, effect: 1.00, xpPerDay: 1, xpLeft: 50, maxLevel: 0, xpNeeded: 50 },
						{type: "Blue Marlin", amount: 0, level: 0, effect: 1.00, xpPerDay: 1, xpLeft: 50, maxLevel: 0, xpNeeded: 50 }
					   ];

	const updateFishingBar = () => {
		unlockedFish.forEach((unlocked, index) => {
			if(unlocked.xpLeft <= 0){
				unlockedFish[index].level += 1;
				unlockedFish[index].xpLeft = unlockedFish[index].level * 100;
				unlockedFish[index].xpNeeded = unlockedFish[index].level * 100; 
			}
		})
		switch (selectedFish) {
			case "Black Drum": unlockedFish[0].xpLeft -= unlockedFish[0].xpPerDay;
			break;
			case "Blue Marlin": unlockedFish[1].xpLeft -= unlockedFish[1].xpPerDay; 
			break;
			default:unlockedFish[0].xpLeft -= unlockedFish[0].xpPerDay;
			break; 
		}
	}

	const masterInterval = window.setInterval(() => {
		update()
	}, 100)
</script>

<main>
	<h1 class="text-6xl">Idle Fishing</h1>
	<div class="flex flex-row">
		<div class="flex flex-col w-1/3">
			<div class="m-3 flex">
				<p class="text-lg">{calculatedAge(GameData.day)}</p>
			</div>
			<div class="m-3 flex flex-col">

				<p class="text-lg">Fish</p>
				{#each unlockedFish as {type, amount}, i (i)}
				<p class="text-lg">{type}: {amount}</p>
				{/each}
			</div>
			<div class="m-3 flex flex-col">
				<p class="text-lg">Coins</p>
				<span class="flex">
					<p class="text-lg text-yellow-400">{0}g</p>
					<p class="text-lg text-gray-400">{0}s</p>
					<p class="text-lg text-yellow-800">{0}c</p>
				</span>
			</div>
				
		</div>

		<div class="flex flex-col mr-5 w-1/2">

			<div class="flex flex-row bg-gray-800 text-white">
				<div class="flex flex-row justify-between">
					<div on:click={() => selectTab("skills")}>Skills</div>
					<div on:click={() => selectTab("goneFishing")}>Gone Fishing</div>
					<div on:click={() => selectTab("shop")}>Shop</div>
				</div>
				<div class="flex justify-end" on:click={() => selectTab("settings")}>Settings</div>
			</div>

			<div class="flex flex-col">
				<!-- fishing bars -->
				<div class="flex flex-col">

					{#each unlockedFish as {type, level, effect, xpPerDay, xpLeft, maxLevel, xpNeeded}}
						<FishingBar type={type} level={level} effect={effect} xpPerDay={xpPerDay} xpLeft={xpLeft} xpNeeded={xpNeeded} maxLevel={maxLevel} selectFish={() => selectFish(type)} selectedFish={selectedFish}/>
					{/each}
				</div>
				<!-- requirements -->
			</div>
			
		</div>


	</div>
</main>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

</style>