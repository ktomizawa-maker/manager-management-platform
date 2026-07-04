# GitHub Pages + Supabase Webアプリ化手順

## ゴール

店長Management Platform TOPをGitHub Pagesで公開し、以下形式のURLを作る。

```txt
https://{owner}.github.io/{repo}/management-platform/
```

まずはSupabase未接続の静的表示でも公開URLを作る。Supabase連携は後追い可能。

## 1. 配置

`management-platform-webapp.zip` の中身を既存HUBリポジトリのルートへ展開する。

```txt
management-platform/
.github/workflows/deploy-management-platform.yml
supabase/functions/manager-platform-summary/index.ts
tools/verify-public-url.mjs
```

## 2. GitHub Pages設定

1. `Settings > Pages` を開く
2. `Build and deployment` の `Source` を `GitHub Actions` にする
3. `Actions` タブで `Deploy Management Platform` を実行する
4. 成功後、`https://{owner}.github.io/{repo}/management-platform/` を開く

Supabase未設定の場合、画面右上の接続表示は `静的`。これは初期公開として正常。

## 3. Supabase接続を有効化する場合

GitHubリポジトリで以下を設定する。

Variables:

```txt
SUPABASE_URL=https://xxxxxxxx.supabase.co
EDGE_FUNCTION_NAME=manager-platform-summary
```

Secrets:

```txt
SUPABASE_ANON_KEY=xxxxxxxx
```

`SUPABASE_ANON_KEY` はブラウザに配信されるため、必ずRLSまたはEdge Function側の認可で守る。service_role keyは絶対に使わない。

## 4. Supabase Edge Function

同梱テンプレート:

```txt
supabase/functions/manager-platform-summary/index.ts
```

デプロイ例:

```bash
supabase functions deploy manager-platform-summary
```

初期テンプレートはDBに接続せず、read-onlyのサンプルJSONを返す。既存DBを読む必要がある場合は、既存backendまたは許可済みread-only API経由に限定する。

## 5. 禁止事項

- Supabase既存テーブルの変更
- 新規テーブル作成
- UPDATE / DELETE
- RLS変更
- GRANT変更
- service_role keyの使用、表示、フロント埋め込み
- Coreマスタ、社員、店舗、役職、職種、権限マスタの独自作成

## 6. 公開後検証

```bash
node tools/verify-public-url.mjs https://{owner}.github.io/{repo}/management-platform/
```

確認項目:

- HTTP 200
- `店長OS` と4領域カード表示
- 4領域リンクが404でない
- 秘密情報らしき文字列が配信されていない
