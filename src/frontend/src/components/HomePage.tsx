import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Plane, ShoppingBag, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Voucher } from "../backend";
import { MOCK_VOUCHERS } from "../data/mockVouchers";
import { useAvailableVouchers } from "../hooks/useQueries";
import VoucherCard from "./VoucherCard";
import VoucherDetailModal from "./VoucherDetailModal";

const CATEGORIES = [
  "All",
  "GPay",
  "PhonePe",
  "Cred",
  "Flipkart",
  "Travel",
  "Hotel",
  "Food",
  "Entertainment",
  "Shopping",
  "Others",
];

interface Props {
  searchQuery: string;
  onLoginRequired: () => void;
}

export default function HomePage({ searchQuery, onLoginRequired }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const { data: backendVouchers, isLoading } = useAvailableVouchers();

  const vouchers = useMemo(() => {
    const base =
      backendVouchers && backendVouchers.length > 0
        ? backendVouchers
        : MOCK_VOUCHERS;
    return base.filter((v) => !v.isSold);
  }, [backendVouchers]);

  const filtered = useMemo(() => {
    let result = vouchers;
    if (selectedCategory !== "All") {
      result = result.filter((v) => v.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.sellerName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [vouchers, selectedCategory, searchQuery]);

  const recentVouchers = useMemo(
    () =>
      [...vouchers]
        .sort((a, b) => Number(b.createdAt - a.createdAt))
        .slice(0, 6),
    [vouchers],
  );

  return (
    <main>
      {/* Hero Banner */}
      <section className="hero-gradient py-16 md:py-24 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex items-center justify-between">
            {/* Left illustration */}
            <div className="hidden lg:flex flex-col items-center gap-4 opacity-80">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Center content */}
            <motion.div
              className="flex-1 text-center px-4"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block bg-white/20 backdrop-blur rounded-full px-4 py-1 text-white text-sm font-medium mb-4">
                🎉 India's #1 Voucher Marketplace
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Buy & Sell Vouchers
                <br />
                <span className="text-yellow-200">at the Best Price</span>
              </h1>
              <p className="mt-4 text-white/80 text-base md:text-lg max-w-xl mx-auto">
                GPay, PhonePe, Flipkart, Travel, Hotels & more — Save up to 30%
                instantly.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-white text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-300" />
                  {vouchers.length}+ Active Vouchers
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-white text-sm">
                  <span className="w-2 h-2 rounded-full bg-yellow-300" />
                  Verified Sellers
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-white text-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-300" />
                  Instant Delivery
                </div>
              </div>
            </motion.div>

            {/* Right illustration */}
            <div className="hidden lg:flex flex-col items-center gap-4 opacity-80">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Category Pills */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Browse by Category</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "category-pill-active"
                    : "category-pill"
                }`}
                data-ocid={`category.${cat.toLowerCase()}.tab`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Voucher Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {selectedCategory === "All"
                ? "All Vouchers"
                : `${selectedCategory} Vouchers`}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filtered.length} available)
              </span>
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
                <div
                  key={sk}
                  className="bg-white rounded-xl border border-border p-4 space-y-3"
                  data-ocid="voucher.loading_state"
                >
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-16 bg-white rounded-xl border border-border"
              data-ocid="voucher.empty_state"
            >
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground">No vouchers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "No vouchers in this category yet"}
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06 } },
                hidden: {},
              }}
            >
              {filtered.map((voucher, i) => (
                <motion.div
                  key={voucher.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <VoucherCard
                    voucher={voucher}
                    onBuyNow={setSelectedVoucher}
                    index={i + 1}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Recently Added */}
        {!searchQuery &&
          selectedCategory === "All" &&
          recentVouchers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recently Added Vouchers</h2>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  View all <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recentVouchers.map((voucher, i) => (
                  <VoucherCard
                    key={`recent-${voucher.id.toString()}`}
                    voucher={voucher}
                    onBuyNow={setSelectedVoucher}
                    index={i + 1}
                  />
                ))}
              </div>
            </div>
          )}
      </div>

      <VoucherDetailModal
        voucher={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        onLoginRequired={() => {
          setSelectedVoucher(null);
          onLoginRequired();
        }}
      />
    </main>
  );
}
