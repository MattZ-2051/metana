export const myNftAbi = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_from',
				type: 'address'
			},
			{
				internalType: 'uint256',
				name: '_id',
				type: 'uint256'
			},
			{
				internalType: 'uint256',
				name: '_amount',
				type: 'uint256'
			}
		],
		name: 'burn',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_tokenId',
				type: 'uint256'
			}
		],
		name: 'forge',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_to',
				type: 'address'
			},
			{
				internalType: 'uint256',
				name: '_id',
				type: 'uint256'
			},
			{
				internalType: 'uint256',
				name: '_amount',
				type: 'uint256'
			}
		],
		name: 'mintTo',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [],
		stateMutability: 'nonpayable',
		type: 'constructor'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address'
			}
		],
		name: 'addressToMintTime',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address'
			},
			{
				internalType: 'uint256',
				name: 'id',
				type: 'uint256'
			}
		],
		name: 'balanceOf',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'myToken',
		outputs: [
			{
				internalType: 'contract MyToken',
				name: '',
				type: 'address'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		name: 'tokenIds',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		stateMutability: 'view',
		type: 'function'
	}
];
