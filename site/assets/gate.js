/* Staging password gate. Remove this file and its <script> tags before launch. */
(function () {
  var HASH = "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";
  var KEY = "ct-staging-auth";
  var d = document, root = d.documentElement;

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  if (saved() === HASH) return;

  root.classList.add("gated");
  var css = d.createElement("style");
  css.textContent =
    "html.gated body>*:not(#ct-gate){display:none!important}" +
    "html.gated,html.gated body{overflow:hidden;background:#000}" +
    "#ct-gate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:#000;color:#dedcd0;font:400 16px/1.5 Inter,'Helvetica Neue',Arial,system-ui,sans-serif}" +
    "#ct-gate form{width:100%;max-width:380px;background:#161616;border-radius:20px;padding:36px 28px}" +
    "#ct-gate img{height:16px;width:auto;margin-bottom:28px}" +
    "#ct-gate h1{margin:0 0 6px;font-size:26px;line-height:1.15;letter-spacing:-.02em;font-weight:500;color:#dedcd0}" +
    "#ct-gate p{margin:0 0 24px;color:#929a92;font-size:15px}" +
    "#ct-gate input{width:100%;height:48px;padding:0 16px;border-radius:12px;border:1.5px solid rgba(146,154,146,.35);background:#000;color:#fff;font:inherit;outline:none}" +
    "#ct-gate input:focus{border-color:#f2b0cd}" +
    "#ct-gate button{width:100%;height:48px;margin-top:12px;border:0;border-radius:12px;background:#f2b0cd;color:#000;font:600 15px/1 inherit;font-family:inherit;cursor:pointer}" +
    "#ct-gate .err{min-height:20px;margin:10px 0 0;font-size:14px;color:#f2b0cd}";
  (d.head || root).appendChild(css);

  function sha256(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }

  function mount() {
    var wrap = d.createElement("div");
    wrap.id = "ct-gate";
    wrap.innerHTML =
      '<form autocomplete="off">' +
      '<img src="/assets/wordmark-white.svg" alt="colorteam">' +
      "<h1>Studio staging</h1>" +
      "<p>This preview is private. Enter the password to continue.</p>" +
      '<input type="password" aria-label="Password" placeholder="Password" required autofocus>' +
      '<button type="submit">Enter</button>' +
      '<div class="err" role="alert"></div>' +
      "</form>";
    d.body.appendChild(wrap);
    var form = wrap.querySelector("form"), input = wrap.querySelector("input"), err = wrap.querySelector(".err");
    input.focus();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sha256(input.value).then(function (h) {
        if (h === HASH) {
          save(HASH);
          root.classList.remove("gated");
          wrap.remove();
        } else {
          err.textContent = "That password isn't right.";
          input.value = "";
          input.focus();
        }
      });
    });
  }

  if (d.body) mount(); else d.addEventListener("DOMContentLoaded", mount);
})();
