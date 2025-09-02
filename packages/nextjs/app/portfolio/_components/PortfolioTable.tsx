import React, { type JSX } from "react";
import { TOKEN_CONFIGS } from "./Portfolio.constants";
import { convertToUSD, getTokenIcon } from "./Portfolio.utils";

type PortfolioTableProps = {
  tableRows: ((typeof TOKEN_CONFIGS)[keyof typeof TOKEN_CONFIGS][number] & {
    formattedBalance: number;
    usdValue: number;
    price: number;
  })[];
};

export function PortfolioTable({ tableRows }: PortfolioTableProps): JSX.Element {
  const total = tableRows.reduce((s: number, r: any) => s + r.usdValue, 0);

  return (
    <div className="shadow-xl card bg-base-100">
      <div className="card-body">
        <h2 className="mb-6 card-title">Token Balances</h2>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Token</th>
                <th>Network</th>
                <th>Balance</th>
                <th>Price</th>
                <th>USD Value</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(row => (
                <tr key={`${row.network}-${row.symbol}`} className="hover">
                  <td>
                    <div className="flex gap-3 items-center">
                      <div className="text-2xl">{getTokenIcon(row.symbol)}</div>
                      <div>
                        <div className="font-bold">{row.symbol}</div>
                        <div className="text-sm text-base-content/70">{row.network}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-outline">{row.network}</div>
                  </td>
                  <td>
                    <div className="font-semibold">
                      {row.formattedBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                  </td>
                  <td>
                    <span className="font-medium">{convertToUSD(row.price)}</span>
                  </td>
                  <td>
                    <span className="font-semibold text-success">{convertToUSD(row.usdValue)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Portfolio Total */}
        <div className="mt-6 shadow stats stats-horizontal">
          <div className="stat">
            <div className="stat-figure text-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20m9-9H3"></path>
              </svg>
            </div>
            <div className="stat-title">Total Portfolio Value</div>
            <div className="stat-value text-success">{convertToUSD(total)}</div>
            <div className="stat-desc">Across {tableRows.length} tokens</div>
          </div>
        </div>
      </div>
    </div>
  );
}
