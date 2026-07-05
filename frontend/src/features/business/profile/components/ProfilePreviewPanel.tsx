import { Eye } from 'lucide-react';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { Toggle } from '@/components/ui/toggle';
import { LiveBusinessCard } from './LiveBusinessCard';
import type { BusinessFormValues } from '../schemas/businessSchema';

interface Props {
  control: Control<BusinessFormValues>;
  liveCardData: any;
}

export function ProfilePreviewPanel({ control, liveCardData }: Props) {
  return (
    <div className="sticky top-6 space-y-6 min-w-0 w-full">
      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Live Card Preview
        </h3>
        <LiveBusinessCard formData={liveCardData} />
      </div>

      {/* Visibility Controls */}
      <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none space-y-3">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Card Display Settings</h4>
        
        <Controller
          control={control}
          name="card_preferences.show_phone_2"
          render={({ field }) => (
            <Toggle 
              checked={field.value} 
              onChange={field.onChange} 
              label="Show Phone Numbers" 
            />
          )}
        />
        
        <Controller
          control={control}
          name="card_preferences.show_email"
          render={({ field }) => (
            <Toggle 
              checked={field.value} 
              onChange={field.onChange} 
              label="Show Email Address" 
            />
          )}
        />

        <Controller
          control={control}
          name="card_preferences.show_address"
          render={({ field }) => (
            <Toggle 
              checked={field.value} 
              onChange={field.onChange} 
              label="Show Complete Address" 
            />
          )}
        />

        <Controller
          control={control}
          name="card_preferences.show_gst"
          render={({ field }) => (
            <Toggle 
              checked={field.value} 
              onChange={field.onChange} 
              label="Show GST Number" 
            />
          )}
        />

        <div className="pt-4 border-t border-slate-200 dark:border-white/5">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Card Theme</h4>
          <div className="flex flex-wrap gap-3">
            {['dark', 'primary', 'blue', 'green', 'purple'].map((theme) => (
              <Controller
                key={theme}
                control={control}
                name="card_preferences.theme"
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(theme)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      field.value === theme ? 'border-primary-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                    } ${
                      theme === 'dark' ? 'bg-slate-800' :
                      theme === 'primary' ? 'bg-[#fe7d02]' :
                      theme === 'blue' ? 'bg-blue-600' :
                      theme === 'green' ? 'bg-emerald-600' :
                      'bg-purple-600'
                    }`}
                    title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                  />
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
