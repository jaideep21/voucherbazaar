import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import MyVouchersPage from "./components/MyVouchersPage";
import ProfileSetupModal from "./components/ProfileSetupModal";
import SellVoucherPage from "./components/SellVoucherPage";
import { StorageProvider } from "./context/StorageContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerUserProfile } from "./hooks/useQueries";

type Page = "home" | "sell" | "my-vouchers";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const { identity, login } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useCallerUserProfile();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleNavigate = (page: Page) => {
    if ((page === "sell" || page === "my-vouchers") && !isAuthenticated) {
      void login();
      return;
    }
    setCurrentPage(page);
    if (page === "home") setSearchQuery("");
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (currentPage !== "home") setCurrentPage("home");
  };

  const handleLoginRequired = () => {
    void login();
  };

  return (
    <StorageProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          userProfile={userProfile ?? null}
        />

        <div className="flex-1">
          {currentPage === "home" && (
            <HomePage
              searchQuery={searchQuery}
              onLoginRequired={handleLoginRequired}
            />
          )}
          {currentPage === "sell" && isAuthenticated && (
            <SellVoucherPage onNavigate={handleNavigate} />
          )}
          {currentPage === "my-vouchers" && isAuthenticated && (
            <MyVouchersPage onNavigate={handleNavigate} />
          )}
          {(currentPage === "sell" || currentPage === "my-vouchers") &&
            !isAuthenticated && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <p className="text-muted-foreground">
                  Please log in to continue.
                </p>
              </div>
            )}
        </div>

        {/* Footer */}
        <footer className="bg-[#0f172a] text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                  <span className="font-bold text-lg">VoucherBazaar</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  India's trusted marketplace for buying and selling gift
                  vouchers at the best prices.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-3 text-sm">Categories</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>GPay & PhonePe</li>
                  <li>Flipkart & Shopping</li>
                  <li>Travel & Hotels</li>
                  <li>Food & Entertainment</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3 text-sm">Platform</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigate("home")}
                      className="hover:text-white transition-colors"
                    >
                      Explore Vouchers
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigate("sell")}
                      className="hover:text-white transition-colors"
                    >
                      Sell a Voucher
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3 text-sm">Trust & Safety</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Verified Sellers</li>
                  <li>Secure Transactions</li>
                  <li>Internet Identity Auth</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} VoucherBazaar. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs">
                Built with ❤️ using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>

      <ProfileSetupModal
        open={showProfileSetup}
        onComplete={() =>
          queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] })
        }
      />
      <Toaster richColors />
    </StorageProvider>
  );
}
