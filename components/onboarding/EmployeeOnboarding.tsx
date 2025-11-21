'use client';

import OnboardingWizard from './OnboardingWizard';
import { Calendar, Clock, Bell, User } from 'lucide-react';

interface EmployeeOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function EmployeeOnboarding({ onComplete, onSkip }: EmployeeOnboardingProps) {
  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Your Workspace!',
      description: 'Let\'s get you started with SmartShift. This quick tour will show you everything you need to know.',
      content: (
        <div className="space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 className="font-semibold text-primary-900 mb-2">What you'll learn:</h4>
            <ul className="space-y-2 text-primary-800">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>How to view your upcoming shifts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>How to clock in and out</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>How to set your availability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>How to request time off</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            This tour takes about 2 minutes. You can skip it and explore on your own, but we recommend completing it!
          </p>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      description: 'Your dashboard is your home base. Here\'s what you\'ll find:',
      content: (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Next Shift</h4>
                <p className="text-sm text-gray-600">
                  See your upcoming shift and clock in/out when it's time to work.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Weekly Schedule</h4>
                <p className="text-sm text-gray-600">
                  View all your shifts for the week and track your total hours.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Notifications</h4>
                <p className="text-sm text-gray-600">
                  Get notified about new shifts, schedule changes, and approvals.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'my-shifts',
      title: 'My Shifts',
      description: 'View all your shifts in one place.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Click on <strong>"My Shifts"</strong> in the navigation to see:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Upcoming Shifts</p>
                <p className="text-sm text-gray-600">All your scheduled shifts with dates and times</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Shift Details</p>
                <p className="text-sm text-gray-600">Role, location, and any special notes</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Clock In/Out</p>
                <p className="text-sm text-gray-600">Track your attendance for each shift</p>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'availability',
      title: 'Set Your Availability',
      description: 'Let your manager know when you\'re available to work.',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ol className="space-y-2 text-blue-800 list-decimal list-inside">
              <li>Go to <strong>Availability</strong> in the navigation</li>
              <li>Select the days you're available to work</li>
              <li>Set your preferred start and end times</li>
              <li>Save your availability</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>Important:</strong> After your initial setup, any changes to your availability will require manager approval.
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Your manager will see your availability when creating the schedule, helping ensure you're only scheduled when you're available.
          </p>
        </div>
      ),
    },
    {
      id: 'time-off',
      title: 'Request Time Off',
      description: 'Need a day off? Here\'s how to request it.',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Navigate to Time Off</p>
                <p className="text-sm text-gray-600">Click "Time Off" in the navigation menu</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Submit Your Request</p>
                <p className="text-sm text-gray-600">Select dates and provide a reason</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Wait for Approval</p>
                <p className="text-sm text-gray-600">Your manager will review and respond</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                4
              </div>
              <div>
                <p className="font-medium text-gray-900">Get Notified</p>
                <p className="text-sm text-gray-600">You'll receive a notification when it's approved or denied</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-900">
              💡 <strong>Tip:</strong> Submit time-off requests as early as possible for better approval chances!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'You\'re ready to start using SmartShift.',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-green-900 mb-2">
              Welcome to the team!
            </h4>
            <p className="text-green-800">
              You now know the basics of SmartShift. Start by setting your availability!
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-gray-900">Quick Links:</h5>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/availability"
                className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center text-sm font-medium text-gray-700"
              >
                Set Availability
              </a>
              <a
                href="/my-shifts"
                className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center text-sm font-medium text-gray-700"
              >
                View Shifts
              </a>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can always access help by clicking the "?" icon in the navigation
          </p>
        </div>
      ),
    },
  ];

  return <OnboardingWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
