'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Review { _id: string; name: string; rating: number; comment: string; createdAt: string }

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`${onChange ? 'cursor-pointer' : 'cursor-default'} transition-colors`}>
          <Star className={`w-5 h-5 ${(hover || value) >= i ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!localStorage.getItem('userToken'));
  }, []);

  const fetchReviews = () => {
    fetch(`${API_URL}/api/reviews/${productId}`)
      .then(r => r.json())
      .then(data => { setReviews(data.reviews || []); setAverage(data.average || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating === 0) { setError('Por favor selecciona una calificación'); return; }
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('Debes iniciar sesión para publicar una reseña');
      
      const res = await fetch(`${API_URL}/api/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setSuccess(true);
      setForm({ name: '', rating: 0, comment: '' });
      fetchReviews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 space-y-8">
      <div className="flex items-center gap-4 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white">Reseñas</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(average)} />
            <span className="text-sm text-gray-400">{average} / 5 ({reviews.length} reseñas)</span>
          </div>
        )}
      </div>

      {/* Review form */}
      {!isLogged ? (
        <div className="card p-6 text-center">
          <p className="text-gray-400 mb-4">Debes iniciar sesión para dejar una reseña sobre este producto.</p>
          <a href="/login" className="btn-primary inline-flex text-sm py-2 px-6">Iniciar Sesión</a>
        </div>
      ) : !success ? (
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-4">Deja tu reseña</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tu nombre</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ricardo S."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Calificación</label>
              <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Comentario</label>
              <textarea required value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                placeholder="¿Qué te pareció el producto?"
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand focus:outline-none resize-none" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary text-sm disabled:opacity-50">
              {submitting ? 'Enviando...' : 'Publicar Reseña'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card p-4 text-green-400 text-sm text-center font-medium">✅ ¡Gracias por tu reseña!</div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Cargando reseñas...</div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">Sin reseñas todavía. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-white text-sm">{r.name}</div>
                  <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('es-CL')}</div>
                </div>
                <StarRating value={r.rating} />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
