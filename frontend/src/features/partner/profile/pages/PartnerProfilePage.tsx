import { useState } from 'react';
import { usePartnerProfile, useUpdatePartnerProfile, useUpdatePayoutDetails, useChangePartnerPassword } from '../api/usePartnerProfile';
import { usePartnerReferralLink } from '../../referrals/api/usePartnerReferrals';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { UserCircle, Copy, Check, Link2, Building2, CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';


export default function PartnerProfilePage() {
  const { data: profile, isLoading } = usePartnerProfile();
  const { data: referralData } = usePartnerReferralLink();
  const updateProfile = useUpdatePartnerProfile();
  const updatePayout = useUpdatePayoutDetails();
  const changePassword = useChangePartnerPassword();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'payout' | 'password'>('profile');

  // Profile form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [profileInitialized, setProfileInitialized] = useState(false);

  // Payout form
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [payoutInitialized, setPayoutInitialized] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Initialize forms with fetched data
  if (profile && !profileInitialized) {
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setCompanyName(profile.company_name || '');
    setProfileInitialized(true);
  }

  if (profile?.payout_details && !payoutInitialized) {
    const pd = profile.payout_details;
    setBankName(pd.bank_name || '');
    setAccountNumber(pd.account_number || '');
    setIfscCode(pd.ifsc_code || '');
    setAccountHolderName(pd.account_holder_name || '');
    setUpiId(pd.upi_id || '');
    setPayoutInitialized(true);
  }

  const handleCopyLink = () => {
    if (referralData?.referral_link) {
      navigator.clipboard.writeText(referralData.referral_link);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (referralData?.referral_code) {
      navigator.clipboard.writeText(referralData.referral_code);
      toast.success('Referral code copied!');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ name, phone, company_name: companyName });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSavePayoutDetails = async () => {
    try {
      await updatePayout.mutateAsync({ bank_name: bankName, account_number: accountNumber, ifsc_code: ifscCode, account_holder_name: accountHolderName, upi_id: upiId });
      toast.success('Payout details updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payout details');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await changePassword.mutateAsync({ current_password: currentPassword, new_password: newPassword, new_password_confirmation: confirmPassword });
      toast.success('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] p-6 space-y-6">
        <div className="h-24 bg-slate-200 dark:bg-white/5 animate-pulse rounded-xl w-full"></div>
        <div className="h-64 bg-slate-200 dark:bg-white/5 animate-pulse rounded-xl w-full"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: UserCircle },
    { id: 'payout' as const, label: 'Payout Details', icon: CreditCard },
    { id: 'password' as const, label: 'Password', icon: Lock },
  ];

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader icon={UserCircle} title="My Profile" subtitle="Manage your profile, payout details, and referral link" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Referral Link Card */}
        <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/5 dark:from-primary-500/20 dark:to-primary-600/10 border border-primary-200/50 dark:border-primary-500/20 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">Your Referral Link</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white dark:bg-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-600 dark:text-slate-300 truncate border border-slate-200 dark:border-white/10">
              {referralData?.referral_link || 'Loading...'}
            </div>
            <Button onClick={handleCopyLink} size="sm" className="bg-primary-500 hover:bg-primary-600 text-white shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">Referral Code:</span>
            <button onClick={handleCopyCode} className="font-bold text-primary-600 dark:text-primary-400 hover:underline tracking-wider">
              {referralData?.referral_code || '...'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl shadow-sm">
          <div className="flex border-b border-slate-100 dark:border-white/5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className={labelClass}>Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={profile?.email || ''} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputClass} />
                </div>
                <div className="flex items-center gap-3 text-sm pt-2">
                  <span className="text-slate-400">Commission Rate:</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {profile?.commission_type === 'percentage' ? `${profile.commission_value}%` : `₹${profile?.commission_value}`}
                    {' '}{profile?.commission_type === 'percentage' ? 'per sale' : 'fixed per referral'}
                  </span>
                </div>
                <div className="pt-3">
                  <Button size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending} className="bg-primary-500 hover:bg-primary-600 text-white">
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'payout' && (
              <div className="space-y-4 max-w-lg">
                <p className="text-sm text-slate-400 mb-4">Add your bank or UPI details for commission payouts.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Bank Name</label>
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className={inputClass} placeholder="e.g. State Bank of India" />
                  </div>
                  <div>
                    <label className={labelClass}>Account Holder Name</label>
                    <input type="text" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Account Number</label>
                    <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>IFSC Code</label>
                    <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value)} className={inputClass} placeholder="e.g. SBIN0001234" />
                  </div>
                </div>
                <div className="relative flex items-center py-3">
                  <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                  <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or UPI</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                </div>
                <div>
                  <label className={labelClass}>UPI ID</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className={inputClass} placeholder="e.g. name@upi" />
                </div>
                <div className="pt-3">
                  <Button size="sm" onClick={handleSavePayoutDetails} disabled={updatePayout.isPending} className="bg-primary-500 hover:bg-primary-600 text-white">
                    {updatePayout.isPending ? 'Saving...' : 'Save Payout Details'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
                </div>
                <div className="pt-3">
                  <Button size="sm" onClick={handleChangePassword} disabled={changePassword.isPending} className="bg-primary-500 hover:bg-primary-600 text-white">
                    {changePassword.isPending ? 'Updating...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
