# 店長Management Platform TOP

既存HUBリポジトリの `/management-platform/` 配下へ配置する静的TOP/ハブ画面です。

## ファイル

- `index.html`: 店長OS TOP画面
- `styles.css`: レイアウトとUIスタイル
- `app.js`: `hub_context` の読み取り、更新日の表示、カード件数表示

## 配置

既存HUBリポジトリ内で以下の形になるよう配置します。

```txt
/management-platform/
  index.html
  styles.css
  app.js
```

GitHub Pagesでは `/management-platform/` にアクセスするとTOP画面が表示されます。

## 遷移先

初期実装では各カードのリンクを以下の相対パスにしています。既存の個別アプリが別パスの場合は、`index.html` の `href` だけを差し替えてください。

- 成果: `./sales/`
- 育成: `./training/`
- 定着: `./retention/`
- 理念浸透 / コンピテンシー / チームワーク: `./culture/`

## hub_context

`app.js` は次の順で表示コンテキストを読み取ります。

1. `window.hub_context`
2. `localStorage.hub_context`
3. フォールバック表示

読み取り専用です。DB更新、認証情報の保存、Supabaseへの直接接続は行いません。

## 初期実装で行っていないこと

- Supabase既存テーブルの変更
- 新規テーブル作成
- UPDATE / DELETE
- RLS変更
- GRANT変更
- service_role keyの使用、表示、フロント埋め込み
- Coreマスタ、社員、店舗、役職、職種、権限マスタの独自作成

将来データ連携する場合は、既存backendまたはEdge Functions経由でread-only summaryを取得する設計にしてください。

## 準備中ページ

リンク切れを避けるため、初期実装では `sales/`、`training/`、`retention/`、`culture/` に薄い準備中ページを置いています。既存の個別アプリがある場合は、TOPのカードリンクを既存パスへ変更するか、各ディレクトリ配下を既存アプリで置き換えてください。

## GitHub Pages + Supabase

Webアプリ化の配置、GitHub Actions、Supabase接続設定は、成果物ルートの `DEPLOYMENT.md` を参照してください。`config.js` はローカル用の静的フォールバック設定、`config.template.js` はGitHub Actionsで生成する本番設定のテンプレートです。
