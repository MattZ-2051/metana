<script>
	import { user, walletLoginFx } from '$lib/store';
	import Button from './Button.svelte';
</script>

<nav
	class="relative flex w-full flex-wrap items-center justify-between bg-neutral-900 px-8 py-4 text-neutral-200 shadow-lg lg:flex-wrap lg:justify-start"
	data-te-navbar-ref
>
	<div class="flex w-full flex-wrap items-center justify-between">
		{#if $user && $user.ethAddress}
			{$user.ethAddress}
		{/if}
		<Button title="Connect Wallet" onClick={walletLoginFx} />
	</div>
</nav>
