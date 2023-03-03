import { burnToken, connectWallet, getTokenBalance, getTxStatus, mintToken } from '$lib/ethers';
import type { User } from '$lib/types';
import { createEffect, createEvent, createStore } from 'effector';
import Swal from 'sweetalert2';

const walletLogin = createEvent<User>();

const updateTxPending = createEvent<boolean>();
const updateUserTokens = createEvent<Record<string, number>>();

export const walletLoginFx = createEffect<void, User>(async () => {
	const res = await connectWallet();
	if (res) {
		return res;
	} else {
		throw new Error('Error connecting to metamask');
	}
});

export const burnTokenFx = createEffect<
	{ address: string; tokenId: number; amount: number },
	{ hash: string }
>(async ({ address, tokenId, amount }) => {
	return await burnToken({ address, tokenId, amount });
});

export const mintTokenFx = createEffect<
	{ address: string; tokenId: number; amount: number },
	{ hash: string }
>(async ({ address, tokenId, amount }) => {
	return await mintToken({ address, tokenId, amount });
});

const getTxStatusFx = createEffect<{ hash: string }, any>(async ({ hash }) => {
	return await getTxStatus(hash);
});

export const getTokenBalanceFx = createEffect<{ address: string }, any>(async ({ address }) => {
	const tokenIds = [1, 2, 3, 4, 5, 6];
	return Promise.all([...tokenIds.map((id) => getTokenBalance(address, id))]);
});

getTokenBalanceFx.doneData.watch((res) => {
	const tokenMap: Record<string, number> = {};
	for (let i = 0; i < res.length; i++) {
		if (res[i] > 0) {
			tokenMap[(i + 1).toString()] = res[i];
		}
	}
	console.log('token', tokenMap);
	updateUserTokens(tokenMap);
});

burnTokenFx.doneData.watch((res) => {
	getTxStatusFx({ hash: res.hash as string });
});

burnTokenFx.failData.watch((res) => {
	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: 'Error burning'
	});
});

mintTokenFx.doneData.watch((res) => {
	getTxStatusFx({ hash: res.hash as string });
});

getTxStatusFx.doneData.watch((res) => {
	updateTxPending(false);
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

mintTokenFx.failData.watch(() => {
	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: 'Error minting'
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
		text: error as unknown as string
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
