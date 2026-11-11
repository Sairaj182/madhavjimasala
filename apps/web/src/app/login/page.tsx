"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        await authClient.signUp.email({
          email,
          password,
          name,
        }, {
          onSuccess: () => {
            router.push("/products");
            router.refresh();
          },
          onError: (ctx) => {
            setError(ctx.error.message);
          }
        });
      } else {
        await authClient.signIn.email({
          email,
          password,
        }, {
          onSuccess: () => {
            router.push("/products");
            router.refresh();
          },
          onError: (ctx) => {
            setError(ctx.error.message);
          }
        });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-brand-gold/20">
        <div>
          <Link href="/" className="flex justify-center mb-6">
            <Image 
              src="/images/madhavjimasala_logo_tbg.png"
              alt="Madhavji Masala"
              width={80}
              height={80}
              className="object-contain"
            />
          </Link>
          <h2 className="text-center text-3xl font-heading font-extrabold text-brand-dark">
            {isRegister ? "Create an Account" : "Sign in to your account"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            {isRegister && (
              <div>
                <label className="sr-only" htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  required={isRegister}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-brand-gray/60 text-brand-dark focus:outline-none focus:ring-brand-maroon focus:border-brand-maroon focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="sr-only" htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-brand-gray/60 text-brand-dark focus:outline-none focus:ring-brand-maroon focus:border-brand-maroon focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-brand-border placeholder-brand-gray/60 text-brand-dark focus:outline-none focus:ring-brand-maroon focus:border-brand-maroon focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-brand-maroon hover:bg-brand-maroon-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-maroon transition-all"
            >
              {loading ? "Processing..." : isRegister ? "Sign Up" : "Sign In"}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="font-medium text-brand-maroon hover:text-brand-maroon-dark"
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
