import { FormEvent, useState } from "react";
import Link from "next/link";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Register form submitted:", formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
            <p className="mt-1 text-sm text-gray-600">Start using Genboot by registering below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              name="name"
              label="Name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            />
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            />
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            />
            <Button type="submit">Register</Button>
          </form>

          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
