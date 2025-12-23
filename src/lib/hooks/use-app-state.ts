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

  const fetchProfile = React.useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
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
