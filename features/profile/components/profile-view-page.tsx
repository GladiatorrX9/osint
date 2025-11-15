"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  IconUser,
  IconShield,
  IconHistory,
  IconCamera,
  IconMail,
  IconLock,
  IconDeviceMobile,
  IconKey,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";

interface ActivityLog {
  id: string;
  action: string;
  type: string;
  timestamp: string;
  details?: {
    email?: string;
    status?: string;
    organization?: string;
    role?: string;
  };
}

interface ProfileData {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: string;
  organization: any;
  teamMemberships: any[];
  preferences: {
    emailNotifications: boolean;
    securityAlerts: boolean;
    twoFactorEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfileViewPage() {
  const { data: session, update: updateSession } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{
    qrCode: string;
    secret: string;
    manualEntryKey: string;
  } | null>(null);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const [profileRes, activityRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/profile/activity"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfileData(data);
          setFormData({
            name: data.name,
            email: data.email,
          });
          setEmailNotifications(data.preferences.emailNotifications);
          setSecurityAlerts(data.preferences.securityAlerts);
          setTwoFactorEnabled(data.preferences.twoFactorEnabled);
        }

        if (activityRes.ok) {
          const data = await activityRes.json();
          setActivityLogs(data.activities || []);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (
      ![
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ].includes(file.type)
    ) {
      toast.error("File must be an image (JPEG, PNG, GIF, or WebP)");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/profile/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      // Update local state
      setProfileData((prev) =>
        prev ? { ...prev, image: data.imageUrl } : null
      );

      // Update session
      await updateSession();

      toast.success("Profile image updated successfully");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileData(data.profile);

      // Update session if email changed
      if (formData.email !== session?.user?.email) {
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            email: formData.email,
            name: formData.name,
          },
        });
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle preferences save
  const handleSavePreferences = async () => {
    try {
      const response = await fetch("/api/profile/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications,
          securityAlerts,
          twoFactorEnabled,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update preferences");
      }

      toast.success("Preferences updated successfully");
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error(error.message || "Failed to update preferences");
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle 2FA toggle
  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled) {
      // Enable 2FA - initiate setup
      try {
        setIsSettingUp2FA(true);
        const response = await fetch("/api/profile/2fa/enable", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to initiate 2FA setup");
        }

        setTwoFactorSetup({
          qrCode: data.qrCode,
          secret: data.secret,
          manualEntryKey: data.manualEntryKey,
        });
        setVerificationCode("");
        toast.success("Scan the QR code with your authenticator app");
      } catch (error: any) {
        console.error("Error enabling 2FA:", error);
        toast.error(error.message || "Failed to enable 2FA");
        setTwoFactorEnabled(false);
      } finally {
        setIsSettingUp2FA(false);
      }
    } else {
      // Disable 2FA - need to verify with code
      const code = prompt(
        "Enter your 2FA code to disable two-factor authentication:"
      );
      if (!code) {
        setTwoFactorEnabled(true);
        return;
      }

      try {
        const response = await fetch("/api/profile/2fa/disable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: code }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to disable 2FA");
        }

        setTwoFactorSetup(null);
        setVerificationCode("");
        toast.success("Two-factor authentication disabled");
      } catch (error: any) {
        console.error("Error disabling 2FA:", error);
        toast.error(error.message || "Failed to disable 2FA");
        setTwoFactorEnabled(true);
      }
    }
  };

  // Handle 2FA verification
  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      setIsVerifying2FA(true);
      const response = await fetch("/api/profile/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify 2FA");
      }

      setTwoFactorEnabled(true);
      setTwoFactorSetup(null);
      setVerificationCode("");
      toast.success("Two-factor authentication enabled successfully!");
    } catch (error: any) {
      console.error("Error verifying 2FA:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsVerifying2FA(false);
    }
  };

  if (!session || isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <IconLoader2 className="inline-block h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userInitials =
    session.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={
                      profileData?.image || session?.user?.image || undefined
                    }
                  />
                  <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                  type="button"
                >
                  <IconCamera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">
                  {profileData?.name || session.user?.name || "User"}
                </h2>
                <p className="text-muted-foreground">
                  {profileData?.email || session.user?.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {profileData?.role || "User"}
                  </span>
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="gap-2">
              <IconUser className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <IconShield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <IconHistory className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Update your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Changing your email will require you to log in again
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">
                    Notification Preferences
                  </h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about breaches and alerts
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={(checked) => {
                        setEmailNotifications(checked);
                        handleSavePreferences();
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="security-alerts">Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about critical security events
                      </p>
                    </div>
                    <Switch
                      id="security-alerts"
                      checked={securityAlerts}
                      onCheckedChange={(checked) => {
                        setSecurityAlerts(checked);
                        handleSavePreferences();
                      }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        name: profileData?.name || session.user?.name || "",
                        email: profileData?.email || session.user?.email || "",
                      });
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData?.organization?.subscription?.plan === "OAUTH" ? (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <div className="flex gap-3">
                        <IconAlertCircle className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">OAuth Account</p>
                          <p className="text-sm text-muted-foreground">
                            You signed in with Google. Password management is
                            not available for OAuth accounts.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          disabled={isChangingPassword}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          disabled={isChangingPassword}
                          minLength={8}
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters long
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          disabled={isChangingPassword}
                        />
                      </div>

                      <Button
                        className="gap-2"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? (
                          <>
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          <>
                            <IconLock className="h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account with TOTP
                    authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <IconDeviceMobile className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Authenticator App</p>
                        <p className="text-sm text-muted-foreground">
                          {twoFactorEnabled ? "Enabled" : "Not enabled"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={handle2FAToggle}
                      disabled={isSettingUp2FA || !!twoFactorSetup}
                    />
                  </div>

                  {twoFactorSetup && (
                    <div className="rounded-lg border border-primary/50 bg-primary/5 p-6 space-y-4">
                      <div className="text-center space-y-4">
                        <h3 className="font-semibold text-lg">
                          Set Up Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Scan this QR code with your authenticator app (Google
                          Authenticator, Authy, etc.)
                        </p>

                        {/* QR Code */}
                        <div className="flex justify-center py-4">
                          <img
                            src={twoFactorSetup.qrCode}
                            alt="2FA QR Code"
                            className="w-64 h-64 border-4 border-background rounded-lg"
                          />
                        </div>

                        {/* Manual Entry */}
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Can't scan? Enter this code manually:
                          </p>
                          <code className="text-sm font-mono bg-background px-3 py-1 rounded border">
                            {twoFactorSetup.manualEntryKey}
                          </code>
                        </div>

                        {/* Verification Input */}
                        <div className="space-y-2">
                          <Label htmlFor="verification-code">
                            Enter the 6-digit code from your app
                          </Label>
                          <Input
                            id="verification-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) =>
                              setVerificationCode(
                                e.target.value.replace(/\D/g, "")
                              )
                            }
                            className="text-center text-2xl tracking-widest"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setTwoFactorSetup(null);
                              setVerificationCode("");
                              setTwoFactorEnabled(false);
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleVerify2FA}
                            disabled={
                              verificationCode.length !== 6 || isVerifying2FA
                            }
                            className="flex-1 gap-2"
                          >
                            {isVerifying2FA ? (
                              <>
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <IconShield className="h-4 w-4" />
                                Verify & Enable
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {twoFactorEnabled && !twoFactorSetup && (
                    <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                      <div className="flex gap-3">
                        <IconShield className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-green-500">
                            Two-Factor Authentication is Active
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            You'll be asked for a verification code each time
                            you log in. Keep your authenticator app accessible.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!twoFactorEnabled && !twoFactorSetup && (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <div className="flex gap-3">
                        <IconAlertCircle className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            Recommended Security Feature
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Enable 2FA to add an extra layer of security to your
                            account. You'll need an authenticator app like
                            Google Authenticator or Authy.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Recent activity on your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <div className="py-8 text-center">
                    <IconHistory className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      No recent activity to display
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start gap-4 rounded-lg border border-border p-4"
                      >
                        <div className="rounded-full bg-primary/10 p-2">
                          <IconHistory className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{log.action}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span>
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            {log.details?.status && (
                              <>
                                <span>•</span>
                                <span className="capitalize">
                                  {log.details.status.toLowerCase()}
                                </span>
                              </>
                            )}
                            {log.details?.organization && (
                              <>
                                <span>•</span>
                                <span>{log.details.organization}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
