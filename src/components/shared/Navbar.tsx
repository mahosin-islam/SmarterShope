'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, Search, X, Heart, ShoppingBag, User, LayoutDashboard, LogOut, ChevronDown, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';
import { useAuthModal } from '@/features/auth/contexts/authModal.context';
import { useGoogleAccounts } from '@/features/auth/hooks/useGoogleAccounts';

interface SuggestionProduct {
  id: string;
  slug: string;
  title: string;
  basePrice: number;
  imageUrl?: string;
  images?: Array<{ url: string }>;
  category?: { name: string; slug: string };
}

interface SuggestionCategory {
  id: string;
  name: string;
  slug: string;
}

const NAV_LINKS = [
  { label: 'Shop All', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'Brands', href: '/brands' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { accounts: googleAccounts } = useGoogleAccounts();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Live predictive search states
  const [productSuggestions, setProductSuggestions] = useState<SuggestionProduct[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<SuggestionCategory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch search suggestions with debounce
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setProductSuggestions([]);
      setCategorySuggestions([]);
      setIsSearching(false);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_URL}/products?search=${encodeURIComponent(query)}&limit=6`),
          fetch(`${API_URL}/categories`),
        ]);

        if (prodRes.ok) {
          const json = await prodRes.json();
          setProductSuggestions(Array.isArray(json.data) ? json.data : []);
        } else {
          setProductSuggestions([]);
        }

        if (catRes.ok) {
          const catJson = await catRes.json();
          const allCats: SuggestionCategory[] = Array.isArray(catJson.data) ? catJson.data : [];
          const matched = allCats.filter((c) =>
            c.name.toLowerCase().includes(query.toLowerCase())
          );
          setCategorySuggestions(matched.slice(0, 3));
        } else {
          setCategorySuggestions([]);
        }

        setShowSearchDropdown(true);
      } catch {
        setProductSuggestions([]);
        setCategorySuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const updateCounts = () => {
      try {
        const cartRaw = localStorage.getItem('modora_cart');
        if (cartRaw) {
          const items = JSON.parse(cartRaw);
          const total = items.reduce(
            (sum: number, i: { quantity?: number }) => sum + (i.quantity || 1),
            0
          );
          setCartCount(total);
        } else {
          setCartCount(0);
        }

        const wishRaw = localStorage.getItem('modora_wishlist');
        if (wishRaw) {
          const list = JSON.parse(wishRaw);
          setWishlistCount(Array.isArray(list) ? list.length : 0);
        } else {
          setWishlistCount(0);
        }
      } catch {
        setCartCount(0);
        setWishlistCount(0);
      }
    };

    updateCounts();
    window.addEventListener('cart_updated', updateCounts);
    window.addEventListener('wishlist_updated', updateCounts);
    return () => {
      window.removeEventListener('cart_updated', updateCounts);
      window.removeEventListener('wishlist_updated', updateCounts);
    };
  }, []);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const displayName = user?.firstName ?? user?.email?.split('@')[0] ?? 'Account';

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e8e6e3]">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 -ml-1 text-neutral-800 hover:text-black focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
          </button>

          <Link href="/" className="flex items-center space-x-2">
            <span className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#ff4600] font-bold">
              MODORA
            </span>
          </Link>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-wider font-medium text-neutral-700">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[#ff4600] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Wishlist Icon — Always visible */}
          {user ? (
            <Link
              href="/account/wishlist"
              className="relative p-1.5 text-neutral-800 hover:text-[#ff4600] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff4600] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in-50">
                  {wishlistCount}
                </span>
              )}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="relative p-1.5 text-neutral-800 hover:text-[#ff4600] transition-colors focus:outline-none"
              aria-label="Wishlist (sign in required)"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
            </button>
          )}

          {/* Cart Icon — ALWAYS visible for all visitors, customers, and admins */}
          <Link
            href="/cart"
            className="relative p-1.5 text-neutral-800 hover:text-[#ff4600] transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff4600] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth area */}
          {isLoading ? (
            /* Skeleton while session restores */
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            /* Authenticated: profile dropdown */
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[#e8e6e3] hover:border-[#ff4600] text-neutral-800 hover:text-[#ff4600] transition-colors focus:outline-none"
                aria-label="Account menu"
                aria-expanded={profileDropdownOpen}
              >
                <User className="w-4 h-4 stroke-[2]" />
                <span className="hidden sm:block text-xs font-medium max-w-[80px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
              </button>

              {/* Dropdown */}
              {profileDropdownOpen && (
                <>
                  {/* Backdrop to close */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#e8e6e3] rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-[#e8e6e3]">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-neutral-800 truncate">{user.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#fff3ec] text-[#ff4600]">
                        {user.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-[#fff3ec] hover:text-[#ff4600] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    {!isAdmin && (
                      <Link
                        href="/account/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-[#fff3ec] hover:text-[#ff4600] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Guest: Google account chips + Login / Register buttons */
            <div className="flex items-center gap-2">
              {googleAccounts.length > 0 && (
                <>
                  <span className="px-2 py-1 text-[10px] text-neutral-500 hidden sm:block">Sign in as:</span>
                  {googleAccounts.map((acct) => (
                    <button
                      key={acct.email}
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.googleTriggerPrompt) {
                          window.googleTriggerPrompt();
                        } else {
                          openAuthModal('login');
                        }
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[#e8e6e3] bg-white text-xs font-medium text-neutral-800 hover:border-[#ff4600] hover:text-[#ff4600] transition-colors focus:outline-none"
                      aria-label={`Sign in with ${acct.email}`}
                    >
                      <Mail className="w-3 h-3 text-neutral-500" />
                      <span className="truncate max-w-[120px]">{acct.email}</span>
                    </button>
                  ))}
                </>
              )}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:text-[#ff4600] px-2.5 py-1.5 rounded-lg hover:bg-[#fff3ec] transition-colors focus:outline-none"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="text-xs font-semibold uppercase tracking-wider text-white bg-[#ff4600] hover:bg-[#e03e00] px-3 py-1.5 rounded-lg transition-colors focus:outline-none"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Integrated Search Input Row with Live Autocomplete Dropdown */}
      <div ref={searchContainerRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              setShowSearchDropdown(false);
              router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            }
          }}
          className="relative flex items-center"
        >
          <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setShowSearchDropdown(true);
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search garments, shoes, bags & accessories..."
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] transition-all placeholder:text-neutral-400 text-neutral-800"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3 w-4 h-4 text-neutral-400 animate-spin" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-3 p-0.5 text-neutral-400 hover:text-neutral-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </form>

        {/* Live Search Suggestions Dropdown */}
        {showSearchDropdown && searchQuery.trim().length >= 2 && (
          <div className="absolute left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 top-full mt-1.5 bg-white border border-[#e8e6e3] rounded-xl shadow-2xl z-50 overflow-hidden max-h-[460px] overflow-y-auto divide-y divide-neutral-100 animate-in fade-in zoom-in-95">
            {/* Matching Categories if any */}
            {categorySuggestions.length > 0 && (
              <div className="p-3 bg-neutral-50/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Matching Categories
                </span>
                <div className="flex flex-wrap gap-2">
                  {categorySuggestions.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                        router.push(`/products?category=${cat.slug}`);
                      }}
                      className="px-3 py-1.5 bg-white border border-[#e8e6e3] hover:border-[#ff4600] hover:text-[#ff4600] rounded-lg text-xs font-semibold text-neutral-800 transition-colors shadow-2xs flex items-center space-x-1.5"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-neutral-400">&rarr;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Products */}
            {productSuggestions.length > 0 ? (
              <div className="p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1.5 block">
                  Products ({productSuggestions.length})
                </span>
                <div className="space-y-1">
                  {productSuggestions.map((product) => {
                    const imgUrl = product.images?.[0]?.url || product.imageUrl || '';
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          router.push(`/products/${product.slug}`);
                        }}
                        className="w-full flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#fff9f5] transition-colors text-left group"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-12 h-14 rounded-lg bg-neutral-100 border border-[#e8e6e3] overflow-hidden shrink-0">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={product.title}
                              fill
                              sizes="48px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Title, Category & Price */}
                        <div className="flex-1 min-w-0">
                          {product.category?.name && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">
                              {product.category.name}
                            </span>
                          )}
                          <p className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-[#ff4600] truncate transition-colors">
                            {product.title}
                          </p>
                          <span className="text-xs font-bold text-[#ff4600] mt-0.5 block">
                            ৳{Number(product.basePrice).toFixed(0)}
                          </span>
                        </div>

                        <span className="text-xs text-neutral-300 group-hover:text-[#ff4600] group-hover:translate-x-0.5 transition-all">
                          &rarr;
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : !isSearching && categorySuggestions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-neutral-500">
                  No products found matching &ldquo;<span className="font-semibold text-neutral-800">{searchQuery}</span>&rdquo;.
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Try searching for keywords like &ldquo;sneakers&rdquo;, &ldquo;leather&rdquo;, &ldquo;belt&rdquo; or &ldquo;wallet&rdquo;.
                </p>
              </div>
            ) : null}

            {/* Bottom View All CTA */}
            {productSuggestions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowSearchDropdown(false);
                  router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="w-full py-3 px-4 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-[#ff4600] text-center transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>View all search results for &ldquo;{searchQuery}&rdquo;</span>
                <span>&rarr;</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e8e6e3] bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-800">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#ff4600]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile auth actions */}
          {!isLoading && !user && (
            <div className="pt-3 border-t border-[#e8e6e3] flex gap-3">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}
                className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider border border-[#ff4600] text-[#ff4600] rounded-lg hover:bg-[#fff3ec] transition-colors"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openAuthModal('register'); }}
                className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider bg-[#ff4600] text-white rounded-lg hover:bg-[#e03e00] transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
