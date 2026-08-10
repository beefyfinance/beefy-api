import * as platforms from './platforms/index.js';
export declare const emerald: {
    readonly platforms: typeof platforms;
    readonly tokens: {
        readonly WNATIVE: {
            readonly name: "Wrapped ROSE ";
            readonly address: "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733";
            readonly symbol: "WROSE";
            readonly oracleId: "WROSE";
            readonly decimals: 18;
            readonly chainId: 42262;
            readonly website: "https://oasisprotocol.org/";
            readonly description: "Oasis Network is the leading privacy-enabled and scalable layer-1 blockchain network to propel Web3 forward";
        };
        readonly FEES: {
            readonly name: "Wrapped ROSE ";
            readonly address: "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733";
            readonly symbol: "WROSE";
            readonly oracleId: "WROSE";
            readonly decimals: 18;
            readonly chainId: 42262;
            readonly website: "https://oasisprotocol.org/";
            readonly description: "Oasis Network is the leading privacy-enabled and scalable layer-1 blockchain network to propel Web3 forward";
        };
        readonly ROSE: {
            readonly name: "Wrapped ROSE ";
            readonly address: "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733";
            readonly symbol: "WROSE";
            readonly oracleId: "WROSE";
            readonly decimals: 18;
            readonly chainId: 42262;
            readonly website: "https://oasisprotocol.org/";
            readonly description: "Oasis Network is the leading privacy-enabled and scalable layer-1 blockchain network to propel Web3 forward";
        };
        readonly WROSE: {
            readonly name: "Wrapped ROSE ";
            readonly address: "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733";
            readonly symbol: "WROSE";
            readonly oracleId: "WROSE";
            readonly decimals: 18;
            readonly chainId: 42262;
            readonly website: "https://oasisprotocol.org/";
            readonly description: "Oasis Network is the leading privacy-enabled and scalable layer-1 blockchain network to propel Web3 forward";
        };
        readonly WBTC: {
            readonly name: "Multichain Wrapped BTC";
            readonly symbol: "WBTC";
            readonly oracleId: "WBTC";
            readonly address: "0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818";
            readonly chainId: 42262;
            readonly decimals: 8;
            readonly description: "Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.";
            readonly tags: readonly ["BLUECHIP"];
        };
        readonly oldBIFI: {
            readonly name: "Beefy.Finance";
            readonly symbol: "oldBIFI";
            readonly oracleId: "oldBIFI";
            readonly address: "0x65e66a61D0a8F1e686C2D6083ad611a10D84D97A";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://www.beefy.finance/";
            readonly description: "Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.";
            readonly documentation: "https://docs.beefy.finance/";
        };
        readonly ceUSDC: {
            readonly name: "USD Coin (Celer)";
            readonly symbol: "ceUSDC";
            readonly oracleId: "ceUSDC";
            readonly address: "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://www.circle.com/usdc";
            readonly documentation: "https://developers.circle.com/docs";
            readonly description: "USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.";
            readonly tags: readonly ["STABLECOIN"];
        };
        readonly UST: {
            readonly name: "UST (Wormhole)";
            readonly symbol: "UST";
            readonly oracleId: "UST";
            readonly address: "0xa1E73c01E0cF7930F5e91CB291031739FE5Ad6C2";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://www.terra.money/";
            readonly description: "Terra stablecoins offer instant settlements, low fees and seamless cross-border exchange - loved by millions of users and merchants.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly FTP: {
            readonly name: "Fountain Protocol";
            readonly symbol: "FTP";
            readonly oracleId: "FTP";
            readonly address: "0xd1dF9CE4b6159441D18BD6887dbd7320a8D52a05";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://ftp.cash/home";
            readonly description: "Supply, borrow, and earn. More than a DeFi lending protocol.";
        };
        readonly YUZU: {
            readonly name: "YUZUToken";
            readonly symbol: "YUZU";
            readonly oracleId: "YUZU";
            readonly address: "0xf02b3e437304892105992512539F769423a515Cb";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://yuzu-swap.com/";
            readonly description: "An open, safe, fair DEX ecosystem with high composability built on Oasis";
        };
        readonly USDT: {
            readonly name: "Tether USD (Wormhole)";
            readonly symbol: "USDT";
            readonly oracleId: "USDT";
            readonly address: "0xdC19A122e268128B5eE20366299fc7b5b199C8e3";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://tether.to/";
            readonly description: "Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.";
            readonly tags: readonly ["STABLECOIN"];
        };
        readonly WETH: {
            readonly name: "Wrapped Ether (Wormhole)";
            readonly symbol: "WETH";
            readonly oracleId: "WETH";
            readonly address: "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://ethereum.org/";
            readonly description: "The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.";
            readonly documentation: "https://ethereum.org/en/developers/docs/";
            readonly tags: readonly ["BLUECHIP"];
        };
        readonly VS: {
            readonly name: "ValleySwap Token";
            readonly symbol: "VS";
            readonly oracleId: "VS";
            readonly address: "0xBC033203796CC2C8C543a5aAe93a9a643320433D";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://valleyswap.com/";
            readonly description: "ValleySwap is a decentralized exchange on the Oasis Emerald paratime that includes features like liquidity farming, swap and IFO.";
        };
        readonly evoUSDT: {
            readonly name: "Tether USD (EvoDeFi)";
            readonly symbol: "evoUSDT";
            readonly oracleId: "evoUSDT";
            readonly address: "0x6Cb9750a92643382e020eA9a170AbB83Df05F30B";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://bridge.evodefi.com/";
            readonly description: "USDT bridged via EvoDeFi: Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly evoUSDC: {
            readonly name: "USD Coin (EvoDeFi)";
            readonly symbol: "evoUSDC";
            readonly oracleId: "evoUSDC";
            readonly address: "0x94fbfFe5698DB6f54d6Ca524DbE673a7729014Be";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://bridge.evodefi.com/";
            readonly description: "USDC bridged via EvoDeFi: USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly evoWETH: {
            readonly name: "Wrapped Ether (EvoDeFi)";
            readonly symbol: "evoWETH";
            readonly oracleId: "evoWETH";
            readonly address: "0xE9b38eD157429483EbF87Cf6C002cecA5fd66783";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://bridge.evodefi.com/";
            readonly description: "WETH bridged via EvoDeFi: The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly evoWBTC: {
            readonly name: "Wrapped BTC (EvoDeFi)";
            readonly symbol: "evoWBTC";
            readonly oracleId: "evoWBTC";
            readonly address: "0x010CDf0Db2737f9407F8CFcb4dCaECA4dE54c815";
            readonly chainId: 42262;
            readonly decimals: 8;
            readonly website: "https://bridge.evodefi.com/";
            readonly description: "WBTC bridged via EvoDeFi: Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.";
            readonly tags: readonly ["SYNTHETIC"];
        };
    };
    readonly tokenAddressMap: import("../../util/convertSymbolTokenMapToAddressTokenMap.js").AddressToTokenMap<{
        readonly WNATIVE: {
            readonly name: "Wrapped ROSE ";
            readonly address: "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733";
            readonly symbol: "WROSE";
            readonly oracleId: "WROSE";
            readonly decimals: 18;
            readonly chainId: 42262;
            readonly website: "https://oasisprotocol.org/";
            readonly description: "Oasis Network is the leading privacy-enabled and scalable layer-1 blockchain network to propel Web3 forward";
        };
        readonly FEES: {
            readonly name: "Wrapped ROSE ";
            readonly address: "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733";
            readonly symbol: "WROSE";
            readonly oracleId: "WROSE";
            readonly decimals: 18;
            readonly chainId: 42262;
            readonly website: "https://oasisprotocol.org/";
            readonly description: "Oasis Network is the leading privacy-enabled and scalable layer-1 blockchain network to propel Web3 forward";
        };
        readonly ROSE: {
            readonly name: "Wrapped ROSE ";
            readonly address: "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733";
            readonly symbol: "WROSE";
            readonly oracleId: "WROSE";
            readonly decimals: 18;
            readonly chainId: 42262;
            readonly website: "https://oasisprotocol.org/";
            readonly description: "Oasis Network is the leading privacy-enabled and scalable layer-1 blockchain network to propel Web3 forward";
        };
        readonly WROSE: {
            readonly name: "Wrapped ROSE ";
            readonly address: "0x21C718C22D52d0F3a789b752D4c2fD5908a8A733";
            readonly symbol: "WROSE";
            readonly oracleId: "WROSE";
            readonly decimals: 18;
            readonly chainId: 42262;
            readonly website: "https://oasisprotocol.org/";
            readonly description: "Oasis Network is the leading privacy-enabled and scalable layer-1 blockchain network to propel Web3 forward";
        };
        readonly WBTC: {
            readonly name: "Multichain Wrapped BTC";
            readonly symbol: "WBTC";
            readonly oracleId: "WBTC";
            readonly address: "0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818";
            readonly chainId: 42262;
            readonly decimals: 8;
            readonly description: "Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.";
            readonly tags: readonly ["BLUECHIP"];
        };
        readonly oldBIFI: {
            readonly name: "Beefy.Finance";
            readonly symbol: "oldBIFI";
            readonly oracleId: "oldBIFI";
            readonly address: "0x65e66a61D0a8F1e686C2D6083ad611a10D84D97A";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://www.beefy.finance/";
            readonly description: "Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.";
            readonly documentation: "https://docs.beefy.finance/";
        };
        readonly ceUSDC: {
            readonly name: "USD Coin (Celer)";
            readonly symbol: "ceUSDC";
            readonly oracleId: "ceUSDC";
            readonly address: "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://www.circle.com/usdc";
            readonly documentation: "https://developers.circle.com/docs";
            readonly description: "USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.";
            readonly tags: readonly ["STABLECOIN"];
        };
        readonly UST: {
            readonly name: "UST (Wormhole)";
            readonly symbol: "UST";
            readonly oracleId: "UST";
            readonly address: "0xa1E73c01E0cF7930F5e91CB291031739FE5Ad6C2";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://www.terra.money/";
            readonly description: "Terra stablecoins offer instant settlements, low fees and seamless cross-border exchange - loved by millions of users and merchants.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly FTP: {
            readonly name: "Fountain Protocol";
            readonly symbol: "FTP";
            readonly oracleId: "FTP";
            readonly address: "0xd1dF9CE4b6159441D18BD6887dbd7320a8D52a05";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://ftp.cash/home";
            readonly description: "Supply, borrow, and earn. More than a DeFi lending protocol.";
        };
        readonly YUZU: {
            readonly name: "YUZUToken";
            readonly symbol: "YUZU";
            readonly oracleId: "YUZU";
            readonly address: "0xf02b3e437304892105992512539F769423a515Cb";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://yuzu-swap.com/";
            readonly description: "An open, safe, fair DEX ecosystem with high composability built on Oasis";
        };
        readonly USDT: {
            readonly name: "Tether USD (Wormhole)";
            readonly symbol: "USDT";
            readonly oracleId: "USDT";
            readonly address: "0xdC19A122e268128B5eE20366299fc7b5b199C8e3";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://tether.to/";
            readonly description: "Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.";
            readonly tags: readonly ["STABLECOIN"];
        };
        readonly WETH: {
            readonly name: "Wrapped Ether (Wormhole)";
            readonly symbol: "WETH";
            readonly oracleId: "WETH";
            readonly address: "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://ethereum.org/";
            readonly description: "The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.";
            readonly documentation: "https://ethereum.org/en/developers/docs/";
            readonly tags: readonly ["BLUECHIP"];
        };
        readonly VS: {
            readonly name: "ValleySwap Token";
            readonly symbol: "VS";
            readonly oracleId: "VS";
            readonly address: "0xBC033203796CC2C8C543a5aAe93a9a643320433D";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://valleyswap.com/";
            readonly description: "ValleySwap is a decentralized exchange on the Oasis Emerald paratime that includes features like liquidity farming, swap and IFO.";
        };
        readonly evoUSDT: {
            readonly name: "Tether USD (EvoDeFi)";
            readonly symbol: "evoUSDT";
            readonly oracleId: "evoUSDT";
            readonly address: "0x6Cb9750a92643382e020eA9a170AbB83Df05F30B";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://bridge.evodefi.com/";
            readonly description: "USDT bridged via EvoDeFi: Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly evoUSDC: {
            readonly name: "USD Coin (EvoDeFi)";
            readonly symbol: "evoUSDC";
            readonly oracleId: "evoUSDC";
            readonly address: "0x94fbfFe5698DB6f54d6Ca524DbE673a7729014Be";
            readonly chainId: 42262;
            readonly decimals: 6;
            readonly website: "https://bridge.evodefi.com/";
            readonly description: "USDC bridged via EvoDeFi: USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly evoWETH: {
            readonly name: "Wrapped Ether (EvoDeFi)";
            readonly symbol: "evoWETH";
            readonly oracleId: "evoWETH";
            readonly address: "0xE9b38eD157429483EbF87Cf6C002cecA5fd66783";
            readonly chainId: 42262;
            readonly decimals: 18;
            readonly website: "https://bridge.evodefi.com/";
            readonly description: "WETH bridged via EvoDeFi: The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly evoWBTC: {
            readonly name: "Wrapped BTC (EvoDeFi)";
            readonly symbol: "evoWBTC";
            readonly oracleId: "evoWBTC";
            readonly address: "0x010CDf0Db2737f9407F8CFcb4dCaECA4dE54c815";
            readonly chainId: 42262;
            readonly decimals: 8;
            readonly website: "https://bridge.evodefi.com/";
            readonly description: "WBTC bridged via EvoDeFi: Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.";
            readonly tags: readonly ["SYNTHETIC"];
        };
    }>;
    readonly native: {
        readonly symbol: "ROSE";
        readonly oracleId: "ROSE";
    };
};
