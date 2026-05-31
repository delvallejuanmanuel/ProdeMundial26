const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://boemqrxbzgshihyvzbki.supabase.co';
const supabaseKey = 'sb_publishable_kvoRQASYZjmwe1lb6nOGkQ_c628zRvL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Creando usuario dummy...");
  const email = `test_admin_${Date.now()}@test.com`;
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: { full_name: 'Test Admin' }
    }
  });

  if (authError) {
    console.error("Error creating user:", authError);
    return;
  }

  const user = authData.user;
  console.log("Usuario creado:", user.id);

  // Note: we can't update is_admin via standard API if RLS blocks it, but let's query it first.
  console.log("Consultando profile como el usuario...");
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('paid_groups, paid_knockouts, is_admin')
    .eq('id', user.id)
    .single();

  console.log("Profile data:", profile);
  console.log("Profile error:", profileError);
}

test();
