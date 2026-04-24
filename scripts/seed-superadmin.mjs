import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPERADMIN_PHONE",
  "SUPERADMIN_INITIAL_PASSWORD",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const phone = normalizePhone(process.env.SUPERADMIN_PHONE);
const password = process.env.SUPERADMIN_INITIAL_PASSWORD;
const authEmail = phoneToAuthEmail(phone);

const { data: existingProfile, error: profileError } = await supabase
  .from("profiles")
  .select("id")
  .eq("phone", phone)
  .maybeSingle();

if (profileError) {
  throw profileError;
}

let userId = existingProfile?.id;

if (!userId) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: "Superadmin",
      phone,
    },
  });

  if (error) {
    throw error;
  }

  userId = data.user.id;
}

const { error: updateUserError } = await supabase.auth.admin.updateUserById(userId, {
  email: authEmail,
  password,
  email_confirm: true,
  user_metadata: {
    display_name: "Superadmin",
    phone,
  },
});

if (updateUserError) {
  throw updateUserError;
}

const { error: upsertError } = await supabase.from("profiles").upsert({
  id: userId,
  phone,
  display_name: "Superadmin",
  role: "superadmin",
  is_active: true,
});

if (upsertError) {
  throw upsertError;
}

console.log("Superadmin seeded.");

function normalizePhone(rawPhone) {
  const trimmed = rawPhone.trim().replace(/[\s()-]/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("0")) return `+62${trimmed.slice(1)}`;
  if (trimmed.startsWith("62")) return `+${trimmed}`;
  return trimmed;
}

function phoneToAuthEmail(rawPhone) {
  const digits = normalizePhone(rawPhone).replace(/\D/g, "");
  if (!digits) throw new Error("Invalid phone.");
  return `wa-${digits}@psikotes-kemenkeu.local`;
}
