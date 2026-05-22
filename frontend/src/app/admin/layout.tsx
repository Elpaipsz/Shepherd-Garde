import Link from "next/link";
import { LayoutDashboard, Package, Tag, ShoppingCart, Users, Settings, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Productos", href: "/admin/products", icon: Package },
    { name: "Colecciones", href: "/admin/collections", icon: Tag },
    { name: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
    { name: "Clientes", href: "/admin/customers", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-neutral-900 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-black flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <span className="text-lg font-bold tracking-widest uppercase">Shepherd Garde</span>
          <span className="ml-2 text-xs bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">ADMIN</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center space-x-3 mb-4 px-3">
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div>
              <p className="text-sm font-medium">Administrador</p>
              <p className="text-xs text-neutral-500">admin@shepherd.com</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Salir al sitio</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-8 bg-black/50 backdrop-blur-sm">
          <h1 className="text-xl font-semibold">Administración</h1>
          <div className="flex items-center space-x-4">
            {/* Quick Actions or Notifications can go here */}
            <Link href="/admin/products/new" className="bg-white text-black px-4 py-2 rounded-md font-medium text-sm hover:bg-neutral-200 transition-colors">
              + Nuevo Producto
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
