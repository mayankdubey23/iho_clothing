import { Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Field } from '../../Layouts/AppLayout';

export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  function submit(event) {
    event.preventDefault();
    post('/register');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 p-4">
      <section className="w-full max-w-md border border-stone-300 bg-white p-8 shadow-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-3">
          <span className="grid size-11 place-items-center bg-zinc-900 text-sm font-black text-white">IHO</span>
          <span className="font-black">IHO Clothing</span>
        </Link>
        <h1 className="text-3xl font-black">Create account</h1>
        <p className="mt-2 text-zinc-500">One account for shopping and franchise applications.</p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Field label="Full name" error={errors.name}>
            <input className="input" value={data.name} onChange={(event) => setData('name', event.target.value)} required />
          </Field>
          <Field label="Email address" error={errors.email}>
            <input className="input" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} required />
          </Field>
          <Field label="Password" error={errors.password}>
            <input className="input" type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} required />
          </Field>
          <Field label="Confirm password">
            <input
              className="input"
              type="password"
              value={data.password_confirmation}
              onChange={(event) => setData('password_confirmation', event.target.value)}
              required
            />
          </Field>
          <button disabled={processing} className="inline-flex min-h-12 items-center justify-center gap-2 bg-zinc-900 px-4 font-black text-white disabled:bg-stone-400">
            {processing ? 'Creating account...' : 'Create account'}
            {!processing && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-6 border-t border-stone-200 pt-6 text-center text-sm text-zinc-500">
          Already registered? <Link href="/login" className="font-black text-teal-700">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
