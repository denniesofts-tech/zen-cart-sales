import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { InstallButton } from '@/components/pwa/InstallButton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Bell, 
  User, 
  Shield, 
  LogOut,
  Smartphone
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, isManager, isAdmin } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Check current theme
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleTheme = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Settings</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Section */}
        <section className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{profile?.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary capitalize mt-1">
                {profile?.role}
              </span>
            </div>
          </div>
        </section>

        {/* App Preferences */}
        <section className="bg-card rounded-xl border border-border p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Sun className="h-4 w-4" />
            App Preferences
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
              <div>
                <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={toggleTheme}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="notifications" className="font-medium">Notifications</Label>
                <p className="text-sm text-muted-foreground">Enable sound alerts</p>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </section>

        {/* Install App */}
        <section className="bg-card rounded-xl border border-border p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Install App
          </h3>
          <p className="text-sm text-muted-foreground">
            Install ZenCart POS on your device for quick access and offline support.
          </p>
          <InstallButton />
        </section>

        {/* Admin Section */}
        {(isManager || isAdmin) && (
          <section className="bg-card rounded-xl border border-border p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Administration
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage users, roles, and system settings.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin">
                <Shield className="h-4 w-4 mr-2" />
                Open Admin Panel
              </Link>
            </Button>
          </section>
        )}

        {/* Sign Out */}
        <section className="bg-card rounded-xl border border-border p-4">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
