import { arbitrum, arbitrumNitro, mainnet } from "~~/utils/scaffold-stylus/supportedChains";

// Token configurations for different networks
export const TOKEN_CONFIGS = {
  // Ethereum Mainnet
  [mainnet.id]: [
    {
      symbol: "ETH",
      decimals: 18,
      coingeckoId: "ethereum",
      address: "0x0000000000000000000000000000000000000000",
      type: "native" as const,
      network: "Ethereum",
    },
    {
      symbol: "USDC",
      decimals: 6,
      coingeckoId: "usd-coin",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      type: "erc20" as const,
      network: "Ethereum",
    },
    {
      symbol: "USDT",
      decimals: 6,
      coingeckoId: "tether",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      type: "erc20" as const,
      network: "Ethereum",
    },
    {
      symbol: "AAVE",
      decimals: 18,
      coingeckoId: "aave",
      address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      type: "erc20" as const,
      network: "Ethereum",
    },
    {
      symbol: "LINK",
      decimals: 18,
      coingeckoId: "chainlink",
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      type: "erc20" as const,
      network: "Ethereum",
    },
  ],

  // Arbitrum Mainnet
  [arbitrum.id]: [
    {
      symbol: "ETH",
      decimals: 18,
      coingeckoId: "ethereum",
      address: "0x0000000000000000000000000000000000000000",
      type: "native" as const,
      network: "Arbitrum",
    },
    {
      symbol: "USDC",
      decimals: 6,
      coingeckoId: "usd-coin",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      type: "erc20" as const,
      network: "Arbitrum",
    },
    {
      symbol: "AAVE",
      decimals: 18,
      coingeckoId: "aave",
      address: "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196",
      type: "erc20" as const,
      network: "Arbitrum",
    },
    {
      symbol: "LINK",
      decimals: 18,
      coingeckoId: "chainlink",
      address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      type: "erc20" as const,
      network: "Arbitrum",
    },
  ],

  // Local Arbitrum Nitro DevNode
  [arbitrumNitro.id]: [
    {
      symbol: "ETH",
      decimals: 18,
      coingeckoId: "ethereum",
      address: "0x0000000000000000000000000000000000000000",
      type: "native" as const,
      network: "Local Dev",
    },
  ],
} as const;
