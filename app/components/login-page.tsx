import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Leaf, User, UserCog, Lock, Phone } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: 'staff' | 'supplier', username: string) => void;
}

async function sendAuthRequest<T>(endpoint: string, data: Record<string, string>): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
        ? result.error
        : 'The request could not be completed.';
    throw new Error(message);
  }
  return result as T;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'signin' | 'register' | 'recover'>('signin');
  const [selectedRole, setSelectedRole] = useState<'staff' | 'supplier'>('staff');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (password.length < 8) {
          setError('Use a password with at least 8 characters.');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        const account = await sendAuthRequest<{ username: string }>('/api/auth/register', {
          role: selectedRole,
          username: username.trim(),
          phone: phone.trim(),
          password,
        });
        onLogin(selectedRole, account.username);
        return;
      }

      if (mode === 'recover') {
        if (!resetCodeSent) {
          await sendAuthRequest('/api/auth/forgot-password', {
            role: selectedRole,
            username: username.trim(),
            phone: phone.trim(),
          });
          setResetCodeSent(true);
          setNotice('If the account details match, a verification code has been sent by SMS.');
          return;
        }
        if (password.length < 8) {
          setError('Use a password with at least 8 characters.');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        await sendAuthRequest('/api/auth/reset-password', {
          role: selectedRole,
          username: username.trim(),
          phone: phone.trim(),
          code: verificationCode.trim(),
          password,
        });
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setResetCodeSent(false);
        setMode('signin');
        setNotice('Password updated. Sign in with your new password.');
        return;
      }

      const account = await sendAuthRequest<{ username: string }>('/api/auth/login', {
        role: selectedRole,
        username: username.trim(),
        password,
      });
      onLogin(selectedRole, account.username);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to complete your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            Tea Factory Management
          </h1>
          <p className="text-green-700">
            තේ කර්මාන්තශාලා කළමනාකරණ පද්ධතිය
          </p>
        </div>

        {/* Authentication Card */}
        <Card className="shadow-2xl border-green-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-green-900">
              {mode === 'signin'
                ? 'Sign In | පුරනය වන්න'
                : mode === 'register'
                  ? 'Create Account | ගිණුමක් සාදන්න'
                  : 'Reset Password | මුරපදය නැවත සකසන්න'}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'signin'
                ? 'Select your role and enter your account details'
                : mode === 'register'
                  ? 'Create an account for the selected role'
                  : resetCodeSent
                    ? 'Enter the code sent to your phone and choose a new password'
                    : 'Enter your account details to receive a reset code'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode !== 'recover' && <div className="mb-6 grid grid-cols-2 rounded-lg bg-green-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setNotice('');
                  setPassword('');
                  setConfirmPassword('');
                  setResetCodeSent(false);
                }}
                aria-pressed={mode === 'signin'}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'signin' ? 'bg-white text-green-800 shadow-sm' : 'text-green-700 hover:bg-white/70'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setNotice('');
                  setPassword('');
                  setConfirmPassword('');
                  setResetCodeSent(false);
                }}
                aria-pressed={mode === 'register'}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'register' ? 'bg-white text-green-800 shadow-sm' : 'text-green-700 hover:bg-white/70'
                }`}
              >
                Register
              </button>
            </div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-green-900">Select Role | භූමිකාව තෝරන්න</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('staff')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      selectedRole === 'staff'
                        ? 'border-green-600 bg-green-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <UserCog className={`w-8 h-8 ${selectedRole === 'staff' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div className="text-center">
                      <div className="font-semibold text-sm">Staff</div>
                      <div className="text-xs text-gray-600">කාර්ය මණ්ඩලය</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('supplier')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      selectedRole === 'supplier'
                        ? 'border-green-600 bg-green-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <User className={`w-8 h-8 ${selectedRole === 'supplier' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div className="text-center">
                      <div className="font-semibold text-sm">Supplier</div>
                      <div className="text-xs text-gray-600">සැපයුම්කරු</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-green-900">
                  {selectedRole === 'supplier' && mode !== 'recover'
                    ? 'Supplier ID | සැපයුම්කරු හැඳුනුම්පත'
                    : 'Username | පරිශීලක නාමය'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder={selectedRole === 'supplier' ? 'e.g., SUP001' : 'Enter username'}
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    className="pl-10 border-green-200 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {(mode === 'register' || mode === 'recover') && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-green-900">
                    Phone Number | දුරකථන අංකය
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+94771234567"
                      pattern="\+[1-9][0-9]{7,14}"
                      title="Enter a number in international format, such as +94771234567"
                      value={phone}
                      readOnly={mode === 'recover' && resetCodeSent}
                      onChange={(e) => { setPhone(e.target.value); setError(''); }}
                      className="pl-10 border-green-200 focus:border-green-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the number in international format, including + and country code.
                    </p>
                  </div>
                </div>
              )}

              {mode === 'recover' && resetCodeSent && (
                <div className="space-y-2">
                  <Label htmlFor="verificationCode" className="text-green-900">SMS verification code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter the code sent to your phone"
                    value={verificationCode}
                    onChange={(e) => { setVerificationCode(e.target.value); setError(''); }}
                    className="border-green-200 focus:border-green-500"
                    required
                  />
                </div>
              )}

              {/* Password */}
              {(mode !== 'recover' || resetCodeSent) && <div className="space-y-2">
                <Label htmlFor="password" className="text-green-900">
                  Password | මුරපදය
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    placeholder={mode === 'recover' ? 'Enter new password' : 'Enter password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="pl-10 border-green-200 focus:border-green-500"
                    required
                  />
                </div>
              </div>}

              {(mode === 'register' || (mode === 'recover' && resetCodeSent)) && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-green-900">
                    Confirm Password | මුරපදය තහවුරු කරන්න
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      className="pl-10 border-green-200 focus:border-green-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">Password must be at least 8 characters.</p>
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              {notice && (
                <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  {notice}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                {isSubmitting
                  ? 'Please wait…'
                  : mode === 'signin'
                    ? 'Sign In | පුරනය වන්න'
                    : mode === 'register'
                        ? 'Create Account'
                      : mode === 'recover'
                        ? resetCodeSent ? 'Reset Password' : 'Send SMS Code'
                        : 'Submit'}
              </Button>
            </form>
            {mode === 'signin' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('recover');
                  setError('');
                  setNotice('');
                  setPassword('');
                  setConfirmPassword('');
                  setResetCodeSent(false);
                }}
                className="mt-4 w-full text-center text-sm font-medium text-green-700 underline-offset-4 hover:text-green-900 hover:underline"
              >
                Forgot password?
              </button>
            ) : mode === 'recover' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setNotice('');
                  setPassword('');
                  setConfirmPassword('');
                  setPhone('');
                  setVerificationCode('');
                  setResetCodeSent(false);
                }}
                className="mt-4 w-full text-center text-sm font-medium text-green-700 underline-offset-4 hover:text-green-900 hover:underline"
              >
                Back to sign in
              </button>
            ) : null}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-green-700 mt-6">
          © 2026 Tea Factory Management System
        </p>
      </div>
    </div>
  );
}
