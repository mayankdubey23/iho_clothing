import { useForm } from '@inertiajs/react';
import AppLayout, { Field, SectionHeading } from '../../Layouts/AppLayout';

export default function Categories({ categories }) {
  const { data, setData, post, processing, errors, reset } = useForm({ name: '', slug: '', is_active: true });

  function submit(event) {
    event.preventDefault();
    post('/admin/categories', { onSuccess: () => reset('name', 'slug') });
  }

  return (
    <AppLayout active="categories" admin>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <form onSubmit={submit} className="h-fit border border-stone-300 bg-white p-6 shadow-sm">
          <SectionHeading eyebrow="Admin" title="Add category" />
          <div className="grid gap-4">
            <Field label="Name" error={errors.name}>
              <input className="input" value={data.name} onChange={(event) => setData('name', event.target.value)} required />
            </Field>
            <Field label="Slug" error={errors.slug}>
              <input className="input" value={data.slug} onChange={(event) => setData('slug', event.target.value)} required />
            </Field>
            <button disabled={processing} className="min-h-11 bg-zinc-900 px-4 font-black text-white disabled:bg-stone-400">Save category</button>
          </div>
        </form>
        <section>
          <SectionHeading eyebrow="Catalog" title="Categories" aside={`${categories.length} total`} />
          <div className="grid gap-3">
            {categories.map((category) => (
              <article key={category.id} className="flex items-center justify-between border border-stone-300 bg-white p-5 shadow-sm">
                <div>
                  <h3 className="text-xl font-black">{category.name}</h3>
                  <p className="text-sm text-zinc-500">{category.slug}</p>
                </div>
                <span className="font-black text-teal-700">{category.products_count} products</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
