import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // フォント読み込み最適化
  preload: true
});

export const metadata: Metadata = {
  title: "将棋ゲーム",
  description: "Next.js製将棋アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* FOUC防止 - インラインCSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* FOUC防止用の最小限スタイル */
              html {
                visibility: hidden;
              }
              html.hydrated {
                visibility: visible;
              }
              
              /* ローディング時の基本スタイル */
              body {
                margin: 0;
                font-family: system-ui, -apple-system, sans-serif;
                background-color: #f5f5f5;
                transition: opacity 0.3s ease;
              }
              
              /* コンテナの最小サイズ確保 */
              .min-h-screen {
                min-height: 100vh;
              }
              
              /* 将棋盤エリアの最小サイズ */
              [role="grid"] {
                min-width: 300px;
                min-height: 300px;
                background-color: #fef3c7;
              }
              
              /* スケルトンローディング風 */
              .loading-placeholder {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
              }
              
              @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Hydration完了検知スクリプト */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 即座に実行
                function showContent() {
                  document.documentElement.classList.add('hydrated');
                }
                
                // DOMContentLoaded後
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', showContent);
                } else {
                  showContent();
                }
                
                // フォールバック：確実に表示
                setTimeout(showContent, 50);
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
