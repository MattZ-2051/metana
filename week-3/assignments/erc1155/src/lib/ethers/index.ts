import type { User } from '$lib/types';
import { BigNumber, ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { myNftAbi } from '../../contracts/abi';

let provider: ethers.providers.Web3Provider;

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page

export const connectWallet = async (): Promise<User | null> => {
	if (typeof window.ethereum !== 'undefined') {
		provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
		const mmProvider = await detectEthereumProvider();
		const network = await provider.getNetwork();
		if (network.name !== 'maticmum') {
			// TODO: fix when alchemy fixes nodes
			// try {
			// 	await window.ethereum.request({
			// 		method: 'wallet_addEthereumChain',
			// 		params: [
			// 			{
			// 				chainId: '0x80001',
			// 				chainName: 'maticmum',
			// 				rpcUrls: ['https://endpoints.omniatech.io/v1/matic/mumbai/public'],
			// 				nativeCurrency: {
			// 					symbol: 'MATIC',
			// 					decimals: 18,
			// 					name: 'matic'
			// 				}
			// 			}
			// 		]
			// 	});
			// } catch {
			// 	throw new Error('connect to mumbai polygon network');
			// }
			throw new Error('connect to mumbai polygon network');
		}
		const ethAddress = await provider.send('eth_requestAccounts', []);
		if (mmProvider) {
			mmProvider.on('accountsChanged', () => {
				window.location.reload();
			});
		}
		provider.on('network', (newNetwork, oldNetwork) => {
			// When a Provider makes its initial connection, it emits a "network"
			// event with a null oldNetwork along with the newNetwork. So, if the
			// oldNetwork exists, it represents a changing network
			if (oldNetwork) {
				window.location.reload();
			}
		});

		const balance = await getBalance();
		return {
			ethAddress: ethAddress[0],
			provider,
			balance: ethers.utils.formatEther(balance),
			txPending: false
		};
	} else {
		return null;
	}
};

export const mintToken = async ({
	tokenId,
	address,
	amount
}: {
	tokenId: number;
	address: string;
	amount: number;
}) => {
	const signer = provider.getSigner();
	const contract = new ethers.Contract(
		'0x691729fEC623F3A5A5e0359F5fFCe5e4CFa7A42A',
		myNftAbi,
		signer
	);

	return await contract.mintTo(address, tokenId, amount);
};

export const getBalance = async (): Promise<BigNumber> => {
	const signer = provider.getSigner();
	return await signer.getBalance();
};

export const getTxStatus = async (tx: string) => {
	return await provider.waitForTransaction(tx);
};
