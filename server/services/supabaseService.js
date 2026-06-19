const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only initialize if we have valid HTTP URLs
const isValidUrl = supabaseUrl && supabaseUrl.startsWith("http");
const supabase = isValidUrl ? createClient(supabaseUrl, supabaseKey) : null;

if (!isValidUrl) {
  console.warn("Valid SUPABASE_URL not found. Running in MOCK DATABASE mode.");
}

module.exports = {
  supabase,
};
