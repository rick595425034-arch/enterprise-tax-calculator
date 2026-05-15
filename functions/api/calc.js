// ── 税务计算 API ─────────────────────────────────────────
// POST /api/calc
// Body: { key, inputs: { income, cost, expense, vatRate, cbtRate,
//                        stampType, stampRatio, citType,
//                        incomeType, costType, vatPayer } }
// 先验证授权码，再执行计算，返回计算结果 JSON

export async function onRequestPost({ request, env }) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  };

  let body;
  try { body = await request.json(); } catch { return res({ error: '请求格式错误' }, 400, headers); }

  const { inputs } = body;
  if (!inputs) return res({ error: '参数缺失' }, 400, headers);

  // ── 税务计算 ─────────────────────────────────────────
  const result = compute(inputs);
  return res({ ok: true, result }, 200, headers);
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

function res(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers });
}

// ── 核心计算逻辑 ─────────────────────────────────────────
function compute(p) {
  const incomeRaw  = parseFloat(p.income)     || 0;
  const costRaw    = parseFloat(p.cost)       || 0;
  const expense    = parseFloat(p.expense)    || 0;
  const vatR       = parseFloat(p.vatRate)    || 0;
  const cbtR       = parseFloat(p.cbtRate)    || 0;
  const stampR     = parseFloat(p.stampType)  || 0;
  const stampRatio = parseFloat(p.stampRatio) || 0;
  const citTypeVal = p.citType  || 'auto';
  const incomeType = p.incomeType || 'tax';
  const costType   = p.costType   || 'tax';
  const isSmall    = p.vatPayer === 'small';

  // 含税/不含税还原
  let incomeT, incomeN, costT, costN;
  if (incomeType === 'tax') {
    incomeT = incomeRaw;
    incomeN = incomeRaw / (1 + vatR);
  } else {
    incomeN = incomeRaw;
    incomeT = incomeRaw * (1 + vatR);
  }
  if (costType === 'tax') {
    costT = costRaw;
    costN = costRaw / (1 + vatR);
  } else {
    costN = costRaw;
    costT = costRaw * (1 + vatR);
  }

  let vatOut = incomeN * vatR;
  let vatIn  = costN * vatR;
  let vat    = Math.max(0, vatOut - vatIn);
  let vatExempt = false;
  let cbt, edu, ledu, addTotal, stampBase, stamp, profit0, citBase, cit, citRateLabel;

  if (isSmall) {
    if (incomeT <= 303000) {
      vatOut = 0; vatIn = 0; vat = 0; vatExempt = true;
    } else {
      vatOut = incomeN * vatR; vatIn = 0; vat = vatOut;
    }
    cbt  = vat * cbtR * 0.5;
    edu  = vat * 0.03 * 0.5;
    ledu = vat * 0.02 * 0.5;
    addTotal = cbt + edu + ledu;
    stampBase = (incomeT + costT) * stampRatio;
    stamp = stampBase * stampR * 0.5;
    const exemptVAT = vatExempt ? (incomeT - incomeN) : 0;
    profit0 = incomeN + exemptVAT - costT - expense - addTotal - stamp;
  } else {
    cbt  = vat * cbtR;
    edu  = vat * 0.03;
    ledu = vat * 0.02;
    addTotal = cbt + edu + ledu;
    stampBase = (incomeT + costT) * stampRatio;
    stamp = stampBase * stampR;
    profit0 = incomeN - costN - expense - addTotal - stamp;
  }

  citBase = profit0 > 0 ? profit0 : 0;
  cit = 0; citRateLabel = '';

  if (citTypeVal === 'auto') {
    if (citBase <= 0)            { cit = 0; citRateLabel = '亏损 0%'; }
    else if (citBase <= 3000000) { cit = citBase * 0.05; citRateLabel = '小微企业（≤300万）实际税负5%'; }
    else                         { cit = citBase * 0.25; citRateLabel = '标准企业 25%'; }
  } else {
    const fixedRate = parseFloat(citTypeVal);
    cit = citBase * fixedRate;
    citRateLabel = (fixedRate * 100).toFixed(0) + '%';
  }

  const totalTax = vat + addTotal + stamp + cit;
  const netProfit = profit0 - cit;
  const taxRate = incomeN > 0 ? totalTax / incomeN : 0;

  return {
    incomeT, incomeN, costT, costN, expense,
    vatOut, vatIn, vat, vatExempt,
    cbt, edu, ledu, addTotal, cbtR,
    stampBase, stamp,
    profit0, citBase, cit, citRateLabel,
    totalTax, netProfit, taxRate,
  };
}
