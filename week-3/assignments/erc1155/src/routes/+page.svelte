<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { forgeTokenFx, mintTokenFx, tradeTokenFx, user, walletLoginFx } from '$lib/store';
	import Swal from 'sweetalert2';

	$: tokenBalance = $user && $user.balance;
	$: userTxPending = $user?.txPending;
	$: tokenIdToMint = 0;
	$: tokenIdToForge = 3;
	$: tokenIdToTrade = 0;
	$: tokenIdToReceive = 0;
	$: ownedTokens = [] as { id: number; amount: any }[];
	$: if ($user?.nftBalance && $user) {
		for (const key in $user.nftBalance) {
			if ($user.nftBalance[key].amount > 0 && $user.nftBalance) {
				if (!!ownedTokens.find((token) => token.id === $user?.nftBalance?.[key].id)) {
					const token = ownedTokens.find((token) =>
						$user?.nftBalance ? token.id === $user.nftBalance[key].id : false
					);
					if (token) {
						token.amount = $user.nftBalance[key].amount;
					}
				} else {
					ownedTokens.push($user.nftBalance[key]);
				}
			}
		}
		ownedTokens = ownedTokens;
	}

	const handleMint = () => {
		if (tokenIdToMint <= 2 && tokenIdToMint >= 0) {
			mintTokenFx({ tokenId: tokenIdToMint });
		} else {
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: 'Token ID must be between 0 and 2'
			});
		}
	};

	const handleTrade = () => {
		tradeTokenFx({ tokenToTrade: tokenIdToTrade, tokenToReceive: tokenIdToReceive });
	};
</script>

<div class="h-[80vh] w-full flex justify-center items-center">
	<div
		class="flex flex-col bg-white p-8 rounded-lg h-full w-[600px] items-center justify-center text-black"
	>
		{#if !$user}
			<p class="text-3xl text-center mb-4">Connect Wallet to view balance and mint nfts</p>
			<Button title="Connect Wallet" onClick={walletLoginFx} />
		{/if}
		{#if tokenBalance}
			{#if userTxPending}
				<Spinner styles="h-24 w-24" />
				<p class="text-4xl text-center mt-8">Tx Pending...</p>
			{:else}
				<div class="flex text-3xl items-center">
					<p>Balance:</p>
					<p class="ml-4">{parseFloat(tokenBalance).toFixed(4)} Matic</p>
				</div>
				<div class="mt-8 flex flex-col">
					<p class="text-2xl text-center mb-4">Mint Tokens Ids 0 - 2</p>
					<div class="flex">
						<div class="mr-8">
							<input
								type="number"
								class="peer block min-h-[auto] w-32 rounded border border-black bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none  text-black [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
								id="input"
								bind:value={tokenIdToMint}
								max={2}
								min={0}
							/>
						</div>
						<Button title="Mint Token" onClick={handleMint} />
					</div>
				</div>
				<div class="mt-8 flex flex-col">
					<p class="text-2xl text-center mb-4">Trade Token</p>
					<div class="flex items-center">
						<div class="">
							<input
								type="number"
								class="peer block min-h-[auto] w-32 rounded border border-black bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none  text-black [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
								id="input"
								bind:value={tokenIdToTrade}
								max={6}
								min={0}
							/>
						</div>
						<p class="text-xl text-center px-4">For</p>
						<div class="mr-8">
							<input
								type="number"
								class="peer block min-h-[auto] w-32 rounded border border-black bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none  text-black [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
								id="input"
								bind:value={tokenIdToReceive}
								max={2}
								min={0}
							/>
						</div>
						<Button title="Trade Token" onClick={handleTrade} />
					</div>
				</div>
				<div class="mt-8 flex flex-col">
					<p class="text-2xl text-center mb-4">Forge Token 3 - 6</p>
					<div class="flex">
						<div class="mr-8">
							<input
								type="number"
								class="peer block min-h-[auto] w-32 rounded border border-black bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none  text-black [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
								id="input"
								bind:value={tokenIdToForge}
								max={6}
								min={3}
							/>
						</div>
						<Button title="Forge Token" onClick={() => forgeTokenFx({ tokenId: tokenIdToForge })} />
					</div>
				</div>
				{#if $user?.nftBalance && ownedTokens}
					<div class="mt-8 flex flex-col items-center justify-center text-center ">
						<p class="text-2xl text-center pb-4">My Tokens</p>
						<ul class="max-h-32 overflow-auto px-8">
							<li class="text-xl">
								{#key ownedTokens}
									{#each ownedTokens as token}
										<p>{`ID - ${token.id} Amount - ${token.amount}`}</p>
									{/each}
								{/key}
							</li>
						</ul>
					</div>
				{/if}
			{/if}
		{/if}
	</div>
</div>
