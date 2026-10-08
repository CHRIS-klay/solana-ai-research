import { NextRequest, NextResponse } from "next/server";

interface TokenHolding {
  mint: string;
  amount: number;
}
interface ChainData {
  address: string;
  solBalance: number;
  tokens: TokenHolding[];
  chain: string;
}

export async function POST(req: NextRequest) {
  try {
    const data: ChainData = await req.json();
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "服务端未配置 DASHSCOPE_API_KEY，请在 .env.local 填写你的通义千问 key" },
        { status: 500 }
      );
    }
    const prompt = buildPrompt(data);
    const report = await callQwen(apiKey, prompt);
    return NextResponse.json({ report });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "生成失败" }, { status: 500 });
  }
}

function buildPrompt(d: ChainData): string {
  const tokenLines = d.tokens.length
    ? d.tokens
        .map((t) => `- 代币 mint ${t.mint.slice(0, 6)}…${t.mint.slice(-4)} 数量 ${t.amount}`)
        .join("\n")
    : "- 无 SPL 代币持仓";
  return `你是一名严谨的中文 crypto 投研分析师。请基于以下 Solana ${d.chain} 链上钱包数据，用简体中文为持有者生成一份「持仓概览与风险报告」。

钱包地址：${d.address}
SOL 余额：${d.solBalance} SOL
代币持仓：
${tokenLines}

报告要求（请分三段，使用 Markdown 小标题）：
### 一、持仓概览
用通俗语言说明该钱包的资产结构（SOL 占比、是否高度集中、是否有多样化代币）。

### 二、风险评估
指出可能的风险点：例如资产高度集中、空投 / scam 代币特征、链上行为异常等。若数据有限，请说明局限性。

### 三、给持有者的建议
给出 2-4 条务实、可执行的建议（如分散、警惕未知代币、关注手续费等）。不要鼓励盲目交易或承诺收益。

语气专业、克制、对散户友好。控制在 400 字以内。`;
}

async function callQwen(apiKey: string, prompt: string): Promise<string> {
  const url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "qwen-plus",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 800,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("通义千问调用失败：" + res.status + " " + t.slice(0, 200));
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content || "（模型未返回内容）";
}
