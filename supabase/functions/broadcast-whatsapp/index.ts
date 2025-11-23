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

    // ⚠️ TEMPORARY BYPASS FOR TESTING:
    // In a production environment, ensure user authentication is enforced.
    // The following lines are commented out to bypass the user check as requested.
    // const { data: { user } } = await supabaseClient.auth.getUser();
    // if (!user) {
    //   console.error('Edge Function: Unauthorized - No user found in JWT.');
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //     status: 401,
    //   });
    // }
    // console.log(`Edge Function: User ${user.id} authenticated.`);
    
    // Mock user for testing purposes when authentication is bypassed
    const user = { id: 'anonymous_test_user' }; 
    console.warn('Edge Function: User authentication bypassed for testing purposes. DO NOT USE IN PRODUCTION.');
    // ⚠️ END TEMPORARY BYPASS

    const { message, contacts, attachments, wahaSettings } = await req.json();

    if (!message && (!attachments || attachments.length === 0)) {
      console.error('Edge Function: Validation failed - Message or attachments are required.');
      return new Response(JSON.stringify({ error: 'Message or attachments are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!Array.isArray(contacts) || contacts.length === 0) {
      console.error('Edge Function: Validation failed - Contacts array is required and cannot be empty.');
      return new Response(JSON.stringify({ error: 'Contacts array is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!wahaSettings || !wahaSettings.baseUrl || !wahaSettings.apiKey || !wahaSettings.sessionName || !wahaSettings.phoneNumber) {
      console.error('Edge Function: Validation failed - WhatsApp API settings (baseUrl, apiKey, sessionName, phoneNumber) are required.');
      return new Response(JSON.stringify({ error: 'WhatsApp API settings (baseUrl, apiKey, sessionName, phoneNumber) are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Edge Function: User ${user.id} initiating broadcast to ${contacts.length} contacts using WAHA API.`);
    console.log(`Edge Function: Message: ${message ? message.substring(0, 50) + '...' : '[No message]'}`);
    console.log(`Edge Function: Attachments count: ${attachments ? attachments.length : 0}`);
    console.log(`Edge Function: WAHA Base URL: ${wahaSettings.baseUrl}`);
    console.log(`Edge Function: WAHA Session Name: ${wahaSettings.sessionName}`);
    console.log(`Edge Function: WAHA Phone Number: ${wahaSettings.phoneNumber}`);


    const successfulSends: string[] = [];
    const failedSends: { phone: string; error: string }[] = [];

    for (const contact of contacts) {
      try {
        const chatId = `${contact.phone}@c.us`;
        let currentMessage = message; // Message to be used as caption or standalone text

        // Send attachments first, if any
        if (attachments && attachments.length > 0) {
          for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];
            const isImage = attachment.type.startsWith('image/');
            const isVideo = attachment.type.startsWith('video/');
            
            let wahaApiUrl = `${wahaSettings.baseUrl}/api/sendFile`; // Default to sendFile
            let payload: any = {
              session: wahaSettings.sessionName,
              chatId: chatId,
              filename: attachment.name,
              contentType: attachment.type,
              content: attachment.data, // Base64 content
            };

            if (isImage) {
              wahaApiUrl = `${wahaSettings.baseUrl}/api/sendImage`;
              payload = {
                session: wahaSettings.sessionName,
                chatId: chatId,
                image: attachment.data, // Base64 image
                caption: i === 0 ? currentMessage : undefined, // Only first attachment gets the message as caption
              };
            } else if (isVideo) {
              wahaApiUrl = `${wahaSettings.baseUrl}/api/sendVideo`;
              payload = {
                session: wahaSettings.sessionName,
                chatId: chatId,
                video: attachment.data, // Base64 video
                caption: i === 0 ? currentMessage : undefined, // Only first attachment gets the message as caption
              };
            } else {
              // For other files, use sendFile. WAHA's sendFile usually supports caption.
              payload.caption = i === 0 ? currentMessage : undefined;
            }

            console.log(`Edge Function: Sending attachment ${attachment.name} to ${contact.phone} via ${wahaApiUrl}`);
            const response = await fetch(wahaApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': wahaSettings.apiKey,
              },
              body: JSON.stringify(payload),
            });

            const responseData = await response.json();
            console.log(`Edge Function: WAHA API response for attachment to ${contact.phone}:`, responseData);

            if (!response.ok || responseData.result !== 'success') {
              const errorMessage = responseData.message || responseData.error || `WAHA API error sending ${attachment.name}`;
              throw new Error(errorMessage); // Propagate error to catch block
            }
            
            // Clear message if it was used as a caption for the first attachment
            if (i === 0 && currentMessage) {
              currentMessage = ''; 
            }
          }
        }

        // Send remaining text message if not already sent as a caption
        if (currentMessage) {
          const wahaApiUrl = `${wahaSettings.baseUrl}/api/sendText`;
          const payload = {
            session: wahaSettings.sessionName,
            chatId: chatId,
            text: currentMessage,
          };

          console.log(`Edge Function: Sending text message to ${contact.phone} via ${wahaApiUrl}`);
          const response = await fetch(wahaApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': wahaSettings.apiKey,
            },
            body: JSON.stringify(payload),
          });

          const responseData = await response.json();
          console.log(`Edge Function: WAHA API response for text to ${contact.phone}:`, responseData);

          if (!response.ok || responseData.result !== 'success') {
            const errorMessage = responseData.message || responseData.error || 'WAHA API error sending text message';
            throw new Error(errorMessage);
          }
        }
        
        successfulSends.push(contact.phone);

      } catch (apiError: any) {
        failedSends.push({ phone: contact.phone, error: apiError.message || 'Network or API call failed' });
        console.error(`Edge Function: Error sending to ${contact.phone}: ${apiError.message}`);
      }
    }

    console.log(`Edge Function: Broadcast completed. Successful: ${successfulSends.length}, Failed: ${failedSends.length}`);

    return new Response(JSON.stringify({
      message: 'Broadcast initiated successfully.',
      successfulSends: successfulSends.length,
      failedSends: failedSends.length,
      details: { successfulSends, failedSends },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Edge Function: Uncaught error in broadcast-whatsapp function:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});