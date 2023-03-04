<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import { mintTokenFx, user, walletLoginFx } from '$lib/store';
	import { getTokenUri } from '$lib/ethers';

	$: tokenBalance = $user && $user.balance;
	$: userTxPending = $user?.txPending;
	$: $user?.nftBalance && getTokenInfo();
	let uris: string[] | undefined = undefined;
	let ownedTokens: string[] = [];
	const getTokenInfo = async () => {
		if ($user?.nftBalance) {
			const uriArr: string[] = [];
			for (const key in $user.nftBalance) {
				if ($user.nftBalance[key] > 0) {
					ownedTokens.push(key);
					await getTokenUri(parseInt(key, 10)).then((res) => uriArr.push(res));
				}
			}
		}
	};
</script>

<div class="h-[80vh] w-full flex justify-center items-center">
	<div
		class="flex flex-col bg-white p-8 rounded-lg h-96 w-[600px] items-center justify-center text-black"
	>
		{#if !$user}
			<p class="text-3xl text-center mb-4">Connect Wallet to view balance and mint nfts</p>
			<Button title="Connect Wallet" onClick={walletLoginFx} />
		{/if}
		{#if tokenBalance}
			<div class="flex text-3xl items-center">
				<p>Balance:</p>
				<p class="ml-4">{parseInt(tokenBalance, 10).toFixed(2)} Matic</p>
			</div>
			<div class="mt-8 flex flex-col">
				<p class="text-2xl text-center mb-4">Mint Tokens Id's 0, 1 or 2</p>
				<div class="flex">
					<div class="mr-8">
						<Input label="Token ID" type="number" />
					</div>
					<Button
						title="Mint Token"
						onClick={() =>
							mintTokenFx({ address: $user ? $user.ethAddress : '', tokenId: 1, amount: 1 })}
						loading={userTxPending}
					/>
				</div>
			</div>
			{#if $user?.nftBalance && ownedTokens}
				<div class="mt-8 flex flex-col items-center justify-center text-center">
					<p class="text-3xl text-center pb-4">My Tokens</p>
					<ul>
						<li class="text-xl">{ownedTokens.map((token) => 'Token ID - ' + token)}</li>
					</ul>
				</div>
			{/if}
		{/if}
	</div>
</div>
