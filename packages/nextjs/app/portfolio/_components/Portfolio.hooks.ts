import { useEffect, useState, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { TOKEN_CONFIGS } from "./Portfolio.constants";
import { Address, erc20Abi, formatUnits } from "viem";
import { pricesUSDFromCoingecko } from "~~/utils/scaffold-eth";
import { isValidAddress } from "./Portfolio.utils";
import { getBalance, multicall, readContract } from "@wagmi/core";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

type BalanceResult = { balances: bigint[]; ms: number };
type TokenBalance = {
  address: Address;
  abi: typeof erc20Abi;
  functionName: "balanceOf";
  args: [Address];
};

const PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function usePortfolio() {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [walletAddress, setWalletAddress] = useState("");

  // Use connected address or custom address
  const activeAddress = walletAddress || connectedAddress || "";
  const selectedChainId = targetNetwork.id;

  const [isFetchingPortfolio, setIsFetchingPortfolio] = useState(false);
  const [isRunningComparison, setIsRunningComparison] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [pricesLastFetched, setPricesLastFetched] = useState<number>(0);

  // Method selection for table display (batched by default for better performance)
  const [selectedMethod, setSelectedMethod] = useState<"individual" | "batched">("batched");

  // data for storing user balances for each token
  // ms = milliseconds for counting performance
  const [individualRpcCalls, setIndividualRpcCalls] = useState<BalanceResult>();
  const [batchRpcCalls, setBatchRpcCalls] = useState<BalanceResult>();

  const tokenConfigs = useMemo(
    () => TOKEN_CONFIGS[selectedChainId as keyof typeof TOKEN_CONFIGS] || [],
    [selectedChainId],
  );

  // Separate native and ERC20 tokens for optimized processing
  const { nativeTokens, erc20Tokens, tokenIndexMap } = useMemo(() => {
    const nativeTokens = tokenConfigs.filter(t => t.type === "native");
    const erc20Tokens = tokenConfigs.filter(t => t.type === "erc20");
    const tokenIndexMap = new Map(tokenConfigs.map((token, index) => [token.address, index]));
    return { nativeTokens, erc20Tokens, tokenIndexMap };
  }, [tokenConfigs]);

  // Check if prices need to be fetched
  const shouldFetchPrices = useCallback(() => {
    return Object.keys(prices).length === 0 || Date.now() - pricesLastFetched > PRICE_CACHE_DURATION;
  }, [prices, pricesLastFetched]);

  const fetchIndividualBalances = useCallback(async (): Promise<BalanceResult> => {
    const t1 = performance.now();

    const balancePromises = tokenConfigs.map(async token => {
      if (token.type === "native") {
        return await getBalance(wagmiConfig, { address: activeAddress as Address })
          .then(result => result.value)
          .catch(() => 0n);
      } else {
        return await readContract(wagmiConfig, {
          address: token.address as Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [activeAddress as Address],
        }).catch(() => 0n);
      }
    });

    const balances = await Promise.all(balancePromises);

    const t2 = performance.now();
    return { balances, ms: t2 - t1 };
  }, [activeAddress, tokenConfigs]);

  const fetchBatchedBalances = useCallback(async (): Promise<BalanceResult> => {
    const t1 = performance.now();
    const balances: bigint[] = Array(tokenConfigs.length).fill(0n);

    const promises: Promise<any>[] = [];

    // Fetch native token balance
    if (nativeTokens.length > 0) {
      promises.push(
        getBalance(wagmiConfig, { address: activeAddress as Address })
          .then(result => ({ type: "native", result: result.value }))
          .catch(() => ({ type: "native", result: 0n, error: true })),
      );
    }

    // Fetch all ERC20 tokens in a single multicall
    if (erc20Tokens.length > 0) {
      const contracts: TokenBalance[] = erc20Tokens.map(t => ({
        address: t.address as Address,
        abi: erc20Abi,
        functionName: "balanceOf" as const,
        args: [activeAddress as Address],
      }));

      promises.push(
        multicall(wagmiConfig, { contracts })
          .then(results => ({ type: "erc20", results }))
          .catch(() => ({ type: "erc20", results: [], error: true })),
      );
    }

    // Execute in parallel and process results
    const results = await Promise.allSettled(promises);

    results.forEach(promiseResult => {
      if (promiseResult.status === "fulfilled") {
        const { value } = promiseResult;

        if (value.type === "native" && !value.error) {
          const nativeIndex = tokenConfigs.findIndex(t => t.type === "native");
          if (nativeIndex !== -1) {
            balances[nativeIndex] = value.result;
          }
        } else if (value.type === "erc20" && !value.error) {
          value.results.forEach((result: any, index: number) => {
            const token = erc20Tokens[index];
            const globalIndex = tokenIndexMap.get(token?.address);
            if (globalIndex !== undefined) {
              balances[globalIndex] = result?.status === "success" ? (result.result as bigint) : 0n;
            }
          });
        }
      }
    });

    const t2 = performance.now();
    return { balances, ms: t2 - t1 };
  }, [activeAddress, tokenConfigs, nativeTokens, erc20Tokens, tokenIndexMap]);

  const fetchPrices = useCallback(async () => {
    if (!shouldFetchPrices()) return;

    try {
      const cgkoPrices = await pricesUSDFromCoingecko(tokenConfigs.map(t => t.coingeckoId));
      setPrices(cgkoPrices);
      setPricesLastFetched(Date.now());
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  }, [tokenConfigs, shouldFetchPrices]);

  const triggerFetchPortfolio = useCallback(async () => {
    if (!isValidAddress(activeAddress)) return;
    setIsFetchingPortfolio(true);

    try {
      if (selectedMethod === "individual") {
        const [, result] = await Promise.all([fetchPrices(), fetchIndividualBalances()]);
        setIndividualRpcCalls(result);
        setBatchRpcCalls(undefined);
      } else {
        const [, result] = await Promise.all([fetchPrices(), fetchBatchedBalances()]);
        setBatchRpcCalls(result);
        setIndividualRpcCalls(undefined);
      }
    } finally {
      setIsFetchingPortfolio(false);
    }
  }, [activeAddress, selectedMethod, fetchPrices, fetchIndividualBalances, fetchBatchedBalances]);

  const runPerformanceComparison = useCallback(async () => {
    if (!isValidAddress(activeAddress)) return;
    setIsRunningComparison(true);

    try {
      const [, individualResult, batchedResult] = await Promise.all([
        fetchPrices(),
        fetchIndividualBalances(),
        fetchBatchedBalances(),
      ]);
      setIndividualRpcCalls(individualResult);
      setBatchRpcCalls(batchedResult);
    } finally {
      setIsRunningComparison(false);
    }
  }, [activeAddress, fetchPrices, fetchIndividualBalances, fetchBatchedBalances]);

  // Auto-refresh when network changes and we have a valid address
  useEffect(() => {
    if (isValidAddress(activeAddress) && tokenConfigs.length > 0) {
      triggerFetchPortfolio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChainId, activeAddress]); // Refresh when network or address changes

  // Calculate table rows with current data
  const tokenTableRows = useMemo(() => {
    const selectedBalances = selectedMethod === "batched" ? batchRpcCalls?.balances : individualRpcCalls?.balances;

    if (!selectedBalances) {
      return tokenConfigs.map(t => ({ ...t, formattedBalance: 0, price: 0, usdValue: 0 }));
    }

    return tokenConfigs.map((t, i) => {
      const raw = selectedBalances[i] ?? 0n;
      const formattedBalance = Number(formatUnits(raw, t.decimals));
      const price = prices[t.coingeckoId] ?? 0;
      return { ...t, formattedBalance, price, usdValue: formattedBalance * price };
    });
  }, [tokenConfigs, selectedMethod, batchRpcCalls?.balances, individualRpcCalls?.balances, prices]);

  return {
    tokenTableRows,

    tokenConfigs,
    isFetchingPortfolio,
    isRunningComparison,
    individualRpcCalls,
    batchRpcCalls,

    walletAddress: activeAddress,
    selectedChainId,
    targetNetwork,

    selectedMethod,
    setSelectedMethod,
    setWalletAddress,
    triggerFetchPortfolio,
    runPerformanceComparison,
  };
}
