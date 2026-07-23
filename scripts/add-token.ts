import { ethers } from 'ethers';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ChainId } from '../packages/address-book/src/address-book/index.ts';
import { MULTICHAIN_RPC } from '../src/constants.ts';
import ERC20ABI from '../src/abis/ERC20.json' with { type: 'json' };

const args = yargs(hideBin(process.argv))
  .options({
    network: {
      type: 'string',
      demandOption: true,
      describe: 'blockchain network',
      choices: Object.keys(ChainId),
    },
    address: {
      type: 'string',
      demandOption: true,
      describe: 'token address',
    },
  })
  .parseSync();

const chainId = ChainId[args['network']];
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

async function fetchToken(tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  const checksummedTokenAddress = ethers.utils.getAddress(tokenAddress);
  const token = {
    name: await tokenContract.name(),
    symbol: await tokenContract.symbol(),
    address: checksummedTokenAddress,
    chainId: chainId,
    decimals: await tokenContract.decimals(),
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
