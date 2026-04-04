import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Personal Finance Tracker
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Take control of your money.
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Log fast. See your cash position. Know what&apos;s ahead.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            Get Started
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 active:scale-[0.98] dark:bg-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
