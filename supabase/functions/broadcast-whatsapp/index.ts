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

    const { message, contacts, wahaSettings } = await req.json();

    if (!message || !Array.isArray(contacts) || contacts.length === 0) {
      return new Response(JSON.stringify({ error: 'Message and contacts array are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!wahaSettings || !wahaSettings.baseUrl || !wahaSettings.apiKey || !wahaSettings.sessionName || !wahaSettings.phoneNumber) {
      return new Response(JSON.stringify({ error: 'WhatsApp API settings (baseUrl, apiKey, sessionName, phoneNumber) are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`User ${user.id} initiating broadcast to ${contacts.length} contacts using WAHA API.`);
    console.log(`Message: ${message}`);

    const successfulSends: string[] = [];
    const failedSends: { phone: string; error: string }[] = [];

    for (const contact of contacts) {
      try {
        const wahaApiUrl = `${wahaSettings.baseUrl}/api/sendText`; // Session is now in the payload
        const payload = {
          session: wahaSettings.sessionName, // Add session to payload
          chatId: `${contact.phone}@c.us`, // Use chatId format
          text: message, // Use text instead of message
        };

        const response = await fetch(wahaApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': wahaSettings.apiKey,
          },
          body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (response.ok && responseData.result === 'success') {
          successfulSends.push(contact.phone);
        } else {
          failedSends.push({ phone: contact.phone, error: responseData.message || 'WAHA API error' });
          console.error(`Failed to send to ${contact.phone}: ${responseData.message || 'Unknown error'}`);
        }
      } catch (apiError: any) {
        failedSends.push({ phone: contact.phone, error: apiError.message || 'Network or API call failed' });
        console.error(`Error sending to ${contact.phone}: ${apiError.message}`);
      }
    }

    console.log(`Broadcast completed. Successful: ${successfulSends.length}, Failed: ${failedSends.length}`);

    return new Response(JSON.stringify({
      message: 'Broadcast initiated successfully.',
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