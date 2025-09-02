/**
 * Fetch cryptocurrency prices from CoinGecko API
 */

/**
 * Fetches USD prices for multiple cryptocurrency IDs from CoinGecko
 * @param ids Array of CoinGecko cryptocurrency IDs
 * @returns Promise<Record<string, number>> Object mapping IDs to USD prices
 */
export const pricesUSDFromCoingecko = async (ids: string[]): Promise<Record<string, number>> => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
    Array.from(new Set(ids)).join(","),
  )}&vs_currencies=usd`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as Record<string, { usd: number }>;
    return Object.fromEntries(ids.map(id => [id, data?.[id]?.usd ?? 0]));
  } catch (error) {
    console.error("Error fetching prices from CoinGecko:", error);
    return Object.fromEntries(ids.map(id => [id, 0]));
  }
};
