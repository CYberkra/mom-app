"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", icon: "🏠", label: "首页" },
  { href: "/devotion", icon: "📖", label: "灵修" },
  { href: "/hymns", icon: "🎵", label: "诗歌" },
  { href: "/memory", icon: "📝", label: "背经" },
  { href: "/journal", icon: "📓", label: "记录" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav-bar">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}