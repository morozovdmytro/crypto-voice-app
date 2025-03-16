import { useEffect, useState } from "react";

export const useDisplayAddress = (address?: string | null) => {
    const [displayAddress, setDisplayAddress] = useState<string | null>(null);

    useEffect(() => {
        if (address) {
            const formattedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            setDisplayAddress(formattedAddress);
        } else {
            setDisplayAddress(null);
        }
    }, [address]);

    return displayAddress;
}