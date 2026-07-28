import fs from 'node:fs';
import path from 'node:path';
import { ChainId } from '@beefyfinance/blockchain-addressbook';
import { type Address, type Client, createPublicClient, getAddress, getContract, http } from 'viem';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import CowVault from '../src/abis/CowVault.ts';
import ERC20ABI from '../src/abis/ERC20Abi.ts';
import UniV3LPPairABI from '../src/abis/IUniV3Pool.ts';
import StratUniV3 from '../src/abis/StratUniV3.ts';
import { MULTICHAIN_RPC } from '../src/constants.ts';

let vaultsFile = '../src/data/$network/beefyCowVaults.json';

const args = yargs(hideBin(process.argv))
  .options({
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
  })
  .parseSync();

const poolPrefix = args['platform'];
const clmAddress = process.argv[6];
console.log(clmAddress);
const rewardPoolAddress = process.argv[7];
const vaultAddress = process.argv[8] ?? '';
const poolsJsonFile = vaultsFile.replace('$network', args['network']);
const poolsJson = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, poolsJsonFile), 'utf8'));
const chainName = args['network'];

const chainId = ChainId[args['network'] as keyof typeof ChainId];
// cast: viem's PublicClient type collapses to never without strictNullChecks
const publicClient = createPublicClient({ transport: http(MULTICHAIN_RPC[chainId]) }) as Client;

function formatCowVaultsJson(pools: unknown) {
  return JSON.stringify(pools, null, 2).replace(
    /^(\s*)"(tokens|tokenOracleIds|decimals)": \[\n([\s\S]*?)\n\1\](,?)$/gm,
    (match: string, indent: string, key: string, body: string, trailingComma: string) => {
      const values = body
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => line.replace(/,$/, ''));

      if (values.some(value => value.includes('[') || value.includes('{'))) {
        return match;
      }

      return `${indent}"${key}": [${values.join(', ')}]${trailingComma}`;
    }
  );
}

async function fetchLiquidityPair(clmAddress: string) {
  console.log(`fetchLiquidityPair for (${clmAddress})`);
  const clmContract = getContract({ address: getAddress(clmAddress), abi: CowVault, publicClient });

  let lpAddress: Address;
  let token0: Address;
  let token1: Address;

  try {
    lpAddress = await clmContract.read.want();
    const lpContract = getContract({ address: lpAddress, abi: UniV3LPPairABI, publicClient });
    token0 = await lpContract.read.token0();
    token1 = await lpContract.read.token1();
  } catch {
    // Newer CLMs expose wants() instead of want(); get lpAddress from strategy
    const strategyAddress = await clmContract.read.strategy();
    const strategyContract = getContract({ address: strategyAddress, abi: StratUniV3, publicClient });
    lpAddress = await strategyContract.read.pool();
    [token0, token1] = await clmContract.read.wants();
  }

  interface Results {
    address: string;
    token0: string;
    token1: string;
  }

  const results: Results = {
    address: getAddress(lpAddress),
    token0: getAddress(token0),
    token1: getAddress(token1),
  };

  return results;
}

async function fetchToken(tokenAddress: string) {
  const checksummedTokenAddress = getAddress(tokenAddress);
  const tokenContract = getContract({ address: checksummedTokenAddress, abi: ERC20ABI, publicClient });
  const symbol = await tokenContract.read.symbol();
  const token = {
    name: await tokenContract.read.name(),
    symbol: symbol,
    oracleId: symbol,
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

  poolsJson.forEach((pool: { name: string }) => {
    if (pool.name === newPoolName) {
      throw Error(`Duplicate: pool with name ${newPoolName} already exists`);
    }
  });

  const newPools = [newPool, ...poolsJson];

  fs.writeFileSync(path.resolve(import.meta.dirname, poolsJsonFile), formatCowVaultsJson(newPools) + '\n');

  console.log(newPool);
}

main();
