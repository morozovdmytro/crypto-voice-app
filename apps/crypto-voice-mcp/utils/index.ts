import { Transaction } from "../types";

export const formatTransactionForDisplay = (tx: Transaction, owner: string, nativeCurrency: string): string => {
    const timestamp = tx.timestamp ? new Date(tx.timestamp * 1000).toISOString() : 'Unknown';
    const status = tx.status === true ? 'Success' : tx.status === false ? 'Failed' : 'Unknown';
    const valueInNativeCurrency = tx.tokenName && tx.tokenDecimal ? parseFloat(tx.value) / 10 ** parseInt(tx.tokenDecimal) : parseFloat(tx.value) / 1e18;

    return `
        - Type: ${tx.from === owner ? 'Outgoing' : 'Incoming'}
        Value: ${valueInNativeCurrency.toFixed(6)} ${nativeCurrency}
        Time: ${timestamp}
        Status: ${status}
    `;
}