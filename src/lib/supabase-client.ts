import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser-side Supabase client for realtime subscriptions
// This is separate from the Prisma DB client used server-side
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})
