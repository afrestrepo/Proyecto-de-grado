import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <span className="text-4xl">🔒</span>
        <h1 className="mt-3 text-2xl font-bold">Iniciar Sesión</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Accede al evaluador de riesgos de tu organización.
        </p>
      </div>

      <form className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Correo electrónico</label>
          <input
            type="email"
            placeholder="correo@empresa.com"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
        </div>
        <Link
          href="/"
          className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Ingresar
        </Link>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
