export type Network = "mainnet";
export const networks = {
  mainnet: {
    label: "Robinhood Mainnet",
    l1Label: "Ethereum",
    l1Id: 1,
    l2Id: 4663,
    reporter: "0x30adfaef118acaa415d73a20d55dc7a8cd3381b4",
    feed: "0xece3f60de85705472292a44787123a8fc46cda54",
    reporterHash:
      "0x371b67f81457f3967cd1fc39009e7462b8b9b0aa117955940c6180740ddd2ea8",
    feedHash:
      "0x7768b4390fd3a9d6d83c9e8aaa20d4063bf1438f48b296623ab20258dd5fe653",
    l1Explorer: "https://etherscan.io",
    l2Explorer: "https://robinhoodchain.blockscout.com",
    sourceCommit: "4fabe1a8518ea12a26d0f61c31339b00bbd1487a",
  },
} as const;
export function isNetwork(value: unknown): value is Network {
  return value === "mainnet";
}
export const sourceUrl = "https://github.com/EqualFiLabs/statics-oracle";
export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
