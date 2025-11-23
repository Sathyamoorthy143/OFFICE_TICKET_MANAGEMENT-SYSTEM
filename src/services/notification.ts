import { supabase } from '../lib/supabase';

export const sendWhatsAppNotification = async (to: string, message: string) => {
    console.log(`[WhatsApp] Sending to ${to}: ${message}`);

    try {
        const { error } = await supabase.functions.invoke('send-whatsapp', {
            body: { to, message }
        });

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Failed to send WhatsApp:', err);
        return false;
    }
};

export const checkSLAAndNotify = async () => {
    // This logic should ideally run on the server (Cron Job / Edge Function)
    console.log('Checking SLA status...');
};
