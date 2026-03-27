const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ── Submit paper (multipart with file) ── */
export async function submitPaper(formData, file) {
  const body = new FormData();
  body.append("data", JSON.stringify(formData));
  if (file) body.append("paperFile", file);

  const res = await fetch(`${BASE}/api/papers`, { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw { status: res.status, ...json };
  return json;
}

/* ── Fetch papers with optional filters / search / sort ── */
export async function fetchPapers({ q = "", type = "All", dept = "All", sort = "newest", limit = "" } = {}) {
  const params = new URLSearchParams();
  if (q)              params.set("q", q);
  if (type !== "All") params.set("type", type);
  if (dept !== "All") params.set("dept", dept);
  if (sort)           params.set("sort", sort);
  if (limit)          params.set("limit", limit);
  const res = await fetch(`${BASE}/api/papers?${params}`);
  const json = await res.json();
  if (!res.ok) throw json;
  return json.papers;
}

/* ── Get latest 6 papers ── */
export async function fetchLatestPapers() {
  const res  = await fetch(`${BASE}/api/papers/latest`);
  const json = await res.json();
  if (!res.ok) throw json;
  return json.papers;
}

/* ── Get total paper count ── */
export async function fetchPaperCount() {
  const res = await fetch(`${BASE}/api/papers/count`);
  const json = await res.json();
  if (!res.ok) throw json;
  return json.count;
}

/* ── Submit contact message ── */
export async function submitContact(data) {
  const res = await fetch(`${BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw { status: res.status, ...json };
  return json;
}
