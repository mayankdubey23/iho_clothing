import { motion } from 'framer-motion';
import { Head, usePage } from '@inertiajs/react';
import { Box, IndianRupee, ShoppingBag, Store, TrendingUp } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  processing: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Dashboard({ stats }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth.user.role === 'super_admin';

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: IndianRupee,
      color: 'bg-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      label: 'Total Orders',
      value: stats.total_orders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      label: 'Stock Units',
      value: stats.stock || 0,
      icon: Box,
      color: 'bg-violet-500',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    },
    ...(isSuperAdmin
      ? [
          {
            label: 'Franchise Apps',
            value: stats.applications || 0,
            icon: Store,
            color: 'bg-orange-500',
            bg: 'bg-orange-50',
            text: 'text-orange-600',
          },
        ]
      : []),
  ];

  return (
    <AdminLayout active="dashboard">
      <Head title="Dashboard | Admin" />

      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-slate-900">
          Overview
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-400">
          Real-time performance metrics and recent activity.
        </p>
      </div>

      {/* Stat cards */}
      <motion.div
        className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {statCards.map(({ label, value, icon: Icon, color, bg, text }) => (
          <motion.div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            variants={fadeUp}
          >
            <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${color}`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <h3 className="mt-0.5 text-2xl font-black text-slate-900">{value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <TrendingUp size={18} className="text-slate-400" />
          <h2 className="text-base font-bold text-slate-800">Recent Orders</h2>
          {stats.recent_orders?.length > 0 && (
            <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">
              {stats.recent_orders.length} latest
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                {['Order ID', 'Customer', 'Address', 'Amount', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.recent_orders?.length > 0 ? (
                stats.recent_orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-black text-blue-600">#{order.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{order.customer_name}</td>
                    <td className="max-w-48 truncate px-6 py-4 text-sm text-slate-400">
                      {order.shipping_address}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          STATUS_BADGE[order.status] || STATUS_BADGE.pending
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-sm font-medium text-slate-400"
                  >
                    No orders received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
