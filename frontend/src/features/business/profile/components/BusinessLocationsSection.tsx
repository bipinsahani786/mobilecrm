import React, { useState, useEffect, useRef } from 'react';
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

  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Load Leaflet dynamically when in adding mode
  useEffect(() => {
    if (!isAdding) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    if (!(window as any).L) {
      // Inject CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Inject JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setMapLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [isAdding]);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !isAdding || !mapContainerRef.current) return;

    const lat = Number(formData.latitude) || 28.6139;
    const lng = Number(formData.longitude) || 77.2090;

    const L = (window as any).L;
    if (!L) return;

    // Create a beautiful premium SVG marker pin matching the primary theme
    const customPinIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-emerald-500/35 rounded-full animate-ping"></div>
          <div class="relative bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([lat, lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);

      markerRef.current = L.marker([lat, lng], { 
        draggable: true,
        icon: customPinIcon
      }).addTo(mapRef.current);

      // Force Leaflet to recalculate size when rendering within expanding flex blocks
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          mapRef.current.setView([lat, lng], 13);
        }
      }, 250);

      mapRef.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        setFormData(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        }));
      });

      markerRef.current.on('dragend', () => {
        const position = markerRef.current.getLatLng();
        setFormData(prev => ({
          ...prev,
          latitude: position.lat.toFixed(6),
          longitude: position.lng.toFixed(6)
        }));
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoaded, isAdding]);

  // Update Map position from manual fields or auto-detect coordinate updates
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      const currentMarkerLatLng = markerRef.current.getLatLng();
      
      if (Math.abs(currentMarkerLatLng.lat - lat) > 0.0001 || Math.abs(currentMarkerLatLng.lng - lng) > 0.0001) {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng], 15);
        mapRef.current.invalidateSize();
      }
    }
  }, [formData.latitude, formData.longitude]);

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

                {/* Leaflet free map container */}
                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-100 dark:bg-zinc-800 px-4 py-2 border-b border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-350">Interactive Location Map</span>
                    <span>Click map or drag the pin to set coordinate location</span>
                  </div>
                  <div 
                    ref={mapContainerRef} 
                    className="w-full h-64 bg-slate-200 dark:bg-zinc-900 relative z-10" 
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
