import Link from "next/link";

const Navbar = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="text-base font-semibold text-gray-900">Jyotishya Darshan</div>
      <nav className="flex items-center gap-4 text-sm text-gray-600">
        <Link href="/" className="transition hover:text-gray-900">
          Home
        </Link>
        <Link href="/auth/login" className="transition hover:text-gray-900">
          Login
        </Link>
        <Link href="/auth/register" className="transition hover:text-gray-900">
          Register
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
