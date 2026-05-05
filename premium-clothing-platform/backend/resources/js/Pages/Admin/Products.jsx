import { useForm } from '@inertiajs/react';
import AppLayout, { Field, SectionHeading, imageFor, money, stockFor } from '../../Layouts/AppLayout';

export default function Products({ products, categories }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    slug: '',
    category_id: categories[0]?.id || '',
    base_price: '',
    franchise_price: '',
    description: '',
    is_active: true,
  });

  function submit(event) {
    event.preventDefault();
    post('/admin/products', {
      onSuccess: () => reset('name', 'slug', 'base_price', 'franchise_price', 'description'),
    });
  }

  return (
    <AppLayout active="products" admin>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
        <form onSubmit={submit} className="h-fit border border-stone-300 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <SectionHeading eyebrow="Admin" title="Add product" />
          <div className="grid gap-4">
            <Field label="Name" error={errors.name}>
              <input className="input" value={data.name} onChange={(event) => setData('name', event.target.value)} required />
            </Field>
            <Field label="Slug" error={errors.slug}>
              <input className="input" value={data.slug} onChange={(event) => setData('slug', event.target.value)} required />
            </Field>
            <Field label="Category" error={errors.category_id}>
              <select className="input" value={data.category_id} onChange={(event) => setData('category_id', event.target.value)} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Retail price" error={errors.base_price}>
                <input className="input" type="number" min="0" value={data.base_price} onChange={(event) => setData('base_price', event.target.value)} required />
              </Field>
              <Field label="Franchise price" error={errors.franchise_price}>
                <input className="input" type="number" min="0" value={data.franchise_price} onChange={(event) => setData('franchise_price', event.target.value)} required />
              </Field>
            </div>
            <Field label="Description" error={errors.description}>
              <textarea className="input min-h-28 py-3" value={data.description} onChange={(event) => setData('description', event.target.value)} />
            </Field>
            <button disabled={processing} className="min-h-11 bg-zinc-900 px-4 font-black text-white disabled:bg-stone-400">Save product</button>
          </div>
        </form>

        <section>
          <SectionHeading eyebrow="Catalog" title="Products" aside={`${products.total} total`} />
          <div className="grid gap-4">
            {products.data.map((product) => (
              <article key={product.id} className="grid gap-4 border border-stone-300 bg-white p-4 shadow-sm md:grid-cols-[120px_1fr_auto]">
                <div className="h-28 bg-stone-200">
                  {imageFor(product) && <img className="h-full w-full object-cover" src={imageFor(product)} alt={product.name} />}
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-teal-700">{product.category?.name || 'Uncategorized'}</p>
                  <h3 className="text-xl font-black">{product.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{product.description}</p>
                  <p className="mt-2 text-sm font-bold text-zinc-600">{stockFor(product)} stock units</p>
                </div>
                <div className="text-left md:text-right">
                  <strong className="block text-xl">{money.format(Number(product.base_price))}</strong>
                  <small className="font-black text-orange-700">{money.format(Number(product.franchise_price))} franchise</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
