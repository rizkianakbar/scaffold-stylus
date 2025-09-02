import type { JSX } from "react";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { Portfolio } from "./_components/Portfolio";

export const metadata = getMetadata({
  title: "Portfolio Dashboard",
  description: "Efficiently read from multiple contracts with real-time performance comparison",
});

export default function PortfolioPage(): JSX.Element {
  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Portfolio Dashboard</h1>
        <p className="mt-2 text-base-content/70">
          Efficiently read from multiple contracts with real-time performance comparison
        </p>
      </div>
      <Portfolio />
    </div>
  );
}
