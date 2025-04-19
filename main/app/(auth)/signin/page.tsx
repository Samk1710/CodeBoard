'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Get personalized insights for your GitHub repositories
          </p>
        </div>
        <div className="mt-8">
          <Button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="w-full"
            variant="outline"
          >
            <GitHubLogoIcon className="mr-2 h-5 w-5" />
            Sign in with GitHub
          </Button>
        </div>
      </div>
    </div>
  );
} 