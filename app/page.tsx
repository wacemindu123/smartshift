import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ShiftSmart Lite
            </h1>
            <p className="text-gray-600">
              Labor management for small businesses
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-4">
            <SignUpButton mode="redirect">
              <button className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md">
                Get Started
              </button>
            </SignUpButton>
            
            <SignInButton mode="redirect">
              <button className="w-full px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>

          {/* Footer */}
          <p className="mt-8 text-sm text-gray-500">
            Schedule employees, track attendance, and communicate effortlessly
          </p>
        </div>
      </div>
    </div>
  );
}
