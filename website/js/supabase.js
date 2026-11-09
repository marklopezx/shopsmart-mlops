// --- SUPABASE INITIALIZATION ---
const SUPABASE_URL = "https://nggbvafslqtnuamrkafi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ev-_kvyp2AEncoPX7B091A_8Q9N1oUh";

// Initialize the Supabase client
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
