"use client";

import { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Tag, 
  RefreshCw, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap
} from "lucide-react";

export default function AdminDashboard() {
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [collectionsCount, setCollectionsCount] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Fetch count metadata
  const fetchCounts = async () => {
    try {
      const prodRes = await fetch("http://localhost:8000/api/v1/catalog/products/");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const prods = Array.isArray(prodData) ? prodData : prodData.results || [];
        setProductsCount(prods.length);
      }
      
      const collRes = await fetch("http://localhost:8000/api/v1/catalog/collections/");
      if (collRes.ok) {
        const collData = await collRes.json();
        const colls = Array.isArray(collData) ? collData : collData.results || [];
        setCollectionsCount(colls.length);
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  };

  useEffect(() => {
    fetchCounts();
    // Retrieve last sync time from localStorage if it exists
    const storedLastSync = localStorage.getItem("shepherd_last_sync");
    if (storedLastSync) {
      setLastSyncTime(storedLastSync);
    }
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/catalog/sync/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setSyncResult(data);
      const timestamp = new Date().toLocaleString();
      setLastSyncTime(timestamp);
      localStorage.setItem("shepherd_last_sync", timestamp);
      // Refresh stats
      await fetchCounts();
    } catch (err: any) {
      setSyncError(err.message || "No se pudo conectar con el servidor de sincronización.");
    } finally {
      setSyncing(false);
    }
  };

  const metrics = [
    { title: "Ingresos Totales", value: "$12,450.00", icon: DollarSign, trend: "+12.5%", positive: true },
    { title: "Pedidos Mensuales", value: "145", icon: ShoppingCart, trend: "+5.2%", positive: true },
    { title: "Nuevos Clientes", value: "32", icon: Users, trend: "-2.4%", positive: false },
    { title: "Productos Activos", value: productsCount !== null ? String(productsCount) : "Cargando...", icon: Package, trend: "+0.0%", positive: true },
  ];

  const recentOrders = [
    { id: "#ORD-092", customer: "Martín R.", date: "Hoy, 10:42 AM", status: "Procesando", total: "$120.00" },
    { id: "#ORD-091", customer: "Laura G.", date: "Ayer, 18:30 PM", status: "Enviado", total: "$85.50" },
    { id: "#ORD-090", customer: "Carlos V.", date: "Ayer, 14:15 PM", status: "Completado", total: "$210.00" },
    { id: "#ORD-089", customer: "Ana P.", date: "Lun, 09:20 AM", status: "Pendiente", total: "$45.00" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Resumen General
          </h2>
          <p className="text-neutral-400 mt-1">Monitorea el rendimiento de tu tienda y las métricas clave.</p>
        </div>
        
        {/* Connection Status indicator */}
        <div className="flex items-center space-x-3 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full w-fit">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-semibold text-neutral-200">Servicio de Inventario Conectado</span>
        </div>
      </div>

      {/* Sync Banner & Hub */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-neutral-950 to-neutral-950 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -ml-20 -mb-20 -z-10"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold tracking-wider text-xs uppercase bg-indigo-500/10 px-3 py-1 rounded-full w-fit">
              <Zap className="w-3.5 h-3.5" />
              <span>Sincronización en Tiempo Real</span>
            </div>
            <h3 className="text-xl font-bold text-white">Consola de Integración de Inventario</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Shepherd Garde funciona en tándem con el servicio de administrador Core. Toda la edición avanzada de stock, 
              categorías, variantes complejas e imágenes principales se realiza en el administrador central. Los cambios se sincronizan 
              con el catálogo local automáticamente o de forma manual aquí.
            </p>
            {lastSyncTime && (
              <p className="text-xs text-indigo-300">
                Última sincronización manual exitosa: <span className="font-semibold">{lastSyncTime}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Open Admin Button */}
            <a 
              href="http://localhost:3001/admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white px-5 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg group"
            >
              <span>Ir al Administrador Core</span>
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            </a>

            {/* Sync Now Button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center justify-center space-x-2 text-black px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20
                ${syncing 
                  ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed border border-neutral-800' 
                  : 'bg-white hover:bg-neutral-200 border border-neutral-200'}`}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? "Sincronizando..." : "Sincronizar Catálogo"}</span>
            </button>
          </div>
        </div>

        {/* Sync Telemetry Output */}
        {syncResult && (
          <div className="mt-6 border-t border-neutral-800/80 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-neutral-900/60 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-emerald-400">Sincronización completada exitosamente</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-400">
                  <div className="bg-black/30 p-2.5 rounded-lg border border-neutral-800">
                    <p className="text-neutral-500 font-medium">Colecciones</p>
                    <p className="text-lg font-bold text-white mt-1">{syncResult.collections_synced ?? 0}</p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-neutral-800">
                    <p className="text-neutral-500 font-medium">Productos</p>
                    <p className="text-lg font-bold text-white mt-1">{syncResult.products_synced ?? 0}</p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-neutral-800">
                    <p className="text-neutral-500 font-medium">Variantes</p>
                    <p className="text-lg font-bold text-white mt-1">{syncResult.variants_synced ?? 0}</p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-neutral-800">
                    <p className="text-neutral-500 font-medium">Imágenes</p>
                    <p className="text-lg font-bold text-white mt-1">{syncResult.images_synced ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Error Output */}
        {syncError && (
          <div className="mt-6 border-t border-neutral-800/80 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-neutral-900/60 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Error durante la sincronización</p>
                <p className="text-xs text-neutral-400 mt-1">{syncError}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="bg-[#111111] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:border-neutral-700 transition-colors shadow-lg">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-sm font-medium">{metric.title}</span>
                <Icon className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-2xl font-bold text-white">{metric.value}</span>
                <span className={`text-sm flex items-center ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric.trend}
                  <TrendingUp className={`w-3 h-3 ml-1 ${!metric.positive && 'rotate-180'}`} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#111111] border border-neutral-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Pedidos Recientes</h3>
            <button className="text-sm text-neutral-400 hover:text-white flex items-center transition-colors">
              Ver todos <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="pb-3 font-medium">Pedido</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="text-neutral-300 hover:bg-neutral-900/30 transition-colors">
                    <td className="py-4 font-medium text-white">{order.id}</td>
                    <td className="py-4">{order.customer}</td>
                    <td className="py-4 text-neutral-500">{order.date}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                        ${order.status === 'Completado' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 
                          order.status === 'Enviado' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 
                          order.status === 'Procesando' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 
                          'bg-neutral-800 text-neutral-300 border-neutral-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-semibold text-white">{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Acciones Rápidas</h3>
          <div className="space-y-4">
            <a 
              href="http://localhost:3001/admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-colors group"
            >
              <div className="flex items-center space-x-3 text-neutral-300">
                <Package className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                <span className="font-semibold text-sm">Gestionar Inventario (Admin Core)</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </a>
            <a 
              href="http://localhost:3001/admin/collections" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-colors group"
            >
              <div className="flex items-center space-x-3 text-neutral-300">
                <Tag className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                <span className="font-semibold text-sm">Editar Colecciones (Admin Core)</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </a>
            <a 
              href="http://localhost:3001/admin/orders" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-colors group"
            >
              <div className="flex items-center space-x-3 text-neutral-300">
                <ShoppingCart className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                <span className="font-semibold text-sm">Ver Pedidos (Admin Core)</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

