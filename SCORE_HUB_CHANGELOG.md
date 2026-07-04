# Score Hub Update

Updated: 2026-07-04

## Summary

Management Platform TOP was redesigned as a store-aware manager score hub.

## Changed

- Redesigned the TOP page with a cleaner BASSA LINE-style operation layout.
- Added store selection UI.
- Store options are read from the Supabase Edge Function response when `stores` is returned.
- Added four app launch cards: 成果, 育成, 定着, 理念.
- Created the 理念浸透 app under `management-platform/culture/`.
- Added IDEA NOV BASIC and 2026 slogan images to the 理念浸透 app.
- Added sections for 360度アンケート関連 and マネジメントチェック関連.

## Score Items

### 成果

- 売上達成率
- 貢献生産性
- アプローチ率
- NPS
- 顧客満足度

### 育成

- 教育進捗率
- 新規リピート率
- リーダー輩出

### 定着

- 離職率
- 面談実施率
- eNPS

### 理念

- 挨拶
- 約束
- チームワーク
- 思いやり
- 報連相
- マネジメントチェック

## Current Data State

- Store select is ready, but requires the Edge Function to return `stores`.
- Score source is not finalized yet.
- The UI displays `-` when a score value is not returned.
- No Supabase DB schema, RLS, GRANT, UPDATE, DELETE, or service_role key changes were made.

## Public URL

https://ktomizawa-maker.github.io/manager-management-platform/management-platform/
