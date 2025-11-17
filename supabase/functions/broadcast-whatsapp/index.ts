import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client for the Edge Function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user from the JWT
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { message, contacts } = await req.json();

    if (!message || !Array.isArray(contacts) || contacts.length === 0) {
      return new Response(JSON.stringify({ error: 'Message and contacts array are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`User ${user.id} initiating broadcast to ${contacts.length} contacts.`);
    console.log(`Message: ${message}`);

    // --- Placeholder for actual WhatsApp API integration ---
    // In a real application, you would integrate with a WhatsApp API provider here.
    // This might involve:
    // 1. Fetching an API key from Supabase secrets (e.g., Deno.env.get('WHATSAPP_API_KEY')).
    // 2. Iterating through contacts and making API calls to send messages.
    // 3. Handling rate limits, delivery reports, and errors from the WhatsApp API.
    //
    // For demonstration, we'll simulate a delay and success.

    const successfulSends: string[] = [];
    const failedSends: { phone: string; error: string }[] = [];

    for (const contact of contacts) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        successfulSends.push(contact.phone);
      } else {
        failedSends.push({ phone: contact.phone, error: 'Simulated API error' });
      }
    }

    console.log(`Broadcast completed. Successful: ${successfulSends.length}, Failed: ${failedSends.length}`);

    return new Response(JSON.stringify({
      message: 'Broadcast initiated successfully (simulated).',
      successfulSends: successfulSends.length,
      failedSends: failedSends.length,
      details: { successfulSends, failedSends },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in broadcast-whatsapp function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});