import { BigNumber } from 'bignumber.js';
import BeefyVaultV6Abi from '../../abis/BeefyVault.ts';
import ERC20Abi from '../../abis/ERC20Abi.ts';
import { beSonicAbi } from '../../abis/sonic/beSonicAbi.ts';
import { EXCLUDED_IDS_FROM_TVL } from '../../constants.ts';
import { getVaultBalanceOverride } from '../../data/vaultOverrides.ts';
import { type ApiChain, type ApiChainId, toChainId } from '../../utils/chain.ts';
import { fetchPrice } from '../../utils/fetchPrice.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { fetchContract } from '../rpc/client.ts';
import type { AnyVault, CowVault, Erc4626Vault, GovVault, StandardVault } from '../vaults/types.ts';
import { getVaultById, getVaultsByTypeChain } from './getMultichainVaults.ts';

const logger = getLoggerFor({ module: 'tvl' });

type VaultTvlById = Record<string, number>;

export type TvlByChainId = Partial<Record<ApiChainId, VaultTvlById>>;

type ExcludingVault = AnyVault & { excluded?: string };

const getChainTvl = async (apiChain: ApiChain): Promise<TvlByChainId> => {
  const chainId = toChainId(apiChain);

  const lpVaults = getVaultsByTypeChain('standard', apiChain);
  const govVaults = getVaultsByTypeChain('gov', apiChain);
  const cowVaults = getVaultsByTypeChain('cowcentrated', apiChain);
  const erc4626Vaults = getVaultsByTypeChain('erc4626', apiChain);
  const vaultsCalls = [
    getVaultBalances(chainId, lpVaults),
    getGovVaultBalances(chainId, govVaults),
    getCowVaultBalances(chainId, cowVaults),
    getErc4626VaultBalances(chainId, erc4626Vaults),
  ];
  const [vaultBalances, govVaultBalances, cowVaultBalances, erc4624VaultBalances] = await Promise.all(vaultsCalls);

  const tvls: VaultTvlById = {};

  //first set lp vaults since some gov vaults can exlude from tvl from those
  await setVaultsTvl(lpVaults, vaultBalances, chainId, tvls);
  await setVaultsTvl(cowVaults, cowVaultBalances, chainId, tvls);
  await setVaultsTvl(govVaults, govVaultBalances, chainId, tvls);
  await setVaultsTvl(erc4626Vaults, erc4624VaultBalances, chainId, tvls);

  // separate CLM / CLM Pool / CLM Vault TVL
  for (const clm of cowVaults) {
    const clmId = clm.id;
    const clmAddress = clm.earnContractAddress;

    // TODO fix if we ever have more than one pool/vault per clm
    const clmVault = lpVaults.find(vault => vault.tokenAddress === clmAddress);
    const clmPool = govVaults.find(pool => pool.tokenAddress === clmAddress);

    const clmVaultTvl = clmVault ? tvls[clmVault.id] || 0 : 0;
    const clmPoolTvl = clmPool ? tvls[clmPool.id] || 0 : 0;
    const clmTvl = tvls[clmId] || 0;

    // Vault deposits in to Pool
    if (clmPool && clmVault) {
      // On-chain pool TVL therefore also includes vault deposits, so remove them
      tvls[clmPool.id] = Math.max(0, clmPoolTvl - clmVaultTvl);
    }

    // Pool deposits in to CLM
    if (clmPool) {
      // On-chain CLM TVL therefore also includes pool deposits, so remove them
      tvls[clmId] = Math.max(0, clmTvl - clmPoolTvl);
    }
  }

  return { [chainId]: tvls };
};

const setVaultsTvl = async (
  vaults: ExcludingVault[],
  balances: BigNumber[],
  chainId: ApiChainId,
  tvls: VaultTvlById
) => {
  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i];

    if (EXCLUDED_IDS_FROM_TVL.includes(vault.id)) {
      logger.debug({ chain: chainId, vault: vault.id }, 'excluding from tvl');
      continue;
    }

    const vaultBalance = balances[i];
    let tokenPrice = 0;
    try {
      const logUnknown = vault.status !== 'eol';
      tokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId }, logUnknown);
    } catch (e) {
      logger.warn({ chain: chainId, oracle: vault.oracle, token: vault.oracleId, err: e }, 'fetchPrice failed');
    }

    let tvl = vaultBalance.times(tokenPrice).shiftedBy(-(vault.tokenDecimals ?? 18));

    //substract the tvl from itself
    if (vault.excluded) {
      const excludedVault = getVaultById(vault.excluded);
      if (excludedVault && excludedVault.status === 'active') {
        tvl = tvl.minus(new BigNumber(tvls[excludedVault.id] || 0));
      }
    }

    tvls[vault.id] = tvl.isNaN() ? 0 : tvl.toNumber();
  }
};

const getVaultBalances = async (chainId: ApiChainId, vaults: StandardVault[]) => {
  const calls = vaults.map(vault => {
    const contract = fetchContract(vault.earnContractAddress, BeefyVaultV6Abi, chainId);
    return contract.read.balance().catch(err => {
      logger.warn({ chain: chainId, vault: vault.id, err }, 'failed to read balance');
      return 0n;
    });
  });
  const res = await Promise.all(calls);
  return res.map((v, i) => getVaultBalanceOverride(vaults[i].id) ?? new BigNumber(v.toString()));
};

const getGovVaultBalances = async (chainId: ApiChainId, govPools: GovVault[]) => {
  const calls = govPools.map(vault => {
    const tokenContract = fetchContract(vault.tokenAddress, ERC20Abi, chainId);
    return tokenContract.read.balanceOf([vault.earnContractAddress]).catch(err => {
      logger.warn({ chain: chainId, vault: vault.id, err }, 'failed to read balanceOf');
      return 0n;
    });
  });

  const res = await Promise.all(calls);
  return res.map(v => new BigNumber(v.toString()));
};

const getCowVaultBalances = async (chainId: ApiChainId, cowVaults: CowVault[]) => {
  const calls = cowVaults.map(vault => {
    const tokenContract = fetchContract(vault.earnContractAddress, ERC20Abi, chainId);
    return tokenContract.read.totalSupply().catch(err => {
      logger.warn({ chain: chainId, vault: vault.id, err }, 'failed to read totalSupply');
      return 0n;
    });
  });

  const res = await Promise.all(calls);
  return res.map(v => new BigNumber(v.toString()));
};

const getErc4626VaultBalances = async (chainId: ApiChainId, vaults: Erc4626Vault[]) => {
  const calls = vaults.map(vault => {
    const contract = fetchContract(vault.earnContractAddress, beSonicAbi, chainId);
    return contract.read.totalAssets().catch(err => {
      logger.warn({ chain: chainId, vault: vault.id, err }, 'failed to read totalAssets');
      return 0n;
    });
  });
  const res = await Promise.all(calls);
  return res.map(v => new BigNumber(v.toString()));
};

export default getChainTvl;
