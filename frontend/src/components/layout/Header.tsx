import { useState, useRef, useEffect } from "react";
import { Menu, Expand, Shrink, Moon, Sun, Palette, Paintbrush, Settings, ArrowRight, Monitor, User, LogOut, CreditCard, Building2, Store, HelpCircle, Crown, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLayoutStore } from "@/store/layoutStore";
import { useThemeStore, type LayoutTheme, type PrimaryColor, type FontFamily } from "@/store/themeStore";
import { useTenantStore } from "@/store/tenantStore";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { businessMenuGroups, superadminMenuGroups, isRouteActive } from "./Sidebar";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useFeatureAccess } from "@/features/business/hooks/useFeatureAccess";
import { FeatureLockModal } from "@/features/business/components/FeatureLockModal";
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

  const colors: { name: string, value: PrimaryColor, textColor: string }[] = [
    { name: "Blue", value: "blue", textColor: "text-blue-500" },
    { name: "Teal", value: "teal", textColor: "text-teal-500 dark:text-teal-400" },
    { name: "Purple", value: "purple", textColor: "text-purple-500" },
    { name: "Green", value: "green", textColor: "text-emerald-500" },
    { name: "Orange", value: "orange", textColor: "text-orange-500" },
    { name: "Red", value: "red", textColor: "text-red-500" },
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
        <div className="absolute right-[-16px] sm:right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] sm:max-w-none bg-card border border-border rounded-lg shadow-xl z-50 p-5 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
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
              <div className="absolute -top-3 left-4 bg-card px-3.5 py-0.5 border border-border rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground shadow-sm">
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
              <div className="absolute -top-3 left-4 bg-card px-3.5 py-0.5 border border-border rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground shadow-sm">
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
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { activeBusiness, clearActiveBusiness, businesses } = useTenantStore();
  const { getMaxLimit, planName } = useFeatureAccess();
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine Role for Header Display
  const isSuperadmin = user?.roles?.some(r => r.name === 'Superadmin') || location.pathname.startsWith('/superadmin');
  const isPartner = user?.roles?.some(r => r.name === 'Partner') || location.pathname.startsWith('/partner');
  const isBusinessManager = user?.roles?.some((r) => r.name === 'admin' || r.name === 'manager' || r.name === 'Business Admin');
  
  let displayRole = "Staff";
  if (isSuperadmin) displayRole = "Superadmin";
  else if (isPartner) displayRole = "Partner";
  else if (activeBusiness && activeBusiness.owner_id === user?.id) displayRole = "System Admin";
  else if (isBusinessManager) displayRole = "Manager";

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
        "absolute right-[-16px] sm:right-0 mt-3 w-72 max-w-[calc(100vw-2rem)] sm:max-w-none bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top-right",
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
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30">
                {displayRole}
              </span>
              {!isSuperadmin && !isPartner && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                  {planName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Business Context (Hidden for Superadmin and Partners) */}
        {!isSuperadmin && !isPartner && (
          <div className="p-2 space-y-0.5 border-b border-slate-100 dark:border-white/5">
            <div className="px-3 py-2 mb-1">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Business</p>
              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 truncate mt-0.5">{activeBusiness?.name || 'None Selected'}</p>
            </div>
            {isBusinessManager && (
              <>
                <button
                  onClick={() => { setIsOpen(false); navigate('/setup/profile'); }}
                  className="w-full flex items-center px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-all duration-200 group/btn"
                >
                  <Building2 className="w-4 h-4 mr-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" /> Edit Branch
                </button>
                <button
                  onClick={() => { 
                    const maxLocations = getMaxLimit('max_locations');
                    if (businesses.length >= maxLocations) {
                      setIsOpen(false);
                      setIsLockModalOpen(true);
                    } else {
                      clearActiveBusiness(); 
                      setIsOpen(false); 
                      navigate('/setup/profile');
                    }
                  }}
                  className="w-full flex items-center px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-all duration-200 group/btn"
                >
                  <Building2 className="w-4 h-4 mr-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" /> 
                  <span className="flex-1 text-left">Add New Branch</span>
                  <span className="text-[10px] font-bold text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-1.5 py-0.5 rounded ml-2">
                    {businesses.length}/{getMaxLimit('max_locations')}
                  </span>
                  {businesses.length >= getMaxLimit('max_locations') && (
                    <Crown className="w-3.5 h-3.5 text-yellow-500 ml-1.5 flex-shrink-0" />
                  )}
                </button>
              </>
            )}
          </div>
        )}

        <FeatureLockModal isOpen={isLockModalOpen} onClose={() => setIsLockModalOpen(false)} featureName="max_locations" />

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
              <CreditCard className="w-4 h-4 mr-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" /> Billing &amp; Plans
            </button>
          )}
        </div>

        {/* Logout */}
        <div className="border-t border-slate-100 dark:border-white/5 p-2 bg-slate-50/50 dark:bg-white/[0.01]">
          <button
            onClick={() => setIsSignOutOpen(true)}
            className="w-full flex items-center px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all duration-200 group/btn cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" /> Sign out
          </button>
        </div>
      </div>

      <Modal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        title="Confirm Sign Out"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" size="sm" onClick={() => setIsSignOutOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { logout(); setIsSignOutOpen(false); }}>
              Sign Out
            </Button>
          </div>
        }
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Are you sure you want to sign out? This will end your active session.
        </p>
      </Modal>
    </div>
  );
}

export function Header({ className }: { className?: string }) {
  const { toggleSidebar, isSidebarCollapsed } = useLayoutStore();
  const { theme } = useThemeStore();
  const { businesses, activeBusiness, setActiveBusiness, fetchBusinesses } = useTenantStore();
  const user = useAuthStore(state => state.user);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { getMaxLimit } = useFeatureAccess();
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const isSuperadminMode = user?.roles?.some(r => r.name === 'Superadmin') || location.pathname.startsWith('/superadmin');
  const isPartnerMode = location.pathname.startsWith('/partner');
  const isBusinessManager = user?.roles?.some((r) => r.name === 'admin' || r.name === 'manager' || r.name === 'Business Admin');

  // Real-time DateTime logic
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    if (!isSuperadminMode && !isPartnerMode) {
      fetchBusinesses();
    }
  }, [fetchBusinesses, isSuperadminMode, isPartnerMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    if (isBranchDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isBranchDropdownOpen]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Determine active page title + icon from menu groups
  let ActiveIcon: any = Store;
  let currentHeaderTitle = 'Dashboard';

  if (location.pathname === '/profile' || location.pathname === '/superadmin/profile') {
    currentHeaderTitle = 'User Profile';
    ActiveIcon = User;
  } else {
    const allItems = [
      ...superadminMenuGroups.flatMap(g => g.items),
      ...businessMenuGroups.flatMap(g => g.items),
    ];
    const activeItem = allItems.find(item => isRouteActive(item.href, location.pathname));
    if (activeItem) {
      currentHeaderTitle = activeItem.name;
      ActiveIcon = activeItem.icon;
    }
  }

  return (
    <header className={cn("h-14 flex items-center justify-between px-4 bg-card dark:bg-slate-900 border-b border-border sticky top-0 z-30 shadow-sm transition-colors duration-300", className)}>
      <div className="flex items-center flex-1 gap-2 sm:gap-3 min-w-0">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors rounded-sm hover:bg-primary-50 dark:hover:bg-white/5 shrink-0">
          {isSidebarCollapsed ? <ArrowRight className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Active Page Title Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-full border border-primary-100/60 dark:border-primary-500/30 bg-primary-50/50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 select-none shadow-sm animate-in fade-in slide-in-from-left-4 duration-300 min-w-0">
          <ActiveIcon className="h-4 w-4 text-primary-500 dark:text-primary-400 shrink-0" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none truncate max-w-[120px] sm:max-w-[200px]">
            {currentHeaderTitle}
          </span>
        </div>

        {/* Impersonation Banner */}
        {useAuthStore((state) => !!state.originalToken) && (
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 animate-in slide-in-from-top-2 duration-300 shadow-sm ml-1 sm:ml-2 shrink-0">
            <User className="h-4 w-4 shrink-0 hidden sm:block" />
            <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest leading-none truncate max-w-[80px] xl:max-w-[150px]">
              Impersonating {user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                useAuthStore.getState().leaveImpersonation();
                window.location.href = '/staff'; 
              }}
              className="h-6 px-2 sm:ml-1 text-[9px] bg-white hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 font-bold uppercase tracking-widest rounded-full transition-colors shrink-0"
            >
              Leave
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Branch Selector - business mode only */}
        {!isSuperadminMode && !isPartnerMode && (
          isBusinessManager ? (
            <div className="relative" ref={branchDropdownRef}>
              <button
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm border border-primary-200 dark:border-primary-500/20 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors"
              >
                {activeBusiness?.logo_path ? (
                  <img src={activeBusiness.logo_path} alt="Logo" className="w-4 h-4 object-contain rounded-sm" />
                ) : (
                  <Building2 className="w-4 h-4 opacity-70" />
                )}
                <span className="text-[10px] font-bold tracking-widest uppercase truncate max-w-[120px]">
                  {activeBusiness?.name || 'SELECT BRANCH'}
                </span>
              </button>

              {isBranchDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-sm shadow-xl z-50 py-2">
                  <div className="px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Branch</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {businesses.map((b, index) => {
                      const maxLocations = getMaxLimit('max_locations');
                      const isLocked = index >= maxLocations;
                      
                      return (
                      <button
                        key={b.id}
                        onClick={() => {
                          if (isLocked) {
                            setIsBranchDropdownOpen(false);
                            setIsLockModalOpen(true);
                            return;
                          }
                          if (activeBusiness?.id !== b.id) {
                            setActiveBusiness(b);
                            setIsBranchDropdownOpen(false);
                            window.location.reload();
                          } else {
                            setIsBranchDropdownOpen(false);
                          }
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-3 transition-colors",
                          activeBusiness?.id === b.id
                            ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500"
                            : isLocked 
                              ? "text-slate-400 dark:text-slate-500 opacity-70 cursor-not-allowed bg-slate-50/50 dark:bg-white/[0.02]" 
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        )}
                      >
                        {b.logo_path ? (
                          <img src={b.logo_path} alt="Logo" className={cn("w-5 h-5 object-contain rounded-sm bg-white/10", isLocked && "grayscale")} />
                        ) : (
                          <Building2 className="w-4 h-4 opacity-70" />
                        )}
                        <span className="truncate flex-1">{b.name}</span>
                        {isLocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                      </button>
                    )})}
                    {businesses.length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-400 text-center">No branches found</div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 dark:border-white/5 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        const maxLocations = getMaxLimit('max_locations');
                        if (businesses.length >= maxLocations) {
                          setIsBranchDropdownOpen(false);
                          setIsLockModalOpen(true);
                        } else {
                          setIsBranchDropdownOpen(false);
                          navigate('/setup/profile');
                        }
                      }}
                      className="w-full flex items-center justify-center py-2 text-xs font-bold text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-sm transition-colors"
                    >
                      <span className="flex-1 text-center">+ Add New Branch ({businesses.length}/{getMaxLimit('max_locations')})</span>
                      {businesses.length >= getMaxLimit('max_locations') && (
                        <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 select-none shadow-sm">
              {activeBusiness?.logo_path ? (
                <img src={activeBusiness.logo_path} alt="Logo" className="w-4 h-4 object-contain rounded-sm" />
              ) : (
                <Building2 className="w-4 h-4 opacity-70" />
              )}
              <span className="text-[10px] font-bold tracking-widest uppercase truncate max-w-[150px]">
                {activeBusiness?.name || 'Company Name'}
              </span>
            </div>
          )
        )}

        {/* Plan Info Badge */}
        {!isSuperadminMode && !isPartnerMode && isBusinessManager && activeBusiness?.plan && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200/60 dark:border-yellow-700/30 rounded-sm shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/setup/profile')}>
            <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-800/50 flex items-center justify-center shrink-0">
              <Crown className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-extrabold text-yellow-700 dark:text-yellow-500 uppercase tracking-widest leading-none">
                {activeBusiness.plan.name}
              </span>
              {activeBusiness.plan_expires_at && (
                <span className="text-[9px] text-yellow-600/80 dark:text-yellow-500/80 font-bold leading-none mt-1">
                  {Math.max(0, Math.ceil((new Date(activeBusiness.plan_expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} Days Left
                </span>
              )}
            </div>
          </div>
        )}

        {/* Real-time DateTime Display */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-sm border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] shadow-sm">
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wider">
            {currentDateTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="w-1 h-1 rounded-full bg-primary-500 mx-1"></div>
          <div className="text-[11px] font-black text-primary-600 dark:text-primary-400 tracking-widest">
            {currentDateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button onClick={handleFullscreen} className="p-2 text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors rounded-sm hover:bg-primary-50 dark:hover:bg-white/5" title="Toggle Fullscreen">
          {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </button>

        {/* Animated Theme Toggle */}
        <ModeToggle />

        {/* Help & Docs */}
        <button
          onClick={() => navigate('/docs')}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          title="Help & Docs"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Advanced Theme Customizer */}
        <ThemeCustomizer />

        {/* Profile Dropdown Menu */}
        <ProfileMenu />

      </div>
      {/* Feature Lock Modal for Add Branch */}
      <FeatureLockModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        featureName="Multi-Branch"
      />
    </header>
  );
}
