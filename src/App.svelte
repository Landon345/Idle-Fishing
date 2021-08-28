<script lang="ts">
	import Achievements from "src/tabs/Achievements.svelte";
	import GoneFishing from "src/tabs/GoneFishing.svelte";
	import Shop from "src/tabs/Shop.svelte";
	import Skills from "src/tabs/Skills.svelte";
	import Settings from "src/tabs/Settings.svelte";

	import {calculatedAge, loadGameData, saveGameData, update} from "./functions";
	import {GameData} from "./gameData";
	

	type Tab = "goneFishing" | "skills" | "shop" | "achievements" | "settings";
	let selectedTab: Tab = "goneFishing";
	let gameData = GameData;

	const selectTab = (selected: Tab) => {
		selectedTab = selected;
	}

	loadGameData();
	
	const masterInterval = window.setInterval(() => {
		gameData = GameData;
		update()
	}, 1000)
	const saveInterval = window.setInterval(() => {
		saveGameData();
	}, 3000)
</script>

<main>
	<h1 class="text-6xl">Idle Fishing</h1>
	<div class="flex flex-row">
		<div class="flex flex-col w-1/3">
			<div class="m-3 flex">
				<p class="text-lg">{calculatedAge(gameData.day)}</p>
			</div>
			<div class="m-3 flex flex-col">

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
				<div class="flex flex-row justify-between w-2/3">
					<button on:click={() => selectTab("skills")}>Skills</button>
					<button on:click={() => selectTab("goneFishing")}>Gone Fishing</button>
					<button on:click={() => selectTab("achievements")}>Achievements</button>
					<button on:click={() => selectTab("shop")}>Shop</button>
				</div>
				<div class="flex justify-end w-1/3" >
					<button on:click={() => selectTab("settings")}>Settings</button>	
				</div>
			</div>

			<div class="flex flex-col">
				{#if selectedTab == "skills"}
					<Skills gameData={{...gameData}}/>
				{:else if selectedTab == "goneFishing"}
					<GoneFishing gameData={{...gameData}}/>
				{:else if selectedTab == "achievements"}
					<Achievements gameData={{...gameData}}/>
				{:else if selectedTab == "shop"}
					<Shop gameData={{...gameData}}/>
				{:else}
					<Settings gameData={{...gameData}}/>
				{/if}
			</div>
			
		</div>


	</div>
</main>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

</style>