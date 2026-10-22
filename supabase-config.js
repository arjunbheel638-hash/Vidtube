/*
  VIDTUBE - Supabase Configuration
  Browser client setup
*/

(function () {
  "use strict";

  const SUPABASE_URL =
    "https://crfzbdfrfhlhjobymtkt.supabase.co";

  // Yahan apni Supabase sb_publishable_ wali key paste karo.
  const SUPABASE_PUBLISHABLE_KEY =
    "PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE";

  if (!window.supabase) {
    console.error("Supabase library load nahi hui.");
    return;
  }

  if (
    !SUPABASE_PUBLISHABLE_KEY ||
    SUPABASE_PUBLISHABLE_KEY ===
      "PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE"
  ) {
    console.error("Supabase Publishable Key add karo.");
    return;
  }

  const { createClient } = window.supabase;

  window.supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );

  console.log("VIDTUBE Supabase client initialized.");
})();
