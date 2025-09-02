"use client";

import type { JSX } from "react";
import { PortfolioTable } from "./PortfolioTable";
import { usePortfolio } from "./Portfolio.hooks";
import { isValidAddress } from "./Portfolio.utils";
import { PortfolioComparison } from "./PortfolioComparison";

export function Portfolio(): JSX.Element {
  const {
    tokenTableRows,

    tokenConfigs,
    isFetchingPortfolio,
    isRunningComparison,
    individualRpcCalls,
    batchRpcCalls,

    walletAddress,
    selectedChainId,
    targetNetwork,

    selectedMethod,
    setSelectedMethod,
    setWalletAddress,
    triggerFetchPortfolio,
  } = usePortfolio();

  return (
    <>
      {/* Network Info */}
      <div className="p-4 mb-6 rounded-2xl bg-base-200">
        <div className="flex gap-2 items-center text-sm">
          <div className="w-2 h-2 rounded-full animate-pulse bg-success"></div>
          <span>
            Connected to: {targetNetwork.name} (Chain ID: {selectedChainId})
          </span>
          <div className="ml-auto text-xs text-base-content/60">Network controlled by wallet connection</div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 mb-8 lg:grid-cols-3">
        <div>
          <label className="block mb-2 text-sm font-medium">Wallet Address</label>
          <input
            type="text"
            className="w-full input input-bordered"
            placeholder="0x... wallet address"
            value={walletAddress}
            onChange={e => setWalletAddress(e.target.value)}
          />
          <div className="mt-2 text-xs text-base-content/60">Enter any address or use your connected wallet</div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Fetch Method</label>
          <select
            className="w-full select select-bordered"
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value as "individual" | "batched")}
          >
            <option value="batched">Batched Calls (Recommended)</option>
            <option value="individual">Individual Calls</option>
          </select>
          <div className="mt-2 text-xs text-base-content/60">Choose how to fetch token balances</div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Actions</label>
          <button
            className="w-full btn btn-primary"
            disabled={!isValidAddress(walletAddress) || isFetchingPortfolio || isRunningComparison}
            onClick={triggerFetchPortfolio}
          >
            {isFetchingPortfolio ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Loading {selectedMethod}...
              </>
            ) : (
              `Fetch using ${selectedMethod === "individual" ? "Individual" : "Batched"}`
            )}
          </button>
          <div className="mt-2 text-xs text-base-content/60">
            Fast fetch using selected method ({tokenConfigs.length} tokens)
          </div>
        </div>
      </div>

      {/* Current Table Method */}
      <div className="p-4 mb-6 rounded-2xl bg-base-200">
        <div className="flex gap-2 items-center text-sm">
          <div
            className={`w-2 h-2 rounded-full ${selectedMethod === "individual" ? "bg-primary" : "bg-secondary"}`}
          ></div>
          <span>
            Table showing data from:{" "}
            <strong>{selectedMethod === "individual" ? "Individual Calls" : "Batched Calls"}</strong>
            {selectedMethod === "individual" && !individualRpcCalls && " (no data - click fetch)"}
            {selectedMethod === "batched" && !batchRpcCalls && " (no data - click fetch)"}
            {selectedMethod === "individual" && individualRpcCalls && ` (${individualRpcCalls.ms.toFixed(0)}ms)`}
            {selectedMethod === "batched" && batchRpcCalls && ` (${batchRpcCalls.ms.toFixed(0)}ms)`}
          </span>
          <div className="ml-auto text-xs text-base-content/60">
            {selectedMethod === "individual" && individualRpcCalls
              ? "Individual data loaded"
              : selectedMethod === "batched" && batchRpcCalls
                ? "Batched data loaded"
                : "No data for selected method"}
          </div>
        </div>
      </div>

      {tokenConfigs.length > 0 ? (
        <>
          <PortfolioTable tableRows={tokenTableRows} />

          <PortfolioComparison />
        </>
      ) : (
        <div className="shadow-xl card bg-base-100">
          <div className="text-center card-body">
            <h2 className="justify-center card-title">No Tokens Configured</h2>
            <p className="text-base-content/70">No token configurations found for {targetNetwork.name}.</p>
            <p className="text-sm text-base-content/60">
              Switch to a supported network using the wallet connection above.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
