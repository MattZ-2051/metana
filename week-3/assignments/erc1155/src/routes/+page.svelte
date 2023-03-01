<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { getTokenBalanceFx, mintTokenFx, user } from '$lib/store';

	$: tokenBalance = $user && $user.balance;
	$: userTxPending = $user?.txPending;
</script>

<div class="h-screen w-screen flex justify-center items-center">
	{#if userTxPending}
		<p class="text-white text-6xl">Loading...</p>
	{/if}
	{#if tokenBalance}
		<div class="flex flex-col bg-white p-8 rounded-lg h-96 w-96 text-black">
			<div class="flex">
				<p class="text-4xl">Balance:</p>
				<p class="text-4xl ml-4">{parseInt(tokenBalance, 10).toFixed(2)}</p>
			</div>
			<div class="mt-4">
				<Button
					title="Mint Token"
					onClick={() =>
						mintTokenFx({ address: $user ? $user.ethAddress : '', tokenId: 1, amount: 1 })}
					loading={userTxPending}
				/>
			</div>
			<div class="mt-4">
				<Button
					title="Check Token Balance"
					onClick={() => getTokenBalanceFx({ address: $user ? $user.ethAddress : '', tokenId: 1 })}
					loading={userTxPending}
				/>
			</div>
		</div>
	{/if}
</div>
