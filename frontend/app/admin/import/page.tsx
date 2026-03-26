'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/ui/AdminLayout';
import { getToken } from '@/lib/api';
import { Search, Download, Calculator, TrendingUp, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ScrapedProduct {
  name: string; price: number; image: string; description: string; category: string;
  supplierPrice: number; margin: number; demandScore: number;
  competitionLevel: 'low' | 'medium' | 'high'; trend: string; source: string; sourceUrl: string;
}

interface ProfitResult {
  revenue: number; profit: number; marginPercent: number; roi: number;
  isViable: boolean; recommendation: string;
  costs: { supplier: number; shipping: number; paymentFee: number; total: number };
}

const COMPETITION_COLOR = { low: 'text-green-400 bg-green-400/10', medium: 'text-yellow-400 bg-yellow-400/10', high: 'text-red-400 bg-red-400/10' };
const DEMAND_COLOR = (d: number) => d >= 8 ? 'text-green-400' : d >= 5 ? 'text-yellow-400' : 'text-red-400';

export default function AdminImport() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScrapedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [calcProduct, setCalcProduct] = useState<ScrapedProduct | null>(null);
  const [calcResult, setCalcResult] = useState<ProfitResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const token = getToken();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(''); setResults([]);
    try {
      const res = await fetch(`${API_URL}/api/scraper/search?q=${encodeURIComponent(query)}&limit=12`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      setResults(data.products || []);
    } catch { setError('Error al buscar. Verifica que el backend esté corriendo.'); }
    finally { setLoading(false); }
  };

  const handleImport = async (p: ScrapedProduct) => {
    setImporting(p.name);
    try {
      const res = await fetch(`${API_URL}/api/scraper/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: p.name, price: p.price, image: p.image, description: p.description, category: p.category, stock: 20 }),
      });
      if (res.ok) setImported(prev => new Set([...prev, p.name]));
    } catch { /* silent */ }
    finally { setImporting(null); }
  };

  const handleCalculate = async (p: ScrapedProduct) => {
    setCalcProduct(p); setCalcLoading(true); setCalcResult(null);
    try {
      const res = await fetch(`${API_URL}/api/scraper/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sellingPrice: p.price, supplierCost: p.supplierPrice }),
      });
      setCalcResult(await res.json());
    } catch { /* silent */ }
    finally { setCalcLoading(false); }
  };

  return (
    <AdminLayout title="Importar Productos">
      <div className="space-y-6">
        {/* Header */}
        <div className="card p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-white">Investigación de Productos</div>
            <div className="text-xs text-gray-400 mt-1">
              Basado en el marco <code className="text-indigo-400">ecommerce-product-pro</code>: busca productos ganadores en AliExpress, analiza márgenes y compite.
              Solo se importan productos con margen ≥ 30%.
            </div>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Ej: wireless headphones, gaming laptop, smart watch..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-6 disabled:opacity-50">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && <div className="card p-4 text-yellow-400 text-sm">⚠️ {error}</div>}

        {/* Profit Calculator Modal */}
        {calcProduct && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Calculator className="w-5 h-5 text-indigo-400" /> Calculadora de Margen
                </div>
                <button onClick={() => { setCalcProduct(null); setCalcResult(null); }} className="text-gray-500 hover:text-white text-xl">×</button>
              </div>
              <div className="text-sm text-gray-400 truncate">{calcProduct.name}</div>
              {calcLoading && <div className="text-center py-4"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>}
              {calcResult && (
                <div className="space-y-3">
                  <div className={`text-sm px-3 py-2 rounded-lg ${calcResult.isViable ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {calcResult.recommendation}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: 'Precio de venta', value: `$${calcResult.revenue}` },
                      { label: 'Costo total', value: `$${calcResult.costs.total}` },
                      { label: 'Ganancia neta', value: `$${calcResult.profit}`, highlight: true },
                      { label: 'Margen', value: `${calcResult.marginPercent}%`, highlight: true },
                      { label: 'ROI', value: `${calcResult.roi}%` },
                      { label: 'Fee Stripe', value: `$${calcResult.costs.paymentFee}` },
                    ].map(r => (
                      <div key={r.label} className={`card p-3 ${r.highlight ? 'border-indigo-500/30 bg-indigo-500/5' : ''}`}>
                        <div className="text-xs text-gray-500">{r.label}</div>
                        <div className={`font-bold ${r.highlight ? 'text-indigo-400' : 'text-white'}`}>{r.value}</div>
                      </div>
                    ))}
                  </div>
                  {calcResult.isViable && (
                    <button onClick={() => { handleImport(calcProduct); setCalcProduct(null); setCalcResult(null); }}
                      className="w-full btn-primary text-sm">
                      <Download className="w-4 h-4" /> Importar producto
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results grid */}
        {results.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{results.length} productos encontrados desde <span className="text-indigo-400">{results[0].source}</span></p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Margen ≥30%
                <XCircle className="w-3.5 h-3.5 text-red-400 ml-2" /> Margen {'<'}30%
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((p, i) => (
                <div key={i} className={`card p-4 flex flex-col gap-3 ${p.margin >= 30 ? 'border-green-500/10' : 'border-red-500/10 opacity-70'}`}>
                  {/* Product image/icon */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-white text-sm leading-snug flex-1">{p.name}</div>
                    {p.margin >= 30 ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/[0.03] rounded-lg p-2">
                      <div className="text-[10px] text-gray-500">Precio Venta</div>
                      <div className="text-sm font-bold text-white">${p.price}</div>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-2">
                      <div className="text-[10px] text-gray-500">Margen</div>
                      <div className={`text-sm font-bold ${p.margin >= 30 ? 'text-green-400' : 'text-red-400'}`}>{p.margin}%</div>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-2">
                      <div className="text-[10px] text-gray-500">Demanda</div>
                      <div className={`text-sm font-bold ${DEMAND_COLOR(p.demandScore)}`}>{p.demandScore}/10</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${COMPETITION_COLOR[p.competitionLevel]}`}>
                      {p.competitionLevel === 'low' ? '↓ Competencia baja' : p.competitionLevel === 'medium' ? '→ Media' : '↑ Alta'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{p.category}</span>
                    {p.trend === 'rising' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">📈 En alza</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-1">
                    <button onClick={() => handleCalculate(p)} className="flex-1 btn-ghost text-xs py-2 gap-1">
                      <Calculator className="w-3.5 h-3.5" /> Calcular
                    </button>
                    {p.sourceUrl && (
                      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {imported.has(p.name) ? (
                      <div className="flex-1 flex items-center justify-center gap-1 text-xs text-green-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Importado
                      </div>
                    ) : (
                      <button onClick={() => handleImport(p)} disabled={importing === p.name || p.margin < 30}
                        className="flex-1 btn-primary text-xs py-2 gap-1 disabled:opacity-40">
                        {importing === p.name ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        Importar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-600">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <div className="text-sm">Busca un producto para ver análisis de mercado, márgenes y proveedores</div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
