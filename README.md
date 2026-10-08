# Solana AI 投研助手（AI × Solana）

Colosseum **Crypto World's Fair Hackathon** 参赛 MVP。

## 一句话

连接 Phantom 钱包或粘贴任意 Solana 地址 → 读取链上持仓（SOL 余额 + SPL 代币）→ 大语言模型（通义千问 qwen-plus）用**中文**生成一份「持仓概览 + 风险评估 + 建议」的投研报告。

## 为什么是 AI × Solana

- **Solana 优势**：亚秒级确认、极低手续费，使「每次钱包交互都触发一次 AI 分析」在成本上完全可行——这是高费低速链做不到的。
- **AI 价值**：链上数据对散户是天书。LLM 把 raw 余额/代币翻译成人话，降低 crypto 投研门槛，正是「把世界市场搬上链」里「人」的那一环。
- **金融垂直差异化**：不做通用 chatbot，做金融投研垂直场景，贴合 Solana 上日益增长的 DeFi / 支付生态。

## 本机运行

```bash
npm install
cp .env.example .env.local   # 填入 DASHSCOPE_API_KEY
npm run dev                  # 打开 http://localhost:3000
```

国内安装慢可加镜像：

```bash
npm install --registry https://registry.npmmirror.com
```

## 配置

- `DASHSCOPE_API_KEY`：通义千问 key（https://dashscope.console.aliyun.com ）。AI 调用走服务端 `/api/report`，**key 不暴露给浏览器**。
- `NEXT_PUBLIC_SOLANA_RPC_MAINNET` / `_DEVNET`：可选自定义 RPC。公共节点有限流，建议用 Helius 等免费节点提升演示稳定性。

## 演示建议

- 用 mainnet 上一个**公开知名地址**（如 Solana 基金会 / 某协议金库）展示，避免 devnet 空数据导致报告单薄。
- 录屏动线：连接钱包 / 粘贴地址 → 点「生成 AI 报告」→ 展示中文三段式报告。

## 技术栈

Next.js 14（App Router）· 纯 `fetch` 调 Solana JSON-RPC（零 web3.js 打包负担）· Phantom 注入式连接 · 通义千问 qwen-plus。

## 已知局限（诚实声明）

- 仅读取余额与 SPL 代币，未做交易历史 / 盈亏 PnL（后续可接 Helius / Dune）。
- 报告为 AI 生成，仅供参考，不构成投资建议。
- mainnet 公共 RPC 可能限流，演示建议自定义 RPC。
