// ===== ここにあなたの Xumm API キーを入れる =====
const XUMM_API_KEY = "bedbb175-1ab7-4fc8-a321-08d00ad4a1a5"; // ← 青い方の API Key をコピペ

// DOM が準備できてから動かす
window.addEventListener("DOMContentLoaded", () => {
  // どのページを開いているか判定
  const path = location.pathname.split("/").pop() || "index.html";
  console.log("現在のページ:", path);

  // ページごとに必要な処理を呼び出す
  if (path === "index.html") {
    setupLoginPage();
  } else if (path === "home.html") {
    setupHomePage();
  } else if (path === "profile.html") {
    setupProfilePage();
  } else if (path === "features.html") {
    setupFeaturesPage();
  }
});

// ===== ログインページ (index.html) 用の処理 =====
function setupLoginPage() {
  const xumm = new Xumm(XUMM_API_KEY);
  const connectButton = document.getElementById("connectXaman");
  const statusEl = document.getElementById("status");
  const accountEl = document.getElementById("account");

  statusEl.textContent = "ボタンを押して Xaman でサインインできます。";

  connectButton.addEventListener("click", () => {
    statusEl.textContent = "Xaman アプリでサインインを承認してください…";
    xumm.authorize(); // サインインリクエスト送信
  });

  xumm.on("success", async () => {
    statusEl.textContent = "✅ サインイン成功！アドレスを取得中…";
    try {
      const account = await xumm.user.account;
      accountEl.textContent = "アドレス：" + account;
      statusEl.textContent = "接続完了！LikeMe ホームへ移動します…";

      setTimeout(() => {
        const url = "home.html?account=" + encodeURIComponent(account);
        window.location.href = url;
      }, 800);
    } catch (err) {
      statusEl.textContent = "アドレス取得中にエラーが発生しました。";
    }
  });

  xumm.on("error", (e) => {
    statusEl.textContent = "サインインがキャンセルされたか、エラーが発生しました。";
  });
}

// ===== 内部ページ (home, profile, features) 共通の処理 =====
function setupInternalPage(pageName) {
  const params = new URLSearchParams(window.location.search);
  const account = params.get("account");
  const accountQuery = account ? "?account=" + encodeURIComponent(account) : "";

  // 接続中アドレスの表示
  const addrEl = document.getElementById("connectedAddress");
  if (account) {
    addrEl.textContent = account.substring(0, 10) + "...";
  } else {
    addrEl.textContent = "未接続";
  }

  // ログアウトボタンの処理
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      const xumm = new Xumm(XUMM_API_KEY);
      try { await xumm.logout(); } catch (e) { console.warn(e); }
      window.location.href = "index.html";
    });
  }

  // 各ページ内のリンクにアカウント情報を引き継ぐ
  if (pageName === 'home') {
    document.getElementById("demoLink").href = "profile.html" + accountQuery;
    document.getElementById("moreLink").href = "features.html" + accountQuery;
  } else if (pageName === 'profile') {
    document.getElementById("backHome").href = "home.html" + accountQuery;
  } else if (pageName === 'features') {
    document.getElementById("backHome").href = "home.html" + accountQuery;
    document.getElementById("ctaProfileLink").href = "profile.html" + accountQuery;
  }
}

// 各ページ用の呼び出し関数
function setupHomePage() { setupInternalPage('home'); }
function setupProfilePage() { setupInternalPage('profile'); }
function setupFeaturesPage() { setupInternalPage('features'); }
