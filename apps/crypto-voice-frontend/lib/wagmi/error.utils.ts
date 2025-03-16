import {
    ContractFunctionExecutionError,
    TransactionExecutionError,
    WaitForTransactionReceiptErrorType,
    WriteContractErrorType,
  } from 'viem';
  import { BaseError } from 'wagmi';
  
  export type WagmiError = BaseError & {
    reason?: string;
    data?: { errorName: string };
  };
  
  export const parseWagmiError = (
    error: unknown,
    defaultError = "Something wen't wrong. Please try again.",
  ): string => {
    if (!error) return defaultError;
    if (error instanceof TransactionExecutionError) {
      return error.shortMessage;
    }
    if (error instanceof ContractFunctionExecutionError) {
      const wagmiError = error.cause as WagmiError;
      if (!wagmiError) {
        return error.shortMessage;
      }
      let reason = wagmiError?.reason ?? wagmiError?.data?.errorName;
  
      switch (reason) {
        case '!PriceOrCurrency':
        case 'MetaUSD__InvalidPricePerToken':
        case 'MetaUSD__CurrencyNotWhitelisted':
          return 'You are trying to purchase with an invalid price or currency.';
        case '!Qty':
        case 'MetaUSD__InvalidQuantity':
          return 'You are trying to purchase with an invalid quantity.';
        case '!MaxSupply':
          return 'You are trying to purchase more than the maximum supply.';
        case 'cant claim yet':
        case '!CONDITION':
          return 'Sale is not active yet. Try again later';
        case 'MetaUSD__InvalidReceiver':
          return 'Invalid receiver';
        default:
          return error.shortMessage;
      }
    }
    if (error instanceof Error || isWagmiErrorType(error)) {
      return error.message;
    }
    return defaultError;
  };
  
  function isWagmiErrorType(
    error: any,
  ): error is WaitForTransactionReceiptErrorType | WriteContractErrorType {
    return 'message' in error;
  }
  