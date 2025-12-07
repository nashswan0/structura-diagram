import crypto from 'crypto';

// TriPay Configuration
export const TRIPAY_CONFIG = {
  apiKey: process.env.VITE_TRIPAY_API_KEY || '',
  privateKey: process.env.VITE_TRIPAY_PRIVATE_KEY || '',
  merchantCode: process.env.VITE_TRIPAY_MERCHANT_CODE || '',
  mode: process.env.VITE_TRIPAY_MODE || 'sandbox',
  apiUrl: process.env.VITE_TRIPAY_API_URL || 'https://tripay.co.id/api-sandbox',
};

// Token Packages Configuration
export interface TokenPackage {
  id: string;
  name: string;
  nameId: string;
  tokens: number;
  price: number;
}

export const TOKEN_PACKAGES: Record<string, TokenPackage> = {
  basic: {
    id: 'basic',
    name: 'Basic Pack',
    nameId: 'Paket Basic',
    tokens: 5,
    price: 5000,
  },
  standard: {
    id: 'standard',
    name: 'Standard Pack',
    nameId: 'Paket Standard',
    tokens: 10,
    price: 10000,
  },
  pro: {
    id: 'pro',
    name: 'Pro Pack',
    nameId: 'Paket Pro',
    tokens: 20,
    price: 20000,
  },
  premium: {
    id: 'premium',
    name: 'Premium Pack',
    nameId: 'Paket Premium',
    tokens: 30,
    price: 25000,
  },
  ultra: {
    id: 'ultra',
    name: 'Ultra Pack',
    nameId: 'Paket Ultra',
    tokens: 50,
    price: 40000,
  },
};

/**
 * Generate HMAC-SHA256 signature for TriPay requests
 */
export function generateSignature(data: string): string {
  return crypto
    .createHmac('sha256', TRIPAY_CONFIG.privateKey)
    .update(data)
    .digest('hex');
}

/**
 * Generate signature for creating closed payment transaction
 */
export function generateTransactionSignature(
  merchantCode: string,
  merchantRef: string,
  amount: number
): string {
  const data = `${merchantCode}${merchantRef}${amount}`;
  return generateSignature(data);
}

/**
 * Validate callback signature from TriPay
 */
export function validateCallbackSignature(
  callbackSignature: string,
  jsonPayload: string
): boolean {
  const calculatedSignature = generateSignature(jsonPayload);
  return callbackSignature === calculatedSignature;
}

/**
 * Get package details by ID
 */
export function getPackageDetails(packageId: string): TokenPackage | null {
  return TOKEN_PACKAGES[packageId] || null;
}

/**
 * Generate unique merchant reference
 */
export function generateMerchantRef(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${timestamp}-${random}`;
}

/**
 * Calculate TriPay fee for QRIS
 * Fee: Rp 750 + 0.7%
 */
export function calculateQRISFee(amount: number): number {
  const flatFee = 750;
  const percentFee = Math.ceil(amount * 0.007);
  return flatFee + percentFee;
}

/**
 * Make request to TriPay API
 */
export async function tripayRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, any>
): Promise<T> {
  const url = `${TRIPAY_CONFIG.apiUrl}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${TRIPAY_CONFIG.apiKey}`,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (method === 'POST' && body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    // Serialize body with proper handling for arrays (TriPay format)
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (Array.isArray(value)) {
        // Serialize arrays with indexed notation: key[0][field]
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            for (const [field, fieldValue] of Object.entries(item)) {
              formData.append(`${key}[${index}][${field}]`, String(fieldValue));
            }
          } else {
            formData.append(`${key}[${index}]`, String(item));
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        // JSON stringify objects
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
    options.body = formData.toString();
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `TriPay API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get payment channels from TriPay
 */
export async function getPaymentChannels() {
  return tripayRequest('/merchant/payment-channel', 'GET');
}

/**
 * Calculate fee using TriPay calculator
 */
export async function calculateFee(amount: number, code: string = 'QRIS') {
  return tripayRequest(`/merchant/fee-calculator?amount=${amount}&code=${code}`, 'GET');
}

/**
 * Get transaction detail from TriPay
 */
export async function getTransactionDetail(reference: string) {
  return tripayRequest(`/transaction/detail?reference=${reference}`, 'GET');
}

/**
 * Format amount to IDR
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Check if transaction is expired
 */
export function isTransactionExpired(expiredAt: number): boolean {
  return Date.now() / 1000 > expiredAt;
}
