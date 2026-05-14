const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DURATIONS = {
  test:     60 * 1000,
  day:      24 * 60 * 60 * 1000,
  month:    30 * 24 * 60 * 60 * 1000,
  quarter:  90 * 24 * 60 * 60 * 1000,
  year:     365 * 24 * 60 * 60 * 1000,
  lifetime: null
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let key, deviceId, activate;
  try {
    const body = await request.json();
    key = (body.key || '').trim().toUpperCase();
    deviceId = (body.deviceId || '').trim();
    activate = body.activate === true; // 主动输入授权码才能切换设备
  } catch {
    return json({ valid: false, msg: '请求格式错误' });
  }

  if (!key) return json({ valid: false, msg: '请输入授权码' });
  if (!deviceId) return json({ valid: false, msg: '设备识别失败' });

  const raw = await env.LICENSE_KEYS.get(key);
  if (raw === null) return json({ valid: false, msg: '授权码无效' });

  let data;
  try { data = JSON.parse(raw); } catch { return json({ valid: false, msg: '授权码数据异常' }); }

  const now = new Date();

  // 首次使用：激活，记录到期时间和设备ID
  if (!data.expires) {
    const ms = DURATIONS[data.type];
    data.expires = ms === null ? 'lifetime' : new Date(now.getTime() + ms).toISOString();
    data.activatedAt = now.toISOString();
    data.deviceId = deviceId;
    await env.LICENSE_KEYS.put(key, JSON.stringify(data));
    return json({ valid: true, expires: data.expires });
  }

  // 校验是否过期
  if (data.expires !== 'lifetime' && new Date(data.expires) < now) {
    return json({ valid: false, msg: '授权码已过期' });
  }

  // 设备不一致
  if (data.deviceId !== deviceId) {
    // 只有主动输入授权码时才允许切换设备
    if (!activate) return json({ valid: false, msg: '授权码已在其他设备上使用' });
    data.deviceId = deviceId;
    await env.LICENSE_KEYS.put(key, JSON.stringify(data));
    return json({ valid: true, expires: data.expires, switched: true });
  }

  return json({ valid: true, expires: data.expires });
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}
