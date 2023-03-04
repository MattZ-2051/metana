<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { burnTokenFx, forgeTokenFx, mintTokenFx, user, walletLoginFx } from '$lib/store';
	import Swal from 'sweetalert2';

	$: tokenBalance = $user && $user.balance;
	$: userTxPending = $user?.txPending;
	$: tokenIdToMint = 0;
	$: tokenIdToBurn = 0;
	$: tokenIdToForge = 3;
	$: ownedTokens = [] as { id: number; amount: any }[];
	$: if ($user?.nftBalance && $user) {
		for (let key in $user.nftBalance) {
			if ($user.nftBalance[key].amount > 0 && $user.nftBalance) {
				if (!!ownedTokens.find((token) => token.id === $user.nftBalance[key].id)) {
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
	}

	const handleMint = () => {
		if (tokenIdToMint <= 2 && tokenIdToMint >= 0) {
			mintTokenFx({ address: $user ? $user.ethAddress : '', tokenId: tokenIdToMint, amount: 1 });
		} else {
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: 'Token ID must be between 0 and 2'
			});
		}
	};

	const handleBurn = () => {
		burnTokenFx({ address: $user ? $user.ethAddress : '', tokenId: tokenIdToBurn, amount: 1 });
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
					<p class="text-2xl text-center mb-4">Burn Token</p>
					<div class="flex">
						<div class="mr-8">
							<input
								type="number"
								class="peer block min-h-[auto] w-32 rounded border border-black bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none  text-black [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
								id="input"
								bind:value={tokenIdToBurn}
								max={6}
								min={0}
							/>
						</div>
						<Button title="Burn Token" onClick={handleBurn} />
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
								{#each ownedTokens as token}
									<p>{`ID - ${token.id} Amount - ${token.amount}`}</p>
								{/each}
							</li>
						</ul>
					</div>
				{/if}
			{/if}
		{/if}
	</div>
</div>
