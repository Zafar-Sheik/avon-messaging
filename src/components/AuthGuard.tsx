"use client";

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isLoading && !session) {
      // Redirect to login page if not authenticated and not already on login page
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
  }, [session, isLoading, navigate, location.pathname]);

  if (isLoading) {
    // Show a loading spinner while checking session
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <CardContent className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 text-muted-foreground">Loading session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    // If not loading and no session, and we're not on the login page,
    // the redirect has already been triggered by the useEffect.
    // We can return null or a minimal loading state here to prevent rendering protected content.
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;