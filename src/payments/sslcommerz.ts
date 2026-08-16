const SANDBOX_BASE = 'https://sandbox-gw.sslcommerz.com';
const LIVE_BASE = 'https://securepay.sslcommerz.com';

function apiBase(): string {
  return process.env.SSLCOMMERZ_IS_LIVE === 'true' ? LIVE_BASE : SANDBOX_BASE;
}

export function isSslcommerzConfigured(): boolean {
  return Boolean(
    process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD,
  );
}

export interface InitiateSslcommerzParams {
  tranId: string;
  totalAmount: number;
  currency: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  productName: string;
}

export async function initiateSslcommerzPayment(
  params: InitiateSslcommerzParams,
): Promise<string> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID!;
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD!;

  const body = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePasswd,
    total_amount: params.totalAmount.toFixed(2),
    currency: params.currency,
    tran_id: params.tranId,
    success_url: params.successUrl,
    fail_url: params.failUrl,
    cancel_url: params.cancelUrl,
    ipn_url: params.ipnUrl,
    shipping_method: 'NO',
    product_name: params.productName,
    product_category: 'General',
    product_profile: 'general',
    cus_name: params.customerName,
    cus_email: params.customerEmail,
    cus_add1: params.customerAddress,
    cus_city: params.customerCity,
    cus_country: 'Bangladesh',
    cus_phone: params.customerPhone,
  });

  const res = await fetch(`${apiBase()}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await res.json()) as {
    status?: string;
    GatewayPageURL?: string;
    failedreason?: string;
  };

  if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
    throw new Error(
      `SSLCommerz init failed: ${data.failedreason ?? data.status ?? 'unknown error'}`,
    );
  }
  return data.GatewayPageURL;
}

export interface SslcommerzValidationResult {
  valid: boolean;
  status?: string;
  amount?: string;
  currency?: string;
  bankTranId?: string;
}

export async function validateSslcommerzPayment(
  valId: string,
): Promise<SslcommerzValidationResult> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID!;
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD!;

  const query = new URLSearchParams({
    val_id: valId,
    store_id: storeId,
    store_passwd: storePasswd,
    format: 'json',
  });

  const res = await fetch(
    `${apiBase()}/validator/api/validationserverAPI.php?${query.toString()}`,
  );
  const data = (await res.json()) as {
    status?: string;
    amount?: string;
    currency?: string;
    bank_tran_id?: string;
  };

  const valid = data.status === 'VALID' || data.status === 'VALIDATED';
  return {
    valid,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    bankTranId: data.bank_tran_id,
  };
}
