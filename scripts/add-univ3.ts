import { ChainId, addressBook } from '../packages/address-book/address-book';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

import { ethers } from 'ethers';
import { MULTICHAIN_RPC } from '../src/constants';

import UniV3LPPairABI from '../src/abis/UniV3LPPair.json';
import StratUniV3ABI from '../src/abis/StratUniV3.json';
import ERC20ABI from '../src/abis/ERC20.json';

const {} = addressBook;

const projects = {
  uniswap_polygon: {
    prefix: 'uniswap-polygon',
    file: '../src/data/matic/uniswapLpPools.json',
  },
};

const args = yargs.options({
  network: {
    type: 'string',
    demandOption: true,
    describe: 'blockchain network',
    choices: Object.keys(ChainId),
  },
  project: {
    type: 'string',
    demandOption: true,
    describe: 'project name',
    choices: Object.keys(projects),
  },
  strategy: {
    type: 'string',
    demandOption: true,
    describe: 'strategy for underlying univ3 pool',
  },
}).argv;

const poolPrefix = projects[args['project']].prefix;
const strategyAddress = args['strategy'];
const poolsJsonFile = projects[args['project']].file;
const poolsJson = require(poolsJsonFile);

const chainId = ChainId[args['network']];
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

async function fetchLiquidityPair(strategyAddress) {
  console.log(`fetchLiquidityPair for (${strategyAddress})`);
  const strategyContract = new ethers.Contract(strategyAddress, StratUniV3ABI, provider);
  const lpAddress = await strategyContract.pool();
  const lpContract = new ethers.Contract(lpAddress, UniV3LPPairABI, provider);
  interface Results {
    address: String;
    strategy: String;
    token0: String;
    token1: String;
    fee: number;
  }

  const results: Results = {
    address: ethers.utils.getAddress(lpAddress),
    strategy: ethers.utils.getAddress(strategyAddress),
    token0: await lpContract.token0(),
    token1: await lpContract.token1(),
    fee: await lpContract.fee(),
  };

  return results;
}

async function fetchToken(tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  const checksummedTokenAddress = ethers.utils.getAddress(tokenAddress);
  const token = {
    name: await tokenContract.name(),
    symbol: await tokenContract.symbol(),
    address: checksummedTokenAddress,
    chainId: chainId,
    decimals: await tokenContract.decimals(),
    logoURI: '',
    website: '',
    description: '',
    documentation: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const lp = await fetchLiquidityPair(strategyAddress);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);
  const returnedFee = Number(lp.fee);
  const fees = returnedFee / 10000;
  const newPoolName = `${poolPrefix}-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}-${fees}`;
  const newPool = {
    name: newPoolName,
    address: lp.address,
    strategy: lp.strategy,
    beefyFee: 0.095,
    poolFee: fees,
    chainId: chainId,
    lp0: {
      address: token0.address,
      oracle: 'tokens',
      oracleId: token0.symbol,
      decimals: `1e${token0.decimals}`,
    },
    lp1: {
      address: token1.address,
      oracle: 'tokens',
      oracleId: token1.symbol,
      decimals: `1e${token1.decimals}`,
    },
  };

  poolsJson.forEach(pool => {
    if (pool.name === newPoolName) {
      throw Error(`Duplicate: pool with name ${newPoolName} already exists`);
    }
  });

  const newPools = [newPool, ...poolsJson];

  fs.writeFileSync(
    path.resolve(__dirname, poolsJsonFile),
    JSON.stringify(newPools, null, 2) + '\n'
  );

  console.log(newPool);
}

main();
