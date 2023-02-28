import { ethers } from 'ethers';

let provider: ethers.providers.Web3Provider;

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page

export const connectWallet = async () => {
	if (typeof window?.ethereum !== 'undefined') {
		window.ethereum.enable();
		provider = new ethers.providers.Web3Provider(window?.ethereum, 'any');
		return await provider.send('eth_requestAccounts', []);
	}
};
