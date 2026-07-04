# 脇田社長 / 管理AI 宛: 店長Management Platform Web公開 + Supabase接続 指示書

## 目的

店長Management Platform TOPをGitHub PagesでWeb公開し、Supabase Edge Function `manager-platform-summary` に接続した状態でユーザーへURLを返す。

公開URL形式:

```txt
https://{owner}.github.io/{repo}/management-platform/
```

今回はSupabase接続まで行う。画面右上の接続表示が `Supabase` になることを目標にする。

## こちらから渡すもの

- `management-platform-webapp.zip`

このzipを既存HUBリポジトリのルートに展開してください。

展開後の主な配置:

```txt
management-platform/
.github/workflows/deploy-management-platform.yml
supabase/functions/manager-platform-summary/index.ts
DEPLOYMENT.md
ADMIN_REQUEST.md
SEND_TO_ADMIN.md
ADMIN_REPLY_FORMAT.md
PUBLICATION_VERIFY.md
tools/verify-public-url.mjs
```

## GitHub Pages公開

1. 既存HUBリポジトリのルートにzipの中身を展開する
2. GitHubで `Settings > Pages` を開く
3. `Build and deployment` の `Source` を `GitHub Actions` にする
4. `Settings > Secrets and variables > Actions` を開く
5. 下記のVariables / Secretsを設定する
6. `Actions` タブで `Deploy Management Platform` を手動実行、またはmainへpushして実行する
7. workflow成功後、公開URLを確認する

```txt
https://{owner}.github.io/{repo}/management-platform/
```

## GitHub Actionsに設定する値

Variables:

```txt
SUPABASE_URL=https://xxxxxxxx.supabase.co
EDGE_FUNCTION_NAME=manager-platform-summary
```

Secrets:

```txt
SUPABASE_ANON_KEY=xxxxxxxx
```

重要: `SUPABASE_ANON_KEY` はブラウザに配信される公開可能キーです。ただしRLSまたはEdge Function側の認可で守ってください。service_role keyは絶対に使わないでください。

## Supabase Edge Functionデプロイ

Edge Functionテンプレートは以下に同梱しています。

```txt
supabase/functions/manager-platform-summary/index.ts
```

Supabase CLIでデプロイしてください。

```bash
supabase functions deploy manager-platform-summary
```

初期テンプレートはDBに接続せず、read-onlyのサンプルJSONを返します。まずはこのテンプレートで接続確認して問題ありません。

## 接続確認

Edge Function URL:

```txt
https://xxxxxxxx.supabase.co/functions/v1/manager-platform-summary
```

期待する状態:

- GETでJSONが返る
- CORSエラーが出ない
- `domains.sales` `domains.training` `domains.retention` `domains.culture` が返る

Webアプリ側の期待する状態:

- `https://{owner}.github.io/{repo}/management-platform/` が開く
- 画面右上の接続表示が `Supabase` になる
- 4領域カードの状態と次アクションがEdge FunctionのJSONで上書きされる

## 既存DB連携する場合

既存DBを読む必要がある場合は、既存backendまたは許可済みread-only API経由に限定してください。

禁止:

- Supabase既存テーブルの変更
- 新規テーブル作成
- UPDATE / DELETE
- RLS変更
- GRANT変更
- service_role keyの使用、表示、フロント埋め込み
- Coreマスタ、社員、店舗、役職、職種、権限マスタの独自作成

## 共有禁止・使用禁止

以下は不要です。共有・設定しないでください。

- Supabase service_role key
- DBパスワード
- 個人GitHubパスワード
- Firebase秘密鍵

## 公開後に返してほしい情報

以下のフォーマットで返してください。

```txt
WebアプリURL:
GitHub Actions URL:
Supabase Edge Function URL:
接続状態: Supabase
補足:
```

## こちらで検証すること

WebアプリURL受領後、以下を検証します。

- URLがHTTP 200で開く
- 日本語が文字化けしていない
- `店長OS` と4領域カードが表示される
- `/sales/` `/training/` `/retention/` `/culture/` が404にならない
- 接続表示が `Supabase` として表示される
- ブラウザにservice_role key相当の秘密情報が配信されていない

自動確認コマンド:

```bash
node tools/verify-public-url.mjs https://{owner}.github.io/{repo}/management-platform/
```
