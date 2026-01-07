import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface LockContextType {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
  hasPin: boolean;
  autoLockMinutes: number;
  setAutoLockMinutes: (minutes: number) => void;
}

const LockContext = createContext<LockContextType | null>(null);

export function useLock() {
  const context = useContext(LockContext);
  if (!context) {
    throw new Error('useLock must be used within a LockProvider');
  }
  return context;
}

interface LockProviderProps {
  children: ReactNode;
}

export function LockProvider({ children }: LockProviderProps) {
  const { user, profile } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [autoLockMinutes, setAutoLockMinutesState] = useState(() => {
    const saved = localStorage.getItem('autoLockMinutes');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [lastActivity, setLastActivity] = useState(Date.now());

  const hasPin = !!profile?.pin;

  const lock = useCallback(() => {
    if (hasPin && user) {
      setIsLocked(true);
    }
  }, [hasPin, user]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    setLastActivity(Date.now());
  }, []);

  const setAutoLockMinutes = useCallback((minutes: number) => {
    setAutoLockMinutesState(minutes);
    localStorage.setItem('autoLockMinutes', minutes.toString());
  }, []);

  // Track user activity
  useEffect(() => {
    if (!user || !hasPin || isLocked) return;

    const updateActivity = () => setLastActivity(Date.now());

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, updateActivity, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [user, hasPin, isLocked]);

  // Auto-lock after inactivity
  useEffect(() => {
    if (!user || !hasPin || isLocked || autoLockMinutes === 0) return;

    const checkInactivity = () => {
      const inactiveMs = Date.now() - lastActivity;
      const lockAfterMs = autoLockMinutes * 60 * 1000;

      if (inactiveMs >= lockAfterMs) {
        lock();
      }
    };

    const interval = setInterval(checkInactivity, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [user, hasPin, isLocked, autoLockMinutes, lastActivity, lock]);

  // Lock when tab becomes hidden (optional security feature)
  useEffect(() => {
    if (!user || !hasPin) return;

    const handleVisibilityChange = () => {
      if (document.hidden && hasPin) {
        // Lock after a short delay when tab is hidden
        setTimeout(() => {
          if (document.hidden) {
            lock();
          }
        }, 30000); // 30 seconds
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, hasPin, lock]);

  // Reset lock state when user logs out
  useEffect(() => {
    if (!user) {
      setIsLocked(false);
    }
  }, [user]);

  return (
    <LockContext.Provider
      value={{
        isLocked,
        lock,
        unlock,
        hasPin,
        autoLockMinutes,
        setAutoLockMinutes,
      }}
    >
      {children}
    </LockContext.Provider>
  );
}
