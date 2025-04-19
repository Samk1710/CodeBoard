'use client'

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Code Board
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/dashboard" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Repositories
              </Link>
            </div>
            {status === 'authenticated' ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  {session.user?.name}
                </span>
                <Button
                  onClick={() => signOut()}
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 