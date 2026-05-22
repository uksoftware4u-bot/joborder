const DEFAULT_BASE_URL = "https://accounting-api.autocountcloud.com";

export function getAutoCountConfig() {
  const accountBookId = process.env.AUTOCOUNT_ACCOUNT_BOOK_ID;
  const keyId = process.env.AUTOCOUNT_KEY_ID;
  const apiKey = process.env.AUTOCOUNT_API_KEY;
  const baseUrl = process.env.AUTOCOUNT_BASE_URL || DEFAULT_BASE_URL;

  if (!accountBookId || !keyId || !apiKey) {
    throw new Error("Missing AutoCount credentials. Set AUTOCOUNT_ACCOUNT_BOOK_ID, AUTOCOUNT_KEY_ID and AUTOCOUNT_API_KEY in .env.local.");
  }

  return {
    accountBookId,
    keyId,
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, ""),
    salesLocation: process.env.AUTOCOUNT_SALES_LOCATION || "HQ",
    salesAccNo: process.env.AUTOCOUNT_SALES_ACC_NO || "500-0000"
  };
}

export async function autocountFetch(path, options = {}) {
  const config = getAutoCountConfig();
  const response = await fetch(`${config.baseUrl}/${config.accountBookId}${path}`, {
    ...options,
    headers: {
      "API-Key": config.apiKey,
      "Key-ID": config.keyId,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }

  if (!response.ok) {
    const message = body?.message || body?.error || `AutoCount request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return {
    status: response.status,
    headers: response.headers,
    body
  };
}

export function normalizeDebtor(raw) {
  return {
    accNo: raw.accNo || raw.AccNo,
    companyName: raw.companyName || raw.CompanyName,
    currencyCode: raw.currencyCode || raw.CurrencyCode,
    creditTerm: raw.creditTerm || raw.CreditTerm || "C.O.D.",
    address: raw.address || raw.Address || "",
    emailAddress: raw.emailAddress || raw.EmailAddress || ""
  };
}

export function normalizeProduct(raw) {
  const product = raw.product || raw.Product || raw;
  return {
    product,
    productVariant1Options: raw.productVariant1Options || [],
    productVariant2Options: raw.productVariant2Options || [],
    productVariants: raw.productVariants || []
  };
}
