import fs from 'node:fs';
import path from 'node:path';
import { addressBook, ChainId } from '@beefyfinance/blockchain-addressbook';
import { createPublicClient, getAddress, getContract, http, parseAbi } from 'viem';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ERC20ABI from '../src/abis/ERC20Abi.ts';
import ISolidlyPair from '../src/abis/ISolidlyPair.ts';
import { MULTICHAIN_RPC } from '../src/constants.ts';

const voterABI = parseAbi(['function gauges(address) view returns (address)']);
const etherexVoterABI = parseAbi(['function gaugeForPool(address) view returns (address)']);

const {
  optimism: {
    platforms: { velodrome },
  },
  zksync: {
    platforms: { vesync },
  },
  base: {
    platforms: { aerodrome },
  },
  linea: {
    platforms: { etherex },
  },
  hyperevm: {
    platforms: { kittenswap },
  },
} = addressBook;

const projects: Record<string, { prefix: string; voter: string; stableFile?: string; volatileFile?: string }> = {
  velodrome: {
    prefix: 'velodrome-v2',
    stableFile: '../src/data/optimism/velodromeStableLpPools.json',
    volatileFile: '../src/data/optimism/velodromeLpPools.json',
    voter: velodrome.voter,
  },
  vesync: {
    prefix: 'vesync',
    stableFile: '../src/data/zksync/veSyncStableLpPools.json',
    volatileFile: '../src/data/zksync/veSyncLpPools.json',
    voter: vesync.voter,
  },
  aerodrome: {
    prefix: 'aerodrome',
    stableFile: '../src/data/base/aerodromeStableLpPools.json',
    volatileFile: '../src/data/base/aerodromeLpPools.json',
    voter: aerodrome.voter,
  },
  kittenswap: {
    prefix: 'kittenswap',
    stableFile: '../src/data/hyperevm/kittenswapStablePools.json',
    volatileFile: '../src/data/hyperevm/kittenswapLpPools.json',
    voter: kittenswap.voter,
  },
  etherex: {
    prefix: 'etherex',
    stableFile: '../src/data/linea/etherexStablePools.json',
    volatileFile: '../src/data/linea/etherexVolatilePools.json',
    voter: etherex.voter,
  },
  lithos: {
    prefix: 'lithos',
    stableFile: '../src/data/plasma/lithosStablePools.json',
    volatileFile: '../src/data/plasma/lithosPools.json',
    voter: '0x2AF460a511849A7aA37Ac964074475b0E6249c69',
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
    lp: {
      type: 'string',
      demandOption: true,
      describe: 'provide the solidly LP for gauge',
    },
    newFee: {
      type: 'boolean',
      demandOption: true,
      describe: 'If the beefy fee is 9.5% use true else use false',
    },
  })
  .parseSync();

const project = projects[args['project'] as keyof typeof projects];
const poolPrefix = project.prefix;
const lpAddress = args['lp'];

const chainId = ChainId[args['network'] as keyof typeof ChainId];
const client = createPublicClient({ transport: http(MULTICHAIN_RPC[chainId]) });

async function fetchGauge(lp: string) {
  console.log(`fetchGauge(${lp})`);
  if (project === projects['etherex']) {
    const voterContract = getContract({
      address: getAddress(projects['etherex'].voter),
      abi: etherexVoterABI,
      client,
    });
    const rewardsContract = await voterContract.read.gaugeForPool([getAddress(lp)]);
    return {
      newGauge: rewardsContract,
    };
  } else {
    const voterContract = getContract({
      address: getAddress(project.voter),
      abi: voterABI,
      client,
    });
    const rewardsContract = await voterContract.read.gauges([getAddress(lp)]);
    return {
      newGauge: rewardsContract,
    };
  }
}

async function fetchLiquidityPair(lp: string) {
  console.log(`fetchLiquidityPair(${lp})`);
  const lpContract = getContract({ address: getAddress(lp), abi: ISolidlyPair, client });
  return {
    address: getAddress(lpAddress),
    token0: await lpContract.read.token0(),
    token1: await lpContract.read.token1(),
    decimals: await lpContract.read.decimals(),
    stable: await lpContract.read.stable(),
  };
}

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
    documentation: '',
    bridge: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const farm = await fetchGauge(lpAddress);
  const lp = await fetchLiquidityPair(lpAddress);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);

  const poolsJsonFile = lp.stable ? project.stableFile : project.volatileFile;
  if (!poolsJsonFile) {
    throw new Error(`No ${lp.stable ? 'stable' : 'volatile'} pools file configured for project ${args['project']}`);
  }
  const poolsJson = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, poolsJsonFile), 'utf8'));

  const newPoolName = `${poolPrefix}-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;
  const newPool = {
    name: newPoolName,
    address: lp.address,
    gauge: farm.newGauge,
    decimals: `1e${lp.decimals}`,
    chainId: chainId,
    beefyFee: args['newFee'] ? 0.095 : 0.045,
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

  poolsJson.forEach((pool: { name: string }) => {
    if (pool.name === newPoolName) {
      throw Error(`Duplicate: pool with name ${newPoolName} already exists`);
    }
  });

  const newPools = [newPool, ...poolsJson];

  fs.writeFileSync(path.resolve(import.meta.dirname, poolsJsonFile), JSON.stringify(newPools, null, 2) + '\n');

  console.log(newPool);
}

main();
