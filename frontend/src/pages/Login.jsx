import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-slate-50 font-sans">
      <div className="relative hidden w-1/2 overflow-hidden bg-orange-100 lg:flex">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-orange-300/60 blur-3xl"></div>
        <div className="absolute -bottom-24 right-0 h-[28rem] w-[28rem] rounded-full bg-blue-300/50 blur-3xl"></div>

        <div className="relative z-10 m-10 flex w-full flex-col justify-between rounded-[2.5rem] border border-white/40 bg-white/45 p-10 backdrop-blur-sm">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-900">
              EduTrack Campus
            </p>
            <h2 className="max-w-sm text-4xl font-extrabold leading-tight text-slate-900">
              Manage attendance, schedules, and student life in one dashboard.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Daily check-ins</p>
              <p className="mt-2 text-2xl font-extrabold text-blue-900">12.4k</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Courses active</p>
              <p className="mt-2 text-2xl font-extrabold text-orange-500">218</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900">Welcome Back</h1>
            <p className="mt-2 text-sm text-slate-500">Login to continue to your smart campus account.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@campus.edu"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-orange-200 transition focus:ring-4"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <button type="button" className="text-xs font-semibold text-blue-900 hover:underline">
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-orange-200 transition focus:ring-4"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-900" />
                Remember me
              </label>
              <span className="font-semibold text-slate-500">Secure login</span>
            </div>

            <button className="w-full rounded-2xl bg-blue-900 py-3 font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-800">
              Login
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            New to EduTrack?{' '}
            <Link to="/signup" className="font-bold text-orange-600 hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
