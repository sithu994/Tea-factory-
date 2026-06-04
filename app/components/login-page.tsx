import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Leaf, User, UserCog, Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: 'staff' | 'supplier') => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'staff' | 'supplier'>('staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
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

        {/* Login Card */}
        <Card className="shadow-2xl border-green-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-green-900">
              Sign In | පුරනය වන්න
            </CardTitle>
            <CardDescription className="text-center">
              Select your role and enter credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  Username | පරිශීලක නාමය
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-900">
                  Password | මුරපදය
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                Sign In | පුරනය වන්න
              </Button>
            </form>
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
