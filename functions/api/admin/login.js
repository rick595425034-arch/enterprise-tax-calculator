const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let password;
  try {
    const body = await request.json();
    password = body.password || '';
  } catch {
    return json({ success: false, msg: '请求格式错误' }, 400);
  }

  const adminPassword = env.ADMIN_PASSWORD || 'admin';
  if (password !== adminPassword) {
    return json({ success: false, msg: '密码错误' }, 401);
  }

  return json({ success: true, token: btoa(password) });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
