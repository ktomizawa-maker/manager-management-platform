const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  const url = new URL(req.url);
  const storeId = url.searchParams.get("store_id") || "unknown";

  // Read-only placeholder. Replace this block with an existing backend read call if needed.
  // Do not add DDL, UPDATE, DELETE, GRANT, RLS changes, or service_role exposure here.
  return Response.json(
    {
      storeId,
      storeName: storeId === "unknown" ? "店舗未選択" : `店舗 ${storeId}`,
      managerName: "店長",
      updatedAt: new Date().toISOString(),
      domains: {
        sales: {
          status: "watch",
          statusLabel: "要確認",
          nextAction: "予算比と前年差分を確認"
        },
        training: {
          status: "steady",
          statusLabel: "進行中",
          nextAction: "今週の育成対象者を1名決める"
        },
        retention: {
          status: "risk",
          statusLabel: "注意",
          nextAction: "シフト負荷と欠勤兆候を確認"
        },
        culture: {
          status: "steady",
          statusLabel: "習慣化",
          nextAction: "よい行動を1つ称賛する"
        }
      }
    },
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
