import { Transaction } from "@/types/transaction";
import axios from "axios";

const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const internalApi = {
    getTransactionHistory: async (address: string, contractAddress: string) => {
        const response = await api.get<Transaction[]>(`/api/transactions?address=${address}&contractAddress=${contractAddress}`);
        return response.data;
    }
}