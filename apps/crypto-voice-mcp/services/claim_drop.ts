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
            
            const claimCondition = await this.publicClient.readContract({
                address: address as `0x${string}`,
                abi: ClaimDropAbi,
                functionName: 'getClaimConditionById',
                args: [claimConditionId]
            });

            logger.info({ claimCondition }, 'Claim condition fetched');

            return claimCondition;
        } catch (error) {
            logger.error({ error, address, claimConditionId }, 'Error fetching claim condition');
            throw error;
        }
    }
}