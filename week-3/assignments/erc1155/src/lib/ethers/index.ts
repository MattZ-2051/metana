import { BigNumber, ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import type { User } from '$lib/types';
import { myNftAbi } from '../../contracts/abi';

let provider: ethers.providers.Web3Provider;

const contractAddress = '0x3E54A660BA7273C0aF4bE604549C8c47D7E22bD0';

export const connectWallet = async (): Promise<User | null> => {
	if (typeof window.ethereum !== 'undefined') {
		provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
		const mmProvider = await detectEthereumProvider();
		const network = await provider.getNetwork();
		if (network.name !== 'goerli') {
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
}): Promise<{ hash: string }> => {
	const signer = provider.getSigner();
	const contract = new ethers.Contract(contractAddress, myNftAbi, signer);

	return await contract.mintTo(address, tokenId, amount);
};

export const burnToken = async ({
	tokenId,
	address,
	amount
}: {
	tokenId: number;
	address: string;
	amount: number;
}): Promise<{ hash: string }> => {
	const signer = provider.getSigner();
	const contract = new ethers.Contract(contractAddress, myNftAbi, signer);

	return await contract.burn(address, tokenId, amount);
};
export const getBalance = async (): Promise<BigNumber> => {
	const signer = provider.getSigner();
	return await signer.getBalance();
};

export const getTokenBalance = async (address: string, tokenId: number): Promise<number> => {
	const signer = provider.getSigner();
	const contract = new ethers.Contract(contractAddress, myNftAbi, signer);
	const res = await contract.balanceOf(address, tokenId);
	return res.toNumber();
};
export const getTxStatus = async (tx: string) => {
	return await provider.waitForTransaction(tx);
};

export const forgeToken = async (tokenId: number): Promise<{ hash: string }> => {
	const signer = provider.getSigner();
	const contract = new ethers.Contract(contractAddress, myNftAbi, signer);
	return await contract.forge(tokenId);
};
