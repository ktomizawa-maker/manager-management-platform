# 実装メモ

## 画面の役割

この画面は評価制度そのものを管理するものではなく、店長が日々の現在地、課題、改善アクションを確認するためのハブです。

## 4領域

- 成果: 店舗成果の現在地と差分要因確認
- 育成: スタッフ成長テーマ、面談、習熟状況の確認
- 定着: 勤怠、負荷、コンディション、離職兆候の早期確認
- 理念浸透 / コンピテンシー / チームワーク: 行動基準、連携、称賛の習慣化

## 将来のread-only連携案

実装する場合はフロントからSupabaseへ直接接続せず、既存backendまたはEdge Functionsに次のようなread-only endpointを置く想定です。

```txt
GET /management-platform/summary?store_id={store_id}
```

レスポンス例:

```json
{
  "storeName": "店舗名",
  "managerName": "店長名",
  "updatedAt": "2026-07-04T00:00:00+09:00",
  "domains": {
    "sales": { "status": "watch", "summary": "予算比を確認" },
    "training": { "status": "steady", "summary": "面談予定あり" },
    "retention": { "status": "risk", "summary": "負荷偏りを確認" },
    "culture": { "status": "steady", "summary": "称賛行動を記録" }
  }
}
```

この案は設計メモのみです。今回のファイルにはDB接続処理を入れていません。
