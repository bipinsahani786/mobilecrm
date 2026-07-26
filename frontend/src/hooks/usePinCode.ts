import { useState, useCallback } from 'react';

interface PinCodeData {
  city: string;
  district: string;
  state: string;
}

export function usePinCode() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchPinCodeDetails = useCallback(async (pin: string): Promise<PinCodeData | null> => {
    if (!pin || pin.length !== 6) return null;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        return {
          city: postOffice.Block || postOffice.Region || postOffice.District,
          district: postOffice.District,
          state: postOffice.State
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching PIN code details:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchPinCodeDetails, isLoading };
}
