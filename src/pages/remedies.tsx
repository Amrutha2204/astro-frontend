import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { remediesApi, type RemedyRecommendations } from "@/services/remediesService";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Loading from "@/components/ui/Loading";
import Image from "next/image";

const REDIRECT_DELAY_MS = 2000;

type RemedyItem = {
  name: string;
  description?: string;
  descriptions?: string;
  timing?: string;
  frequency?: string;
  duration?: string;
  benefits?: string;
  guidelines?: string;
  items?: string;
  type?: string;
  emoji?: string;
  uniqueKey?: string;
};

export default function RemediesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [remedies, setRemedies] = useState<RemedyRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRemedy, setSelectedRemedy] = useState<RemedyItem | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const remedyCategories = [
    {
      id: "gemstone",
      name: "Gemstones",
      emoji: "💎",
      color: "#9333ea",
      image:
        "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319764/gemstone-card_mhfefz.jpg",
    },
    {
      id: "mantra",
      name: "Mantras",
      emoji: "🕉️",
      color: "#3b82f6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319765/mantra-card_rlzlef.jpg",
    },
    {
      id: "ritual",
      name: "Rituals",
      emoji: "🕯️",
      color: "#ec4899",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319765/ritual-card_geae4r.jpg",
    },
    {
      id: "donation",
      name: "Donations",
      emoji: "🙏",
      color: "#f59e0b",
      image:
        "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319763/donation-card_fpyp3d.jpg",
    },
    {
      id: "fasting",
      name: "Fasting",
      emoji: "🌙",
      color: "#10b981",
      image:
        "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319764/fasting-card_arkw78.jpg",
    },
  ];

  const getCategoryData = (categoryId: string) => {
    if (!remedies) {
      return [];
    }
    switch (categoryId) {
      case "gemstone":
        return remedies.gemstones;
      case "mantra":
        return remedies.mantras;
      case "ritual":
        return remedies.rituals;
      case "donation":
        return remedies.donations;
      case "fasting":
        return remedies.fastingDays;
      default:
        return [];
    }
  };

  const getCategoryGradientClass = (categoryId: string) => {
    switch (categoryId) {
      case "gemstone":
        return "bg-[linear-gradient(135deg,rgba(147,51,234,0.25)_0%,rgba(147,51,234,0.12)_100%)]";
      case "mantra":
        return "bg-[linear-gradient(135deg,rgba(59,130,246,0.25)_0%,rgba(59,130,246,0.12)_100%)]";
      case "ritual":
        return "bg-[linear-gradient(135deg,rgba(236,72,153,0.25)_0%,rgba(236,72,153,0.12)_100%)]";
      case "donation":
        return "bg-[linear-gradient(135deg,rgba(245,158,11,0.25)_0%,rgba(245,158,11,0.12)_100%)]";
      case "fasting":
        return "bg-[linear-gradient(135deg,rgba(16,185,129,0.25)_0%,rgba(16,185,129,0.12)_100%)]";
      default:
        return "bg-white";
    }
  };

  const getCategoryBorderTopClass = (categoryId: string) => {
    switch (categoryId) {
      case "gemstone":
        return "border-t-[#9333ea]";
      case "mantra":
        return "border-t-[#3b82f6]";
      case "ritual":
        return "border-t-[#ec4899]";
      case "donation":
        return "border-t-[#f59e0b]";
      case "fasting":
        return "border-t-[#10b981]";
      default:
        return "border-t-[#6b4423]";
    }
  };

  const getCloseButtonBgClass = (categoryId?: string) => {
    switch (categoryId) {
      case "gemstone":
        return "bg-[#9333ea]";
      case "mantra":
        return "bg-[#3b82f6]";
      case "ritual":
        return "bg-[#ec4899]";
      case "donation":
        return "bg-[#f59e0b]";
      case "fasting":
        return "bg-[#10b981]";
      default:
        return "bg-[#6b7280]";
    }
  };

  const getGemstoneSwatchClasses = (name: string) => {
    switch (name?.toLowerCase()) {
      case "emerald":
        return "bg-[#50C878] shadow-[0_0_30px_rgba(80,200,120,0.5)]";
      case "ruby":
        return "bg-[#E0115F] shadow-[0_0_30px_rgba(224,17,95,0.5)]";
      case "sapphire":
        return "bg-[#0F52BA] shadow-[0_0_30px_rgba(15,82,186,0.5)]";
      case "diamond":
        return "bg-[#F0F8FF] shadow-[0_0_30px_rgba(240,248,255,0.5)]";
      case "pearl":
        return "bg-[#FFFDD0] shadow-[0_0_30px_rgba(255,253,208,0.5)]";
      case "coral":
        return "bg-[#FF7F50] shadow-[0_0_30px_rgba(255,127,80,0.5)]";
      case "opal":
        return "bg-[#E8DAEF] shadow-[0_0_30px_rgba(232,218,239,0.5)]";
      case "topaz":
        return "bg-[#FFC600] shadow-[0_0_30px_rgba(255,198,0,0.5)]";
      case "amethyst":
        return "bg-[#9966CC] shadow-[0_0_30px_rgba(153,102,204,0.5)]";
      case "citrine":
        return "bg-[#F1C40F] shadow-[0_0_30px_rgba(241,196,15,0.5)]";
      case "turquoise":
        return "bg-[#40E0D0] shadow-[0_0_30px_rgba(64,224,208,0.5)]";
      case "garnet":
        return "bg-[#DC143C] shadow-[0_0_30px_rgba(220,20,60,0.5)]";
      default:
        return "bg-[#A9A9A9] shadow-[0_0_30px_rgba(169,169,169,0.5)]";
    }
  };

  const primaryButtonClass =
    "rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-60";

  const fetchRemedies = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await remediesApi.getRecommendations(t);
      setRemedies(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load remedies";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchRemedies();
  }, [rehydrated, token, dispatch, router, fetchRemedies]);

  const getDetailGridClass = (remedy: RemedyItem) => {
    // For items with many properties, use fullWidth
    const propertyCount = [
      remedy.timing,
      remedy.frequency,
      remedy.duration,
      remedy.benefits,
      remedy.guidelines,
      remedy.items,
    ].filter(Boolean).length;

    return propertyCount > 4 ? "grid-cols-1" : "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]";
  };

  const getRemedyImagePath = (type: string, name: string) => {
    const lowerName = name?.toLowerCase().replace(/\s+/g, "-") || "default";
    return `/images/remedies/${type}/${lowerName}.jpg`;
  };

  const getGemstoneColor = (name: string) => {
    const gemstoneColors: { [key: string]: { color: string; hex: string } } = {
      emerald: { color: "Emerald Green", hex: "#50C878" },
      ruby: { color: "Deep Red", hex: "#E0115F" },
      sapphire: { color: "Royal Blue", hex: "#0F52BA" },
      diamond: { color: "Colorless", hex: "#F0F8FF" },
      pearl: { color: "White", hex: "#FFFDD0" },
      coral: { color: "Coral Orange", hex: "#FF7F50" },
      opal: { color: "Rainbow White", hex: "#E8DAEF" },
      topaz: { color: "Golden Yellow", hex: "#FFC600" },
      amethyst: { color: "Purple", hex: "#9966CC" },
      citrine: { color: "Pale Yellow", hex: "#F1C40F" },
      turquoise: { color: "Turquoise", hex: "#40E0D0" },
      garnet: { color: "Deep Red", hex: "#DC143C" },
    };

    const lowerName = name?.toLowerCase() || "diamond";
    return gemstoneColors[lowerName] || { color: "Stone", hex: "#A9A9A9" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <Loading text="Loading your Remedies.." />
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
            <PageHeader
              onBack={() => router.back()}
              onRefresh={fetchRemedies}
              refreshAriaLabel="Refresh remedies"
              disableRefresh={loading}
            />
            <h1 className="text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent">
              Astrological Remedies
            </h1>
            <p className="mb-[30px] text-[#6b7280]">
              Personalized remedies based on your birth chart details to enhance positive energies
              and mitigate challenges.
            </p>
            {error && <ErrorMessage message={error} />}

            {remedies && (
              <>
                <div className="mb-10 mt-[30px] grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
                  {remedyCategories.map((category) => {
                    const count = getCategoryData(category.id).length;
                    return (
                      <button
                        key={category.id}
                        className={`relative flex h-[200px] cursor-pointer flex-col justify-end overflow-hidden rounded-[16px] border-none p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)] ${getCategoryGradientClass(category.id)}`}
                        onClick={() =>
                          setExpandedCategory(expandedCategory === category.id ? null : category.id)
                        }
                      >
                        <div className="absolute inset-0 overflow-hidden rounded-[16px]">
                          <div className="relative h-full w-full">
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              sizes="(max-width:768px) 50vw, 200px"
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.3)_50%,rgba(0,0,0,0.6)_100%)]" />
                        </div>
                        <div className="relative z-[2] text-center text-white">
                          <h3 className="mb-1 text-[16px] font-bold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
                            {category.name}
                          </h3>
                          <p className="m-0 text-[12px] text-[rgba(255,255,255,0.8)] [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
                            {count} items
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {expandedCategory && (
                  <div className="mb-10 rounded-[20px] bg-[linear-gradient(135deg,#ffffff_0%,#faf7f2_100%)] p-[30px] shadow-[0_8px_24px_rgba(107,68,35,0.1)]">
                    <div className="mb-6 flex items-center justify-between border-b-[2px] border-b-[rgba(107,68,35,0.15)] pb-4">
                      <h2 className="flex items-center gap-3 text-[24px] font-bold text-[#1f2937]">
                        {remedyCategories.find((c) => c.id === expandedCategory)?.emoji}{" "}
                        {remedyCategories.find((c) => c.id === expandedCategory)?.name}
                      </h2>
                      <button
                        className={primaryButtonClass}
                        onClick={() => setExpandedCategory(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                      {getCategoryData(expandedCategory).map((remedy, index) => (
                        <button
                          key={`${expandedCategory}-${index}`}
                          className={`flex flex-col gap-3 rounded-[12px] border border-[#e5e7eb] border-t-[4px] bg-white p-5 text-left shadow-[0_2px_6px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] ${getCategoryBorderTopClass(expandedCategory)}`}
                          onClick={() =>
                            setSelectedRemedy({
                              ...remedy,
                              uniqueKey: `${expandedCategory}-${index}`,
                              type: expandedCategory,
                              emoji:
                                remedyCategories.find((c) => c.id === expandedCategory)?.emoji ||
                                "✨",
                            })
                          }
                        >
                          <p className="m-0 text-[18px] font-bold text-[#1f2937]">{remedy.name}</p>
                          <p className="m-0 text-[14px] leading-[1.5] text-[#6b7280]">
                            {remedy.description?.substring(0, 80)}...
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRemedy && (
                  <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.55)] p-5 backdrop-blur-[4px]"
                    onClick={() => setSelectedRemedy(null)}
                  >
                    <div
                      className="max-h-[90vh] w-full max-w-[750px] overflow-y-auto rounded-[28px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative max-h-[85vh] overflow-y-auto rounded-[24px] border-l-[8px] border-l-[#6b4423] bg-[linear-gradient(135deg,#ffffff_0%,#faf7f2_100%)] p-[50px] shadow-[0_20px_60px_rgba(107,68,35,0.2),0_10px_30px_rgba(0,0,0,0.1)]">
                        <div className="mb-8 -mx-[50px] -mt-[50px] flex h-[300px] w-[calc(100%+100px)] items-center justify-center overflow-hidden rounded-t-[24px] bg-[linear-gradient(135deg,#f5ebe0_0%,#ede4d8_100%)]">
                          <div className="relative z-[1] h-full w-full">
                            <Image
                              src={getRemedyImagePath(
                                selectedRemedy.type || "default",
                                selectedRemedy.name,
                              )}
                              alt={selectedRemedy.name}
                              fill
                              sizes="(max-width:768px) 100vw, 750px"
                              className="object-cover object-center"
                            />
                          </div>
                        </div>

                        {selectedRemedy.type === "gemstone" && (
                          <div className="-mx-[50px] -mt-[50px] mb-8 flex items-center gap-6 border-b-[3px] border-b-[rgba(107,68,35,0.15)] bg-[linear-gradient(135deg,rgba(245,235,224,0.3)_0%,rgba(255,255,255,0)_100%)] px-[50px] py-6">
                            <div
                              className={`h-[120px] w-[120px] shrink-0 rounded-[20px] border-[2px] border-[rgba(255,255,255,0.8)] shadow-[0_8px_20px_rgba(0,0,0,0.15)] ${getGemstoneSwatchClasses(selectedRemedy.name)}`}
                            />
                            <div className="flex flex-col gap-2">
                              <p className="m-0 text-[12px] font-bold uppercase tracking-[1px] text-[#6b4423]">
                                Stone Color
                              </p>
                              <p className="m-0 bg-[linear-gradient(135deg,#6b4423_0%,#8b5a3c_100%)] bg-clip-text text-[24px] font-extrabold tracking-[-0.5px] text-transparent">
                                {getGemstoneColor(selectedRemedy.name).color}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="relative z-[1] mb-8 flex items-center justify-between border-b-[3px] border-b-[rgba(107,68,35,0.15)] pb-6">
                          <h3 className="flex items-center gap-4 bg-[linear-gradient(135deg,#1f2937_0%,#6b4423_100%)] bg-clip-text text-[32px] font-extrabold tracking-[-0.8px] text-transparent">
                            {selectedRemedy.emoji} {selectedRemedy.name}
                          </h3>
                          <button
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-none text-[20px] text-white ${getCloseButtonBgClass(selectedRemedy.type)}`}
                            onClick={() => setSelectedRemedy(null)}
                            aria-label="Close details"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="relative z-[1] flex flex-col gap-7">
                          {selectedRemedy.description && (
                            <div>
                              <p className="m-0 rounded-[12px] border-l-[5px] border-l-[#9333ea] bg-[linear-gradient(135deg,rgba(245,235,224,0.5)_0%,rgba(255,255,255,0.8)_100%)] p-6 text-left text-[16px] leading-[1.9] tracking-[0.3px] text-[#2d3748] shadow-[0_4px_12px_rgba(147,51,234,0.08)]">
                                {selectedRemedy.description}
                              </p>
                            </div>
                          )}

                          {(selectedRemedy.timing ||
                            selectedRemedy.frequency ||
                            selectedRemedy.benefits ||
                            selectedRemedy.duration ||
                            selectedRemedy.guidelines ||
                            selectedRemedy.items) && (
                            <div
                              className={`grid gap-5 border-t-[3px] border-t-[rgba(107,68,35,0.1)] pt-7 ${getDetailGridClass(selectedRemedy)}`}
                            >
                              {selectedRemedy.timing && (
                                <div className="relative overflow-hidden rounded-[14px] border-l-[5px] border-l-[#6b4423] border-t border-t-[rgba(147,51,234,0.2)] bg-[linear-gradient(135deg,#ffffff_0%,#faf7f2_100%)] p-5 shadow-[0_6px_16px_rgba(107,68,35,0.08),inset_0_1px_2px_rgba(255,255,255,0.5)]">
                                  <strong className="relative z-[1] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b4423]">
                                    ⏰ Best Timing
                                  </strong>
                                  <span className="relative z-[1] text-[16px] font-semibold leading-[1.7] text-[#1f2937]">
                                    {selectedRemedy.timing}
                                  </span>
                                </div>
                              )}
                              {selectedRemedy.frequency && (
                                <div className="relative overflow-hidden rounded-[14px] border-l-[5px] border-l-[#6b4423] border-t border-t-[rgba(147,51,234,0.2)] bg-[linear-gradient(135deg,#ffffff_0%,#faf7f2_100%)] p-5 shadow-[0_6px_16px_rgba(107,68,35,0.08),inset_0_1px_2px_rgba(255,255,255,0.5)]">
                                  <strong className="relative z-[1] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b4423]">
                                    🔄 Frequency
                                  </strong>
                                  <span className="relative z-[1] text-[16px] font-semibold leading-[1.7] text-[#1f2937]">
                                    {selectedRemedy.frequency}
                                  </span>
                                </div>
                              )}
                              {selectedRemedy.duration && (
                                <div className="relative overflow-hidden rounded-[14px] border-l-[5px] border-l-[#6b4423] border-t border-t-[rgba(147,51,234,0.2)] bg-[linear-gradient(135deg,#ffffff_0%,#faf7f2_100%)] p-5 shadow-[0_6px_16px_rgba(107,68,35,0.08),inset_0_1px_2px_rgba(255,255,255,0.5)]">
                                  <strong className="relative z-[1] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b4423]">
                                    ⏱️ Duration
                                  </strong>
                                  <span className="relative z-[1] text-[16px] font-semibold leading-[1.7] text-[#1f2937]">
                                    {selectedRemedy.duration}
                                  </span>
                                </div>
                              )}
                              {selectedRemedy.benefits && (
                                <div className="relative overflow-hidden rounded-[14px] border-l-[5px] border-l-[#6b4423] border-t border-t-[rgba(147,51,234,0.2)] bg-[linear-gradient(135deg,#ffffff_0%,#faf7f2_100%)] p-5 shadow-[0_6px_16px_rgba(107,68,35,0.08),inset_0_1px_2px_rgba(255,255,255,0.5)]">
                                  <strong className="relative z-[1] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b4423]">
                                    ✨ Benefits
                                  </strong>
                                  <span className="relative z-[1] text-[16px] font-semibold leading-[1.7] text-[#1f2937]">
                                    {selectedRemedy.benefits}
                                  </span>
                                </div>
                              )}
                              {selectedRemedy.guidelines && (
                                <div className="relative overflow-hidden rounded-[14px] border-l-[5px] border-l-[#6b4423] border-t border-t-[rgba(147,51,234,0.2)] bg-[linear-gradient(135deg,#ffffff_0%,#faf7f2_100%)] p-5 shadow-[0_6px_16px_rgba(107,68,35,0.08),inset_0_1px_2px_rgba(255,255,255,0.5)]">
                                  <strong className="relative z-[1] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b4423]">
                                    📋 Guidelines
                                  </strong>
                                  <span className="relative z-[1] text-[16px] font-semibold leading-[1.7] text-[#1f2937]">
                                    {selectedRemedy.guidelines}
                                  </span>
                                </div>
                              )}
                              {selectedRemedy.items && (
                                <div className="relative overflow-hidden rounded-[14px] border-l-[5px] border-l-[#6b4423] border-t border-t-[rgba(147,51,234,0.2)] bg-[linear-gradient(135deg,#ffffff_0%,#faf7f2_100%)] p-5 shadow-[0_6px_16px_rgba(107,68,35,0.08),inset_0_1px_2px_rgba(255,255,255,0.5)]">
                                  <strong className="relative z-[1] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b4423]">
                                    📦 Items Needed
                                  </strong>
                                  <span className="relative z-[1] text-[16px] font-semibold leading-[1.7] text-[#1f2937]">
                                    {selectedRemedy.items}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {selectedRemedy.type === "gemstone" && selectedRemedy.descriptions && (
                            <div className="mt-2 border-t border-t-[rgba(107,68,35,0.1)] pt-4">
                              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b4423]">
                                💎 Gemstone Properties
                              </p>
                              <p className="text-[14px] leading-[1.6] text-[#4b5563]">
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}

                          {selectedRemedy.type === "mantra" && selectedRemedy.descriptions && (
                            <div className="mt-2 border-t border-t-[rgba(107,68,35,0.1)] pt-4">
                              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b4423]">
                                🕉️ Mantra Details
                              </p>
                              <p className="text-[14px] italic leading-[1.6] text-[#4b5563]">
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}

                          {selectedRemedy.type === "donation" && selectedRemedy.descriptions && (
                            <div className="mt-2 border-t border-t-[rgba(107,68,35,0.1)] pt-4">
                              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b4423]">
                                🙏 Donation Purpose
                              </p>
                              <p className="text-[14px] leading-[1.6] text-[#4b5563]">
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}

                          {selectedRemedy.type === "ritual" && selectedRemedy.descriptions && (
                            <div className="mt-2 border-t border-t-[rgba(107,68,35,0.1)] pt-4">
                              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b4423]">
                                🕯️ Ritual Steps
                              </p>
                              <p className="text-[14px] leading-[1.6] text-[#4b5563]">
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}

                          {selectedRemedy.type === "fasting" && selectedRemedy.descriptions && (
                            <div className="mt-2 border-t border-t-[rgba(107,68,35,0.1)] pt-4">
                              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b4423]">
                                🌙 Fasting Guidelines
                              </p>
                              <p className="text-[14px] leading-[1.6] text-[#4b5563]">
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
