import { useState, useEffect } from "react";
import { Search, X, Check } from "lucide-react";
import { WineRow } from "../types/wine";
import { motion, AnimatePresence } from "motion/react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  wines: WineRow[];
  onToggleWine: (wineName: string) => void;
  selectedWines: Set<string>;
}

// 유사도 계산 함수 (Levenshtein Distance)
function getLevenshteinDistance(
  str1: string,
  str2: string,
): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[len1][len2];
}

// 유사도 점수 계산 (0~1, 1에 가까울수록 유사)
function getSimilarityScore(
  str1: string,
  str2: string,
): number {
  const distance = getLevenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

// 문자열 정규화 (띄어쓰기 제거, 소문자 변환)
function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "");
}

// 유사도 검색 함수
function isSimilarMatch(
  searchTerm: string,
  targetText: string,
  threshold: number = 0.7,
): boolean {
  const normalizedSearch = normalize(searchTerm);
  const normalizedTarget = normalize(targetText);

  // 정확한 포함 관계 체크
  if (normalizedTarget.includes(normalizedSearch)) {
    return true;
  }

  // 단어별로 나누어서 유사도 체크
  const searchWords = searchTerm.toLowerCase().split(/\s+/);
  const targetWords = targetText.toLowerCase().split(/\s+/);

  for (const searchWord of searchWords) {
    let found = false;
    for (const targetWord of targetWords) {
      if (
        targetWord.includes(searchWord) ||
        searchWord.includes(targetWord)
      ) {
        found = true;
        break;
      }
      // 유사도 체크
      const similarity = getSimilarityScore(
        normalize(searchWord),
        normalize(targetWord),
      );
      if (similarity >= threshold) {
        found = true;
        break;
      }
    }
    if (found) {
      return true;
    }
  }

  // 전체 문자열 유사도 체크
  const similarity = getSimilarityScore(
    normalizedSearch,
    normalizedTarget,
  );
  return similarity >= threshold;
}

export function SearchModal({
  isOpen,
  onClose,
  wines,
  onToggleWine,
  selectedWines,
}: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<WineRow[]>(
    [],
  );

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = wines.filter(
      (wine) =>
        isSimilarMatch(term, wine.wine_name) ||
        isSimilarMatch(term, wine.country) ||
        isSimilarMatch(term, wine.subregion) ||
        isSimilarMatch(term, wine.grape_or_style) ||
        isSimilarMatch(term, wine.wine_type) ||
        wine.aromas.some((aroma) =>
          isSimilarMatch(term, aroma),
        ),
    );

    setSearchResults(results);
  }, [searchTerm, wines]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSearchTerm("");
      setSearchResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 pb-20">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="relative w-full max-w-3xl mx-4 bg-white rounded-lg shadow-2xl h-[65vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 backdrop으로 전파 방지
          >
            {/* Search Input */}
            <div className="p-3 shadow-lg relative bg-white rounded-t-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="와인 이름, 국가, 지역, 품종, 향 검색..."
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
                  autoFocus
                  onClick={(e) => e.stopPropagation()} // input 클릭 시 이벤트 전파 방지
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4 pb-16 min-h-0">
              {searchTerm.trim() === "" ? (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>와인을 검색해보세요</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>검색 결과가 없습니다</p>
                  <p className="text-sm mt-2">
                    다른 키워드로 검색해보세요
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((wine, index) => {
                    const uniqueKey = `${wine.wine_name}-${wine.country}-${wine.subregion}-${wine.vintage}-${index}`;
                    const isSelected = selectedWines.has(
                      wine.wine_name,
                    );
                    return (
                      <div
                        key={uniqueKey}
                        className={`p-4 border shadow-sm rounded-lg transition-colors cursor-pointer relative ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // 검색 결과 클릭 시 이벤트 전파 방지
                          onToggleWine(wine.wine_name);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {wine.wine_name}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs mr-2">
                                  {wine.wine_type}
                                </span>
                                {wine.country}, {wine.subregion}
                              </p>
                              <p>
                                <span className="font-medium">
                                  품종:
                                </span>{" "}
                                {wine.grape_or_style}
                              </p>
                              {wine.vintage && (
                                <p>
                                  <span className="font-medium">
                                    빈티지:
                                  </span>{" "}
                                  {wine.vintage}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col items-end gap-2">
                            {isSelected && (
                              <div className="flex items-center gap-1 text-blue-600 text-sm">
                                <Check className="w-4 h-4" />
                                <span className="font-medium">
                                  선택됨
                                </span>
                              </div>
                            )}
                            {wine.price_krw && (
                              <p className="font-bold text-gray-900">
                                ₩
                                {wine.price_krw.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Floating Footer */}
            {searchResults.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-3 text-sm text-gray-400 text-center pointer-events-none">
                <span className="inline-block bg-white/65 backdrop px-4 py-2 rounded-full shadow-lg font-medium">
                  {searchResults.length}개의 와인이
                  검색되었습니다
                </span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}