import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btsyvpoelshucpsaaolz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c3l2cG9lbHNodWNwc2Fhb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTQ0MzQsImV4cCI6MjA4NzUzMDQzNH0.1o-wfmqK3uhAyhEX4qxHlThc7_fXXcvohu5myLg6xPw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
