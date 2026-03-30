# TechStore — Copilot Agent Skills

Este directorio documenta las **habilidades (skills)** disponibles para el agente Copilot del proyecto TechStore. Cada skill describe un endpoint del backend que el agente puede invocar para asistir al administrador en tareas de abastecimiento, análisis de mercado y optimización de listings.

## Estructura

```
.agents/
└── skills/
    ├── web-scraper/            ← Framework genérico de web scraping
    ├── product-search.yml      ← Busca productos en AliExpress / eBay
    ├── market-analysis.yml     ← Analiza mercado con DuckDuckGo + eBay
    ├── supplier-finder.yml     ← Encuentra proveedores en Alibaba
    ├── listing-optimizer.yml   ← Optimiza títulos, bullets y keywords
    └── profit-calculator.yml   ← Calcula margen, ROI y viabilidad
```

## Arquitectura General

```
Agente Copilot
     │
     ├─ web-scraper (framework) →  Metodología genérica de scraping
     │
     ├─ product-search    →  GET  /api/scraper/search (AliExpress + eBay)
     ├─ market-analysis   →  GET  /api/scraper/market (DuckDuckGo + eBay)
     ├─ supplier-finder   →  GET  /api/scraper/suppliers (Alibaba)
     ├─ listing-optimizer →  GET  /api/scraper/optimize
     └─ profit-calculator →  POST /api/scraper/calculate
```

**Nota**: `web-scraper` es un framework educativo y de referencia para nuevas implementaciones. Los `.yml` son APIs específicas ya implementadas en el backend.

## Flujo de Trabajo Típico

1. **Buscar producto** (`product-search`) — identifica oportunidades en marketplaces.
2. **Analizar mercado** (`market-analysis`) — valida tamaño, crecimiento y estacionalidad.
3. **Encontrar proveedores** (`supplier-finder`) — localiza fabricantes en Alibaba con precio/MOQ.
4. **Calcular rentabilidad** (`profit-calculator`) — verifica que el margen supere el 30%.
5. **Optimizar listing** (`listing-optimizer`) — genera título SEO, bullets y keywords listos para publicar.

## Implementación de los Skills

| Skill               | Archivo fuente                                    | Tecnología          |
|---------------------|---------------------------------------------------|---------------------|
| product-search      | `backend/src/services/scraper.ts`                 | Playwright + cheerio |
| market-analysis     | `backend/src/services/marketAnalysis.ts`          | axios + cheerio     |
| supplier-finder     | `backend/src/services/supplierFinder.ts`          | Playwright + axios  |
| listing-optimizer   | `backend/src/services/listingOptimizer.ts`        | Síncrono (sin I/O)  |
| profit-calculator   | `backend/src/utils/profitCalculator.ts`           | Síncrono (sin I/O)  |

Los skills con scraping (`product-search`, `market-analysis`, `supplier-finder`) usan una estrategia en **cascada**: intentan la fuente principal y caen al siguiente nivel si obtienen resultados insuficientes. Esto garantiza que el agente siempre obtenga datos reales sin datos sintéticos de respaldo.

## Formato de los Skills

Cada archivo `.yml` sigue esta estructura:

```yaml
name: <identificador>
version: "1.0"
description: >
  Descripción del propósito del skill.

endpoint:
  method: GET | POST
  path: /api/scraper/<skill>
  auth: jwt
  rate_limit: 10/min | none

parameters:
  - name: <param>
    in: query | body
    type: string | integer | number
    required: true | false
    ...

returns:
  type: object
  properties:
    ...

errors:
  400: ...
  401: ...
  403: ...
  429: ...
  500: ...
```
