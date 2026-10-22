export type Network = "mainnet" | "testnet";
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
  testnet: {
    label: "Robinhood Testnet",
    l1Label: "Sepolia",
    l1Id: 11155111,
    l2Id: 46630,
    reporter: "0x36A0d2FFBb1322D7f000D09BA419B7F7b7295c20",
    feed: "0x265246C5b006C2bc7D19A482e7767FfFa8F2f0B2",
    reporterHash:
      "0xf1337deb200cbca50f6a762e1a3a77dad57dbb86d2627b06e3fd1f0d7534b2c8",
    feedHash:
      "0x18905e0f72fa66a097eef1d4f522b9a4e2be0ecfb088e02c1bf614d8d4de4ee3",
    l1Explorer: "https://sepolia.etherscan.io",
    l2Explorer: "https://explorer.testnet.chain.robinhood.com",
    sourceCommit: "c0317749ee7bf1f26833eecf7ef38ec8377d7a15",
  },
} as const;
export function isNetwork(value: unknown): value is Network {
  return value === "mainnet" || value === "testnet";
}
export const sourceUrl = "https://github.com/EqualFiLabs/statics-oracle";
export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
