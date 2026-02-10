import { request, ASTRO_BASE } from "./fetcher";

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface WalletBalanceResponse {
  balancePaise: number;
  balanceRupees: number;
}

export const paymentApi = {
  async createOrder(token: string, amountRupees: number, description?: string, receipt?: string): Promise<CreateOrderResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token. Please login again.");
    return request<CreateOrderResponse>(ASTRO_BASE, "/api/v1/payment/create-order", {
      method: "POST",
      token: t,
      body: { amountRupees, description, receipt },
    });
  },

  async verify(token: string, orderId: string, paymentId: string, signature: string): Promise<{ status: string; transactionId: string }> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token. Please login again.");
    return request<{ status: string; transactionId: string }>(ASTRO_BASE, "/api/v1/payment/verify", {
      method: "POST",
      token: t,
      body: { orderId, paymentId, signature },
    });
  },

  async getBalance(token: string): Promise<WalletBalanceResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token. Please login again.");
    return request<WalletBalanceResponse>(ASTRO_BASE, "/api/v1/payment/wallet/balance", {
      method: "GET",
      token: t,
    });
  },
};
