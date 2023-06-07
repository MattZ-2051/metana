<script lang="ts">
	import { ContractFactory, ethers } from 'ethers';
	import { onMount } from 'svelte';
	import { abi } from '../ethers/abi';
	import axios from 'axios';

	let provider;

	let account: { address: string } | null;
	let ownedNfts: string[];
	$: account = null;
	$: ownedNfts = [];

	onMount(async () => {
		provider = new ethers.providers.Web3Provider(window?.ethereum);
	});

	const axiosInstance = axios.create({
		baseURL: '',
		withCredentials: false,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET'
		}
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
	};

	const getImage = async (publicUrl: string) => {
		console.log('url', publicUrl);
		try {
			const res = await axiosInstance.get(publicUrl);
			console.log('res', res);
		} catch (error) {
			console.log('error', error);
		}
	};

	const getMyNfts = async () => {
		const contract = randomNftContract();
		const nftBalance = await contract.balanceOf(account?.address);
		const ownedNftIds = [];
		for (let i = 0; i < nftBalance.toNumber(); i++) {
			const tokenId = await contract.ownedTokens(account?.address, i);
			const tokenUri = await contract.tokenURI(tokenId);
			ownedNftIds.push(tokenUri);
		}
		console.log('nfts', ownedNftIds);
		console.log('data', await getImage(ownedNftIds[0]));
	};
</script>

<div class="w-full h-screen flex justify-center items-center">
	<div>
		{#if !account}
			<button on:click={connectAccount} class="btn variant-filled-primary"> Connect Account</button>
		{:else}
			<h1>Account</h1>
			<h3>{account.address}</h3>
			<button on:click={getMyNfts} class="btn variant-filled">Get NFTs</button>
		{/if}
	</div>
</div>
