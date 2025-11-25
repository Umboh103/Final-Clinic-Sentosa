import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
} else {
    console.log('Supabase URL:', supabaseUrl);
    // Don't log the full key for security, just check if it exists
    console.log('Supabase Key loaded:', !!supabaseAnonKey);
}

export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
        global: {
            headers: {
                'apikey': supabaseAnonKey || ''
            }
        }
    }
);
