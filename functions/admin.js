const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>授权码管理后台</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,"PingFang SC",sans-serif;background:#f0f3f8;color:#1a2236;font-size:14px}
.login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh}
.login-card{background:#fff;border-radius:16px;padding:40px;width:340px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.login-card h1{font-size:20px;font-weight:700;margin-bottom:8px}
.login-card p{color:#6b7a99;margin-bottom:28px;font-size:13px}
.login-card input{width:100%;border:1.5px solid #dde3f0;border-radius:10px;padding:11px 14px;font-size:15px;outline:none;transition:.2s}
.login-card input:focus{border-color:#3b6ef8}
.login-card button{width:100%;margin-top:16px;background:#3b6ef8;color:#fff;border:none;border-radius:10px;padding:13px;font-size:15px;font-weight:600;cursor:pointer;transition:.2s}
.login-card button:hover{background:#2a5de0}
.err-msg{color:#e53e3e;font-size:13px;margin-top:10px;text-align:center;min-height:18px}
.app{display:none;min-height:100vh}
.header{background:#fff;border-bottom:1px solid #e8ecf4;padding:0 32px;height:56px;display:flex;align-items:center;justify-content:space-between}
.header h1{font-size:16px;font-weight:700}
.header button{background:none;border:1.5px solid #dde3f0;border-radius:8px;padding:6px 16px;cursor:pointer;font-size:13px;color:#6b7a99;transition:.2s}
.header button:hover{border-color:#3b6ef8;color:#3b6ef8}
.main{padding:28px 32px;max-width:1100px;margin:0 auto}
.card{background:#fff;border-radius:14px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.05);margin-bottom:24px}
.card h2{font-size:15px;font-weight:700;margin-bottom:18px;color:#1a2236}
.gen-row{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap}
.field{display:flex;flex-direction:column;gap:6px}
.field label{font-size:12px;color:#6b7a99;font-weight:500}
.field select,.field input{border:1.5px solid #dde3f0;border-radius:9px;padding:9px 12px;font-size:14px;outline:none;background:#fff;transition:.2s}
.field select:focus,.field input:focus{border-color:#3b6ef8}
.gen-btn{background:#3b6ef8;color:#fff;border:none;border-radius:9px;padding:10px 24px;font-size:14px;font-weight:600;cursor:pointer;transition:.2s;white-space:nowrap}
.gen-btn:hover{background:#2a5de0}
.gen-result{margin-top:14px;display:none}
.key-box{display:inline-flex;align-items:center;gap:10px;background:#f0f4ff;border:1.5px solid #c7d7fd;border-radius:10px;padding:10px 16px}
.key-text{font-size:18px;font-weight:700;letter-spacing:2px;color:#2a5de0;font-family:monospace}
.copy-btn{background:#3b6ef8;color:#fff;border:none;border-radius:7px;padding:5px 12px;font-size:12px;cursor:pointer;transition:.2s}
.copy-btn:hover{background:#2a5de0}
.copy-btn.copied{background:#38a169}
.table-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.table-header h2{font-size:15px;font-weight:700}
.total-badge{font-size:12px;color:#6b7a99;background:#f0f3f8;padding:3px 10px;border-radius:20px}
.refresh-btn{background:none;border:1.5px solid #dde3f0;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;color:#6b7a99;transition:.2s}
.refresh-btn:hover{border-color:#3b6ef8;color:#3b6ef8}
.filter-tabs{display:flex;gap:6px;margin-bottom:16px}
.filter-tab{border:1.5px solid #dde3f0;background:#fff;border-radius:20px;padding:5px 16px;cursor:pointer;font-size:13px;color:#6b7a99;transition:.2s}
.filter-tab:hover{border-color:#3b6ef8;color:#3b6ef8}
.filter-tab.active{background:#3b6ef8;border-color:#3b6ef8;color:#fff}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:10px 14px;font-size:12px;color:#6b7a99;font-weight:600;border-bottom:1.5px solid #e8ecf4;white-space:nowrap}
td{padding:12px 14px;font-size:13px;border-bottom:1px solid #f0f3f8;vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:#fafbff}
.key-cell{font-family:monospace;font-weight:700;letter-spacing:1px;color:#1a2236;font-size:14px}
.type-badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;background:#eef2ff;color:#3b6ef8}
.status-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
.status-valid{background:#ecfdf5;color:#22863a}
.status-expired{background:#fff5f5;color:#e53e3e}
.status-inactive{background:#f7f8fa;color:#8896b3}
.pagination{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:20px}
.page-btn{border:1.5px solid #dde3f0;background:#fff;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;transition:.2s}
.page-btn:hover:not(:disabled){border-color:#3b6ef8;color:#3b6ef8}
.page-btn:disabled{opacity:.4;cursor:default}
.page-info{font-size:13px;color:#6b7a99;padding:0 8px}
.empty{text-align:center;padding:48px;color:#8896b3}
.loading{text-align:center;padding:48px;color:#8896b3}
</style>
</head>
<body>
<div class="login-wrap" id="loginWrap">
  <div class="login-card">
    <h1>管理后台</h1>
    <p>企业税务计算器 · 授权码管理</p>
    <input type="password" id="pwdInput" placeholder="请输入管理密码" onkeydown="if(event.key==='Enter')doLogin()">
    <button onclick="doLogin()">登录</button>
    <div class="err-msg" id="loginErr"></div>
  </div>
</div>
<div class="app" id="app">
  <div class="header">
    <h1>授权码管理后台</h1>
    <button onclick="doLogout()">退出登录</button>
  </div>
  <div class="main">
    <div class="card">
      <h2>生成授权码</h2>
      <div class="gen-row">
        <div class="field">
          <label>授权类型</label>
          <select id="genType">
            <option value="test">测试（1分钟）</option>
            <option value="day">24小时</option>
            <option value="month" selected>1个月</option>
            <option value="quarter">季度（3个月）</option>
            <option value="year">1年</option>
            <option value="lifetime">永久</option>
          </select>
        </div>
        <div class="field">
          <label>自定义授权码（可选）</label>
          <input type="text" id="genKey" placeholder="留空则自动生成" style="width:220px">
        </div>
        <button class="gen-btn" onclick="doGenerate()">生成授权码</button>
      </div>
      <div class="gen-result" id="genResult">
        <div class="key-box">
          <span class="key-text" id="genKeyText"></span>
          <button class="copy-btn" id="copyBtn" onclick="copyKey()">复制</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="table-header">
        <div style="display:flex;align-items:center;gap:12px">
          <h2>授权码列表</h2>
          <span class="total-badge" id="totalBadge">共 0 个</span>
        </div>
        <button class="refresh-btn" onclick="loadKeys()">刷新</button>
      </div>
      <div class="filter-tabs">
        <button class="filter-tab" onclick="setFilter('')">全部</button>
        <button class="filter-tab active" onclick="setFilter('有效')">有效</button>
        <button class="filter-tab" onclick="setFilter('已过期')">已过期</button>
        <button class="filter-tab" onclick="setFilter('未激活')">未激活</button>
      </div>
      <div id="tableWrap"><div class="loading">加载中...</div></div>
      <div class="pagination" id="pagination"></div>
    </div>
  </div>
</div>
<script>
const TOKEN_KEY = 'admin_token';
let currentPage = 1;
let currentStatus = '有效';
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setFilter(status) {
  currentStatus = status;
  currentPage = 1;
  document.querySelectorAll('.filter-tab').forEach(t => {
    t.classList.toggle('active', t.textContent === (status || '全部'));
  });
  loadKeys(1);
}
async function doLogin() {
  const pwd = document.getElementById('pwdInput').value;
  const err = document.getElementById('loginErr');
  if (!pwd) { err.textContent = '请输入密码'; return; }
  err.textContent = '';
  try {
    const res = await fetch('/api/admin/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({password: pwd}) });
    const d = await res.json();
    if (d.success) { localStorage.setItem(TOKEN_KEY, d.token); showApp(); }
    else { err.textContent = d.msg || '登录失败'; }
  } catch { err.textContent = '网络错误，请重试'; }
}
function doLogout() {
  localStorage.removeItem(TOKEN_KEY);
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginWrap').style.display = 'flex';
  document.getElementById('pwdInput').value = '';
}
function showApp() {
  document.getElementById('loginWrap').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  loadKeys();
}
async function doGenerate() {
  const type = document.getElementById('genType').value;
  const key = document.getElementById('genKey').value.trim();
  const btn = document.querySelector('.gen-btn');
  btn.textContent = '生成中...'; btn.disabled = true;
  try {
    const res = await fetch('/api/admin/keys', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+getToken()}, body: JSON.stringify({type, key}) });
    const d = await res.json();
    if (d.success) {
      document.getElementById('genKeyText').textContent = d.key;
      document.getElementById('genResult').style.display = 'block';
      document.getElementById('copyBtn').textContent = '复制';
      document.getElementById('copyBtn').className = 'copy-btn';
      document.getElementById('genKey').value = '';
      loadKeys();
    } else { alert(d.msg || '生成失败'); }
  } catch { alert('网络错误，请重试'); }
  btn.textContent = '生成授权码'; btn.disabled = false;
}
function copyKey() {
  navigator.clipboard.writeText(document.getElementById('genKeyText').textContent).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = '已复制'; btn.className = 'copy-btn copied';
    setTimeout(() => { btn.textContent = '复制'; btn.className = 'copy-btn'; }, 2000);
  });
}
async function loadKeys(page) {
  if (page) currentPage = page;
  const wrap = document.getElementById('tableWrap');
  wrap.innerHTML = '<div class="loading">加载中...</div>';
  try {
    const qs = '/api/admin/keys?page=' + currentPage + (currentStatus ? '&status=' + encodeURIComponent(currentStatus) : '');
    const res = await fetch(qs, { headers: {'Authorization':'Bearer '+getToken()} });
    if (res.status === 401) { doLogout(); return; }
    const d = await res.json();
    if (!d.success) { wrap.innerHTML = '<div class="empty">加载失败</div>'; return; }
    document.getElementById('totalBadge').textContent = '共 ' + d.total + ' 个';
    renderTable(d.items);
    renderPagination(d.page, d.totalPages);
  } catch { wrap.innerHTML = '<div class="empty">网络错误，请刷新重试</div>'; }
}
function fmtDate(iso) {
  if (!iso || iso === '-') return '-';
  if (iso === 'lifetime') return '永久';
  const d = new Date(iso);
  const p = n => String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
}
function renderTable(items) {
  const wrap = document.getElementById('tableWrap');
  if (!items.length) { wrap.innerHTML = '<div class="empty">暂无授权码</div>'; return; }
  const rows = items.map(item => {
    const sc = item.status==='有效'?'status-valid':item.status==='已过期'?'status-expired':'status-inactive';
    return \`<tr><td><span class="key-cell">\${item.key}</span></td><td><span class="type-badge">\${item.type}</span></td><td>\${fmtDate(item.createdAt)}</td><td>\${fmtDate(item.activatedAt)}</td><td>\${fmtDate(item.expires)}</td><td><span class="status-badge \${sc}">\${item.status}</span></td></tr>\`;
  }).join('');
  wrap.innerHTML = '<table><thead><tr><th>授权码</th><th>类型</th><th>生成时间</th><th>激活时间</th><th>过期时间</th><th>状态</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
function renderPagination(page, total) {
  const el = document.getElementById('pagination');
  if (total <= 1) { el.innerHTML = ''; return; }
  el.innerHTML = \`<button class="page-btn" onclick="loadKeys(\${page-1})" \${page<=1?'disabled':''}>上一页</button><span class="page-info">第 \${page} / \${total} 页</span><button class="page-btn" onclick="loadKeys(\${page+1})" \${page>=total?'disabled':''}>下一页</button>\`;
}
if (getToken()) showApp();
</script>
</body>
</html>`;

export async function onRequest() {
  return new Response(HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
