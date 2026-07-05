import { useState, useRef, useEffect } from "react";
import { Search, Menu, Expand, Shrink, Moon, Sun, ChevronDown, Zap, Palette, Paintbrush, Settings, ArrowRight, Monitor, User, LogOut, CreditCard, Building2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLayoutStore } from "@/store/layoutStore";
import { useThemeStore, type LayoutTheme, type PrimaryColor, type FontFamily } from "@/store/themeStore";
import { useTenantStore } from "@/store/tenantStore";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

// Theme dropdown component inside Header.tsx
function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme, setTheme, primaryColor, setPrimaryColor, fontFamily, setFontFamily } = useThemeStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const colors: { name: string, value: PrimaryColor, hex: string, textColor: string }[] = [
    { name: "Blue", value: "blue", hex: "#3b82f6", textColor: "text-blue-500" },
    { name: "Teal", value: "teal", hex: "#14b8a6", textColor: "text-teal-500 dark:text-teal-400" },
    { name: "Purple", value: "purple", hex: "#8b5cf6", textColor: "text-purple-500" },
    { name: "Green", value: "green", hex: "#10b981", textColor: "text-emerald-500" },
    { name: "Orange", value: "orange", hex: "#f97316", textColor: "text-orange-500" },
    { name: "Red", value: "red", hex: "#ef4444", textColor: "text-red-500" },
  ];

  const layouts: { name: string, value: LayoutTheme, icon: any }[] = [
    { name: "Light Mode", value: "light", icon: Sun },
    { name: "Semi Dark", value: "semi-dark", icon: Monitor },
    { name: "Dark Mode", value: "dark", icon: Moon },
  ];

  const fonts: { name: string, value: FontFamily }[] = [
    { name: "Lato", value: "lato" },
    { name: "Rubik", value: "rubik" },
    { name: "Inter", value: "inter" },
    { name: "Cinzel", value: "cinzel" },
    { name: "Poppins", value: "poppins" },
    { name: "Montserrat", value: "montserrat" },
    { name: "Roboto", value: "roboto" },
    { name: "Nunito", value: "nunito" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors rounded-sm hover:bg-primary-50 dark:hover:bg-white/5",
          isOpen && "bg-primary-50 text-primary-500 dark:bg-white/5 dark:text-white"
        )}
        title="Theme Settings"
      >
        <Paintbrush className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-[-16px] sm:right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] sm:max-w-none bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg shadow-xl z-50 p-5 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-5 flex items-center shrink-0">
            <Palette className="h-4 w-4 mr-2 text-primary-500" />
            Theme Customizer
          </h3>
          
          <div className="space-y-6 overflow-y-auto pr-1 flex-1 py-1">
            {/* Layout Options */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Layout Style</label>
              <div className="grid grid-cols-3 gap-2">
                {layouts.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setTheme(l.value)}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors border cursor-pointer",
                      theme === l.value 
                        ? "bg-primary-50 dark:bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-500 shadow-sm" 
                        : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20"
                    )}
                  >
                    <l.icon className="h-4 w-4 mb-1.5 opacity-80" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{l.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Section */}
            <div className="relative border border-slate-200 dark:border-white/10 rounded-lg p-4 pt-6 bg-slate-50/30 dark:bg-white/[0.01]">
              <div className="absolute -top-3 left-4 bg-white dark:bg-[#121212] px-3.5 py-0.5 border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400 shadow-sm">
                Colors
              </div>
              <div className="grid grid-cols-3 gap-2">
                {colors.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setPrimaryColor(c.value)}
                    className={cn(
                      "h-10 border text-center font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center cursor-pointer bg-white dark:bg-zinc-900 shadow-sm",
                      primaryColor === c.value
                        ? "border-primary-500 text-primary-500 bg-primary-50/20 dark:bg-primary-500/10"
                        : "border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10"
                    )}
                  >
                    {primaryColor === c.value ? (
                      <span className="text-primary-500 font-extrabold text-xs">✓</span>
                    ) : (
                      <span className={cn("font-bold text-[10px] uppercase tracking-wider", c.textColor)}>
                        {c.name}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Section */}
            <div className="relative border border-slate-200 dark:border-white/10 rounded-lg p-4 pt-6 bg-slate-50/30 dark:bg-white/[0.01]">
              <div className="absolute -top-3 left-4 bg-white dark:bg-[#121212] px-3.5 py-0.5 border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400 shadow-sm">
                Typography
              </div>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFontFamily(f.value)}
                    className={cn(
                      "h-10 border text-center font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center cursor-pointer bg-white dark:bg-zinc-900 shadow-sm",
                      fontFamily === f.value
                        ? "border-primary-500 text-primary-500 bg-primary-50/20 dark:bg-primary-500/10"
                        : "border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10"
                    )}
                  >
                    {fontFamily === f.value ? (
                      <span className="text-primary-500 font-extrabold text-xs">✓</span>
                    ) : (
                      <span>{f.name}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// Profile Dropdown
function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { activeBusiness, clearActiveBusiness } = useTenantStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Use both roles and route path for robust determination
  const isSuperadmin = user?.roles?.some(r => r.name === 'Superadmin') || location.pathname.startsWith('/superadmin');
  const isPartner = user?.roles?.some(r => r.name === 'Partner') || location.pathname.startsWith('/partner');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Handle absolute vs relative avatar URL
  const avatarUrl = user?.avatar
    ? user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${user.avatar}`
    : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0f172a&color=ffffff`;

  return (
    <div
      className="relative group"
      ref={ref}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 ml-2 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer border-2 border-slate-200 dark:border-white/10 shadow-sm overflow-hidden ring-2 ring-transparent group-hover:ring-primary-500/30 transition-all duration-300"
      >
        <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
      </div>

      {/* Invisible bridge to keep hover state active when moving from avatar to menu */}
      <div className="absolute right-0 top-full h-3 w-full z-40"></div>

      <div className={cn(
        "absolute right-[-16px] sm:right-0 mt-3 w-72 max-w-[calc(100vw-2rem)] sm:max-w-none bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top-right",
        isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      )}>
        {/* Profile Header Block */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 shadow-sm">
            <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-800 dark:text-white truncate tracking-tight">{user?.name || "User"}</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email || ""}</p>
            {isSuperadmin && (
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30">
                Superadmin
              </span>
            )}
          </div>
        </div>

        {/* Business Context (Hidden for Superadmin and Partners) */}
        {!isSuperadmin && !isPartner && (
          <div className="p-2 space-y-0.5 border-b border-slate-100 dark:border-white/5">
            <div className="px-3 py-2 mb-1">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Business</p>
              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 truncate mt-0.5">{activeBusiness?.name || 'None Selected'}</p>
            </div>
            <button
              onClick={() => { setIsOpen(false); navigate('/setup/profile'); }}
              className="w-full flex items-center px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-all duration-200 group/btn"
            >
              <Settings className="w-4 h-4 mr-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:rotate-90 transition-all duration-300" /> Edit Business
            </button>
            <button
              onClick={() => { clearActiveBusiness(); setIsOpen(false); navigate('/setup/profile'); }}
              className="w-full flex items-center px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-all duration-200 group/btn"
            >
              <Building2 className="w-4 h-4 mr-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" /> Add New Business
            </button>
          </div>
        )}

        {/* User Options */}
        <div className="p-2 space-y-0.5">
          <button
            onClick={() => { setIsOpen(false); navigate(isSuperadmin ? '/superadmin/profile' : isPartner ? '/partner/profile' : '/profile'); }}
            className="w-full flex items-center px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-all duration-200 group/btn"
          >
            <User className="w-4 h-4 mr-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" /> My Profile
          </button>
          {!isSuperadmin && !isPartner && (
            <button className="w-full flex items-center px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-all duration-200 group/btn">
              <CreditCard className="w-4 h-4 mr-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" /> Billing & Plans
            </button>
          )}
        </div>

        {/* Logout */}
        <div className="border-t border-slate-100 dark:border-white/5 p-2 bg-slate-50/50 dark:bg-white/[0.01]">
          <button
            onClick={() => logout()}
            className="w-full flex items-center px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all duration-200 group/btn"
          >
            <LogOut className="w-4 h-4 mr-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header({ className }: { className?: string }) {
  const { toggleSidebar, isSidebarCollapsed } = useLayoutStore();
  const { theme, toggleTheme } = useThemeStore();
  const { businesses, activeBusiness, setActiveBusiness, fetchBusinesses } = useTenantStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperadminMode = location.pathname.startsWith('/superadmin');
  const isPartnerMode = location.pathname.startsWith('/partner');

  useEffect(() => {
    if (!isSuperadminMode && !isPartnerMode) {
      fetchBusinesses();
    }
  }, [fetchBusinesses, isSuperadminMode, isPartnerMode]);

  // Fullscreen toggle logic
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <header className={cn("h-16 flex items-center justify-between px-6 bg-white dark:bg-[#09090b] border-b border-slate-200 dark:border-white/5 sticky top-0 z-30 shadow-sm transition-colors duration-300", className)}>
      <div className="flex items-center flex-1 gap-4">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors rounded-sm hover:bg-primary-50 dark:hover:bg-white/5">
          {isSidebarCollapsed ? <ArrowRight className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {isSuperadminMode ? (
          <div className="flex items-center ml-2">
            {/* Empty space to keep layout balanced */}
          </div>
        ) : (
          <div className="max-w-xs w-full hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                placeholder="SEARCH NAVIGATION..."
                className="block w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-xs font-bold tracking-widest text-slate-800 dark:text-white placeholder:text-slate-400 uppercase shadow-inner"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Branch Selector */}
        {!isSuperadminMode && !isPartnerMode && (
          <div className="relative">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary-200 dark:border-primary-500/20 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors"
            >
              {activeBusiness?.logo_path ? (
                <img src={activeBusiness.logo_path} alt="Logo" className="w-4 h-4 object-contain rounded-sm" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-primary-400 flex items-center justify-center relative">
                  <div className="w-1 h-1 bg-primary-600 rounded-full absolute -top-1 right-0"></div>
                </div>
              )}
              <span className="text-[10px] font-bold tracking-widest uppercase truncate max-w-[120px]">
                {activeBusiness?.name || 'ALL BRANCHES'}
              </span>
              <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-sm shadow-xl z-50 py-2">
                <div className="px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Branch</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {businesses.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveBusiness(b);
                        setIsBranchDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-3 transition-colors",
                        activeBusiness?.id === b.id
                          ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      {b.logo_path ? (
                        <img src={b.logo_path} alt="Logo" className="w-5 h-5 object-contain rounded-sm bg-white/10" />
                      ) : (
                        <Building2 className="w-4 h-4 opacity-70" />
                      )}
                      <span className="truncate">{b.name}</span>
                    </button>
                  ))}
                  {businesses.length === 0 && (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center">No branches found</div>
                  )}
                </div>
                <div className="border-t border-slate-100 dark:border-white/5 mt-1 pt-1 px-2">
                  <button
                    onClick={() => {
                      setIsBranchDropdownOpen(false);
                      navigate('/setup/profile');
                    }}
                    className="w-full flex items-center justify-center py-2 text-xs font-bold text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-sm transition-colors"
                  >
                    + Add New Branch
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plan Badge */}
        {!isSuperadminMode && !isPartnerMode && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-[#09090b] shadow-sm ml-2 mr-2">
            <div className="bg-primary-50 dark:bg-primary-500/10 text-primary-500 p-1.5 rounded-sm">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-0.5">Current Plan</div>
              <div className="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">PROFESSIONAL Z</div>
            </div>
            <div className="border-l border-slate-200 dark:border-white/10 pl-3 ml-1">
              <div className="text-[8px] font-bold text-emerald-500 tracking-widest uppercase">14+ DAYS LEFT</div>
              <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">ACTIVE TRIAL</div>
            </div>
          </div>
        )}

        {/* Fullscreen Toggle */}
        <button onClick={handleFullscreen} className="p-2 text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors rounded-sm hover:bg-primary-50 dark:hover:bg-white/5" title="Toggle Fullscreen">
          {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </button>

        {/* Toggle generic theme quickly */}
        <button onClick={() => toggleTheme()} className="p-2 text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors rounded-sm hover:bg-primary-50 dark:hover:bg-white/5" title="Toggle Dark/Light Mode">
          {theme === 'dark' || theme === 'semi-dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Advanced Theme Customizer */}
        <ThemeCustomizer />

        {/* Profile Dropdown Menu */}
        <ProfileMenu />

      </div>
    </header>
  );
}
