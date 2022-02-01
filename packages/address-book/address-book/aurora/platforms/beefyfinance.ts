const cowllector = '0xd529b1894491a0a26B18939274ae8ede93E81dbA';
const zeroAddress = '0x0000000000000000000000000000000000000000';
const treasury = '0x8c2d54BA94f4638f1bb91f623F378B66d6023324';

export const beefyfinance = {
  devMultisig: zeroAddress,
  treasuryMultisig: zeroAddress,
  strategyOwner: '0x2d04969ED7D1b186797C44dF5F5634Eb9C89aF6b',
  vaultOwner: '0x19642aDA958632f5e574A6d13eAd0679BD435c20',
  keeper: '0x10aee6B5594942433e7Fc2783598c979B030eF3D',
  rewarder: cowllector,
  treasurer: '0x3Eb7fB70C03eC4AEEC97C6C6C1B59B014600b7F7',
  launchpoolOwner: cowllector,
  rewardPool: '0xE6ab45f5e93FA377D0c4cC097187Ab7256c2AEBf',
  treasury,
  beefyFeeRecipient: '0x9dA9f3C6c45F1160b53D395b0A982aEEE1D212fE',
  multicall: '0x1198f78efd67DFc917510aaA07d49545f4B24f11',
  bifiMaxiStrategy: zeroAddress,
} as const;
