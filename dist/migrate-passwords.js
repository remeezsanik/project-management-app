// scripts/migrate-passwords.ts
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
async function migratePasswords(supabase) {
    const { data: users, error } = await supabase
        .from("User")
        .select("id, email, password");
    if (error) {
        console.error("Error fetching users:", error.message);
        return;
    }
    if (!users || users.length === 0) {
        console.log("No users found to migrate");
        return;
    }
    for (const user of users) {
        if (!user.password.startsWith("$")) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const { error: updateError } = await supabase
                .from("User")
                .update({ password: hashedPassword })
                .eq("id", user.id);
            if (updateError) {
                console.error(`Error updating ${user.email}:`, updateError.message);
            }
            else {
                console.log(`Updated password for ${user.email}`);
            }
        }
        else {
            console.log(`Password for ${user.email} is already hashed`);
        }
    }
}
try {
    dotenv.config();
    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Missing Supabase environment variables");
    }
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    migratePasswords(supabase).then(() => console.log("Migration complete"));
}
catch (error) {
    console.error("Script error:", error instanceof Error ? error.message : String(error));
}
