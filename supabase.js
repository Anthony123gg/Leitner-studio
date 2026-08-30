const SUPABASE_URL = "https://lvznrjxiuupbconofzvz.supabase.co";

const SUPABASE_KEY = "sb_publishable_f8nksozj69tKlhfCm8AJhQ_LZkrqbex";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
console.log("Supabase conectado correctamente");