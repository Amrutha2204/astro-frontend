import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { paymentApi, WalletBalanceResponse, UserTransaction } from "@/services/paymentService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";

const REDIRECT_DELAY_MS = 2000;

type RazorpayHandlerPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayHandlerPayload) => Promise<void>;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: () => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [balance, setBalance] = useState<WalletBalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [amountRupees, setAmountRupees] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await paymentApi.getBalance(t);
      setBalance(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  const fetchTransactions = useCallback(async () => {
    const t = token?.trim();
    if (!t) return;
    setLoadingTx(true);
    try {
      const res = await paymentApi.getMyTransactions(t, 30, 0);
      setTransactions(res.items);
      setTransactionsTotal(res.total);
    } catch {
      setTransactions([]);
      setTransactionsTotal(0);
    } finally {
      setLoadingTx(false);
    }
  }, [token]);

  useEffect(() => {
    if (!rehydrated) return;
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchBalance();
    fetchTransactions();
  }, [rehydrated, token, dispatch, router, fetchBalance, fetchTransactions]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token?.trim();
    if (!t) return;
    const amount = Number(amountRupees);
    if (!amount || amount < 1) {
      showError("Enter a valid amount (₹1 or more)");
      return;
    }
    setCreating(true);
    try {
      const res = await paymentApi.createOrder(t, amount, "Wallet top-up");
      showSuccess("Order created. Complete payment on the next screen.");
      if (typeof window !== "undefined" && window.Razorpay) {
        const options: RazorpayOptions = {
          key: res.keyId,
          amount: res.amount * 100,
          currency: res.currency,
          order_id: res.orderId,
          name: "Astro",
          description: "Wallet top-up",
          handler: async (response: RazorpayHandlerPayload) => {
            try {
              await paymentApi.verify(
                t,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
              );
              showSuccess("Payment successful. Wallet updated.");
              fetchBalance();
              fetchTransactions();
            } catch (e) {
              showError(e instanceof Error ? e.message : "Verification failed");
            }
          },
          modal: {
            ondismiss: () => {
              showError("Payment cancelled");
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        router.push(`/subscription/plans?orderId=${res.orderId}&amount=${res.amount}`);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setCreating(false);
    }
  };

  if (!rehydrated || !token?.trim()) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <p>Loading…</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
            <h1 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
              Wallet &amp; Payment
            </h1>
            {error && <p className="text-[18px] font-semibold text-[#6b4423]">{error}</p>}
            {loading ? (
              <p>Loading balance…</p>
            ) : balance !== null ? (
              <div className="mb-6">
                <p className="mt-2 rounded-[6px] border-l-[3px] border-l-[#6b4423] bg-[#faf8f5] px-3 py-2 text-[14px] italic text-[#5c4033]">
                  <strong>Wallet balance:</strong> ₹{balance.balanceRupees.toFixed(2)}
                </p>
              </div>
            ) : null}
            <div className="max-w-[360px]">
              <h2 className="mb-2 text-[1rem]">Add money</h2>
              <form onSubmit={handleCreateOrder}>
                <input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Amount (₹)"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  className="mb-3 w-full rounded-[6px] border border-[#ccc] px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center rounded-[12px] border-none bg-[#6b4423] px-[28px] py-3 text-[16px] font-bold text-white shadow-[0_4px_14px_rgba(139,94,52,0.25)] transition-colors duration-200 hover:bg-[#5c3a1f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Pay with Razorpay"}
                </button>
              </form>
              <p className="mt-2 text-[0.85rem] text-[#666]">
                If Razorpay is not loaded, you will be redirected to plans page. Load the Razorpay
                script on your site for in-page checkout.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-[24px] font-bold text-[#6b4423]">
                Transaction history ({transactionsTotal})
              </h2>
              {loadingTx ? (
                <p>Loading…</p>
              ) : transactions.length === 0 ? (
                <p className="mt-2 rounded-[6px] border-l-[3px] border-l-[#6b4423] bg-[#faf8f5] px-3 py-2 text-[14px] italic text-[#5c4033]">
                  No transactions yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-[12px] border border-[#e5e7eb] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <table className="min-w-full border-collapse text-left text-[14px]">
                    <thead>
                      <tr className="bg-[#f9fafb] text-[#6b4423]">
                        <th className="border-b border-[#e5e7eb] px-4 py-3 font-semibold">Date</th>
                        <th className="border-b border-[#e5e7eb] px-4 py-3 font-semibold">Type</th>
                        <th className="border-b border-[#e5e7eb] px-4 py-3 font-semibold">
                          Status
                        </th>
                        <th className="border-b border-[#e5e7eb] px-4 py-3 font-semibold">
                          Amount
                        </th>
                        <th className="border-b border-[#e5e7eb] px-4 py-3 font-semibold">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#f1f5f9] last:border-b-0">
                          <td className="px-4 py-3">
                            {new Date(tx.createdAt).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="px-4 py-3">{tx.type}</td>
                          <td className="px-4 py-3">{tx.status}</td>
                          <td className="px-4 py-3">
                            ₹{(Number(tx.amountPaise) / 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">{tx.description || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
