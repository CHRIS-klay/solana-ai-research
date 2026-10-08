"use client";

import { useState, useEffect } from "react";
import {
  getChainData,
  connectPhantom,
  isValidSolanaAddress,
  ChainData,
} from "@/lib/solana";

const RPC_MAINNET =
  process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET ||
  "https://api.mainnet-beta.solana.com";
const RPC_DEVNET =
  process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET || "https://api.devnet.solana.com";

export default function Page() {
  const [input, setInput] = useState("");
  const [wallet, setWallet] = useState("");
  const [chain, setChain] = useState<"mainnet" | "devnet">("mainnet");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chainData, setChainData] = useState<ChainData | null>(null);
  const [report, setReport] = useState("");
  const [hasPhantom, setHasPhantom] = useState(false);

  useEffect(() => {
    setHasPhantom(!!(window as any).solana?.isPhantom);
  }, []);

  async function handleConnect() {
    try {
      const addr = await connectPhantom();
      setWallet(addr);
      setInput(addr);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }

  function activeAddress() {
    const a = wallet && input === wallet ? wallet : input;
    return a.trim();
  }

  async function handleAnalyze() {
    const addr = activeAddress();
    if (!isValidSolanaAddress(addr)) {
      setError("地址格式不正确，请检查 Solana 地址（base58，32-44 位）");
      return;
    }
    setLoading(true);
    setError("");
    setReport("");
    setChainData(null);
    try {
      const rpc = chain === "mainnet" ? RPC_MAINNET : RPC_DEVNET;
      const data = await getChainData(addr, rpc, chain);
      setChainData(data);
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "生成失败");
      setReport(json.report);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <div className="hero">
        <div className="logo">AI × SOLANA</div>
        <h1>Solana AI 投研助手</h1>
        <div className="sub">
          连接 Phantom 钱包或输入地址，AI 用中文为你生成链上持仓概览与风险报告。
          <br />
          金融视角 × 链上数据 × 大语言模型。
        </div>
      </div>

      <div className="card">
        <div className="row">
          {hasPhantom ? (
            <button className="ghost" onClick={handleConnect}>
              {wallet ? "已连接 ✓ 重新连接" : "连接 Phantom 钱包"}
            </button>
          ) : (
            <button
              className="ghost"
              onClick={() =>
                window.open("https://phantom.app/", "_blank")
              }
            >
              安装 Phantom
            </button>
          )}
          <input
            type="text"
            placeholder="粘贴 Solana 钱包地址，或连接钱包自动填入"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <div className="seg">
            <button
              className={chain === "mainnet" ? "on" : ""}
              onClick={() => setChain("mainnet")}
            >
              Mainnet
            </button>
            <button
              className={chain === "devnet" ? "on" : ""}
              onClick={() => setChain("devnet")}
            >
              Devnet
            </button>
          </div>
          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "分析中…" : "生成 AI 报告"}
          </button>
        </div>
        {!hasPhantom && (
          <div className="note">
            提示：未检测到 Phantom 扩展，可直接粘贴任意 Solana 地址进行分析（钱包连接仅用于一键填入地址）。
          </div>
        )}
      </div>

      {error && (
        <div className="card" style={{ borderColor: "var(--danger)" }}>
          <span style={{ color: "var(--danger)" }}>⚠️ {error}</span>
        </div>
      )}

      {loading && (
        <div className="card muted">
          <span className="spin" />
          正在读取链上数据并调用大模型生成报告…
        </div>
      )}

      {chainData && !loading && (
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>链上数据快照</strong>
            <span className="badge">{chainData.chain}</span>
          </div>
          <div className="kv">
            <span>钱包地址</span>
            <span style={{ color: "var(--text)", fontWeight: 400, fontSize: 12 }}>
              {chainData.address.slice(0, 8)}…{chainData.address.slice(-6)}
            </span>
          </div>
          <div className="kv">
            <span>SOL 余额</span>
            <span>{chainData.solBalance.toFixed(4)} SOL</span>
          </div>
          <div className="kv">
            <span>SPL 代币种类</span>
            <span>{chainData.tokens.length} 种</span>
          </div>
        </div>
      )}

      {report && !loading && (
        <div className="card report">{renderReport(report)}</div>
      )}
    </div>
  );
}

function renderReport(md: string) {
  const lines = md.split("\n");
  const out: any[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={"ul" + out.length}>
          {list.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  lines.forEach((ln, i) => {
    const s = ln.trim();
    if (s.startsWith("### ")) {
      flush();
      out.push(<h3 key={i}>{s.slice(4)}</h3>);
    } else if (s.startsWith("- ")) {
      list.push(s.slice(2));
    } else if (s === "") {
      flush();
    } else {
      flush();
      out.push(<p key={i}>{s}</p>);
    }
  });
  flush();
  return out;
}
