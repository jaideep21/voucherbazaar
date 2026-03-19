import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Loader2, PlusCircle, Tag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Voucher } from "../backend";
import { useStorage } from "../context/StorageContext";
import {
  useDeleteVoucher,
  useMarkAsSold,
  useMyVouchers,
} from "../hooks/useQueries";

type Page = "home" | "sell" | "my-vouchers";

interface Props {
  onNavigate: (page: Page) => void;
}

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

export default function MyVouchersPage({ onNavigate }: Props) {
  const { data: vouchers, isLoading } = useMyVouchers();
  const { getImageUrl } = useStorage();
  const markAsSold = useMarkAsSold();
  const deleteVoucher = useDeleteVoucher();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Voucher | null>(null);

  const handleMarkSold = async (voucher: Voucher) => {
    try {
      await markAsSold.mutateAsync(voucher.id);
      toast.success(`"${voucher.title}" marked as sold.`);
    } catch {
      toast.error("Failed to update voucher.");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await deleteVoucher.mutateAsync(confirmDelete.id);
      toast.success("Voucher deleted.");
    } catch {
      toast.error("Failed to delete voucher.");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Vouchers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {vouchers?.length ?? 0} voucher
            {(vouchers?.length ?? 0) !== 1 ? "s" : ""} listed
          </p>
        </div>
        <Button
          onClick={() => onNavigate("sell")}
          data-ocid="my_vouchers.sell_button"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          List New
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="my_vouchers.loading_state">
          {["s1", "s2", "s3"].map((sk) => (
            <div
              key={sk}
              className="bg-white rounded-xl border border-border p-4"
            >
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : !vouchers || vouchers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-xl border border-border"
          data-ocid="my_vouchers.empty_state"
        >
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-lg">No vouchers yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Start selling by listing your first voucher.
          </p>
          <Button
            onClick={() => onNavigate("sell")}
            data-ocid="my_vouchers.list_first.button"
          >
            List Your First Voucher
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.07 } },
            hidden: {},
          }}
        >
          {vouchers.map((voucher, i) => {
            const imageUrl = voucher.imageId
              ? getImageUrl(voucher.imageId)
              : "";
            const discount = Math.round(
              (1 - voucher.sellingPrice / voucher.faceValue) * 100,
            );
            const badgeClass =
              CATEGORY_BADGE[voucher.category] ?? CATEGORY_BADGE.Others;

            return (
              <motion.div
                key={voucher.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white rounded-xl border border-border shadow-xs p-4 flex items-start gap-4"
                data-ocid={`my_vouchers.item.${i + 1}`}
              >
                {/* Image or Initial */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={voucher.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm truncate">
                      {voucher.title}
                    </h3>
                    <Badge className={`${badgeClass} text-xs`}>
                      {voucher.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        voucher.isSold
                          ? "text-red-600 border-red-300"
                          : "text-green-600 border-green-300"
                      }
                    >
                      {voucher.isSold ? "Sold" : "Available"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-sm">
                    <span className="text-muted-foreground">
                      Face:{" "}
                      <span className="font-medium text-foreground">
                        ₹{voucher.faceValue.toLocaleString("en-IN")}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Selling:{" "}
                      <span className="font-medium text-primary">
                        ₹{voucher.sellingPrice.toLocaleString("en-IN")}
                      </span>
                    </span>
                    <span className="text-green-600 font-medium">
                      {discount}% off
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {voucher.voucherCode}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!voucher.isSold && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-700 border-green-300 hover:bg-green-50 text-xs"
                      onClick={() => handleMarkSold(voucher)}
                      disabled={markAsSold.isPending}
                      data-ocid={`my_vouchers.mark_sold.button.${i + 1}`}
                    >
                      {markAsSold.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      Sold
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => setConfirmDelete(voucher)}
                    disabled={deletingId === voucher.id}
                    data-ocid={`my_vouchers.delete_button.${i + 1}`}
                  >
                    {deletingId === voucher.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent data-ocid="my_vouchers.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{confirmDelete?.title}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="my_vouchers.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="my_vouchers.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
