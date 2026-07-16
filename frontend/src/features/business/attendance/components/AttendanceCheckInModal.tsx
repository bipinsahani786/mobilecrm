import React, { useState, useRef, useCallback } from 'react';
import { useCheckIn, useCheckOut, useTodayAttendance } from '../api/useAttendance';
import api from '@/lib/api';
import axios from 'axios';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AttendanceCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceCheckInModal = ({ isOpen, onClose }: AttendanceCheckInModalProps) => {
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const { data: todayStatus, isLoading: isStatusLoading } = useTodayAttendance();

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera not supported. Please use HTTPS or localhost.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Camera error: ${err.message || 'Permission denied'}`);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
    }
  }, []);

  const takePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'attendance.jpg', { type: 'image/jpeg' });
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const getLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      () => {
        toast.error('Unable to retrieve your location');
        setIsGettingLocation(false);
      }
    );
  };

  const handleAction = async () => {
    if (!photo) {
      toast.error('Please take a photo first');
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Get Presigned URL
      const { data: presignData } = await api.post('/upload/presigned-url', {
        extension: 'jpg',
        folder: 'attendance/checks'
      });
      
      const { upload_url, path } = presignData.data;

      // 2. Upload to S3/R2 directly
      await axios.put(upload_url, photo, {
        headers: {
          'Content-Type': photo.type
        }
      });

      // 3. Complete check-in/out
      const payload: any = { photo: path };
      if (location) {
        payload.latitude = location.lat;
        payload.longitude = location.lng;
      }

      const isCheckedIn = todayStatus && todayStatus.check_in_time;
      const mutation = isCheckedIn ? checkOutMutation : checkInMutation;

      mutation.mutate(payload, {
        onSuccess: () => {
          onClose();
          setPhoto(null);
          setPhotoPreview(null);
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to process attendance');
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up camera on close
  React.useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPhoto(null);
      setPhotoPreview(null);
      setLocation(null);
    }
  }, [isOpen, stopCamera]);

  const isCheckedIn = todayStatus && todayStatus.check_in_time;
  const isCheckedOut = todayStatus && todayStatus.check_out_time;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Self Attendance"
    >
      <div className="space-y-6">
        {isCheckedOut ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold">You're done for today!</h3>
            <p className="text-slate-500 mt-2">Check out recorded at {todayStatus.check_out_time}</p>
          </div>
        ) : (
          <>
            {/* Location Section */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin size={16} className="text-primary-500" /> Current Location
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">Required for geo-fence validation</p>
                </div>
                {location ? (
                  <Badge variant="success">Acquired</Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={getLocation} disabled={isGettingLocation}>
                    {isGettingLocation ? <Loader2 className="animate-spin h-4 w-4" /> : 'Get Location'}
                  </Button>
                )}
              </div>
            </div>

            {/* Photo Section */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Camera size={16} className="text-primary-500" /> Photo Verification
              </h4>
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute bottom-4 right-4"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                        startCamera();
                      }}
                    >
                      Retake
                    </Button>
                  </>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`} />
                    {isCameraOn ? (
                      <Button 
                        onClick={takePhoto}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full h-12 w-12 p-0 shadow-lg hover:scale-105 transition-transform"
                      >
                        <Camera size={20} />
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={startCamera} className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 text-white">
                        <Camera size={16} className="mr-2" /> Start Camera
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full h-12 text-lg" 
              onClick={handleAction}
              disabled={!photo || isUploading || checkInMutation.isPending || checkOutMutation.isPending}
            >
              {(isUploading || checkInMutation.isPending || checkOutMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading Photo...' : 'Processing...'}
                </>
              ) : (
                isCheckedIn ? 'Check Out' : 'Check In'
              )}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};
