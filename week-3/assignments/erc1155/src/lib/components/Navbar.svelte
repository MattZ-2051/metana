<script>
	import { user, walletLoginFx } from '$lib/store';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';

	onMount(() => {
		walletLoginFx();
	});
</script>

<nav
	class="relative flex w-full flex-wrap items-center justify-between bg-neutral-900 px-8 py-4 text-neutral-200 shadow-lg lg:flex-wrap lg:justify-start"
	data-te-navbar-ref
>
	<div class="flex w-full flex-wrap items-center justify-end">
		{#if $user && $user.ethAddress}
			<p class="pr-4">
				My Address:
				{$user.ethAddress}
			</p>
			<a
				href="https://testnets.opensea.io/collection/unidentified-contract-6841"
				class="text-white mr-4 underline">Link to Contract on Opensea</a
			>
		{:else}
			<Button title="Connect Wallet" onClick={walletLoginFx} />
		{/if}
	</div>
</nav>
