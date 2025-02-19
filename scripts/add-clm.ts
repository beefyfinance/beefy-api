import { ChainId, addressBook } from '../packages/address-book/src/address-book';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

import { ethers } from 'ethers';
import { MULTICHAIN_RPC } from '../src/constants';

import UniV3LPPairABI from '../src/abis/UniV3LPPair.json';
import ERC20ABI from '../src/abis/ERC20.json';
import CowVault from '../src/abis/CowVault';

const {} = addressBook;

let vaultsFile = '../src/data/$network/beefyCowVaults.json';

const args = yargs.options({
  network: {
    type: 'string',
    demandOption: true,
    describe: 'blockchain network',
    choices: Object.keys(ChainId),
  },
  platform: {
    type: 'string',
    demandOption: true,
    describe: 'project name',
  },
}).argv;

const poolPrefix = args['platform'];
const clmAddress = process.argv[6];
console.log(clmAddress);
const rewardPoolAddress = process.argv[7];
const vaultAddress = process.argv[8] ?? '';
const poolsJsonFile = vaultsFile.replace('$network', args['network']);
const poolsJson = require(poolsJsonFile);
const chainName = args['network'];

const chainId = ChainId[args['network']];
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

async function fetchLiquidityPair(clmAddress) {
  console.log(`fetchLiquidityPair for (${clmAddress})`);
  const clmContract = new ethers.Contract(clmAddress, CowVault as any, provider);
  const lpAddress = await clmContract.want();
  const lpContract = new ethers.Contract(lpAddress, UniV3LPPairABI, provider);

  interface Results {
    address: String;
    token0: String;
    token1: String;
  }

  const results: Results = {
    address: ethers.utils.getAddress(lpAddress),
    token0: await lpContract.token0(),
    token1: await lpContract.token1(),
  };

  return results;
}

async function fetchToken(tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  const checksummedTokenAddress = ethers.utils.getAddress(tokenAddress);
  const symbol = await tokenContract.symbol();
  const token = {
    name: await tokenContract.name(),
    symbol: symbol,
    oracleId: symbol,
    address: checksummedTokenAddress,
    chainId: chainId,
    decimals: await tokenContract.decimals(),
    logoURI: '',
    website: '',
    description: '',
    documentation: '',
    bridge: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const lp = await fetchLiquidityPair(clmAddress);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);
  const newPoolName = `${poolPrefix}-cow-${chainName}-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;
  const providerId = poolPrefix === 'pancake' ? 'pancakeswap' : poolPrefix;
  const newPool =
    vaultAddress !== ''
      ? {
          address: clmAddress,
          lpAddress: lp.address,
          tokens: [token0.address, token1.address],
          tokenOracleIds: [token0.symbol, token1.symbol],
          decimals: [token0.decimals, token1.decimals],
          oracleId: newPoolName,
          providerId,
          rewardPool: {
            address: rewardPoolAddress,
            oracleId: newPoolName + '-rp',
          },
          vault: {
            address: vaultAddress,
            oracleId: newPoolName + '-vault',
          },
        }
      : {
          address: clmAddress,
          lpAddress: lp.address,
          tokens: [token0.address, token1.address],
          tokenOracleIds: [token0.symbol, token1.symbol],
          decimals: [token0.decimals, token1.decimals],
          oracleId: newPoolName,
          rewardPool: {
            address: rewardPoolAddress,
            oracleId: newPoolName + '-rp',
          },
        };

  poolsJson.forEach(pool => {
    if (pool.name === newPoolName) {
      throw Error(`Duplicate: pool with name ${newPoolName} already exists`);
    }
  });

  const newPools = [newPool, ...poolsJson];

  fs.writeFileSync(path.resolve(__dirname, poolsJsonFile), JSON.stringify(newPools, null, 2) + '\n');

  console.log(newPool);
}

main();
