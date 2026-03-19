import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Voucher } from "../backend";
import { useStorage } from "../context/StorageContext";

const CATEGORY_GRADIENTS: Record<string, string> = {
  GPay: "linear-gradient(135deg, #1a73e8, #0d5bba)",
  PhonePe: "linear-gradient(135deg, #5f259f, #3d1466)",
  Cred: "linear-gradient(135deg, #1a1a2e, #16213e)",
  Flipkart: "linear-gradient(135deg, #f37a20, #d45d00)",
  Travel: "linear-gradient(135deg, #0ea5e9, #0369a1)",
  Hotel: "linear-gradient(135deg, #16a34a, #14532d)",
  Food: "linear-gradient(135deg, #ef4444, #b91c1c)",
  Entertainment: "linear-gradient(135deg, #ec4899, #a21caf)",
  Shopping: "linear-gradient(135deg, #4f46e5, #3730a3)",
  Others: "linear-gradient(135deg, #6b7280, #374151)",
};

const CATEGORY_BADGE: Record<string, string> = {
  GPay: "bg-blue-100 text-blue-700 border-blue-200",
  PhonePe: "bg-purple-100 text-purple-700 border-purple-200",
  Cred: "bg-gray-800 text-gray-100 border-gray-700",
  Flipkart: "bg-orange-100 text-orange-700 border-orange-200",
  Travel: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Hotel: "bg-green-100 text-green-700 border-green-200",
  Food: "bg-red-100 text-red-700 border-red-200",
  Entertainment: "bg-pink-100 text-pink-700 border-pink-200",
  Shopping: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Others: "bg-gray-100 text-gray-700 border-gray-200",
};

const CATEGORY_ICON_BG: Record<string, string> = {
  GPay: "#1a73e8",
  PhonePe: "#5f259f",
  Cred: "#1a1a2e",
  Flipkart: "#f37a20",
  Travel: "#0ea5e9",
  Hotel: "#16a34a",
  Food: "#ef4444",
  Entertainment: "#ec4899",
  Shopping: "#4f46e5",
  Others: "#6b7280",
};

interface Props {
  voucher: Voucher;
  onBuyNow: (voucher: Voucher) => void;
  index: number;
}

export default function VoucherCard({ voucher, onBuyNow, index }: Props) {
  const { getImageUrl } = useStorage();
  const imageUrl = voucher.imageId ? getImageUrl(voucher.imageId) : "";
  const discount = Math.round(
    (1 - voucher.sellingPrice / voucher.faceValue) * 100,
  );
  const gradient =
    CATEGORY_GRADIENTS[voucher.category] ?? CATEGORY_GRADIENTS.Others;
  const badgeClass = CATEGORY_BADGE[voucher.category] ?? CATEGORY_BADGE.Others;
  const iconBg = CATEGORY_ICON_BG[voucher.category] ?? CATEGORY_ICON_BG.Others;
  const initial = voucher.title.charAt(0).toUpperCase();

  return (
    <div
      className="voucher-card bg-white rounded-xl border border-border shadow-card overflow-hidden flex flex-col"
      data-ocid={`voucher.item.${index}`}
    >
      {/* Card Top */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={voucher.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ background: iconBg }}
            >
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
              {voucher.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              by {voucher.sellerName}
            </p>
          </div>
        </div>
        <Badge
          className={`${badgeClass} text-xs shrink-0 ml-2 border`}
          variant="outline"
        >
          {voucher.category}
        </Badge>
      </div>

      <div className="border-t border-border mx-4" />

      {/* Pricing */}
      <div className="px-4 py-3 flex gap-2 text-center">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Face Value</p>
          <p className="font-bold text-sm text-foreground">
            ₹{voucher.faceValue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Selling Price</p>
          <p className="font-bold text-sm text-primary">
            ₹{voucher.sellingPrice.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Discount</p>
          <p className="font-bold text-sm text-green-600">{discount}% off</p>
        </div>
      </div>

      {/* Buy Button */}
      <div className="px-4 pb-4 mt-auto">
        <button
          type="button"
          className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: gradient }}
          onClick={() => onBuyNow(voucher)}
          data-ocid={`voucher.buy.button.${index}`}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
