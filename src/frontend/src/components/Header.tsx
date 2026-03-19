import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Menu, Search, Tag, X } from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Page = "home" | "sell" | "my-vouchers";

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  userProfile: UserProfile | null | undefined;
}

export default function Header({
  currentPage,
  onNavigate,
  onSearch,
  searchQuery,
  userProfile,
}: Props) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      if (error?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onNavigate("home");
  };

  const displayName =
    userProfile?.displayName ??
    identity?.getPrincipal().toString().slice(0, 8) ??
    "";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        {/* Logo */}
        <button
          type="button"
          className="flex items-center gap-2 shrink-0 mr-2"
          onClick={() => onNavigate("home")}
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Tag className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:block">
            Voucher<span className="text-primary">Bazaar</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentPage === "home"
                ? "text-primary bg-primary/8"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            data-ocid="nav.explore.link"
          >
            Explore Vouchers
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => onNavigate("sell")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentPage === "sell"
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-ocid="nav.sell.link"
            >
              Sell
            </button>
          )}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => onNavigate("my-vouchers")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentPage === "my-vouchers"
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-ocid="nav.my_vouchers.link"
            >
              My Vouchers
            </button>
          )}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vouchers..."
              className="pl-9 h-9 text-sm bg-muted/50 border-border"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              data-ocid="header.search_input"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <>
              <Button
                variant="default"
                size="sm"
                className="hidden md:flex"
                onClick={() => onNavigate("sell")}
                data-ocid="header.sell_button"
              >
                + Sell Voucher
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
                    data-ocid="header.user_menu.button"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary text-white">
                        {initials || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() => onNavigate("my-vouchers")}
                    data-ocid="header.my_vouchers.link"
                  >
                    My Vouchers
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onNavigate("sell")}
                    data-ocid="header.sell.link"
                  >
                    Sell a Voucher
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                    data-ocid="header.logout_button"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="hidden sm:flex font-medium"
                data-ocid="header.login_button"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="font-medium"
                data-ocid="header.signup_button"
              >
                {isLoggingIn ? "Connecting..." : "Sign Up"}
              </Button>
            </>
          )}
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-1.5 rounded-md hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vouchers..."
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
            onClick={() => {
              onNavigate("home");
              setMobileMenuOpen(false);
            }}
          >
            Explore Vouchers
          </button>
          {isAuthenticated && (
            <>
              <button
                type="button"
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                onClick={() => {
                  onNavigate("sell");
                  setMobileMenuOpen(false);
                }}
              >
                Sell Voucher
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                onClick={() => {
                  onNavigate("my-vouchers");
                  setMobileMenuOpen(false);
                }}
              >
                My Vouchers
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-muted"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
