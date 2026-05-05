import { Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Field } from '../../Layouts/AppLayout';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });

  function submit(event) {
    event.preventDefault();
    post('/login');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 p-4">
      <section className="w-full max-w-md border border-stone-300 bg-white p-8 shadow-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-3">
          <span className="grid size-11 place-items-center bg-zinc-900 text-sm font-black text-white">IHO</span>
          <span className="font-black">IHO Clothing</span>
        </Link>
        <h1 className="text-3xl font-black">Welcome back</h1>
        <p className="mt-2 text-zinc-500">Sign in to shop, apply, or manage the platform.</p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Field label="Email address" error={errors.email}>
            <input className="input" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} required />
          </Field>
          <Field label="Password" error={errors.password}>
            <input className="input" type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} required />
          </Field>
          <button disabled={processing} className="inline-flex min-h-12 items-center justify-center gap-2 bg-teal-700 px-4 font-black text-white disabled:bg-stone-400">
            {processing ? 'Signing in...' : 'Sign in'}
            {!processing && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-6 border-t border-stone-200 pt-6 text-center text-sm text-zinc-500">
          New customer? <Link href="/register" className="font-black text-teal-700">Create account</Link>
        </p>
      </section>
    </main>
  );
}
