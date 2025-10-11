"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetHeader,
} from "./ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, X, Leaf, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function Sidebar() {
  const router = useRouter();
  const { status, allIds, byId } = useSelector((state) => state.products);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Add state to control Sheet open/close

  useEffect(() => {
    const storedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(storedSearches);
  }, []);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extract categories from productSlice
  const categories = useMemo(() => {
    if (status !== "succeeded" || !allIds) return ["All"];
    const cats = new Set(["All"]);
    allIds.forEach((id) => {
      const prod = byId[id];
      if (prod?.categories) prod.categories.forEach((cat) => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, [status, allIds, byId]);

  useEffect(() => {
    // Persist recent searches to localStorage
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      toast.error("Please enter a search term.");
      return;
    }
    // Update recent searches
    setRecentSearches((prev) => [
      trimmed,
      ...prev.filter((item) => item !== trimmed).slice(0, 4),
    ]);
    // Navigate to products page with query parameters
    const query = new URLSearchParams({
      search: trimmed,
      category: selectedCategory === "All" ? "" : selectedCategory,
    }).toString();
    router.push(`/products?${query}`);
    setSearchQuery("");
    setIsOpen(false); // Close the Sheet after navigation
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    toast.success("Recent searches cleared.");
  };

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        aria-label="Open search panel"
        className="p-2 rounded-md sm:flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-6 bg-white dark:bg-gray-800">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />{" "}
            Nature Search
          </SheetTitle>
          <SheetDescription className="text-gray-500 dark:text-gray-400 text-sm">
            Explore eco-friendly products effortlessly.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSearch} className="mt-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full p-3 pr-10 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-green-400 dark:focus:ring-green-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <Select
              onValueChange={setSelectedCategory}
              value={selectedCategory}
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-green-400 dark:focus:ring-green-500">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
              disabled={status === "loading"}
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-6">
          <button
            onClick={toggleHistory}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <span>Recent Searches</span>
            {showHistory ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showHistory && recentSearches.length > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Recent
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-500"
                >
                  Clear
                </button>
              </div>
              <ul className="space-y-2 max-h-40 overflow-auto">
                {recentSearches
                  .filter((search) =>
                    selectedCategory === "All"
                      ? true
                      : search
                          .toLowerCase()
                          .includes(selectedCategory.toLowerCase())
                  )
                  .map((search, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        const query = new URLSearchParams({
                          search: search,
                          category:
                            selectedCategory === "All" ? "" : selectedCategory,
                        }).toString();
                        router.push(`/products?${query}`);
                        setIsOpen(false); // Close the Sheet after clicking a recent search
                      }}
                      className="p-2 rounded-md cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      {search}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}