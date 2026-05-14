const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const TYPE_LABELS = {
  test: '测试(1分钟)', day: '24小时', month: '1个月',
  quarter: '季度(3个月)', year: '1年', lifetime: '永久',
};

function verifyToken(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  try { return atob(token) === (env.ADMIN_PASSWORD || 'admin'); } catch { return false; }
}

function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) key += '-';
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestGet({ request, env }) {
  if (!verifyToken(request, env)) return json({ success: false, msg: '未授权' }, 401);

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const statusFilter = url.searchParams.get('status') || '';
  const limit = 15;

  // Fetch all key names
  let allKeys = [];
  let cursor;
  do {
    const result = await env.LICENSE_KEYS.list({ limit: 1000, cursor });
    allKeys = allKeys.concat(result.keys);
    cursor = result.list_complete ? undefined : result.cursor;
  } while (cursor);

  // Fetch all values in parallel
  const values = await Promise.all(allKeys.map(k => env.LICENSE_KEYS.get(k.name)));

  const items = allKeys.map((k, i) => {
    let data = {};
    try { data = JSON.parse(values[i]); } catch {}
    const now = new Date();
    let status = '未激活';
    if (data.activatedAt) {
      if (data.expires !== 'lifetime' && data.expires && new Date(data.expires) < now) {
        status = '已过期';
      } else {
        status = '有效';
      }
    }
    return {
      key: k.name,
      type: TYPE_LABELS[data.type] || data.type || '-',
      createdAt: data.createdAt || '-',
      activatedAt: data.activatedAt || '-',
      expires: data.expires || '-',
      status,
    };
  }).sort((a, b) => {
    if (a.createdAt === '-') return 1;
    if (b.createdAt === '-') return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filtered = statusFilter ? items.filter(i => i.status === statusFilter) : items;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  return json({ success: true, items: pageItems, total, totalPages, page });
}

export async function onRequestPost({ request, env }) {
  if (!verifyToken(request, env)) return json({ success: false, msg: '未授权' }, 401);

  let type, customKey;
  try {
    const body = await request.json();
    type = body.type || 'month';
    customKey = (body.key || '').trim().toUpperCase();
  } catch {
    return json({ success: false, msg: '请求格式错误' }, 400);
  }

  const validTypes = ['test', 'day', 'month', 'quarter', 'year', 'lifetime'];
  if (!validTypes.includes(type)) return json({ success: false, msg: '类型无效' }, 400);

  const key = customKey || generateKey();
  const existing = await env.LICENSE_KEYS.get(key);
  if (existing) return json({ success: false, msg: '授权码已存在，请换一个' }, 409);

  await env.LICENSE_KEYS.put(key, JSON.stringify({ type, createdAt: new Date().toISOString() }));
  return json({ success: true, key });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
