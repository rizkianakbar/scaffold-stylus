export function convertToUSD(number: number) {
  return number.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function getTokenIcon(symbol: string) {
  switch (symbol) {
    case "ETH":
      return "🔷";
    case "USDC":
      return "💵";
    case "LINK":
      return "🔗";
    default:
      return "🪙";
  }
}
