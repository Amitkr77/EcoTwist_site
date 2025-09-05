import React, { useState } from "react";
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

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Evergreen Trees",
    "Wildlife Habitats",
    "Mountain Landscapes",
  ]);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Plants", "Animals", "Landscapes"];

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      setRecentSearches((prev) => [
        trimmed,
        ...prev.filter((item) => item !== trimmed).slice(0, 4),
      ]);
      setSearchQuery("");
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  return (
    <Sheet>
      <SheetTrigger
        aria-label="Open search panel"
        className="p-2 rounded-md sm:flex items-center justify-center hover:bg-gray-100 transition-colors "
      >
        <Search className="h-5 w-5 text-gray-600 " />
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-6 bg-white">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" /> Nature Search
          </SheetTitle>
          <SheetDescription className="text-gray-500 text-sm">
            Explore plants, animals, and landscapes effortlessly.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSearch} className="mt-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nature..."
              className="w-full p-3 pr-10 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-400 placeholder-gray-400 text-gray-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-6">
          <button
            onClick={toggleHistory}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
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
                <h3 className="text-sm font-medium text-gray-500">Recent</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-green-600 hover:text-green-800"
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
                      onClick={() => setSearchQuery(search)}
                      className="p-2 rounded-md cursor-pointer text-gray-700 hover:bg-gray-100 transition-colors text-sm"
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
