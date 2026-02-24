import { createClient } from '@supabase/supabase-js';

// Replace these strings with your actual Supabase URL and Anon Key
const supabaseUrl = 'https://angtbjbzcmskbrlsreiy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZ3RiamJ6Y21za2JybHNyZWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MTA2NDksImV4cCI6MjA4NzQ4NjY0OX0.cs8JSRGPahPKcjUqRRrA_YPT9N0OeLtg3PLaEAbgsQs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);