import { type OnboardFormValues } from '../schemas/onboardClientSchema';

export const defaultOnboardFormValues: Partial<OnboardFormValues> = {
  owner_name: '',
  owner_email: '',
  owner_password: '',
  business_name: '',
  payment_method: 'online',
};
