import { env } from "@/env";
import { Transaction } from "@/types/transaction";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const getTransactionHistory = async (address: string, contractAddress: string): Promise<{ result: Transaction[], status: string, message: string } | null> => {
    const response = await fetch(`https://api.polygonscan.com/api?module=account&action=tokentx&address=${address}&contractaddress=${contractAddress}&page=1&sort=desc&apikey=${env.POLYGONSCAN_API_KEY}`);
    const data = await response.json();
    return data;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const contractAddress = searchParams.get('contractAddress');

    if (!address || !contractAddress) {
        return NextResponse.json({ error: 'Address and contract address are required' }, { status: 400 });
    }

    const data = await getTransactionHistory(address, contractAddress);

    return NextResponse.json(data?.result);
}