# 自分のGitHubアカウントで公開する手順

## ゴール

自分のGitHubアカウントで店長Management PlatformをGitHub Pages公開し、Supabase Edge Functionまで接続する。

公開URLの形式:

```txt
https://{あなたのGitHubユーザー名}.github.io/{リポジトリ名}/management-platform/
```

## 1. GitHubで新規リポジトリを作る

おすすめリポジトリ名:

```txt
manager-management-platform
```

設定:

- Visibility: `Public` 推奨
- README: ありでもなしでもOK
- `.gitignore`: なしでOK
- License: なしでOK

作成後、リポジトリURLを控える。

例:

```txt
https://github.com/{あなたのGitHubユーザー名}/manager-management-platform
```

## 2. zipを展開してアップロードする

`management-platform-webapp.zip` を展開し、中身をリポジトリ直下にアップロードする。

直下にこう見えていればOK:

```txt
.github/workflows/deploy-management-platform.yml
management-platform/
supabase/
tools/
DEPLOYMENT.md
ADMIN_REQUEST.md
SEND_TO_ADMIN.md
ADMIN_REPLY_FORMAT.md
PUBLICATION_VERIFY.md
```

GitHub画面からアップロードする場合:

1. リポジトリを開く
2. `Add file` > `Upload files`
3. zipの中身をドラッグ&ドロップ
4. `Commit changes`

## 3. GitHub Pagesを有効化する

1. リポジトリの `Settings` を開く
2. 左メニューの `Pages` を開く
3. `Build and deployment` の `Source` を `GitHub Actions` にする

## 4. Supabase接続情報をGitHubに設定する

リポジトリの `Settings > Secrets and variables > Actions` を開く。

Variablesに追加:

```txt
SUPABASE_URL=https://xxxxxxxx.supabase.co
EDGE_FUNCTION_NAME=manager-platform-summary
```

Secretsに追加:

```txt
SUPABASE_ANON_KEY=xxxxxxxx
```

共有・設定しないもの:

- service_role key
- DBパスワード
- GitHubパスワード
- Firebase秘密鍵

## 5. GitHub Actionsを実行する

1. リポジトリの `Actions` を開く
2. `Deploy Management Platform` を選ぶ
3. `Run workflow` を押す
4. 成功するまで待つ

成功後のURL:

```txt
https://{あなたのGitHubユーザー名}.github.io/manager-management-platform/management-platform/
```

## 6. Supabase Edge Functionをデプロイする

Supabase側で以下のEdge Functionを作成・デプロイする。

```txt
supabase/functions/manager-platform-summary/index.ts
```

Supabase CLIを使える場合:

```bash
supabase functions deploy manager-platform-summary
```

CLIを使わない場合は、Supabase管理者または脇田社長にこのフォルダを渡してデプロイしてもらう。

## 7. 完了後にCodexへ渡すもの

以下をCodexに貼る。

```txt
WebアプリURL:
GitHub Actions URL:
Supabase Edge Function URL:
接続状態: Supabase
補足:
```

Codex側で公開状態を検証し、最終URLとして確認する。
