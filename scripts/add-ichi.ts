import { ChainId } from '../packages/address-book/address-book';

import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

import { ethers } from 'ethers';
import { MULTICHAIN_RPC } from '../src/constants';

import WrapperABI from '../src/abis/Wrapper.json';
import ERC20ABI from '../src/abis/ERC20.json';
import IchiABI from '../src/abis/Ichi.json';
import { addressBook } from '../packages/address-book/address-book';
import ISolidlyPair from '../src/abis/ISolidlyPair';

const {
  bsc: {
    platforms: {},
  },
} = addressBook;

const projects = {
  pancake: {
    prefix: 'pancake',
    file: '../src/data/bsc/pancakeIchiPools.json',
  },
  range: {
    prefix: 'pancake-range',
    file: '../src/data/bsc/pancakeRangePools.json',
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
  wrapper: {
    type: 'string',
    demandOption: true,
    describe: 'provide the wrapper',
  },
}).argv;

const poolPrefix = projects[args['project']].prefix;
const wrapperAddress = args['wrapper'];

const chainId = ChainId[args['network']];
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

async function fetchLp(wrapper) {
  console.log(`fetchLp(${wrapper})`);
  const wrapperContract = new ethers.Contract(wrapper, WrapperABI, provider);
  const rewardsContract = await wrapperContract.stakedToken();
  return {
    lp: rewardsContract,
  };
}

async function fetchPool(lp) {
  console.log(`fetchPool(${lp})`);
  const lpContract = new ethers.Contract(lp, IchiABI, provider);
  const poolContract = await lpContract.pool();
  return {
    pool: poolContract,
  };
}

async function fetchLiquidityPair(lp) {
  console.log(`fetchLiquidityPair(${lp})`);
  const lpContract = new ethers.Contract(lp, ISolidlyPair as any, provider);
  const lpTokenContract = new ethers.Contract(lp, ERC20ABI, provider);
  return {
    address: ethers.utils.getAddress(lp),
    token0: await lpContract.token0(),
    token1: await lpContract.token1(),
    decimals: await lpTokenContract.decimals(),
  };
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
    logoURI: ``,
    website: '',
    description: '',
    documentation: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  let farm = wrapperAddress;
  let lpToken = await fetchLp(farm);
  let lpPool = await fetchPool(lpToken.lp);

  const lp = await fetchLiquidityPair(lpToken.lp);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);

  const poolsJsonFile = projects[args['project']].file;
  const poolsJson = require(poolsJsonFile);

  const newPoolName = `${poolPrefix}-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;

  const pool = {
    name: newPoolName,
    address: lp.address,
    pool: lpPool.pool,
    gauge: farm,
    decimals: `1e${lp.decimals}`,
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

  const newPool = pool;

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
