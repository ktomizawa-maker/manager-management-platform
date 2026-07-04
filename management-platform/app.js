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

  function applyUpdatedDate(value) {
    var date = value ? new Date(value) : new Date();
    var formatter = new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      weekday: "short"
    });

    setText("updatedDate", formatter.format(date));
  }

  function applyConnectionState(label) {
    setText("connectionState", label);
  }

  function countPriorityCards() {
    var cards = document.querySelectorAll(".domain-card");
    setText("priorityCount", String(cards.length));
  }

  function normalizeDomains(summary) {
    if (!summary || !summary.domains) {
      return {};
    }
    return summary.domains;
  }

  function applyDomainSummary(summary) {
    var domains = normalizeDomains(summary);
    document.querySelectorAll(".domain-card[data-domain]").forEach(function (card) {
      var key = card.getAttribute("data-domain");
      var data = domains[key] || {};
      var status = data.status || card.getAttribute("data-status") || "steady";
      var statusLabel = data.statusLabel || data.label || fallbackDomainLabels[key] || "確認";
      var nextAction = data.nextAction || data.next_action;
      var statusElement = card.querySelector('[data-field="statusLabel"]');
      var actionElement = card.querySelector('[data-field="nextAction"]');

      card.setAttribute("data-status", status);
      if (statusElement) {
        statusElement.textContent = statusLabel;
      }
      if (actionElement && nextAction) {
        actionElement.textContent = nextAction;
      }
    });
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
    countPriorityCards();

    if (!isConfigured(config)) {
      applyConnectionState("静的");
      return;
    }

    applyConnectionState("接続中");
    fetchSummary(config, context)
      .then(function (summary) {
        applyContext(Object.assign({}, context, summary));
        applyUpdatedDate(summary.updatedAt || summary.updated_at);
        applyDomainSummary(summary);
        applyConnectionState("Supabase");
      })
      .catch(function () {
        applyConnectionState("静的");
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
