// ===== ここにあなたの Xumm API キーを入れる =====
const XUMM_API_KEY = "bedbb175-1ab7-4fc8-a321-08d00ad4a1a5"; // ← 青い方の API Key をコピペ

// ===== Xumm SDK 初期化 =====
const xumm = new Xumm(XUMM_API_KEY);

// DOM が準備できてから動かす
window.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split("/").pop() || "index.html";
  console.log("現在のページ:", path);

  if (path === "index.html") {
    setupLoginPage();
  } else if (path === "home.html") {
    setupHomePage();
  }
});

// ---------------------------
// index.html 用の処理
// ---------------------------
function setupLoginPage() {
  const connectButton = document.getElementById("connectXaman");
  const statusEl = document.getElementById("status");
  const accountEl = document.getElementById("account");

  if (!connectButton || !statusEl || !accountEl) {
    console.warn("index.html の要素が見つかりません");
    return;
  }

  statusEl.textContent = "ボタンを押して Xaman でサインインできます。";

  // ボタン押したとき
  connectButton.addEventListener("click", () => {
    statusEl.textContent = "Xaman アプリでサインインを承認してください…";
    xumm.authorize(); // サインインリクエスト送信
  });

  // サインイン成功時
  xumm.on("success", async () => {
    statusEl.textContent = "✅ サインイン成功！アドレスを取得中…";

    try {
      const account = await xumm.user.account;
      console.log("取得したアドレス:", account);

      accountEl.textContent = "アドレス：" + account;
      statusEl.textContent = "接続完了！LikeMe ホームへ移動します…";

      // 0.8秒だけ見せてからホーム画面へ
      setTimeout(() => {
        const url = "home.html?account=" + encodeURIComponent(account);
        window.location.href = url;
      }, 800);
    } catch (err) {
      console.error(err);
      statusEl.textContent = "アドレス取得中にエラーが発生しました。";
    }
  });

  // 失敗・キャンセル
  xumm.on("error", (e) => {
    console.error("Xumm error:", e);
    statusEl.textContent = "サインインがキャンセルされたか、エラーが発生しました。";
  });
}

// ---------------------------
// home.html 用の処理
// ---------------------------
function setupHomePage() {
  const logoutBtn = document.getElementById("logoutBtn");
  const welcomeEl = document.getElementById("welcome-message");
  const accountEl = document.getElementById("account");

  if (!logoutBtn || !welcomeEl || !accountEl) {
    console.warn("home.html の要素が見つかりません");
    return;
  }

  // URL からアドレスを取得
  const params = new URLSearchParams(window.location.search);
  const account = params.get("account");

  if (account) {
    welcomeEl.textContent = `ようこそ、${account.substring(0, 6)}...${account.substring(account.length - 4)} さん！`;
    accountEl.textContent = `${account.substring(0, 10)}...`; // ヘッダーのアドレス表示
  } else {
    welcomeEl.textContent = "アドレスが取得できなかったので、再ログインしてください。";
    accountEl.textContent = "取得失敗";
  }

  logoutBtn.addEventListener("click", async () => {
    // Xaman SDKの接続情報をクリアする（重要）
    await xumm.logout();
    // ログインページに戻る
    window.location.href = "index.html"; 
  });
}
