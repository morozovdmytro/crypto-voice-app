import { http } from "viem";
import { createPublicClient } from "viem";
import { Chain } from "viem";
import { PublicClient } from "viem";
import { createLogger } from "./logger";
import 'dotenv/config';
import { ClaimDropAbi } from "../constants";

const logger = createLogger('ClaimDropService');

export class ClaimDropService {
    private readonly publicClient: PublicClient;

    constructor(chain: Chain) {
        this.publicClient = createPublicClient({
            chain,
            transport: http(process.env.RPC_URL),
        });
    }

    public async getClaimCondition(address: string): Promise<any> {
        // TODO: fetch the claim condition id from the contract
        const claimConditionId = 0n;
        
        try {
            logger.info({ address, claimConditionId }, 'Fetching claim condition');
            
            // Create a promise that will timeout after 10 seconds
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Contract read operation timed out')), 10000);
            });
            
            // Create the contract read promise
            const contractReadPromise = this.publicClient.readContract({
                address: address as `0x${string}`,
                abi: ClaimDropAbi,
                functionName: 'getClaimConditionById',
                args: [claimConditionId]
            });
            
            // Race the promises - whichever resolves/rejects first wins
            const claimCondition = await Promise.race([
                contractReadPromise,
                timeoutPromise
            ]);

            logger.info({ claimCondition }, 'Claim condition fetched');

            return claimCondition;
        } catch (error) {
            logger.error({ error, address, claimConditionId }, 'Error fetching claim condition');
            throw error;
        }
    }
}