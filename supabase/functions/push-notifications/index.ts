import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const ALLOWED_ORIGIN = "https://momo-12-10.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mfit-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function reply(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function getAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase-Serverkonfiguration unvollständig.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function configurePush() {
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const subject = Deno.env.get("VAPID_SUBJECT");
  if (!publicKey || !privateKey || !subject || !subject.startsWith("mailto:")) throw new Error("VAPID-Secrets fehlen oder VAPID_SUBJECT ist ungültig.");
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return publicKey;
}

async function hashDeviceToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function localClock(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { date: values.year + "-" + values.month + "-" + values.day, time: values.hour + ":" + values.minute };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (origin && origin !== ALLOWED_ORIGIN) return reply({ error: "Origin not allowed." }, 403);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);

  try {
    const body = await req.json();
    const action = body?.action;
    if (action !== "dispatch" && origin !== ALLOWED_ORIGIN) return reply({ error: "Origin not allowed." }, 403);

    if (action === "public-key") return reply({ publicKey: configurePush() });

    if (action === "subscribe") {
      configurePush();
      const sub = body.subscription;
      if (!sub || typeof sub.endpoint !== "string" || !sub.endpoint.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth) {
        return reply({ error: "Ungültiges Push-Abonnement." }, 400);
      }
      const deviceToken = body.deviceToken;
      if (typeof deviceToken !== "string" || !/^[a-f0-9]{64}$/.test(deviceToken)) {
        return reply({ error: "Geräteberechtigung fehlt oder ist ungültig." }, 400);
      }
      const tokenHash = await hashDeviceToken(deviceToken);
      const settings = body.settings && typeof body.settings === "object" ? body.settings : {};
      const timezone = typeof body.timezone === "string" && body.timezone.length <= 80 ? body.timezone : "Europe/Vienna";
      try { new Intl.DateTimeFormat("en", { timeZone: timezone }); } catch { return reply({ error: "Ungültige Zeitzone." }, 400); }
      const admin = getAdmin();
      const record = {
        subscription: sub,
        settings: {
          waterEnabled: settings.waterEnabled !== false,
          waterTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(settings.waterTime || "") ? settings.waterTime : "12:30",
          waterMin: Math.max(100, Math.min(5000, Number(settings.waterMin) || 750)),
          mealEnabled: settings.mealEnabled !== false,
          mealTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(settings.mealTime || "") ? settings.mealTime : "14:00",
          mealName: ["Frühstück", "Mittagessen", "Abendessen"].includes(settings.mealName) ? settings.mealName : "Mittagessen",
        },
        timezone,
        device_token_hash: tokenHash,
        updated_at: new Date().toISOString(),
      };
      const { data: existing, error: lookupError } = await admin
        .from("push_subscriptions").select("device_token_hash").eq("endpoint", sub.endpoint).maybeSingle();
      if (lookupError) throw lookupError;
      if (existing) {
        if (existing.device_token_hash && existing.device_token_hash !== tokenHash) {
          return reply({ error: "Dieses Push-Abo gehört bereits zu einem anderen Gerät oder Browserprofil." }, 403);
        }
        let update = admin.from("push_subscriptions").update(record).eq("endpoint", sub.endpoint);
        update = existing.device_token_hash ? update.eq("device_token_hash", tokenHash) : update.is("device_token_hash", null);
        const { data: updated, error } = await update.select("endpoint");
        if (error) throw error;
        if (!updated?.length) return reply({ error: "Push-Abo wurde gleichzeitig geändert. Bitte erneut versuchen." }, 409);
      } else {
        const { error } = await admin.from("push_subscriptions").insert({ endpoint: sub.endpoint, ...record });
        if (error) throw error;
      }
      return reply({ saved: true });
    }

    if (action === "unsubscribe") {
      if (typeof body.endpoint !== "string" || !body.endpoint.startsWith("https://")) return reply({ error: "Ungültiger Endpunkt." }, 400);
      const deviceToken = body.deviceToken;
      if (typeof deviceToken !== "string" || !/^[a-f0-9]{64}$/.test(deviceToken)) {
        return reply({ error: "Geräteberechtigung fehlt oder ist ungültig." }, 400);
      }
      const tokenHash = await hashDeviceToken(deviceToken);
      const admin = getAdmin();
      const { data: existing, error: lookupError } = await admin
        .from("push_subscriptions").select("device_token_hash").eq("endpoint", body.endpoint).maybeSingle();
      if (lookupError) throw lookupError;
      if (!existing) return reply({ removed: true });
      if (!existing.device_token_hash || existing.device_token_hash !== tokenHash) {
        return reply({ error: "Dieses Push-Abo darf von diesem Gerät nicht entfernt werden." }, 403);
      }
      const { error } = await admin.from("push_subscriptions")
        .delete().eq("endpoint", body.endpoint).eq("device_token_hash", tokenHash);
      if (error) throw error;
      return reply({ removed: true });
    }

    if (action === "dispatch") {
      const expected = Deno.env.get("PUSH_CRON_SECRET");
      if (!expected || req.headers.get("x-mfit-cron-secret") !== expected) return reply({ error: "Unauthorized." }, 401);
      configurePush();
      const admin = getAdmin();
      const { data: rows, error } = await admin.from("push_subscriptions").select("endpoint,subscription,settings,timezone,last_water_date,last_meal_date");
      if (error) throw error;
      let sent = 0, removed = 0;
      for (const row of rows || []) {
        const clock = localClock(row.timezone || "Europe/Vienna");
        const settings = row.settings || {};
        const jobs = [];
        if (settings.waterEnabled !== false && settings.waterTime === clock.time && row.last_water_date !== clock.date) {
          jobs.push({ kind: "water", title: "Zeit für eine Trinkpause 💧", body: "Denk daran, etwas zu trinken und deinen Wassereintrag in MFit zu aktualisieren.", field: "last_water_date" });
        }
        if (settings.mealEnabled !== false && settings.mealTime === clock.time && row.last_meal_date !== clock.date) {
          jobs.push({ kind: "meal", title: "Mahlzeit-Erinnerung 🍽️", body: "Denk an deine " + (settings.mealName || "Mahlzeit") + " und trage sie bei Bedarf in MFit ein.", field: "last_meal_date" });
        }
        for (const job of jobs) {
          const { data: claimed, error: markError } = await admin.from("push_subscriptions")
            .update({ [job.field]: clock.date })
            .eq("endpoint", row.endpoint)
            .or(job.field + ".is.null," + job.field + ".neq." + clock.date)
            .select("endpoint");
          if (markError) throw markError;
          if (!claimed?.length) continue;
          try {
            await webpush.sendNotification(row.subscription, JSON.stringify({ title: job.title, body: job.body, tag: "mfit-" + job.kind }), { TTL: 180, urgency: "normal" });
            sent++;
          } catch (error) {
            const statusCode = (error as { statusCode?: number }).statusCode;
            if (statusCode === 404 || statusCode === 410) {
              await admin.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
              removed++;
            } else console.error("Push delivery failed:", statusCode || error);
          }
        }
      }
      return reply({ checked: rows?.length || 0, sent, removed });
    }

    return reply({ error: "Unbekannte Aktion." }, 400);
  } catch (error) {
    const detail = error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
    console.error("push-notifications error:", detail);
    return reply({ error: "Interner Fehler", detail }, 500);
  }
});
