// 客户端链上数据获取：纯 fetch 调 Solana JSON-RPC，不依赖 @solana/web3.js，避免 buffer 打包坑。

export const SOLANA_TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export function isValidSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}

async function rpcCall(rpc: string, method: string, params: any[]): Promise<any> {
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC 错误");
  return json.result;
}

export interface TokenHolding {
  mint: string;
  amount: number;
  rawAmount: string;
}

export interface ChainData {
  address: string;
  solBalance: number;
  tokens: TokenHolding[];
  rpc: string;
  chain: "mainnet" | "devnet";
}

export async function getChainData(
  address: string,
  rpc: string,
  chain: "mainnet" | "devnet"
): Promise<ChainData> {
  const bal = await rpcCall(rpc, "getBalance", [address, { commitment: "confirmed" }]);
  const solBalance = (bal.value || 0) / 1e9;

  const tokens: TokenHolding[] = [];
  try {
    const parsed = await rpcCall(rpc, "getParsedTokenAccountsByOwner", [
      address,
      { programId: SOLANA_TOKEN_PROGRAM },
      { encoding: "jsonParsed", commitment: "confirmed" },
    ]);
    for (const item of parsed.value || []) {
      const info = item?.account?.data?.parsed?.info;
      if (!info) continue;
      const mint = info.mint as string;
      const ta = info.tokenAmount || {};
      const ui =
        ta.uiAmount != null
          ? ta.uiAmount
          : Number(ta.amount || 0) / Math.pow(10, ta.decimals || 0);
      if (ui > 0) {
        tokens.push({ mint, amount: ui, rawAmount: String(ta.amount || 0) });
      }
    }
  } catch (e) {
    // 代币获取失败不影响余额展示
  }

  return { address, solBalance, tokens, rpc, chain };
}

export async function connectPhantom(): Promise<string> {
  const provider = (window as any).solana;
  if (!provider?.isPhantom) {
    throw new Error("未检测到 Phantom 钱包，请安装浏览器扩展后刷新页面");
  }
  const resp = await provider.connect();
  return resp.publicKey.toString();
}
