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

  async getMyTransactions(
    token: string,
    limit?: number,
    offset?: number
  ): Promise<{ items: UserTransaction[]; total: number }> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token. Please login again.");
    const params: Record<string, string> = {};
    if (limit != null) params.limit = String(limit);
    if (offset != null) params.offset = String(offset);
    return request<{ items: UserTransaction[]; total: number }>(
      ASTRO_BASE,
      "/api/v1/payment/transactions/me",
      {
        method: "GET",
        token: t,
        params: Object.keys(params).length ? params : undefined,
      }
    );
  },
};

export interface UserTransaction {
  id: string;
  type: string;
  status: string;
  amountPaise: string;
  description: string | null;
  createdAt: string;
}
