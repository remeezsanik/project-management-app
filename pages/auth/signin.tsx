import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/button";
import { Input } from "components/input";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result?.ok) {
      router.push("/home");
    } else {
      setError(result?.error ?? "Invalid email or password");
    }
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>

      {/* Animated moving shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 h-96 w-96 animate-pulse rounded-full bg-blue-300 opacity-10 blur-3xl"></div>
        <div className="absolute right-1/4 top-1/2 h-48 w-48 animate-pulse rounded-full bg-purple-300 opacity-10 blur-3xl"></div>
      </div>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-white/20 p-3">
            {/* Logo */}
            <svg
              className="h-10 w-10 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white">Sign In</h1>
          <div className="mb-4 mt-2 h-1 w-12 rounded-full bg-white/50"></div>
          <p className="text-white/80">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-white/60"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="Email"
              className="w-full rounded-lg border border-white/30 bg-[rgba(255,255,255,0.1)] p-3 pl-10 text-white placeholder-white/60 backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-white/60"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-white/30 bg-[rgba(255,255,255,0.1)] p-3 pl-10 text-white placeholder-white/60 backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 transform rounded-lg bg-white py-3 font-medium text-purple-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-2 h-5 w-5 animate-spin text-purple-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  />
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-white">
            <p className="text-center font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-sm text-white/50">
        © 2025 Project X. All rights reserved.
      </div>
    </div>
  );
}
