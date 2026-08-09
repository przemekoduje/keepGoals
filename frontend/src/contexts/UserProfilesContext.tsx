import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { getAuthHeaders } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "";

interface UserProfile {
  email: string;
  display_name: string;
}

interface UserProfilesContextType {
  profiles: Record<string, UserProfile>;
  fetchProfiles: (uids: string[]) => Promise<void>;
  getProfileName: (uidOrEmail: string) => string;
}

const UserProfilesContext = createContext<UserProfilesContextType>({
  profiles: {},
  fetchProfiles: async () => {},
  getProfileName: (val) => val,
});

export const useUserProfiles = () => useContext(UserProfilesContext);

export const UserProfilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const fetchedUidsRef = useRef<Set<string>>(new Set());

  const fetchProfiles = useCallback(async (uids: string[]) => {
    // Only fetch UIDs we haven't attempted to fetch yet, and that look like UIDs (no @)
    const neededUids = [...new Set(uids)].filter(uid => !fetchedUidsRef.current.has(uid) && !uid.includes('@'));
    if (neededUids.length === 0) return;

    neededUids.forEach(uid => fetchedUidsRef.current.add(uid));

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/v1/users/profiles`, {
        method: "POST",
        headers,
        body: JSON.stringify(neededUids),
      });

      if (response.ok) {
        const newProfiles = await response.json();
        setProfiles(prev => ({ ...prev, ...newProfiles }));
      }
    } catch (e) {
      console.error("Error fetching user profiles:", e);
    }
  }, [profiles]);

  const getProfileName = useCallback((uidOrEmail: string) => {
    if (!uidOrEmail) return "";
    if (uidOrEmail.includes('@')) {
      return uidOrEmail.split('@')[0];
    }
    const profile = profiles[uidOrEmail];
    return profile ? profile.display_name.split('@')[0] : uidOrEmail;
  }, [profiles]);

  return (
    <UserProfilesContext.Provider value={{ profiles, fetchProfiles, getProfileName }}>
      {children}
    </UserProfilesContext.Provider>
  );
};
