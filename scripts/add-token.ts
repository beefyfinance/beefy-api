import { createPublicClient, getAddress, getContract, http } from 'viem';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ERC20ABI from '../src/abis/ERC20Abi.ts';
import { MULTICHAIN_RPC } from '../src/api/rpc/rpcs.ts';
import { SupportedChains, toChainId } from '../src/utils/chain.ts';

const args = yargs(hideBin(process.argv))
  .options({
    network: {
      type: 'string',
      demandOption: true,
      describe: 'blockchain network',
      choices: SupportedChains,
    },
    address: {
      type: 'string',
      demandOption: true,
      describe: 'token address',
    },
  })
  .parseSync();

const chainId = toChainId(args['network']);
const client = createPublicClient({ transport: http(MULTICHAIN_RPC[chainId]) });

async function fetchToken(tokenAddress: string) {
  const checksummedTokenAddress = getAddress(tokenAddress);
  const tokenContract = getContract({ address: checksummedTokenAddress, abi: ERC20ABI, client });
  const token = {
    name: await tokenContract.read.name(),
    symbol: await tokenContract.read.symbol(),
    address: checksummedTokenAddress,
    chainId: chainId,
    decimals: await tokenContract.read.decimals(),
    website: '',
    description: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const token = await fetchToken(args['address']);

  // @TODO: Write to address-book
}

main();
