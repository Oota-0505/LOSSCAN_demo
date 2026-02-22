# LOSSCAN デモサイト

顧客ヘルス・マネジメントSaaS「LOSSCAN」のランディングページ（LP）デモです。

## サービス概要

LOSSCANは、すでに一定数の来店実績がある店舗を対象に、来店周期・継続傾向をAIで学習し、**「来なくなりそうな顧客」** だけを自動で抽出・可視化するサービスです。新規集客ではなく、既存顧客の継続率改善に特化しています。

- **想定ターゲット**: 美容室・整体院・パーソナルジム・スクールなど、来店／予約履歴が蓄積されている店舗
- **提供価値**: 感覚に依存していたフォロー判断を、データに基づく優先順位のある行動に変える

## 技術スタック

- **HTML5** / **CSS3** / **JavaScript**（バニラ）
- [Swiper](https://swiperjs.com/)（ヒーローセクションのスライダー）
- Google Fonts（Inter, Noto Sans JP）

## ディレクトリ構成

```
demo/
├── README.md
├── index.html          # トップページ
├── privacy.html        # プライバシーポリシー
├── terms.html          # 利用規約
├── tokushoho.html      # 特商法表記
├── css/
│   └── style.css       # メインスタイル
├── js/
│   └── main.js         # スライダー・パララックス・ナビ・アコーディオン等
├── images/             # 画像・ファビコン・ロゴ
│   ├── favicon.svg
│   ├── logo.svg
│   ├── kv-slide-*.png  # ヒーロー背景
│   ├── problem-center.png
│   ├── reason-*.png
│   ├── voice-*.png
│   └── voice-bg.png
├── all.tex             # LP仕様書（参考）
└── etc.tex
```

## 閲覧方法

静的サイトのため、以下のいずれかで閲覧できます。

1. **直接開く**: `index.html` をブラウザで開く
2. **ローカルサーバー**: 例）`npx serve .` や VS Code の Live Server などで `demo` フォルダをルートに指定

## 主なページ・セクション

| ページ | 内容 |
|--------|------|
| トップ (index.html) | ヒーロー / PROBLEM / REASON / VOICE / SERVICE / PLAN / FAQ / COMPANY / CONTACT |
| privacy.html | プライバシーポリシー |
| terms.html | 利用規約 |
| tokushoho.html | 特定商取引法に基づく表記 |

## ライセンス・問い合わせ

本リポジトリの利用条件はプロジェクト方針に従います。サービスに関するお問い合わせはサイト内の CONTACT からご連絡ください。
