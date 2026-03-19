import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Copy, Loader2, Lock, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Voucher } from "../backend";
import { useStorage } from "../context/StorageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDeleteVoucher, useMarkAsSold } from "../hooks/useQueries";

const CATEGORY_BADGE: Record<string, string> = {
  GPay: "bg-blue-100 text-blue-700",
  PhonePe: "bg-purple-100 text-purple-700",
  Cred: "bg-gray-800 text-gray-100",
  Flipkart: "bg-orange-100 text-orange-700",
  Travel: "bg-cyan-100 text-cyan-700",
  Hotel: "bg-green-100 text-green-700",
  Food: "bg-red-100 text-red-700",
  Entertainment: "bg-pink-100 text-pink-700",
  Shopping: "bg-indigo-100 text-indigo-700",
  Others: "bg-gray-100 text-gray-700",
};

interface Props {
  voucher: Voucher | null;
  onClose: () => void;
  onLoginRequired: () => void;
}

export default function VoucherDetailModal({
  voucher,
  onClose,
  onLoginRequired,
}: Props) {
  const { identity } = useInternetIdentity();
  const { getImageUrl } = useStorage();
  const markAsSold = useMarkAsSold();
  const deleteVoucher = useDeleteVoucher();

  if (!voucher) return null;

  const isAuthenticated = !!identity;
  const isSeller =
    isAuthenticated &&
    voucher.sellerId?.toString() === identity?.getPrincipal().toString();
  const discount = Math.round(
    (1 - voucher.sellingPrice / voucher.faceValue) * 100,
  );
  const badgeClass = CATEGORY_BADGE[voucher.category] ?? CATEGORY_BADGE.Others;
  const imageUrl = voucher.imageId ? getImageUrl(voucher.imageId) : "";

  const copyCode = () => {
    navigator.clipboard.writeText(voucher.voucherCode);
    toast.success("Voucher code copied!");
  };

  const handleMarkSold = async () => {
    try {
      await markAsSold.mutateAsync(voucher.id);
      toast.success("Voucher marked as sold.");
      onClose();
    } catch {
      toast.error("Failed to update voucher.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVoucher.mutateAsync(voucher.id);
      toast.success("Voucher deleted.");
      onClose();
    } catch {
      toast.error("Failed to delete voucher.");
    }
  };

  return (
    <Dialog open={!!voucher} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" data-ocid="voucher_detail.dialog">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={voucher.title}
                  className="w-14 h-14 rounded-xl object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-primary" />
                </div>
              )}
              <div>
                <DialogTitle className="text-base leading-tight">
                  {voucher.title}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  by {voucher.sellerName}
                </p>
              </div>
            </div>
            <Badge className={`${badgeClass} shrink-0`}>
              {voucher.category}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Pricing */}
        <div className="grid grid-cols-3 gap-3 py-1">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Face Value</p>
            <p className="font-bold text-foreground">
              ₹{voucher.faceValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground">Selling Price</p>
            <p className="font-bold text-primary">
              ₹{voucher.sellingPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-muted-foreground">You Save</p>
            <p className="font-bold text-green-600">{discount}% off</p>
          </div>
        </div>

        {/* Description */}
        {voucher.description && (
          <p className="text-sm text-muted-foreground">{voucher.description}</p>
        )}

        <Separator />

        {/* Voucher Code Section */}
        {isAuthenticated ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Voucher Code</p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-dashed border-border">
              <code className="flex-1 text-sm font-mono font-bold tracking-wider text-foreground">
                {voucher.voucherCode}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyCode}
                data-ocid="voucher_detail.copy_button"
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 p-4 bg-muted/60 rounded-lg cursor-pointer hover:bg-muted transition-colors"
            onClick={onLoginRequired}
            onKeyDown={(e) => e.key === "Enter" && onLoginRequired()}
            data-ocid="voucher_detail.login_prompt"
          >
            <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Login to view voucher code</p>
              <p className="text-xs text-muted-foreground">
                Sign in to reveal the full voucher code and use it.
              </p>
            </div>
            <Button
              size="sm"
              className="ml-auto shrink-0"
              data-ocid="voucher_detail.login_button"
            >
              Login
            </Button>
          </div>
        )}

        {/* Seller Actions */}
        {isSeller && (
          <div className="flex gap-2 pt-1">
            {!voucher.isSold && (
              <Button
                variant="outline"
                className="flex-1 text-green-700 border-green-300 hover:bg-green-50"
                onClick={handleMarkSold}
                disabled={markAsSold.isPending}
                data-ocid="voucher_detail.mark_sold_button"
              >
                {markAsSold.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Mark as Sold
              </Button>
            )}
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={handleDelete}
              disabled={deleteVoucher.isPending}
              data-ocid="voucher_detail.delete_button"
            >
              {deleteVoucher.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {voucher.isSold && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700 font-medium">
              This voucher has been sold
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
