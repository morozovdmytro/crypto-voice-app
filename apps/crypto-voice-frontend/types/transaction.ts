export interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface TokenDropData {
  currency: string;
  pricePerToken: string;
  quantity: string;
  quantityLimitPerWallet: string;
  tokenAddress: string;
}

export interface TokenTransferData {
  contractAddress: string;
  from: string;
  to: string;
  amount: string;
  tokenName?: string;
  decimals?: number;
}
