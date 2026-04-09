import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <div className="max-w-2xl">
        <div className="text-6xl mb-6">🍽️</div>
        <h1 className="text-4xl font-bold text-orange-700 mb-4">
          Welcome to Recipe Finder
        </h1>
        <p className="text-lg text-orange-900/70 mb-8">
          Discover thousands of recipes from around the world. Search by
          ingredient, cuisine, or category — and save your favorites to revisit
          anytime.
        </p>

        <SignedOut>
          <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-8 mb-6">
            <p className="text-orange-800 font-medium mb-4">
              Sign in to start searching and saving recipes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <SignInButton mode="modal">
                <button className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-orange-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="border border-orange-600 text-orange-600 font-semibold px-6 py-3 rounded-full hover:bg-orange-50 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search"
              className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
            >
              Search Recipes
            </Link>
            <Link
              href="/favorites"
              className="border border-orange-600 text-orange-600 font-semibold px-6 py-3 rounded-full hover:bg-orange-50 transition-colors"
            >
              My Favorites
            </Link>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
