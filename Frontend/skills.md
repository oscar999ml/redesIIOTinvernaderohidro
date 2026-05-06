# skills.md - Frontend SCADA | Invernadero Hidropónico IoT

Conocimientos técnicos, patrones y referencias para construir el dashboard SCADA
de forma profesional, responsiva y en tiempo real.

---

## 1. Stack Tecnológico

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| Next.js | 14 (App Router) | Framework principal, routing, SSR |
| React | 18 | UI reactivo |
| TypeScript | 5 | Tipado estático en todo el proyecto |
| Tailwind CSS | 3 | Estilos utility-first |
| Zustand | 4 | Estado global (nodos, alarmas, sistema) |
| TanStack Query | 5 | Fetching REST, cache, revalidación |
| Socket.io client | 4 | WebSocket tiempo real |
| Recharts | 2 | Gráficas de series de tiempo |
| React Hook Form | 7 | Formularios de configuración |
| Zod | 3 | Validación de formularios y tipos |
| Lucide React | latest | Iconos SVG |
| react-hot-toast | 2 | Notificaciones toast |

---

## 2. Next.js 14 App Router

### Estructura de rutas
```
src/app/
├── layout.tsx          ← RootLayout: Navbar + Sidebar + AlarmBar + Providers
├── page.tsx            ← /  → Dashboard (grid de nodos)
├── nodos/[id]/page.tsx ← /nodos/1 → Detalle de nodo
├── historico/page.tsx  ← /historico → Gráficas históricas
├── alarmas/page.tsx    ← /alarmas → Gestión de alarmas
└── configuracion/page.tsx ← /configuracion → Config de nodos
```

### Providers en layout.tsx
```tsx
// src/app/layout.tsx
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SocketProvider } from '@/components/providers/SocketProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-950 text-gray-100">
        <QueryProvider>
          <SocketProvider>
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <Navbar />
                <AlarmBar />
                <main className="flex-1 overflow-auto p-4">
                  {children}
                </main>
              </div>
            </div>
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## 3. WebSocket con Socket.io Client

### Singleton de socket
```ts
// src/lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 2000,
});
```

### Hook useSocket
```ts
// src/hooks/useSocket.ts
import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { useNodosStore } from '@/store/nodosStore';
import { useAlarmasStore } from '@/store/alarmasStore';

export function useSocket() {
  const actualizarNodo = useNodosStore(s => s.actualizarNodo);
  const agregarAlarma = useAlarmasStore(s => s.agregarAlarma);

  useEffect(() => {
    socket.connect();

    socket.on('nodo:estado', (payload) => {
      actualizarNodo(payload.nodo_id, payload.datos);
    });

    socket.on('alarma:nueva', (alarma) => {
      agregarAlarma(alarma);
    });

    return () => {
      socket.off('nodo:estado');
      socket.off('alarma:nueva');
      socket.disconnect();
    };
  }, []);
}
```

### SocketProvider (inicializa la conexión una vez)
```tsx
// src/components/providers/SocketProvider.tsx
'use client';
import { useSocket } from '@/hooks/useSocket';
export function SocketProvider({ children }) {
  useSocket();
  return <>{children}</>;
}
```

---

## 4. Estado Global con Zustand

### Store de nodos
```ts
// src/store/nodosStore.ts
import { create } from 'zustand';
import { Nodo, LecturaDatos } from '@/types/nodo';

interface NodosState {
  nodos: Record<number, Nodo>;
  actualizarNodo: (id: number, datos: LecturaDatos) => void;
  setNodos: (nodos: Nodo[]) => void;
}

export const useNodosStore = create<NodosState>((set) => ({
  nodos: {},
  actualizarNodo: (id, datos) =>
    set((state) => ({
      nodos: {
        ...state.nodos,
        [id]: { ...state.nodos[id], ultimaLectura: datos, ultimoUpdate: new Date() }
      }
    })),
  setNodos: (nodos) =>
    set({ nodos: Object.fromEntries(nodos.map(n => [n.id, n])) }),
}));
```

### Store de alarmas
```ts
// src/store/alarmasStore.ts
import { create } from 'zustand';
import { Alarma } from '@/types/alarma';

interface AlarmasState {
  alarmasActivas: Alarma[];
  agregarAlarma: (alarma: Alarma) => void;
  reconocerAlarma: (id: number) => void;
}

export const useAlarmasStore = create<AlarmasState>((set) => ({
  alarmasActivas: [],
  agregarAlarma: (alarma) =>
    set(state => ({ alarmasActivas: [alarma, ...state.alarmasActivas] })),
  reconocerAlarma: (id) =>
    set(state => ({
      alarmasActivas: state.alarmasActivas.filter(a => a.id !== id)
    })),
}));
```

---

## 5. Fetching REST con TanStack Query

### Configuración del provider
```tsx
// src/components/providers/QueryProvider.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
export function QueryProvider({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### Hook useNodos (carga inicial de nodos desde REST)
```ts
// src/hooks/useNodos.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useNodos() {
  return useQuery({
    queryKey: ['nodos'],
    queryFn: () => api.get('/nodos'),
    staleTime: 30_000,
  });
}
```

### Envío de comandos con useMutation
```ts
export function useEnviarComando() {
  return useMutation({
    mutationFn: (comando: Comando) => api.post('/comandos', comando),
    onSuccess: () => toast.success('Comando enviado'),
    onError: () => toast.error('Error al enviar comando'),
  });
}
```

---

## 6. Tipos TypeScript

```ts
// src/types/nodo.ts
export interface Nodo {
  id: number;
  nombre: string;
  ubicacion: string;
  activo: boolean;
  ultimaLectura?: LecturaDatos;
  ultimoUpdate?: Date;
  estado: 'online' | 'offline' | 'alerta';
}

export interface LecturaDatos {
  led?: boolean;
  boton?: boolean;
  temperatura?: number;
  humedad?: number;
  ph?: number;
  nivel_agua?: number;
  humedad_suelo?: number;
}

// src/types/alarma.ts
export interface Alarma {
  id: number;
  nodo_id: number;
  variable: string;
  valor: number;
  umbral: number;
  tipo: 'max' | 'min';
  timestamp: string;
  reconocida: boolean;
}
```

---

## 7. Componentes Clave

### NodoCard (tarjeta de nodo en el dashboard)
```tsx
// src/components/nodos/NodoCard.tsx
'use client';
import { useNodosStore } from '@/store/nodosStore';

export function NodoCard({ nodoId }: { nodoId: number }) {
  const nodo = useNodosStore(s => s.nodos[nodoId]);
  if (!nodo) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">{nodo.nombre}</h3>
        <NodoStatus estado={nodo.estado} />
      </div>
      {/* Valores de sensores */}
      <div className="grid grid-cols-2 gap-2">
        <SensorValor label="Temp" valor={nodo.ultimaLectura?.temperatura} unidad="°C" />
        <SensorValor label="Humedad" valor={nodo.ultimaLectura?.humedad} unidad="%" />
        <SensorValor label="pH" valor={nodo.ultimaLectura?.ph} unidad="" />
        <SensorValor label="Nivel" valor={nodo.ultimaLectura?.nivel_agua} unidad="%" />
      </div>
    </div>
  );
}
```

### SensorValor (muestra un valor con su unidad)
```tsx
export function SensorValor({ label, valor, unidad }: {
  label: string; valor?: number; unidad: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-2xl font-mono font-bold">
        {valor !== undefined ? valor.toFixed(1) : '--'}
        <span className="text-sm text-gray-400 ml-1">{unidad}</span>
      </p>
    </div>
  );
}
```

---

## 8. Gráficas con Recharts

```tsx
// src/components/graficas/GraficaLinea.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficaLinea({ datos, variable }: {
  datos: { timestamp: string; valor: number }[];
  variable: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={datos}>
        <XAxis dataKey="timestamp" tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
        />
        <Line
          type="monotone"
          dataKey="valor"
          stroke="#34d399"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## 9. Paleta de Colores Tailwind (SCADA industrial)

```ts
// tailwind.config.ts
// Usar colores base de Tailwind, sin personalización extra
// Clases usadas frecuentemente:
//
// Fondos:    bg-gray-950  bg-gray-900  bg-gray-800
// Bordes:    border-gray-700
// Texto:     text-gray-100  text-gray-400
// Estado OK: text-emerald-400  bg-emerald-400/10  border-emerald-400/30
// Alarma:    text-red-500     bg-red-500/10       border-red-500/30
// Aviso:     text-amber-400   bg-amber-400/10     border-amber-400/30
// Acción:    text-blue-400    bg-blue-500         hover:bg-blue-600
```

---

## 10. Reglas de Calidad

- **Client components**: solo donde se necesite interactividad o hooks (`'use client'`)
- **Server components**: por defecto en App Router — para fetch de datos iniciales
- No poner lógica de negocio en componentes — va en hooks o stores
- Cada componente tiene una sola responsabilidad
- Nombrar eventos WebSocket igual que en el backend: `nodo:estado`, `alarma:nueva`
- Siempre manejar estados de carga y error en queries
- Accesibilidad básica: `aria-label` en botones de control de actuadores

---

## 11. Scripts de package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```
