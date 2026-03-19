import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useStorage } from "../context/StorageContext";
import {
  useCallerUserProfile,
  useCreateVoucher,
  useExtractText,
} from "../hooks/useQueries";

const CATEGORIES = [
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

type Page = "home" | "sell" | "my-vouchers";

interface Props {
  onNavigate: (page: Page) => void;
}

function parseOcrText(text: string): Partial<{
  voucherCode: string;
  title: string;
  faceValue: string;
  sellingPrice: string;
  description: string;
}> {
  const result: Partial<{
    voucherCode: string;
    title: string;
    faceValue: string;
    sellingPrice: string;
    description: string;
  }> = {};
  // Extract code-like pattern (uppercase alphanumeric, 8-20 chars)
  const codeMatch = text.match(/\b[A-Z0-9]{8,20}\b/);
  if (codeMatch) result.voucherCode = codeMatch[0];
  // Extract rupee amounts
  const amountMatches = text.match(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/g);
  if (amountMatches && amountMatches.length > 0) {
    const amounts = amountMatches
      .map((m) => Number.parseFloat(m.replace(/[₹,\s]/g, "")))
      .sort((a, b) => b - a);
    if (amounts[0]) result.faceValue = amounts[0].toString();
    if (amounts[1]) result.sellingPrice = amounts[1].toString();
  }
  // First line as title hint
  const firstLine = text.split("\n")[0].trim();
  if (firstLine && firstLine.length < 80) {
    result.description = text.slice(0, 200);
  }
  return result;
}

export default function SellVoucherPage({ onNavigate }: Props) {
  const { uploadFile, isReady, getImageUrl } = useStorage();
  const createVoucher = useCreateVoucher();
  const extractText = useExtractText();
  const { data: userProfile } = useCallerUserProfile();

  const [uploadedImageId, setUploadedImageId] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    faceValue: "",
    sellingPrice: "",
    voucherCode: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateForm = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isReady) {
      toast.error("Storage is not ready. Please wait.");
      return;
    }

    // Preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const hash = await uploadFile(file, (pct) => setUploadProgress(pct));
      setUploadedImageId(hash);
      toast.success("Image uploaded! Detecting voucher details...");

      // OCR
      setIsExtracting(true);
      try {
        const imageUrl = getImageUrl(hash);
        const ocrText = await extractText.mutateAsync(imageUrl);
        const parsed = parseOcrText(ocrText);
        if (parsed.voucherCode) updateForm("voucherCode", parsed.voucherCode);
        if (parsed.faceValue) updateForm("faceValue", parsed.faceValue);
        if (parsed.sellingPrice)
          updateForm("sellingPrice", parsed.sellingPrice);
        if (parsed.description) updateForm("description", parsed.description);
        if (ocrText.length > 5) {
          toast.success("Voucher details detected from image!");
        }
      } catch {
        // OCR failed silently; user can fill manually
      } finally {
        setIsExtracting(false);
      }
    } catch {
      toast.error("Image upload failed. Please try again.");
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sellerName = userProfile?.displayName ?? "Anonymous";
    try {
      await createVoucher.mutateAsync({
        title: form.title,
        category: form.category,
        faceValue: Number.parseFloat(form.faceValue),
        sellingPrice: Number.parseFloat(form.sellingPrice),
        voucherCode: form.voucherCode,
        description: form.description,
        imageId: uploadedImageId,
        sellerName,
      });
      setSubmitted(true);
      toast.success("Voucher listed successfully!");
    } catch {
      toast.error("Failed to list voucher. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Voucher Listed!</h2>
          <p className="text-muted-foreground mb-6">
            Your voucher is now live on the marketplace.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  title: "",
                  category: "",
                  faceValue: "",
                  sellingPrice: "",
                  voucherCode: "",
                  description: "",
                });
                setUploadedImageId("");
                setPreviewUrl("");
              }}
            >
              List Another
            </Button>
            <Button variant="outline" onClick={() => onNavigate("my-vouchers")}>
              My Vouchers
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-1">Sell a Voucher</h1>
        <p className="text-muted-foreground mb-8">
          Upload your voucher and we'll auto-detect the details.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>
              Voucher Image{" "}
              <span className="text-muted-foreground text-xs">
                (optional — auto-detects details)
              </span>
            </Label>
            <div
              className="relative border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/2 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) =>
                e.key === "Enter" && fileInputRef.current?.click()
              }
              data-ocid="sell.dropzone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                data-ocid="sell.upload_button"
              />
              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-40 rounded-lg object-contain"
                  />
                  {isUploading && (
                    <div className="w-full max-w-xs">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {uploadProgress}% uploaded
                      </p>
                    </div>
                  )}
                  {isExtracting && (
                    <div
                      className="flex items-center gap-2 text-sm text-primary"
                      data-ocid="sell.loading_state"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Detecting voucher details...
                    </div>
                  )}
                  {!isUploading && !isExtracting && uploadedImageId && (
                    <div
                      className="flex items-center gap-1.5 text-sm text-green-600"
                      data-ocid="sell.success_state"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Image uploaded & analyzed
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Click to upload voucher image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP • Auto-detects voucher code & amount
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="title">Voucher Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Google Pay Cashback Voucher"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                required
                data-ocid="sell.title.input"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => updateForm("category", v)}
                required
              >
                <SelectTrigger data-ocid="sell.category.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voucher Code */}
            <div className="space-y-1.5">
              <Label htmlFor="voucherCode">Voucher Code *</Label>
              <Input
                id="voucherCode"
                placeholder="e.g. GPAY2024CASH"
                value={form.voucherCode}
                onChange={(e) => updateForm("voucherCode", e.target.value)}
                required
                className="font-mono"
                data-ocid="sell.voucher_code.input"
              />
            </div>

            {/* Face Value */}
            <div className="space-y-1.5">
              <Label htmlFor="faceValue">Face Value (₹) *</Label>
              <Input
                id="faceValue"
                type="number"
                min="1"
                placeholder="1000"
                value={form.faceValue}
                onChange={(e) => updateForm("faceValue", e.target.value)}
                required
                data-ocid="sell.face_value.input"
              />
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="1"
                placeholder="850"
                value={form.sellingPrice}
                onChange={(e) => updateForm("sellingPrice", e.target.value)}
                required
                data-ocid="sell.selling_price.input"
              />
            </div>

            {/* Discount preview */}
            {form.faceValue && form.sellingPrice && (
              <div className="sm:col-span-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  Buyer saves{" "}
                  {Math.round(
                    (1 -
                      Number.parseFloat(form.sellingPrice) /
                        Number.parseFloat(form.faceValue)) *
                      100,
                  )}
                  % — ₹
                  {(
                    Number.parseFloat(form.faceValue) -
                    Number.parseFloat(form.sellingPrice)
                  ).toLocaleString("en-IN")}{" "}
                  off
                </p>
              </div>
            )}

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Terms and conditions, validity, usage instructions..."
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                rows={3}
                data-ocid="sell.description.textarea"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            disabled={
              createVoucher.isPending ||
              isUploading ||
              isExtracting ||
              !form.category
            }
            data-ocid="sell.submit_button"
          >
            {createVoucher.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Listing Voucher...
              </>
            ) : (
              "List Voucher for Sale"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
