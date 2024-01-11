const MoeChef = [
  {
    "type": "constructor",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "type": "address",
        "name": "moe",
        "internalType": "contract IMoe"
      },
      {
        "type": "address",
        "name": "veMoe",
        "internalType": "contract IVeMoe"
      },
      {
        "type": "address",
        "name": "factory",
        "internalType": "contract IRewarderFactory"
      },
      {
        "type": "uint256",
        "name": "treasuryShare",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "AddressEmptyCode",
    "inputs": [
      {
        "type": "address",
        "name": "target",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "AddressInsufficientBalance",
    "inputs": [
      {
        "type": "address",
        "name": "account",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "FailedInnerCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidInitialization",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MasterChef__CannotRenounceOwnership",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MasterChef__InvalidMoePerSecond",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MasterChef__InvalidShares",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MasterChef__MintFailed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MasterChef__NotMasterchefRewarder",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MasterChef__ZeroAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Math__UnderOverflow",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotInitializing",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "type": "address",
        "name": "owner",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "type": "address",
        "name": "account",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [
      {
        "type": "address",
        "name": "token",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "event",
    "name": "ExtraRewarderSet",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256",
        "indexed": true
      },
      {
        "type": "address",
        "name": "extraRewarder",
        "internalType": "contract IMasterChefRewarder",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FarmAdded",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256",
        "indexed": true
      },
      {
        "type": "address",
        "name": "token",
        "internalType": "contract IERC20",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Initialized",
    "inputs": [
      {
        "type": "uint64",
        "name": "version",
        "internalType": "uint64",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MoePerSecondSet",
    "inputs": [
      {
        "type": "uint256",
        "name": "moePerSecond",
        "internalType": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferStarted",
    "inputs": [
      {
        "type": "address",
        "name": "previousOwner",
        "internalType": "address",
        "indexed": true
      },
      {
        "type": "address",
        "name": "newOwner",
        "internalType": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "type": "address",
        "name": "previousOwner",
        "internalType": "address",
        "indexed": true
      },
      {
        "type": "address",
        "name": "newOwner",
        "internalType": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PositionModified",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256",
        "indexed": true
      },
      {
        "type": "address",
        "name": "account",
        "internalType": "address",
        "indexed": true
      },
      {
        "type": "int256",
        "name": "deltaAmount",
        "internalType": "int256",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "moeReward",
        "internalType": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TreasurySet",
    "inputs": [
      {
        "type": "address",
        "name": "treasury",
        "internalType": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "acceptOwnership",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "add",
    "inputs": [
      {
        "type": "address",
        "name": "token",
        "internalType": "contract IERC20"
      },
      {
        "type": "address",
        "name": "extraRewarder",
        "internalType": "contract IMasterChefRewarder"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "claim",
    "inputs": [
      {
        "type": "uint256[]",
        "name": "pids",
        "internalType": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "deposit",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "amount",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "emergencyWithdraw",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "name": "getDeposit",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      },
      {
        "type": "address",
        "name": "account",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "contract IMasterChefRewarder"
      }
    ],
    "name": "getExtraRewarder",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "name": "getLastUpdateTimestamp",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "contract IMoe"
      }
    ],
    "name": "getMoe",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "name": "getMoePerSecond",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "name": "getMoePerSecondForPid",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "name": "getNumberOfFarms",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "uint256[]",
        "name": "moeRewards",
        "internalType": "uint256[]"
      },
      {
        "type": "address[]",
        "name": "extraTokens",
        "internalType": "contract IERC20[]"
      },
      {
        "type": "uint256[]",
        "name": "extraRewards",
        "internalType": "uint256[]"
      }
    ],
    "name": "getPendingRewards",
    "inputs": [
      {
        "type": "address",
        "name": "account",
        "internalType": "address"
      },
      {
        "type": "uint256[]",
        "name": "pids",
        "internalType": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "contract IRewarderFactory"
      }
    ],
    "name": "getRewarderFactory",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "contract IERC20"
      }
    ],
    "name": "getToken",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "name": "getTotalDeposit",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "address"
      }
    ],
    "name": "getTreasury",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "name": "getTreasuryShare",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "contract IVeMoe"
      }
    ],
    "name": "getVeMoe",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "initialize",
    "inputs": [
      {
        "type": "address",
        "name": "initialOwner",
        "internalType": "address"
      },
      {
        "type": "address",
        "name": "treasury",
        "internalType": "address"
      },
      {
        "type": "address",
        "name": "futureFunding",
        "internalType": "address"
      },
      {
        "type": "address",
        "name": "team",
        "internalType": "address"
      },
      {
        "type": "uint256",
        "name": "futureFundingAmount",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "teamAmount",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "address"
      }
    ],
    "name": "owner",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "address"
      }
    ],
    "name": "pendingOwner",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "pure",
    "outputs": [],
    "name": "renounceOwnership",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "setExtraRewarder",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      },
      {
        "type": "address",
        "name": "extraRewarder",
        "internalType": "contract IMasterChefRewarder"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "setMoePerSecond",
    "inputs": [
      {
        "type": "uint96",
        "name": "moePerSecond",
        "internalType": "uint96"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "setTreasury",
    "inputs": [
      {
        "type": "address",
        "name": "treasury",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "transferOwnership",
    "inputs": [
      {
        "type": "address",
        "name": "newOwner",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "updateAll",
    "inputs": [
      {
        "type": "uint256[]",
        "name": "pids",
        "internalType": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "withdraw",
    "inputs": [
      {
        "type": "uint256",
        "name": "pid",
        "internalType": "uint256"
      },
      {
        "type": "uint256",
        "name": "amount",
        "internalType": "uint256"
      }
    ]
  }
] as const;

export default MoeChef;
