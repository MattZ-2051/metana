<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import { getTokenBalanceFx, mintTokenFx, user, walletLoginFx } from '$lib/store';
	import { getTokenUri, getTokenUriInfo } from '$lib/ethers';

	$: tokenBalance = $user && $user.balance;
	$: userTxPending = $user?.txPending;
	$: $user?.nftBalance && getTokenInfo();
	let uris: string[] | undefined = undefined;
	$: uris && uris?.length > 0 && getTokenUriInfo(uris[0]);
	const getTokenInfo = async () => {
		if ($user?.nftBalance) {
			const uriArr: string[] = [];
			for (const key in $user.nftBalance) {
				if ($user.nftBalance[key] > 0) {
					await getTokenUri(parseInt(key, 10)).then((res) => uriArr.push(res));
				}
			}
			uris = uriArr;
		}
	};
</script>

<div class="h-[80vh] w-full flex justify-center items-center">
	<div class="flex flex-col bg-white p-8 rounded-lg h-96 w-[600px] justify-center text-black">
		{#if !$user}
			<p class="text-3xl text-center mb-4">Connect Wallet to view balance and mint nfts</p>
			<Button title="Connect Wallet" onClick={walletLoginFx} />
		{/if}
		{#if tokenBalance}
			<div class="flex text-3xl items-center">
				<p>Balance:</p>
				<p class="ml-4">{parseInt(tokenBalance, 10).toFixed(2)} Matic</p>
			</div>
			<div class="mt-4 flex">
				<Button
					title="Mint Token"
					onClick={() =>
						mintTokenFx({ address: $user ? $user.ethAddress : '', tokenId: 1, amount: 1 })}
					loading={userTxPending}
				/>
				<Input label="Token ID" type="number" />
			</div>
			<div class="mt-4">
				<p class="text-3xl">My Tokens:</p>
			</div>
		{/if}
	</div>
</div>
