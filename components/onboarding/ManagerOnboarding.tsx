'use client';

import OnboardingWizard from './OnboardingWizard';
import { Calendar, Users, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface ManagerOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function ManagerOnboarding({ onComplete, onSkip }: ManagerOnboardingProps) {
  const steps = [
    {
      id: 'welcome',
      title: 'Welcome, Manager!',
      description: 'Let\'s get you set up to manage your team effectively with SmartShift.',
      content: (
        <div className="space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 className="font-semibold text-primary-900 mb-2">What you'll learn:</h4>
            <ul className="space-y-2 text-primary-800">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>How to create and manage schedules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>How to track team capacity and coverage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>How to approve time-off and availability requests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>How to monitor weekly hours and prevent overwork</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            This tour takes about 3 minutes and will help you get the most out of SmartShift.
          </p>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Manager Dashboard',
      description: 'Your command center for team management.',
      content: (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Weekly Calendar</h4>
                <p className="text-sm text-gray-600">
                  See the entire week at a glance with color-coded coverage indicators. Click any day to manage shifts.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Today's Attendance</h4>
                <p className="text-sm text-gray-600">
                  Monitor who's clocked in and track real-time attendance.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Quick Stats</h4>
                <p className="text-sm text-gray-600">
                  See pending requests, notifications, and important alerts at a glance.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'schedule-management',
      title: 'Creating Schedules',
      description: 'Build and publish schedules for your team.',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Schedule Creation Process:</h4>
            <ol className="space-y-3 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-semibold">1.</span>
                <span>Click any day on the weekly calendar to open schedule management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">2.</span>
                <span>Click "Add Shift" to create a new shift</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">3.</span>
                <span>Select employee, role, and time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">4.</span>
                <span>Review the weekly hours summary to avoid overwork</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">5.</span>
                <span>Publish the schedule to notify employees</span>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Weekly Hours:</strong> The system will warn you if an employee exceeds 40 hours per week.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'team-capacity',
      title: 'Team & Capacity',
      description: 'Manage your team and optimize staffing levels.',
      content: (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Team Management</h4>
                <p className="text-sm text-gray-600 mt-1">
                  View all team members, their roles, and availability. Add new employees and assign work roles.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Capacity Planning</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Analyze staffing levels by role and time period. Identify understaffed or overstaffed situations.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-900">
              💡 <strong>Pro Tip:</strong> Check the capacity page before creating schedules to ensure optimal coverage!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'approvals',
      title: 'Approvals & Requests',
      description: 'Handle employee requests efficiently.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">You'll need to review and approve:</p>

          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-3">
              <h5 className="font-semibold text-blue-900 mb-1">Time-Off Requests</h5>
              <p className="text-sm text-blue-800">
                Navigate to <strong>Time Off</strong> to see pending requests. Approve or deny with optional notes.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 p-3">
              <h5 className="font-semibold text-purple-900 mb-1">Availability Changes</h5>
              <p className="text-sm text-purple-800">
                Go to <strong>Availability</strong> to review employee availability change requests. See their reason and approve/deny.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-900">
              <strong>Note:</strong> Employees are notified immediately when you approve or deny their requests.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'weekly-hours',
      title: 'Weekly Hours Tracking',
      description: 'Prevent employee overwork and ensure compliance.',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">Why It Matters:</h4>
            <p className="text-sm text-red-800">
              Scheduling employees over 40 hours per week can lead to burnout, decreased productivity, and potential labor law issues.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Automatic Warnings</p>
                <p className="text-sm text-gray-600">
                  The schedule page shows a warning banner when any employee exceeds 40 hours
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Weekly Summary</p>
                <p className="text-sm text-gray-600">
                  See total hours per employee with color-coded indicators (yellow = over 40 hours)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-900">
              ✅ <strong>Best Practice:</strong> Review the weekly hours summary before publishing schedules!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'complete',
      title: 'You\'re Ready to Manage!',
      description: 'Start building schedules and managing your team.',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-green-900 mb-2">
              You're all set!
            </h4>
            <p className="text-green-800">
              You now have everything you need to effectively manage your team with SmartShift.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-gray-900">Quick Actions:</h5>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/team"
                className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center text-sm font-medium text-gray-700"
              >
                View Team
              </a>
              <a
                href="/schedule"
                className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center text-sm font-medium text-gray-700"
              >
                Create Schedule
              </a>
              <a
                href="/capacity"
                className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center text-sm font-medium text-gray-700"
              >
                Check Capacity
              </a>
              <a
                href="/time-off"
                className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center text-sm font-medium text-gray-700"
              >
                Review Requests
              </a>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Need help? Click the "?" icon in the navigation anytime
          </p>
        </div>
      ),
    },
  ];

  return <OnboardingWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
