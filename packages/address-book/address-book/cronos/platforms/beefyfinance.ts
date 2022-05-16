const zeroAddress = '0x0000000000000000000000000000000000000000';
const hw = '0x3Eb7fB70C03eC4AEEC97C6C6C1B59B014600b7F7';

export const beefyfinance = {
  devMultisig: zeroAddress,
  treasuryMultisig: zeroAddress,
  strategyOwner: '0x4f4DB83d75876f34fd927d5fa78D5D7b4479E6ce',
  vaultOwner: '0x8c2839aCcC801A61f4F0F7CCf4F92D0895ad2AeC',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: hw,
  launchpoolOwner: hw,
  rewardPool: '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF',
  treasury: '0x3f385082Ee3dFf58ca0a6a7fe44Ea0B5d6b4168E',
  beefyFeeRecipient: '0xF26C10811D602e39580C9448944ddAe7b183fD95',
  multicall: '0x13aD51a6664973EbD0749a7c84939d973F247921',
  bifiMaxiStrategy: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
