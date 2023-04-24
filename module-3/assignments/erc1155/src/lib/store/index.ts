import {
	tradeToken,
	connectWallet,
	forgeToken,
	getTokenBalance,
	getTxStatus,
	mintToken,
	getMintTime
} from '$lib/ethers';
import type { User } from '$lib/types';
import { createEffect, createEvent, createStore } from 'effector';
import { ethers, type BigNumber } from 'ethers';
import Swal from 'sweetalert2';

const walletLogin = createEvent<User>();

const updateTxPending = createEvent<boolean>();
const updateUserTokens = createEvent<Record<string, { id: number; amount: any }>>();

export const walletLoginFx = createEffect<void, User>(async () => {
	const res = await connectWallet();
	if (res) {
		return res;
	} else {
		throw new Error('Error connecting to metamask');
	}
});

export const tradeTokenFx = createEffect<
	{
		tokenToTrade: number;
		tokenToReceive: number;
	},
	{ hash: string }
>(async ({ tokenToTrade, tokenToReceive }) => {
	return await tradeToken({ tokenToTrade, tokenToReceive });
});

export const mintTokenFx = createEffect<{ tokenId: number }, { hash: string }>(
	async ({ tokenId }) => {
		return await mintToken({ tokenId });
	}
);

export const forgeTokenFx = createEffect<{ tokenId: number }, { hash: string }>(
	async ({ tokenId }) => {
		return await forgeToken(tokenId);
	}
);

const getTxStatusFx = createEffect<{ hash: string }, any>(async ({ hash }) => {
	return await getTxStatus(hash);
});

export const getTokenBalanceFx = createEffect<{ address: string }, any>(async ({ address }) => {
	const tokenIds = [0, 1, 2, 3, 4, 5, 6];
	return Promise.all([...tokenIds.map((id) => getTokenBalance(address, id))]);
});

export const getMintTimeFx = createEffect<void, BigNumber>(async () => {
	return await getMintTime();
});

getTokenBalanceFx.doneData.watch((res) => {
	const tokenMap: Record<string, { id: number; amount: any }> = {};

	for (let i = 0; i < res.length; i++) {
		if (res[i] > 0) {
			tokenMap[i.toString()] = { id: i, amount: res[i] };
		}
	}
	updateUserTokens(tokenMap);
});

tradeTokenFx.doneData.watch((res) => {
	getTxStatusFx({ hash: res.hash as string });
	Swal.fire({
		icon: 'success',
		title: 'Success',
		text: 'Burn transaction sent'
	});
});

tradeTokenFx.failData.watch((error) => {
	let errorMessage = 'Error trading token';
	if (error?.error?.message.includes('exceeds balance')) {
		errorMessage = "You don't own necessary tokens to trade";
	}
	if (error?.error?.message) {
		errorMessage = error.error.message;
	}

	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: errorMessage
	});
});

forgeTokenFx.doneData.watch((res) => {
	getTxStatusFx({ hash: res.hash as string });
	Swal.fire({
		icon: 'success',
		title: 'Success',
		text: 'Forging in progress'
	});
});

forgeTokenFx.failData.watch((error) => {
	let message = error?.error?.message as string;
	if (message.includes('burn amount')) {
		message = 'You dont own necessary tokens to forge this token';
	}
	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: message
	});
});

mintTokenFx.doneData.watch((res) => {
	getTxStatusFx({ hash: res.hash as string });
	Swal.fire({
		icon: 'success',
		title: 'Success',
		text: 'Mint transaction sent'
	});
});

getTxStatusFx.doneData.watch((res) => {
	updateTxPending(false);
	getTokenBalanceFx({ address: res.from });
});

getTxStatusFx.failData.watch(() => {
	updateTxPending(false);
	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: 'Error minting'
	});
});

getTxStatusFx.pending.watch((res) => {
	updateTxPending(res);
});

mintTokenFx.failData.watch((error) => {
	const message = (error?.error?.message as string) || 'Error Minting';
	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: message
	});
});

walletLoginFx.doneData.watch((res) => {
	walletLogin(res);
	getTokenBalanceFx({ address: res.ethAddress });
	Swal.fire({
		icon: 'success',
		title: 'Success',
		text: 'Metamask Logged In'
	});
});

walletLoginFx.failData.watch((error) => {
	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: error.message as unknown as string
	});
});

export const user = createStore<User | null>(null)
	.on(walletLogin, (prevState, payload) => payload)
	.on(updateTxPending, (prevState, payload) => {
		if (prevState) {
			return { ...prevState, txPending: payload };
		}
	})
	.on(updateUserTokens, (prevState, payload) => {
		if (prevState) {
			return { ...prevState, nftBalance: payload };
		}
	});
