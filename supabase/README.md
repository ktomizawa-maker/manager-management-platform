# Supabase Edge Function Template

`manager-platform-summary` は店長Management Platform TOPが読むread-only summary endpointのテンプレートです。

## 役割

- GitHub Pages上の静的WebアプリからGETで呼び出される
- 4領域の状態ラベルと次アクションを返す
- 初期状態ではDBへ接続せず、固定のサンプルJSONを返す

## 禁止事項

このテンプレートには以下を入れないでください。

- service_role keyのフロント露出
- DDL
- UPDATE / DELETE
- RLS変更
- GRANT変更
- 独自マスタ作成

既存DBを読む必要がある場合は、既存backendのread-only APIを呼ぶ、または既存の許可済みRPC/ビューを読む形にしてください。
