import fetch from 'node-fetch';
import { VaultConfig } from '../types/config-types';

export async function getVaults(vaultsEndpoint: string): Promise<VaultConfig[]> {
  try {
    let vaults = await fetch(vaultsEndpoint).then(res => res.json());
    vaults = vaults.filter(vault => !vault.isGovVault);
    return vaults;
  } catch (err) {
    console.error(err);
    return [];
  }
}
