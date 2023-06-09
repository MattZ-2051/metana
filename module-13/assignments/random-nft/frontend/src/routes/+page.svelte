<script lang="ts">
	import { ethers } from 'ethers';
	import { onMount } from 'svelte';
	import { abi } from '../ethers/abi';
	import axios from 'axios';

	let provider;
	let account: { address: string } | null;
	let ownedNfts: any[];
	$: account = null;
	$: ownedNfts = [];

	onMount(async () => {
		provider = new ethers.providers.Web3Provider(window?.ethereum);
		await connectAccount();
	});

	const randomNftContract = () => {
		const contract = new ethers.Contract(
			'0xDA7B2c7783c613E3a814B1186A5F71543cC1D6f9',
			abi,
			provider.getSigner()
		);
		return contract;
	};
	// MetaMask requires requesting permission to connect users accounts
	const connectAccount = async () => {
		await provider.send('eth_requestAccounts', []);
		const signer = await provider.getSigner();
		const address = await signer.getAddress();
		account = { address };
		const contract = randomNftContract();
		contract.connect(signer);
		getMyNfts();
	};

	const mintNft = async () => {
		const contract = randomNftContract();
		const res = await contract.requestNft({ value: ethers.utils.parseUnits('2', 'wei') });
		res.wait().then();
	};

	const formatTokenUri = (tokenUri: string): string => {
		const id = tokenUri.split('ipfs')[1];
		return tokenUri.includes('ipfs') ? `https://ipfs.io/ipfs${id}` : '';
	};
	const getIpfsData = async (publicUrl: string) => {
		try {
			const url = formatTokenUri(publicUrl);
			const res = await axios.get(url);
			return res.data;
		} catch (error) {}
	};

	const getMyNfts = async () => {
		const contract = randomNftContract();
		const nftBalance = await contract.balanceOf(account?.address);
		for (let i = 0; i < nftBalance.toNumber(); i++) {
			const tokenId = await contract.ownedTokens(account?.address, i);
			const tokenUri = await contract.tokenURI(tokenId);
			const data = await getIpfsData(tokenUri);
			data.image = formatTokenUri(data.image);
			ownedNfts.push(data);
			ownedNfts = ownedNfts;
		}
	};
</script>

<div class="w-full h-screen flex justify-center items-center">
	<div>
		{#if !account}
			<button on:click={connectAccount} class="btn variant-filled-primary"> Connect Account</button>
		{:else}
			<div class="mb-4">
				<h1>Account</h1>
				<h3>{account.address}</h3>
			</div>
			<div>
				<h3>MY NFTS</h3>
				<div class="mt-4 grid grid-cols-3 gap-x-2 gap-y-4">
					{#each ownedNfts as nft}
						<div class="card p-4 w-[200px] mx-4">
							<img src={nft.image} alt="" />
							<p class="text-base">{nft?.description}</p>
						</div>
					{/each}
				</div>
			</div>
			<div class="mt-12">
				<button class="btn variant-filled w-full" on:click={mintNft}>Mint Nft</button>
			</div>
		{/if}
	</div>
</div>
