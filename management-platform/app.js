(function () {
  "use strict";

  var fallbackContext = {
    storeName: "店舗未選択",
    managerName: "店長"
  };

  var fallbackDomainLabels = {
    sales: "要確認",
    training: "進行中",
    retention: "注意",
    culture: "習慣化"
  };

  function readHubContext() {
    if (window.hub_context && typeof window.hub_context === "object") {
      return window.hub_context;
    }

    try {
      var storedContext = window.localStorage.getItem("hub_context");
      return storedContext ? JSON.parse(storedContext) : {};
    } catch (error) {
      return {};
    }
  }

  function readConfig() {
    return window.managementPlatformConfig || {};
  }

  function isConfigured(config) {
    return Boolean(
      config.enableSupabase &&
        config.supabaseUrl &&
        config.supabaseAnonKey &&
        config.supabaseUrl.indexOf("__") !== 0 &&
        config.supabaseAnonKey.indexOf("__") !== 0
    );
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function applyContext(context) {
    var storeName = context.store_name || context.storeName || fallbackContext.storeName;
    var managerName = context.manager_name || context.managerName || context.displayName || fallbackContext.managerName;

    setText("storeName", storeName);
    setText("managerName", managerName);
  }

  function formatDate(value, options) {
    var date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      date = new Date();
    }
    return new Intl.DateTimeFormat("ja-JP", options).format(date);
  }

  function applyUpdatedDate(value) {
    setText("updatedDate", formatDate(value, { month: "numeric", day: "numeric", weekday: "short" }));
  }

  function applyLastSynced(value) {
    if (!value) {
      setText("lastSyncedAt", "未同期");
      return;
    }
    setText("lastSyncedAt", formatDate(value, { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }));
  }

  function applyConnectionState(label) {
    setText("connectionState", label);
    setText("reviewState", label === "Supabase" ? "確認可能" : "要接続確認");
  }

  function countPriorityCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.domain-card[data-status="risk"], .domain-card[data-status="watch"]'));
    setText("priorityCount", String(cards.length || document.querySelectorAll(".domain-card").length));
  }

  function normalizeDomains(summary) {
    if (!summary || !summary.domains) {
      return {};
    }
    return summary.domains;
  }

  function decorateStatusLabel(status, label) {
    var text = label || "確認";
    if (text.indexOf("⚠️") === 0 || text.indexOf("✓") === 0) {
      return text;
    }
    if (status === "risk" || status === "watch") {
      return "⚠️ " + text;
    }
    return "✓ " + text;
  }

  function pickSummaryText(data) {
    return data.summary || data.description || data.message || data.currentState || data.current_state;
  }

  function applyDomainSummary(summary) {
    var domains = normalizeDomains(summary);
    document.querySelectorAll(".domain-card[data-domain]").forEach(function (card) {
      var key = card.getAttribute("data-domain");
      var data = domains[key] || {};
      var status = data.status || card.getAttribute("data-status") || "steady";
      var statusLabel = data.statusLabel || data.status_label || data.label || fallbackDomainLabels[key] || "確認";
      var nextAction = data.nextAction || data.next_action || data.action;
      var summaryText = pickSummaryText(data);
      var statusElement = card.querySelector('[data-field="statusLabel"]');
      var actionElement = card.querySelector('[data-field="nextAction"]');
      var summaryElement = card.querySelector('[data-field="domainSummary"]');

      card.setAttribute("data-status", status);
      if (statusElement) {
        statusElement.textContent = decorateStatusLabel(status, statusLabel);
      }
      if (actionElement && nextAction) {
        actionElement.textContent = nextAction;
      }
      if (summaryElement && summaryText) {
        summaryElement.textContent = summaryText;
      }
    });
    countPriorityCards();
  }

  function applySummaryMeta(summary) {
    var source = summary.source || (summary.app && summary.app.source) || "supabase-edge";
    var generatedAt = summary.generatedAt || summary.generated_at || summary.updatedAt || summary.updated_at;
    var connection = (summary.app && summary.app.connection) || summary.connection || "Supabase";

    setText("summarySource", source);
    applyLastSynced(generatedAt);
    applyConnectionState(connection === "Supabase" ? "Supabase" : "Supabase");
  }

  function buildSummaryUrl(config, context) {
    var baseUrl = config.supabaseUrl.replace(/\/$/, "");
    var functionName = config.edgeFunctionName || "manager-platform-summary";
    var url = new URL(baseUrl + "/functions/v1/" + functionName);
    var storeId = context.store_id || context.storeId;

    if (storeId) {
      url.searchParams.set("store_id", storeId);
    }
    return url.toString();
  }

  function fetchSummary(config, context) {
    var controller = new AbortController();
    var timeout = window.setTimeout(function () {
      controller.abort();
    }, config.requestTimeoutMs || 6000);

    return fetch(buildSummaryUrl(config, context), {
      method: "GET",
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: "Bearer " + config.supabaseAnonKey,
        Accept: "application/json"
      },
      signal: controller.signal
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Summary request failed: " + response.status);
        }
        return response.json();
      })
      .finally(function () {
        window.clearTimeout(timeout);
      });
  }

  function boot() {
    var context = readHubContext();
    var config = readConfig();

    applyContext(context);
    applyUpdatedDate();
    applyLastSynced();
    countPriorityCards();

    if (!isConfigured(config)) {
      applyConnectionState("静的");
      setText("summarySource", "静的表示");
      return;
    }

    applyConnectionState("接続中");
    setText("summarySource", "取得中");
    fetchSummary(config, context)
      .then(function (summary) {
        applyContext(Object.assign({}, context, summary));
        applyUpdatedDate(summary.updatedAt || summary.updated_at || summary.generatedAt || summary.generated_at);
        applyDomainSummary(summary);
        applySummaryMeta(summary);
      })
      .catch(function () {
        applyConnectionState("静的");
        setText("summarySource", "取得失敗");
        applyLastSynced();
      });
  }

  /*
   * Read-only integration:
   * - GitHub Pages serves this static app.
   * - Supabase is accessed through an Edge Function with anon credentials only.
   * - No service_role key, DDL, RLS, GRANT, UPDATE, or DELETE behavior belongs here.
   */
  document.addEventListener("DOMContentLoaded", boot);
})();

