'use client';

import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const createUser = async () => {
      if (session?.user?.id) {  // Make sure we have the user ID
        try {
          console.log('Creating user with ID:', session.user);
          const response = await fetch('/api/auth/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              githubId: session.user.id,
              name: session.user.name || '',
              email: session.user.email || '',
              image: session.user.image || '',
            }),
          });

          if (response.ok) {
            router.push('/dashboard');
          } else {
            const error = await response.json();
            console.error('Error response:', error);
          }
        } catch (error) {
          console.error('Error creating user:', error);
        }
      }
    };

    if (session) {
      createUser();
    }
  }, [session, router]);

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
            onClick={() => signIn('github')}
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