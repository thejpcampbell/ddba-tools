export async function apiGet(key) {
  try { const r=await fetch(`/api/setter?key=${encodeURIComponent(key)}`); if(!r.ok) throw new Error(); return (await r.json()).value??null; }
  catch { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
}
export async function apiSet(key,value) {
  try { await fetch("/api/setter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key,value})}); }
  catch { try { if(value===null) localStorage.removeItem(key); else localStorage.setItem(key,JSON.stringify(value)); } catch {} }
}
export async function appendHistory(key,entry) {
  const hist=(await apiGet(key))||[];
  const idx=hist.findIndex(h=>h.date===entry.date);
  const next=idx>-1 ? hist.map((h,i)=>i===idx?entry:h) : [...hist,entry].slice(-90);
  await apiSet(key,next);
}
