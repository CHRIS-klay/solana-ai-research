import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solana AI 投研助手",
  description: "连接 Phantom 钱包，AI 用中文生成链上持仓与风险报告",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
