import { ChainId } from '../packages/address-book/address-book';

const yargs = require('yargs');

const { ethers } = require('ethers');
const { MULTICHAIN_RPC } = require('../src/constants');

const ERC20ABI = require('../src/abis/ERC20.json');

const args = yargs.options({
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
}).argv;

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
    logoURI: `https://tokens.pancakeswap.finance/images/${checksummedTokenAddress}.svg`,
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
