import { useState, useMemo, useEffect } from "react";
import { WineFilterSidebar } from "./components/WineFilterSidebar";
import { WineGrid } from "./components/WineGrid";
import { ComparisonBar } from "./components/ComparisonBar";
import { SearchModal } from "./components/SearchModal";
import { ComparisonModal } from "./components/ComparisonModal";
import { BeginnerGuideModal } from "./components/BeginnerGuideModal";
import { Search, HelpCircle } from "lucide-react";
import { WINES } from "./data/wines";
import {
  filterWines,
  getAvailableOptions,
  getInitialFilters,
} from "./utils/filterWines";
import { FilterState } from "./types/wine";
import logoImage from "figma:asset/7f9abf46a1f71a1053cfd18e709338a4e89784ea.png";

export default function App() {
  const [filters, setFilters] = useState<FilterState>(
    getInitialFilters(),
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedWines, setSelectedWines] = useState<
    Set<string>
  >(new Set());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] =
    useState(false);
  const [isBeginnerGuideOpen, setIsBeginnerGuideOpen] =
    useState(false);
  const [displayedCount, setDisplayedCount] = useState(100);

  const availableOptions = useMemo(
    () => getAvailableOptions(WINES),
    [],
  );

  const filteredWines = useMemo(() => {
    return filterWines(WINES, filters);
  }, [filters]);

  // 필터가 변경되면 표시 개수를 100으로 리셋
  useEffect(() => {
    setDisplayedCount(100);
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(getInitialFilters());
  };

  const handleToggleWine = (wineName: string) => {
    setSelectedWines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wineName)) {
        newSet.delete(wineName);
      } else {
        // 최대 5개까지만 선택 가능
        if (newSet.size >= 5) {
          alert("최대 5개의 와인까지만 비교할 수 있습니다.");
          return prev;
        }
        newSet.add(wineName);
      }
      return newSet;
    });
  };

  const handleClearAllSelected = () => {
    setSelectedWines(new Set());
  };

  const handleCompare = () => {
    setIsComparisonOpen(true);
  };

  const selectedWineData = useMemo(() => {
    return WINES.filter((wine) =>
      selectedWines.has(wine.wine_name),
    );
  }, [selectedWines]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Button - Fixed Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsSearchOpen(true);
        }}
        className={`fixed top-4 right-4 z-40 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-sm transition-all hover:shadow-lg ${
          isSearchOpen
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        }`}
        aria-label="검색"
      >
        <Search className="w-6 h-6" />
      </button>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        wines={WINES}
        onToggleWine={handleToggleWine}
        selectedWines={selectedWines}
      />

      {/* Beginner Guide Modal */}
      <BeginnerGuideModal
        isOpen={isBeginnerGuideOpen}
        onClose={() => setIsBeginnerGuideOpen(false)}
      />

      {/* Filter Sidebar */}
      {!isBeginnerGuideOpen && (
        <WineFilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          availableOptions={availableOptions}
          wines={WINES}
          onOpenGuide={() => setIsBeginnerGuideOpen(true)}
          isSearchOpen={isSearchOpen}
        />
      )}
      {/* Main Content - Fixed, not affected by sidebar */}
      <div
        className={`p-8 transition-all ${isSearchOpen ? "pointer-events-none" : ""}`}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img
              src={logoImage}
              alt="opentR Logo"
              className="h-[173px] w-auto"
            />
          </div>
          <p className="text-gray-600">
            총{" "}
            <span className="font-semibold text-gray-900">
              {filteredWines.length}
            </span>
            개의 와인
          </p>
        </div>

        {/* Wine Grid */}
        <WineGrid
          wines={filteredWines}
          selectedWines={selectedWines}
          onToggleWine={handleToggleWine}
          displayedCount={displayedCount}
          onLoadMore={() =>
            setDisplayedCount((prev) => prev + 100)
          }
        />
      </div>

      {/* Comparison Bar */}
      <ComparisonBar
        selectedCount={selectedWines.size}
        onClearAll={handleClearAllSelected}
        onCompare={handleCompare}
        selectedWines={selectedWines}
        wines={WINES}
        onToggleWine={handleToggleWine}
        isComparisonModalOpen={isComparisonOpen}
      />

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        wines={selectedWineData}
      />
    </div>
  );
}