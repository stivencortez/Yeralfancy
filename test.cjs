const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

fetch(env.VITE_SUPABASE_URL + '/rest/v1/categorias?select=nombre,imagen', {
  headers: { apikey: env.VITE_SUPABASE_ANON_KEY }
}).then(r => r.json()).then(console.log).catch(console.error);
