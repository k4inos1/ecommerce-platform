/**
 * Market Analysis Service — ecommerce-product-pro skill
 * Provides: market size, growth trends, seasonality, demographics, price point analysis
 */

export interface MarketAnalysis {
  query: string;
  category: string;
  marketSize: { value: string; unit: string; description: string };
  growthRate: { annual: number; trend: 'rising' | 'stable' | 'declining'; label: string };
  seasonality: SeasonMonth[];
  demographics: Demographic[];
  pricePoints: PricePoint[];
  opportunityScore: number; // 0-100
  summary: string;
}

export interface SeasonMonth {
  month: string; shortMonth: string; demandLevel: number; // 1-10
}

export interface Demographic {
  segment: string; percentage: number; description: string;
}

export interface PricePoint {
  range: string; volume: 'high' | 'medium' | 'low'; label: string;
}

const CATEGORY_DATA: Record<string, {
  marketBillions: number; growth: number; trend: 'rising' | 'stable' | 'declining';
  seasons: number[]; // Jan-Dec demand 1-10
  demographics: Demographic[]; opportunityScore: number;
}> = {
  Laptops: {
    marketBillions: 280, growth: 6.2, trend: 'rising',
    seasons: [5, 4, 6, 6, 7, 5, 6, 8, 9, 8, 7, 6],
    demographics: [
      { segment: 'Estudiantes (18–25)', percentage: 35, description: 'Alto volumen, buscan precio' },
      { segment: 'Profesionales (26–40)', percentage: 40, description: 'Premium, valoran rendimiento' },
      { segment: 'Empresas', percentage: 20, description: 'Compra en bulk, contratos' },
      { segment: 'Otros', percentage: 5, description: 'Segmento menor' },
    ],
    opportunityScore: 72,
  },
  Phones: {
    marketBillions: 485, growth: 4.1, trend: 'stable',
    seasons: [4, 4, 5, 5, 6, 5, 6, 7, 9, 8, 7, 7],
    demographics: [
      { segment: 'Jóvenes (16–30)', percentage: 45, description: 'Actualización frecuente, redes sociales' },
      { segment: 'Adultos (31–50)', percentage: 38, description: 'Productividad y calidad de cámara' },
      { segment: '50+', percentage: 17, description: 'Simplicidad y durabilidad' },
    ],
    opportunityScore: 65,
  },
  Audio: {
    marketBillions: 45, growth: 12.8, trend: 'rising',
    seasons: [5, 4, 5, 6, 7, 6, 7, 7, 8, 9, 9, 10],
    demographics: [
      { segment: 'Gamers (16–28)', percentage: 30, description: 'Buscan surround y microfono' },
      { segment: 'Audiophiles (25–45)', percentage: 25, description: 'Dispuestos a pagar premium' },
      { segment: 'Trabajadores remotos', percentage: 30, description: 'Noise cancelling crítico' },
      { segment: 'Casual', percentage: 15, description: 'Precio accesible, wireless' },
    ],
    opportunityScore: 88,
  },
  Tablets: {
    marketBillions: 62, growth: 3.5, trend: 'stable',
    seasons: [5, 4, 5, 6, 6, 5, 6, 7, 8, 7, 8, 7],
    demographics: [
      { segment: 'Niños / Educación', percentage: 38, description: 'Resistencia y control parental' },
      { segment: 'Creativos (20–40)', percentage: 35, description: 'Valoranstylus y pantalla' },
      { segment: 'Empresas', percentage: 27, description: 'POS, logistics, field work' },
    ],
    opportunityScore: 60,
  },
  Wearables: {
    marketBillions: 95, growth: 18.5, trend: 'rising',
    seasons: [5, 5, 6, 7, 8, 9, 9, 10, 8, 7, 7, 6],
    demographics: [
      { segment: 'Fitness / Deportistas', percentage: 42, description: 'GPS, heart rate, resistencia agua' },
      { segment: 'Health-conscious (30–55)', percentage: 35, description: 'Monitoreo salud, ECG, SpO2' },
      { segment: 'Fashion/Tech (18–30)', percentage: 23, description: 'Diseño y notificaciones' },
    ],
    opportunityScore: 91,
  },
  Monitors: {
    marketBillions: 38, growth: 5.8, trend: 'stable',
    seasons: [5, 5, 6, 6, 7, 6, 7, 8, 9, 7, 7, 6],
    demographics: [
      { segment: 'Gamers', percentage: 40, description: 'Alta tasa de refresco, baja latencia' },
      { segment: 'Diseñadores / Creativos', percentage: 30, description: 'Color accuracy, resolución 4K' },
      { segment: 'Home Office', percentage: 30, description: 'Productividad dual-monitor' },
    ],
    opportunityScore: 68,
  },
  Accessories: {
    marketBillions: 120, growth: 8.3, trend: 'rising',
    seasons: [4, 4, 5, 5, 6, 6, 6, 7, 7, 7, 9, 10],
    demographics: [
      { segment: 'Tech enthusiasts', percentage: 35, description: 'Complementan sus dispositivos' },
      { segment: 'Profesionales', percentage: 40, description: 'Ergonomía y productividad' },
      { segment: 'Regalo', percentage: 25, description: 'Alto en noviembre-diciembre' },
    ],
    opportunityScore: 80,
  },
};

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTHS_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function analyzeMarket(query: string, category: string): MarketAnalysis {
  const data = CATEGORY_DATA[category] || CATEGORY_DATA['Accessories'];

  const seasonality: SeasonMonth[] = data.seasons.map((level, i) => ({
    month: MONTHS_FULL[i],
    shortMonth: MONTHS[i],
    demandLevel: level,
  }));

  const pricePoints: PricePoint[] = [
    { range: '$0–$30', volume: category === 'Accessories' ? 'high' : 'medium', label: 'Entrada / Impulso' },
    { range: '$30–$100', volume: 'high', label: 'Masivo / Mayor volumen' },
    { range: '$100–$300', volume: 'medium', label: 'Mid-range / Buen margen' },
    { range: '$300–$800', volume: 'low', label: 'Premium / Alto margen' },
    { range: '$800+', volume: 'low', label: 'Ultra-premium / Nicho' },
  ];

  const peakMonth = MONTHS_FULL[data.seasons.indexOf(Math.max(...data.seasons))];
  const summary = `El mercado de ${category.toLowerCase()} a nivel global está valorado en $${data.marketBillions}B USD y crece ${data.growth}% anual. La mayor demanda ocurre en ${peakMonth}. Para "${query}" se recomienda posicionarse en el segmento mid-range ($30–$300) donde se concentra el mayor volumen de ventas.`;

  return {
    query,
    category,
    marketSize: {
      value: `$${data.marketBillions}B`,
      unit: 'USD globales',
      description: `Mercado total de ${category} 2025`,
    },
    growthRate: {
      annual: data.growth,
      trend: data.trend,
      label: data.trend === 'rising' ? 'Mercado en expansión' : data.trend === 'stable' ? 'Mercado maduro y estable' : 'Mercado en contracción',
    },
    seasonality,
    demographics: data.demographics,
    pricePoints,
    opportunityScore: data.opportunityScore,
    summary,
  };
}
