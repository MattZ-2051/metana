import {
	burnToken,
	connectWallet,
	forgeToken,
	getTokenBalance,
	getTxStatus,
	mintToken
} from '$lib/ethers';
import type { User } from '$lib/types';
import { createEffect, createEvent, createStore } from 'effector';
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

getTokenBalanceFx.doneData.watch((res) => {
	const tokenMap: Record<string, { id: number; amount: any }> = {};

	for (let i = 0; i < res.length; i++) {
		if (res[i] > 0) {
			tokenMap[i.toString()] = { id: i, amount: res[i] };
		}
	}
	updateUserTokens(tokenMap);
});

burnTokenFx.doneData.watch((res) => {
	getTxStatusFx({ hash: res.hash as string });
	Swal.fire({
		icon: 'success',
		title: 'Success',
		text: 'Burn transaction sent'
	});
});

burnTokenFx.failData.watch((res) => {
	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: 'Error burning'
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

mintTokenFx.doneData.watch((res) => {
	getTxStatusFx({ hash: res.hash as string });
	Swal.fire({
		icon: 'success',
		title: 'Success',
		text: 'Mint transaction sent'
	});
});

getTxStatusFx.doneData.watch(() => {
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

mintTokenFx.failData.watch((error) => {
	const message = error?.error?.message as string;
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
