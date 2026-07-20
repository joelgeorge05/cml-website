import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use Service Role Key to bypass rate limits and RLS
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration: Missing Supabase credentials.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    
    if (callerError || !callerUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if the caller is an admin in the database
    const { data: adminRecord } = await supabaseAdmin
      .from('admin_accounts')
      .select('role')
      .eq('id', callerUser.id)
      .single();

    const isSystemAdmin = callerUser.email === 'joelveliyath05@gmail.com' || callerUser.email === 'admin@cmlkaliyar.org';
    const hasAdminRole = adminRecord?.role === 'Super Admin' || adminRecord?.role === 'Admin';

    if (!isSystemAdmin && !hasAdminRole) {
      return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to create admin accounts' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Create the user in Auth (bypasses rate limit and email verification rules)
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (signUpError) {
      // Return a 400 error but with the Supabase error message
      return new Response(JSON.stringify({ error: signUpError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newUserId = signUpData?.user?.id;

    if (!newUserId) {
      return new Response(JSON.stringify({ error: 'Failed to retrieve user ID after creation.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Forcibly insert into admin_accounts to bypass RLS and triggers
    const { error: insertError } = await supabaseAdmin.from('admin_accounts').upsert({
      id: newUserId,
      email: email,
      name: name,
      role: role
    }, { onConflict: 'id' });

    if (insertError) {
      // If insertion fails, try to cleanup the auth user so we don't have dangling users
      await supabaseAdmin.auth.admin.deleteUser(newUserId).catch(() => {});
      return new Response(JSON.stringify({ error: 'Database insertion failed: ' + insertError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, user: signUpData.user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
