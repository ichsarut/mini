"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 mb-3 pb-2.5 border-b border-gray-200">
      <Link
        href="/"
        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
          pathname === "/"
            ? "bg-green-700 font-bold shadow-lg ring-2 ring-green-800"
            : "text-gray-600 hover:bg-gray-100 hover:text-line-green"
        }`}
        style={
          pathname === "/"
            ? {
                color: "#ffffff",
                textShadow:
                  "0 1px 3px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.8)",
                WebkitTextStroke: "0.3px rgba(0,0,0,0.2)",
              }
            : undefined
        }
      >
        หน้าแรก
      </Link>
      <Link
        href="/calendar"
        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
          pathname === "/calendar"
            ? "bg-green-700 font-bold shadow-lg ring-2 ring-green-800"
            : "text-gray-600 hover:bg-gray-100 hover:text-line-green"
        }`}
        style={
          pathname === "/calendar"
            ? {
                color: "#ffffff",
                textShadow:
                  "0 1px 3px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.8)",
                WebkitTextStroke: "0.3px rgba(0,0,0,0.2)",
              }
            : undefined
        }
      >
        ปฏิทินวันลา
      </Link>
    </nav>
  );
}
