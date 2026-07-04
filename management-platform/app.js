(function () {
  "use strict";

  var fallbackContext = { storeName: "店舗未選択" };
  var selectedStoreKey = "managerPlatformSelectedStoreId";

  var scoreAliases = {
    "sales.salesAchievement": ["sales.salesAchievement", "sales.sales_achievement", "sales.売上達成率", "成果.売上達成率", "売上達成率"],
    "sales.contributionProductivity": ["sales.contributionProductivity", "sales.contribution_productivity", "sales.貢献生産性", "成果.貢献生産性", "貢献生産性"],
    "sales.approachRate": ["sales.approachRate", "sales.approach_rate", "sales.アプローチ率", "成果.アプローチ率", "アプローチ率"],
    "sales.nps": ["sales.nps", "sales.NPS", "sales.Nps", "成果.NPS", "NPS"],
    "sales.customerSatisfaction": ["sales.customerSatisfaction", "sales.customer_satisfaction", "sales.顧客満足度", "成果.顧客満足度", "顧客満足度"],
    "training.educationProgress": ["training.educationProgress", "training.education_progress", "training.教育進捗率", "育成.教育進捗率", "教育進捗率"],
    "training.newRepeatRate": ["training.newRepeatRate", "training.new_repeat_rate", "training.新規リピート率", "育成.新規リピート率", "新規リピート率"],
    "training.leaderDevelopment": ["training.leaderDevelopment", "training.leader_development", "training.リーダー輩出", "育成.リーダー輩出", "リーダー輩出"],
    "retention.turnoverRate": ["retention.turnoverRate", "retention.turnover_rate", "retention.離職率", "定着.離職率", "離職率"],
    "retention.interviewRate": ["retention.interviewRate", "retention.interview_rate", "retention.面談実施率", "定着.面談実施率", "面談実施率"],
    "retention.enps": ["retention.enps", "retention.eNPS", "retention.ENPS", "定着.eNPS", "eNPS"],
    "culture.greeting": ["culture.greeting", "culture.挨拶", "理念.挨拶", "挨拶"],
    "culture.promise": ["culture.promise", "culture.約束", "理念.約束", "約束"],
    "culture.teamwork": ["culture.teamwork", "culture.チームワーク", "理念.チームワーク", "チームワーク"],
    "culture.consideration": ["culture.consideration", "culture.思いやり", "理念.思いやり", "思いやり"],
    "culture.reporting": ["culture.reporting", "culture.報連相", "理念.報連相", "報連相"],
    "culture.managementCheck": ["culture.managementCheck", "culture.management_check", "culture.マネジメントチェック", "理念.マネジメントチェック", "マネジメントチェック"]
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

  function formatDate(value) {
    if (!value) {
      return "-";
    }
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function getByPath(source, path) {
    return path.split(".").reduce(function (current, key) {
      if (current && Object.prototype.hasOwnProperty.call(current, key)) {
        return current[key];
      }
      return undefined;
    }, source);
  }

  function readScore(summary, scoreKey) {
    var aliases = scoreAliases[scoreKey] || [scoreKey];
    var sources = [summary && summary.scores, summary && summary.score, summary && summary.domains, summary];

    for (var i = 0; i < sources.length; i += 1) {
      var source = sources[i];
      if (!source) {
        continue;
      }
      for (var j = 0; j < aliases.length; j += 1) {
        var value = getByPath(source, aliases[j]);
        if (value !== undefined && value !== null && value !== "") {
          return value;
        }
      }
    }
    return null;
  }

  function formatScore(value) {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    if (typeof value === "number") {
      return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
    }
    if (typeof value === "object" && value.value !== undefined) {
      return formatScore(value.value);
    }
    return String(value);
  }

  function applyScoreState(element, value) {
    element.removeAttribute("data-trend");
    if (value === null || value === undefined || value === "") {
      element.setAttribute("data-state", "empty");
      return;
    }
    element.removeAttribute("data-state");
    if (typeof value === "object" && value.trend) {
      element.setAttribute("data-trend", value.trend);
    }
  }

  function applyScores(summary) {
    document.querySelectorAll("[data-score]").forEach(function (element) {
      var key = element.getAttribute("data-score");
      var value = readScore(summary, key);
      element.textContent = formatScore(value);
      applyScoreState(element, value);
    });
  }

  function normalizeStore(store) {
    if (!store || typeof store !== "object") {
      return null;
    }
    var id = store.id || store.store_id || store.storeId || store.code || store.store_code;
    var name = store.name || store.store_name || store.storeName || store.label || id;
    if (!id && !name) {
      return null;
    }
    return { id: String(id || name), name: String(name || id) };
  }

  function readStores(summary) {
    var candidates = [summary && summary.stores, summary && summary.storeOptions, summary && summary.store_options, summary && summary.app && summary.app.stores];
    for (var i = 0; i < candidates.length; i += 1) {
      if (Array.isArray(candidates[i])) {
        return candidates[i].map(normalizeStore).filter(Boolean);
      }
    }
    return [];
  }

  function getSelectedStoreId(context) {
    try {
      return window.localStorage.getItem(selectedStoreKey) || context.store_id || context.storeId || "";
    } catch (error) {
      return context.store_id || context.storeId || "";
    }
  }

  function setSelectedStoreId(value) {
    try {
      if (value) {
        window.localStorage.setItem(selectedStoreKey, value);
      } else {
        window.localStorage.removeItem(selectedStoreKey);
      }
    } catch (error) {}
  }

  function renderStores(stores, selectedStoreId) {
    var select = document.getElementById("storeSelect");
    if (!select) {
      return;
    }

    select.innerHTML = "";
    if (!stores.length) {
      var option = document.createElement("option");
      option.value = "";
      option.textContent = "店舗情報の返却待ち";
      select.appendChild(option);
      select.disabled = true;
      setText("storeHelp", "Supabaseには接続済みです。店舗一覧はEdge Functionのstores返却後に選択できます。");
      return;
    }

    stores.forEach(function (store) {
      var option = document.createElement("option");
      option.value = store.id;
      option.textContent = store.name;
      select.appendChild(option);
    });
    select.disabled = false;
    if (selectedStoreId && stores.some(function (store) { return store.id === selectedStoreId; })) {
      select.value = selectedStoreId;
    } else {
      select.value = stores[0].id;
      setSelectedStoreId(select.value);
    }
    setText("storeHelp", "Supabaseから取得した店舗でスコア表示を切り替えます。");
  }

  function buildSummaryUrl(config, context) {
    var baseUrl = config.supabaseUrl.replace(/\/$/, "");
    var functionName = config.edgeFunctionName || "manager-platform-summary";
    var url = new URL(baseUrl + "/functions/v1/" + functionName);
    var storeId = getSelectedStoreId(context);

    url.searchParams.set("include", "stores,scores");
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

  function refresh(config, context) {
    setText("connectionState", "接続中");
    return fetchSummary(config, context)
      .then(function (summary) {
        var stores = readStores(summary);
        renderStores(stores, getSelectedStoreId(context));
        applyScores(summary);
        setText("connectionState", "Supabase");
        setText("lastSyncedAt", formatDate(summary.generatedAt || summary.generated_at || summary.updatedAt || summary.updated_at));
      })
      .catch(function () {
        setText("connectionState", "静的");
        setText("lastSyncedAt", "取得失敗");
        renderStores([], "");
      });
  }

  function bindStoreSelect(config, context) {
    var select = document.getElementById("storeSelect");
    if (!select) {
      return;
    }
    select.addEventListener("change", function () {
      setSelectedStoreId(select.value);
      applyScores({});
      refresh(config, context);
    });
  }

  function boot() {
    var context = readHubContext();
    var config = readConfig();

    applyScores({});
    bindStoreSelect(config, context);

    if (!isConfigured(config)) {
      setText("connectionState", "静的");
      setText("lastSyncedAt", "-");
      renderStores([], "");
      return;
    }

    refresh(config, context);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
