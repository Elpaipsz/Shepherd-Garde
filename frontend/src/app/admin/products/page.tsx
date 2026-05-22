"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Package } from "lucide-react";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/catalog/products/");
        const data = await res.json();
        // data podria ser un array o paginado (data.results)
        setProducts(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Productos</h2>
          <p className="text-neutral-400 text-sm mt-1">Gestiona el inventario, precios y variantes.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Producto</span>
        </Link>
      </div>

      <div className="bg-[#111111] border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between bg-black/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
          <button className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
            <Filter className="w-4 h-4 text-neutral-400" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-900/50 text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">Colección</th>
                <th className="px-6 py-4 font-medium">Precio Base</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Inventario</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    Cargando productos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No hay productos todavía.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
                  return (
                    <tr key={product.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-md bg-neutral-800 border border-neutral-700 overflow-hidden flex-shrink-0">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0].image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{product.name}</p>
                            <p className="text-xs text-neutral-500">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-300">
                        {product.collection?.name || "Sin colección"}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        ${product.base_price}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                          ${product.is_active ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
                          {product.is_active ? 'Activo' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={totalStock > 0 ? "text-neutral-300" : "text-red-400 font-medium"}>
                          {totalStock} en stock
                        </span>
                        <span className="text-neutral-500 text-xs ml-2">
                          ({product.variants?.length || 0} variantes)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-sm text-neutral-400 bg-black/20">
          <span>Mostrando {products.length} productos</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
