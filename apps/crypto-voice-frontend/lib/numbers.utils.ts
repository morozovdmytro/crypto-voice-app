export const formatTokenAmount = (value: bigint | string, decimals: number = 18): string => {
    const amount = typeof value === 'string' ? BigInt(value) : value;
    const divisor = BigInt(10) ** BigInt(decimals);
    const integerPart = amount / divisor;
    const fractionalPart = amount % divisor;
    let fractionalStr = fractionalPart.toString().padStart(decimals, '0');

    fractionalStr = fractionalStr.replace(/0+$/, '');
    if (fractionalStr === '') {
        return integerPart.toString();
    }
    return `${integerPart.toString()}.${fractionalStr}`;
}