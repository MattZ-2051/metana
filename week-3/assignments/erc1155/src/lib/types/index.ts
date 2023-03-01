import type { BigNumber } from 'ethers';

export type User = {
	ethAddress: string;
	provider: any;
	balance: string;
	txPending: boolean;
};
