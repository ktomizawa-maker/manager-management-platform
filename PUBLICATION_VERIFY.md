# 公開後検証チェックリスト

WebアプリURLを受け取ったら、以下を確認してからユーザーへURLを渡す。

## 必須確認

- [ ] `https://{owner}.github.io/{repo}/management-platform/` がHTTP 200で開く
- [ ] 画面タイトルが `店長Management Platform` になっている
- [ ] H1に `店長OS` が表示される
- [ ] 4領域カードが表示される
  - [ ] 成果
  - [ ] 育成
  - [ ] 定着
  - [ ] 理念浸透 / コンピテンシー / チームワーク
- [ ] `/sales/` `/training/` `/retention/` `/culture/` が404にならない
- [ ] 接続ステータスが `Supabase` になっている
- [ ] ブラウザ表示で日本語が文字化けしていない
- [ ] ブラウザに `service_role` 相当の秘密情報が出ていない

## Supabase接続確認

Edge Function URL:

```txt
https://xxxxxxxx.supabase.co/functions/v1/manager-platform-summary
```

期待する状態:

- GETでJSONが返る
- CORSエラーが出ない
- `domains.sales` `domains.training` `domains.retention` `domains.culture` が返る
- Webアプリ右上の接続表示が `Supabase` になる

## 自動スモークテスト

```bash
node tools/verify-public-url.mjs https://{owner}.github.io/{repo}/management-platform/
```

このスクリプトはTOP、4領域リンク先、`app.js` のHTTP 200と主要文言、秘密情報らしき文字列の露出を確認する。

## 完了条件

上記の必須確認が通り、ユーザーへ実URLを渡せる状態になったら第一ゴール完了。
