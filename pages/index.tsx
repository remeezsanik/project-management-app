import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "../components/button";
import { useState, useEffect } from "react";
import XLogo from "@/components/icon/XLogo";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (session) {
    router.push("/home");
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>

      {/* Animated moving shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted && (
          <>
            <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/3 h-96 w-96 animate-pulse rounded-full bg-blue-300 opacity-10 blur-3xl"></div>
            <div className="absolute right-1/4 top-1/2 h-48 w-48 animate-pulse rounded-full bg-purple-300 opacity-10 blur-3xl"></div>
          </>
        )}
      </div>

      <div className="relative z-10 mx-5 w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-12 shadow-2xl backdrop-blur-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 rounded-full bg-white/20 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-32 w-32 text-white"
              xmlSpace="preserve"
            >
              <path
                fill="#fff"
                d="M113.768 108.4h-4V47.361c0-.711-.567-1.289-1.265-1.289H92.895v-4h15.608c2.903 0 5.265 2.373 5.265 5.289V108.4zM18.231 108.4h-4V47.36c0-2.917 2.361-5.289 5.263-5.289h17.837v4H19.494c-.696 0-1.263.578-1.263 1.289v61.04z"
              />
              <path
                fill="#fff"
                d="M105.664 102.529H92.895v-4h8.769V53.85h-8.769v-4h12.769zM37.331 102.529H22.336V49.85h14.995v4H26.336v44.679h10.995zM118.563 119.227H9.436c-3.711 0-8.146-3.256-8.639-3.627L0 115v-8.904h128V115l-.798.6c-.493.371-4.929 3.627-8.639 3.627zM4 112.961c1.575 1.039 3.925 2.266 5.436 2.266h109.126c1.511 0 3.861-1.225 5.438-2.266v-2.865H4v2.865z"
              />
              <g>
                <path
                  fill="#fff"
                  d="M64.896 106.186h-3.999V13.111H45.793v93.075h-4V9.111h23.103z"
                />
                <path
                  fill="#fff"
                  d="M53.713 17.276h9.184v4h-9.184zM57.952 25.441h4.945v4h-4.945zM53.713 33.607h9.184v4h-9.184zM57.952 41.772h4.945v4h-4.945zM53.713 49.938h9.184v4h-9.184zM57.952 58.104h4.945v4h-4.945zM53.713 66.27h9.184v4h-9.184zM57.952 74.436h4.945v4h-4.945zM53.713 82.602h9.184v4h-9.184zM57.952 90.766h4.945v4h-4.945zM53.713 98.932h9.184v4h-9.184z"
                />
                <g>
                  <path
                    fill="#fff"
                    d="M88.134 29.761h-4v-2.178l-5.611-10.389-5.606 10.389v2.178h-4v-3.189l9.606-17.799 9.611 17.799z"
                  />
                  <path
                    fill="#fff"
                    d="M72.919 106.502h-4l.002-78.528H88.13v78.528h-4V31.974H72.921z"
                  />
                  <path fill="#fff" d="M76.523 30.751h4v75.75h-4z" />
                </g>
              </g>
            </svg>
          </div>
          <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-white sm:text-4xl">
            Welcome to Project
            <XLogo
              width={25}
              height={25}
              className="inline-block sm:h-[35px] sm:w-[35px]"
            />
          </h1>

          <div className="mb-6 h-1 w-16 rounded-full bg-white/50"></div>

          <p className="mb-8 text-lg text-white/90">
            Manage your tasks efficiently with our powerful tool.
          </p>

          <Button
            onClick={() => signIn("credentials")}
            className="transform rounded-lg bg-white px-8 py-3 font-medium text-purple-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-50"
          >
            Get Started
          </Button>
        </div>
      </div>
      <div className="absolute bottom-4 text-sm text-white/50">
        © 2025 Project X. All rights reserved.
      </div>
    </div>
  );
}
