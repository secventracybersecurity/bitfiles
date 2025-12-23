import * as React from "react";
import { createClient } from "@/lib/supabase-browser";
import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  username: string | null;
  storage_used: number;
  storage_limit: number;
  photo_count: number;
  doc_count: number;
  video_count: number;
  starred_count: number;
  total_earnings: number;
  role: string;
  created_at: string;
}

export function useAppState() {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();

  const fetchProfile = React.useCallback(async (userId: string, retryCount = 0) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // PGRST116 means no rows found
      if (error.code === 'PGRST116' && retryCount < 3) {
        console.warn(`Profile not found for ${userId}, retrying... (${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchProfile(userId, retryCount + 1);
      }
      
      // If still not found after retries, try to create it as a safety fallback
      if (error.code === 'PGRST116') {
        console.log("Creating missing profile for user:", userId);
        const { data: newData, error: createError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId, 
            username: userId.split('-')[0], // Fallback username
            storage_limit: 10737418240, 
            storage_used: 0, 
            role: 'USER' 
          })
          .select()
          .single();
        
        if (createError) {
          console.error("Critical: Failed to create profile:", createError);
          return;
        }
        setProfile(newData);
        return;
      }

      console.error("Error fetching profile:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return;
    }
    setProfile(data);
  }, [supabase]);

  React.useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setLoading(false);
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  return { user, profile, loading, refreshProfile: () => user && fetchProfile(user.id) };
}
