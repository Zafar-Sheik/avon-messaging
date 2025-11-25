"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react"; // Import Loader2 for loading state

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(false);
    // Debugging: Log Supabase client details
    console.log("Supabase Client URL:", supabase.supabaseUrl);
    console.log("Supabase Client Anon Key:", supabase.anonKey);
  }, []);

  const handleAuthError = (error: Error) => {
    console.error("Supabase Auth UI Error:", error); // Log the full error object
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={["email"]}
            magicLink={true}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            redirectTo={window.location.origin + '/'}
            onError={handleAuthError}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;