// src/services/supabaseService.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConvexUserId } from '../types'; // Assuming types.ts is in src/

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      // Supabase client options (optional):
      // auth: {
      //   persistSession: false // Example: disable session persistence if only used for logging/public data
      // }
    });
    console.log('[SupabaseService] Supabase client initialized.');
  } catch (error) {
    console.error('[SupabaseService] Error initializing Supabase client:', error);
    // supabase will remain null, and functions will gracefully handle this
  }
} else {
  console.warn('[SupabaseService] Supabase URL (VITE_SUPABASE_URL) or Anon Key (VITE_SUPABASE_ANON_KEY) is not configured. Supabase service will be disabled.');
}

export interface AuditEventData { // Exporting for potential use in calling components
  [key: string]: any; // Allow any other relevant JSON data
}

/**
 * Logs an audit event to Supabase.
 * @param eventName Name of the event (e.g., "USER_LOGIN", "FILE_UPLOADED").
 * @param eventData Associated JSON data for the event.
 * @param userId Optional Convex User ID of the user performing the action.
 */
export const logAuditEvent = async (
  eventName: string,
  eventData: AuditEventData,
  userId?: ConvexUserId | string
): Promise<{ success: boolean; error?: string }> => { // Return type clarified
  if (!supabase) {
    const errorMessage = 'Supabase client not initialized.';
    console.warn(`[SupabaseService] ${errorMessage} Event "${eventName}" not logged.`);
    return { success: false, error: errorMessage };
  }

  const logEntry: {
    event_name: string;
    event_data: AuditEventData;
    user_id?: ConvexUserId | string;
    // Supabase automatically adds 'timestamp with time zone' if column default is now()
  } = {
    event_name: eventName,
    event_data: eventData,
  };

  if (userId) {
    logEntry.user_id = userId;
  }

  try {
    // Assuming your Supabase table is named 'audit_logs'
    const { error, data } = await supabase.from('audit_logs').insert([logEntry]).select();

    if (error) {
      console.error('[SupabaseService] Error logging audit event to Supabase:', error);
      // Return a structured error
      return { success: false, error: error.message };
    }

    console.log(`[SupabaseService] Event "${eventName}" logged successfully. Response data:`, data);
    return { success: true };
  } catch (error: any) {
    // This catch block handles errors not directly from the .insert() call itself (e.g., network issues)
    console.error('[SupabaseService] Failed to log audit event due to unexpected error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Example: Fetch related user data from Supabase (remains placeholder, not primary focus).
 * @param userId The ID of the user.
 */
export const getExtendedUserProfile = async (userId: string): Promise<object | null> => {
  if (!supabase) {
    console.warn('[SupabaseService] Supabase client not initialized. Cannot fetch extended profile.');
    return null;
  }
  console.log(`[SupabaseService] Placeholder: Fetching extended profile for user ${userId}`);
  // Example:
  // const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
  // if (error) {
  //   console.error('[SupabaseService] Error fetching extended profile:', error);
  //   return null;
  // }
  // return data;
  return Promise.resolve({ userId, preferences: { notificationChannel: "email" } }); // Placeholder
};
