// Supabase Edge Function: deletes the signed-in user's auth account.
// Their app_state row is removed by the foreign key's ON DELETE CASCADE.
// Deploy with: supabase functions deploy delete-account
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response('Unauthorised', { status: 401 });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return new Response('Unauthorised', { status: 401 });
  const { error: delError } = await admin.auth.admin.deleteUser(data.user.id);
  if (delError) return new Response('Could not delete', { status: 500 });
  return new Response(JSON.stringify({ deleted: true }), { headers: { 'content-type': 'application/json' } });
});
