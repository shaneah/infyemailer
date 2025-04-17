import React, { useState } from 'react';
import { Shield, Key, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const ClientSecurity: React.FC = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength('weak');
      return;
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strengthScore = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;

    if (strengthScore <= 2) setPasswordStrength('weak');
    else if (strengthScore <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  // Change password handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    
    // Password validation
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation password don't match",
        variant: "destructive",
      });
      setIsChangingPassword(false);
      return;
    }

    if (passwordStrength === 'weak') {
      toast({
        title: "Weak password",
        description: "Please choose a stronger password with uppercase, lowercase, numbers, and special characters",
        variant: "destructive",
      });
      setIsChangingPassword(false);
      return;
    }

    // Simulate API call to change password
    setTimeout(() => {
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed",
        variant: "default",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    }, 1500);
  };

  // Handle 2FA toggle
  const handleToggle2FA = () => {
    const newState = !twoFactorEnabled;
    setTwoFactorEnabled(newState);
    
    toast({
      title: newState ? "2FA Enabled" : "2FA Disabled",
      description: newState 
        ? "Two-factor authentication has been enabled for your account" 
        : "Two-factor authentication has been disabled for your account",
      variant: "default",
    });
  };

  // Generate backup codes
  const handleGenerateBackupCodes = () => {
    toast({
      title: "Backup Codes Generated",
      description: "New backup codes have been generated and sent to your email",
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
      </div>
      
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="password" className="text-sm">
            <Lock className="h-4 w-4 mr-2" />
            Password
          </TabsTrigger>
          <TabsTrigger value="2fa" className="text-sm">
            <Key className="h-4 w-4 mr-2" />
            Two-Factor Authentication
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="password">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your account password to maintain security
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          checkPasswordStrength(e.target.value);
                        }}
                        required
                      />
                    </div>
                    
                    {newPassword && (
                      <div className="mt-2">
                        <div className="text-xs mb-1 font-medium">
                          Password Strength: 
                          <span className={`ml-1 ${
                            passwordStrength === 'weak' ? 'text-red-500' : 
                            passwordStrength === 'medium' ? 'text-yellow-500' : 
                            'text-green-500'
                          }`}>
                            {passwordStrength === 'weak' ? 'Weak' : 
                            passwordStrength === 'medium' ? 'Medium' : 
                            'Strong'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              passwordStrength === 'weak' ? 'bg-red-500 w-1/3' : 
                              passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' : 
                              'bg-green-500 w-full'
                            }`} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    
                    {confirmPassword && newPassword && (
                      <div className="flex items-center mt-1 text-xs">
                        {confirmPassword === newPassword ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-1" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 mr-1" />
                        )}
                        <span className={confirmPassword === newPassword ? 'text-green-600' : 'text-red-600'}>
                          {confirmPassword === newPassword ? 'Passwords match' : 'Passwords do not match'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full"
                  >
                    {isChangingPassword ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : 'Update Password'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password Guidelines</CardTitle>
                  <CardDescription>
                    Follow these guidelines for a strong password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Use at least 8 characters</li>
                    <li>Include at least one uppercase letter (A-Z)</li>
                    <li>Include at least one lowercase letter (a-z)</li>
                    <li>Include at least one number (0-9)</li>
                    <li>Include at least one special character (!@#$%^&*)</li>
                    <li>Avoid using easily guessable information</li>
                    <li>Don't reuse passwords across different services</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Password Security Tips</AlertTitle>
                <AlertDescription className="text-sm">
                  Consider using a password manager to generate and store strong, unique passwords for all your accounts.
                  This helps prevent security breaches from affecting multiple services.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="2fa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa-toggle" className="text-base">Enable 2FA</Label>
                    <p className="text-sm text-gray-500">
                      Require a verification code when logging in
                    </p>
                  </div>
                  <Switch
                    id="2fa-toggle"
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggle2FA}
                  />
                </div>
                
                {twoFactorEnabled && (
                  <Alert variant="default" className="bg-purple-50 text-purple-800 border-purple-200">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <AlertTitle>2FA is Active</AlertTitle>
                    <AlertDescription className="text-sm">
                      Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when logging in.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={!twoFactorEnabled}
                    onClick={handleGenerateBackupCodes}
                  >
                    Generate New Backup Codes
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    How 2FA protects your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Two-factor authentication adds an additional layer of security to your account. When enabled, you'll need two things to log in:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Your password</li>
                    <li>A temporary code from your authenticator app</li>
                  </ol>
                  <p className="text-sm mt-4">
                    Even if someone discovers your password, they won't be able to access your account without the temporary code.
                  </p>
                </CardContent>
              </Card>
              
              <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription className="text-sm">
                  When 2FA is enabled, be sure to save your backup codes in a safe place. If you lose access to your authenticator app, backup codes will be your only way to regain access.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientSecurity;