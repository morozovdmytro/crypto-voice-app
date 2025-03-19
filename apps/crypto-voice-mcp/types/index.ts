export interface Transaction {
    hash: string;
    from: string;
    to: string | null;
    value: string;
    blockNumber: bigint;
    timestamp: number | null;
    gasUsed: bigint | null;
    status: boolean | null;
    tokenName: string | null;
    tokenSymbol: string | null;
    tokenDecimal: string | null;
}

export const erc20Abi = [
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
    }
] as const;