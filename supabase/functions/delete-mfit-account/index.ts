import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://momo-12-10.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (origin && origin !== ALLOWED_ORIGIN) return json({ error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) {
      return json({ error: "Server-Konfiguration unvollständig." }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Anmeldung erforderlich." }, 401);

    const body = await req.json().catch(() => ({}));
    if (body.confirmation !== "DELETE_MY_ACCOUNT") {
      return json({ error: "Bestätigung fehlt." }, 400);
    }

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Sitzung ungültig. Bitte erneut anmelden." }, 401);

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: deleteDataError } = await admin
      .from("mfit_user_data")
      .delete()
      .eq("user_id", user.id);

    if (deleteDataError) {
      return json({ error: "Cloud-Daten konnten nicht gelöscht werden. Das Konto wurde nicht gelöscht: " + deleteDataError.message }, 500);
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      return json({ error: "Cloud-Daten wurden gelöscht, aber das Konto konnte nicht gelöscht werden: " + deleteUserError.message }, 500);
    }

    return json({ deleted: true }, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unbekannter Fehler." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
