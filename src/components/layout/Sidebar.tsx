import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Login", href: "/auth/login" },
  { label: "Register", href: "/auth/register" },
];

const Sidebar = () => {
  return (
    <aside className="hidden w-56 flex-col border-r border-gray-200 bg-white p-4 lg:flex">
      <div className="mb-4 text-sm font-semibold text-gray-900">Menu</div>
      <ul className="flex flex-col gap-2 text-sm text-gray-700">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
