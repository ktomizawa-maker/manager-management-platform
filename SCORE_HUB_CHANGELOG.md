# Score Hub Update

Updated: 2026-07-04

## Summary

Management Platform TOP was simplified into a manager score hub.

## Changed

- Removed the previous hero/status/action-heavy layout.
- Kept the page focused on app links and score visibility.
- Added score rows for the four evaluation domains.
- Kept BASSA LINE-style tone: white base, subtle borders, small typography, no heavy decoration.

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

- Score source is not finalized yet.
- The UI currently displays `-` when a score value is not returned.
- `app.js` is prepared to receive score values from the Supabase Edge Function response.
- No Supabase DB schema, RLS, GRANT, UPDATE, DELETE, or service_role key changes were made.

## Public URL

https://ktomizawa-maker.github.io/manager-management-platform/management-platform/
