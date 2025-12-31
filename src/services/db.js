export async function executeQuery(sql) {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: 'proj_i0fod7om6', sql })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}