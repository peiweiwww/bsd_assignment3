import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="bg-orange-600 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90">
          Recipe Finder
        </Link>
        <nav className="flex items-center gap-4">
          <Show when="signed-in">
            <Link
              href="/search"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Search
            </Link>
            <Link
              href="/favorites"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Favorites
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-white text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-orange-50 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </Show>
        </nav>
      </div>
    </header>
  );
}
