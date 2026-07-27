import fs from 'node:fs';
import path from 'node:path';
import { ChainId } from '@beefyfinance/blockchain-addressbook';
import { type Client, createPublicClient, getAddress, getContract, http } from 'viem';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ERC20ABI from '../src/abis/ERC20Abi.ts';
import UniV3LPPairABI from '../src/abis/IUniV3Pool.ts';
import StratUniV3 from '../src/abis/StratUniV3.ts';
import { MULTICHAIN_RPC } from '../src/constants.ts';

const projects = {
  uniswap_polygon: {
    prefix: 'uniswap-polygon',
    file: '../src/data/matic/uniswapLpPools.json',
  },
};

const args = yargs(hideBin(process.argv))
  .options({
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
  })
  .parseSync();

const poolPrefix = projects[args['project']].prefix;
const strategyAddress = args['strategy'];
const poolsJsonFile = projects[args['project']].file;
const poolsJson = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, poolsJsonFile), 'utf8'));

const chainId = ChainId[args['network']];
// cast: viem's PublicClient type collapses to never without strictNullChecks
const publicClient = createPublicClient({ transport: http(MULTICHAIN_RPC[chainId]) }) as Client;

async function fetchLiquidityPair(strategyAddress) {
  console.log(`fetchLiquidityPair for (${strategyAddress})`);
  const strategyContract = getContract({ address: getAddress(strategyAddress), abi: StratUniV3, publicClient });
  const lpAddress = await strategyContract.read.pool();
  const lpContract = getContract({ address: lpAddress, abi: UniV3LPPairABI, publicClient });
  interface Results {
    address: String;
    strategy: String;
    token0: String;
    token1: String;
    fee: number;
  }

  const results: Results = {
    address: getAddress(lpAddress),
    strategy: getAddress(strategyAddress),
    token0: await lpContract.read.token0(),
    token1: await lpContract.read.token1(),
    fee: await lpContract.read.fee(),
  };

  return results;
}

async function fetchToken(tokenAddress) {
  const checksummedTokenAddress = getAddress(tokenAddress);
  const tokenContract = getContract({ address: checksummedTokenAddress, abi: ERC20ABI, publicClient });
  const token = {
    name: await tokenContract.read.name(),
    symbol: await tokenContract.read.symbol(),
    address: checksummedTokenAddress,
    chainId: chainId,
    decimals: await tokenContract.read.decimals(),
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

  fs.writeFileSync(path.resolve(import.meta.dirname, poolsJsonFile), JSON.stringify(newPools, null, 2) + '\n');

  console.log(newPool);
}

main();
