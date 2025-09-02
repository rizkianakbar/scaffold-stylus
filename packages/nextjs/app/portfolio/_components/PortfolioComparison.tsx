"use client";

import { JSX } from "react";
import { usePortfolio } from "./Portfolio.hooks";
import { isValidAddress } from "./Portfolio.utils";

export function PortfolioComparison(): JSX.Element {
  const {
    walletAddress,
    tokenConfigs,

    individualRpcCalls,
    batchRpcCalls,

    isFetchingPortfolio,
    isRunningComparison,

    runPerformanceComparison,
  } = usePortfolio();

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Performance Comparison</h2>
        <button
          className="btn btn-outline btn-secondary"
          disabled={!isValidAddress(walletAddress) || isFetchingPortfolio || isRunningComparison}
          onClick={runPerformanceComparison}
        >
          {isRunningComparison ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Running comparison...
            </>
          ) : (
            "Run Comparison"
          )}
        </button>
      </div>

      {individualRpcCalls || batchRpcCalls ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-gradient-to-r shadow-lg stats from-primary/10 to-primary/5">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title">Individual Calls</div>
                <div className="text-white stat-value">
                  {individualRpcCalls ? `${individualRpcCalls.ms.toFixed(0)}ms` : "—"}
                </div>
                <div className="stat-desc">RPC calls = {tokenConfigs.length} (parallel, 1 per token)</div>
              </div>
            </div>

            <div className="bg-gradient-to-r shadow-lg stats from-secondary/10 to-secondary/5">
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title">Multicall (Batched)</div>
                <div className="text-white stat-value">{batchRpcCalls ? `${batchRpcCalls.ms.toFixed(0)}ms` : "—"}</div>
                <div className="stat-desc">
                  RPC calls = {tokenConfigs.filter(t => t.type !== "native").length > 0 ? "2" : "1"} (1 ETH + 1
                  multicall)
                </div>
              </div>
            </div>
          </div>

          {individualRpcCalls && batchRpcCalls && (
            <div className="p-4 mt-4 rounded-2xl bg-base-200">
              <div className="text-center">
                <span className="text-sm text-base-content/70">
                  Batched calls are{" "}
                  <strong className={individualRpcCalls.ms > batchRpcCalls.ms ? "text-success" : "text-error"}>
                    {individualRpcCalls.ms > batchRpcCalls.ms
                      ? `${(individualRpcCalls.ms / batchRpcCalls.ms).toFixed(1)}x faster`
                      : `${(batchRpcCalls.ms / individualRpcCalls.ms).toFixed(1)}x slower`}
                  </strong>{" "}
                  than individual calls
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-base-200">
          <p className="text-base-content/70">
            Click &quot;Run Comparison&quot; to test both fetching methods and see performance metrics
          </p>
        </div>
      )}
    </div>
  );
}
