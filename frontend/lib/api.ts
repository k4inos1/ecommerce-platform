const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Auth helpers ─────────────────────────────────────────
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ─── Auth ─────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Credenciales inválidas');
  return res.json();
}

// ─── Products ─────────────────────────────────────────────
export async function getProducts(params?: { search?: string; category?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.category && params.category !== 'All') q.set('category', params.category);
  if (params?.page) q.set('page', String(params.page));

  const res = await fetch(`${API_URL}/api/products?${q}`);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json(); // { products, total, page, pages }
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (!res.ok) throw new Error('Producto no encontrado');
  return res.json();
}

export async function createProduct(data: object) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear producto');
  return res.json();
}

export async function updateProduct(id: string, data: object) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar producto');
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar producto');
}

// ─── Wishlist ─────────────────────────────────────────────
export function getUserToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userToken') || localStorage.getItem('adminToken');
}

function userAuthHeaders(): Record<string, string> {
  const token = getUserToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function getWishlist() {
  const res = await fetch(`${API_URL}/api/users/wishlist`, { headers: userAuthHeaders() });
  if (!res.ok) throw new Error('Error al cargar wishlist');
  return res.json();
}

export async function addToWishlist(productId: string) {
  const res = await fetch(`${API_URL}/api/users/wishlist/${productId}`, {
    method: 'POST',
    headers: userAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al agregar a wishlist');
  return res.json();
}

export async function removeFromWishlist(productId: string) {
  const res = await fetch(`${API_URL}/api/users/wishlist/${productId}`, {
    method: 'DELETE',
    headers: userAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar de wishlist');
  return res.json();
}

// ─── Coupons ──────────────────────────────────────────────
export async function validateCoupon(code: string, cartTotal: number) {
  const res = await fetch(`${API_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: userAuthHeaders(),
    body: JSON.stringify({ code, cartTotal }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Cupón inválido');
  return data;
}

// ─── Admin Coupons ─────────────────────────────────────────
export async function getCoupons() {
  const res = await fetch(`${API_URL}/api/coupons`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al cargar cupones');
  return res.json();
}

export async function createCoupon(data: object) {
  const res = await fetch(`${API_URL}/api/coupons`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al crear cupón');
  return json;
}

export async function updateCoupon(id: string, data: object) {
  const res = await fetch(`${API_URL}/api/coupons/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar cupón');
  return res.json();
}

export async function deleteCoupon(id: string) {
  const res = await fetch(`${API_URL}/api/coupons/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar cupón');
}

// ─── Related products ─────────────────────────────────────
export async function getRelatedProducts(id: string) {
  const res = await fetch(`${API_URL}/api/products/${id}/related`);
  if (!res.ok) return [];
  return res.json();
}
export async function getOrders() {
  const res = await fetch(`${API_URL}/api/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al cargar órdenes');
  return res.json();
}

export async function updateOrderStatus(id: string, status: string) {
  const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
}
