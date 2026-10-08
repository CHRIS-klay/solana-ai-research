# Colosseum Crypto World's Fair — Submission

**Project**: Solana AI 投研助手 (Solana On-chain AI Research Assistant)

## The problem
普通用户看到 Solana 钱包地址和一堆 base58 哈希、代币符号，根本读不懂自己的资产结构，更别说风险。链上数据虽公开，但「可读化 + 可解释」的最后一公里缺失——散户有数据，没有认知。

## Our solution
一个 Web 应用：连接 Phantom 或粘贴地址 → 实时读取链上持仓 → 调用 LLM 生成**中文**投研报告（持仓概览 / 风险评估 / 建议）。让散户 10 秒内看懂自己的链上资产，把「链上透明度」真正变成「用户知情权」。

## Why AI × Solana
Solana 的极低成本与高吞吐，让「每次钱包交互 = 一次 AI 推理」在经济上成立；而 AI 负责把 raw on-chain 数据翻译成人话。二者互补：Solana 提供可信、实时的数据层，AI 提供理解层。没有 Solana 的廉价高并发，这类「交互即分析」的产品在成本上跑不通。

## Demo steps
1. 打开应用，点「连接 Phantom 钱包」（或粘贴一个公开知名地址）。
2. 选 Mainnet，点「生成 AI 报告」。
3. 展示：SOL 余额 + 代币种类 → 中文三段式报告（概览 / 风险 / 建议）。

## Tech
Next.js 14 · Solana JSON-RPC · Phantom · Qwen-plus (DashScope)。零重依赖，可基于 AI 工具在极短时间内迭代出可运行 MVP。

## Why we should win
- **真实可用 MVP**，非 PPT：从钱包到中文报告端到端跑通。
- **金融垂直场景**：贴合 Solana 上 DeFi / 支付生态的未来，而非又一个通用 chatbot。
- **极简、可扩展**：纯 fetch + 服务端 AI 路由，后续可无缝接 Helius / Dune 做盈亏、交易行为分析。

## 后续路线（若有投资）
- 接入 Helius / Dune 做交易历史、PnL、盈亏曲线。
- 支持 AI 自然语言追问（「我最大的风险敞口在哪？」）。
- 钱包连接后一键生成可分享的 PDF 报告，面向华人 crypto 散户做增长。
