import Link from "next/link";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

const Home = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <Card className="flex w-full max-w-xl flex-col items-start gap-6 text-left">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Genboot
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Welcome to Genboot Boilerplate
          </h1>
          <p className="mt-2 text-base text-gray-600">
            A simple starting point with Next.js, TypeScript, and Tailwind CSS.
          </p>
        </div>

        <Link href="/auth/login" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Go to Login</Button>
        </Link>
      </Card>
    </div>
  );
};

export default Home;
