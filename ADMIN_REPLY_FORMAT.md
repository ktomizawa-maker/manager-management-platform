# 管理者から返してもらう情報フォーマット

Supabase接続まで完了したら、以下の形で返してください。

```txt
WebアプリURL:
GitHub Actions URL:
Supabase Edge Function URL:
接続状態: Supabase
補足:
```

## 例

```txt
WebアプリURL: https://example-owner.github.io/example-repo/management-platform/
GitHub Actions URL: https://github.com/example-owner/example-repo/actions/runs/123456789
Supabase Edge Function URL: https://xxxxxxxx.supabase.co/functions/v1/manager-platform-summary
接続状態: Supabase
補足: Edge FunctionはサンプルJSONで初期公開済み
```

受領後、こちらで公開URLのHTTP 200、4領域表示、リンク先、Supabase接続表示、秘密情報露出なしを検証します。
