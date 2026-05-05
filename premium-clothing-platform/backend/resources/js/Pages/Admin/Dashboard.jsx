import { BriefcaseBusiness, Layers, Package, Warehouse } from 'lucide-react';
import AppLayout, { SectionHeading, Stat } from '../../Layouts/AppLayout';

export default function Dashboard({ stats }) {
  return (
    <AppLayout active="dashboard" admin>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <SectionHeading eyebrow="Admin" title="Management dashboard" aside="Laravel + Inertia" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={Package} label="Products" value={stats.products} />
          <Stat icon={Layers} label="Categories" value={stats.categories} />
          <Stat icon={Warehouse} label="SKU stock units" value={stats.stock} />
          <Stat icon={BriefcaseBusiness} label="Franchise applications" value={stats.applications} />
        </div>
      </main>
    </AppLayout>
  );
}
