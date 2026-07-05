export const TEMPLATE_VARIABLES = ['{{name}}', '{{email}}', '{{phone}}', '{{company}}'] as const;

export const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
] as const;
