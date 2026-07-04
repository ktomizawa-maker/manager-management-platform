# Supabase Store Contract

Updated: 2026-07-04

The TOP page now supports store selection from the Supabase Edge Function response.
No DB changes are required from the frontend side.

## Endpoint

`GET /functions/v1/manager-platform-summary?include=stores,scores`

When a store is selected, the frontend calls:

`GET /functions/v1/manager-platform-summary?include=stores,scores&store_id={store_id}`

## Expected Store Response

Return one of the following arrays in the JSON response:

```json
{
  "stores": [
    { "id": "store_001", "name": "BASSA 所沢店" },
    { "id": "store_002", "name": "BASSA 国分寺店" }
  ]
}
```

The frontend also accepts these alternative keys:

- `store_id` / `storeId`
- `store_name` / `storeName`
- `label`
- `storeOptions`
- `store_options`
- `app.stores`

## Expected Score Response

The score source can be finalized later. The frontend already accepts nested score values under:

- `scores`
- `score`
- `domains`
- root JSON

Example:

```json
{
  "generatedAt": "2026-07-04T07:00:00.000Z",
  "stores": [
    { "id": "store_001", "name": "BASSA 所沢店" }
  ],
  "scores": {
    "sales": {
      "salesAchievement": "92%",
      "contributionProductivity": "¥8,400",
      "approachRate": "64%",
      "nps": 38,
      "customerSatisfaction": "4.6"
    },
    "training": {
      "educationProgress": "71%",
      "newRepeatRate": "42%",
      "leaderDevelopment": 2
    },
    "retention": {
      "turnoverRate": "3.1%",
      "interviewRate": "88%",
      "enps": 21
    },
    "culture": {
      "greeting": "A",
      "promise": "B",
      "teamwork": "A",
      "consideration": "A",
      "reporting": "B",
      "managementCheck": "80%"
    }
  }
}
```

## Current Frontend Behavior

- If `stores` is returned, the select box becomes active.
- If `stores` is not returned, it displays `店舗情報の返却待ち`.
- If a score is missing, the UI displays `-`.
- No `service_role` key is used on the frontend.
