import React, { useState } from 'react';
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '../api/useLocations';
import { MapPin, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const BusinessLocationsSection = () => {
  const { data: locations, isLoading } = useLocations();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius_meters: 100,
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString()
        }));
        toast.success('Coordinates acquired!');
      },
      (err) => toast.error('Failed to get location')
    );
  };

  const handleSave = () => {
    if (!formData.name || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      name: formData.name,
      address: 'Not provided',
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      radius_meters: Number(formData.radius_meters),
      is_default: (locations?.length === 0)
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setFormData({ name: '', latitude: '', longitude: '', radius_meters: 100 });
      }
    });
  };

  return (
    <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin size={20} className="text-primary-500" />
            Shop Locations & Geo-Fence
          </h2>
          <p className="text-sm text-slate-500 mt-1">Set up physical locations to validate staff attendance</p>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus size={14} className="mr-2" /> Add Location
          </Button>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-primary-500" /></div>
        ) : (
          <div className="space-y-4">
            {locations?.map((loc) => (
              <div key={loc.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {loc.name} {loc.is_default && <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full uppercase">Default</span>}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Lat: {loc.latitude}, Lng: {loc.longitude} • Radius: {loc.radius_meters}m
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(loc.id)} className="text-red-500">
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}

            {locations?.length === 0 && !isAdding && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No locations configured. Staff can check in from anywhere. Add a location to enable geo-fencing.
              </div>
            )}

            {isAdding && (
              <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg border border-primary-100 dark:border-primary-900/20 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location Name</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                    placeholder="e.g. Main Shop" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Latitude</label>
                    <Input 
                      value={formData.latitude} 
                      onChange={e => setFormData(p => ({...p, latitude: e.target.value}))} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <Input 
                      value={formData.longitude} 
                      onChange={e => setFormData(p => ({...p, longitude: e.target.value}))} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Allowed Radius (Meters)</label>
                  <Input 
                    type="number"
                    value={formData.radius_meters} 
                    onChange={e => setFormData(p => ({...p, radius_meters: Number(e.target.value)}))} 
                  />
                  <p className="text-xs text-slate-500 mt-1">Staff must be within this distance to check in.</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={handleGetLocation}>
                    <MapPin size={14} className="mr-2" /> Auto-detect my coordinates
                  </Button>
                  <div className="flex-1"></div>
                  <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button onClick={handleSave} isLoading={createMutation.isPending}>Save Location</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
