import { connectWallet, getTxStatus, mintToken } from '$lib/ethers';
import type { User } from '$lib/types';
import { createEffect, createEvent, createStore } from 'effector';
import Swal from 'sweetalert2';

const walletLogin = createEvent<User>();

const updateTxPending = createEvent<boolean>();

export const walletLoginFx = createEffect<void, User>(async () => {
	const res = await connectWallet();
	if (res) {
		return res;
	} else {
		throw new Error('Error connecting to metamask');
	}
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

mintTokenFx.doneData.watch((res) => {
	getTxStatusFx({ hash: res.hash as string });
});

getTxStatusFx.doneData.watch((res) => {
	updateTxPending(false);
	console.log('tx status res', res);
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
	});
