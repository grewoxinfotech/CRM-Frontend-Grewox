export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const APP_CONFIG = {
    APP_NAME: 'Grewox CRM',
    API_TIMEOUT: 30000,
    DEFAULT_PAGE_SIZE: 10,
}; 

export const FB_APP_ID = import.meta.env.VITE_FB_APP_ID;
export const FB_CONFIG_ID = import.meta.env.VITE_FB_CONFIG_ID;
export const WHATSAPP_WEBHOOK_URL = import.meta.env.VITE_WHATSAPP_WEBHOOK_URL || 'https://api.grewoxinfotech.com/api/v1/whatsapp/webhook';