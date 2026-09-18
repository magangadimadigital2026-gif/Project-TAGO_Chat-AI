type QuickSuggestionsProps = {
  onSelect: (text: string) => void;
  disabled?: boolean;
};

const suggestions = [
  "🌶️ Aku ingin yang pedas",
  "💸 Cari yang hemat",
  "🍜 Aku ingin makanan berkuah",
  "🍗 Aku ingin makanan ayam",
  "🥗 Cari makanan yang sehat",
];

export default function QuickSuggestions({
  onSelect,
  disabled = false,
}: QuickSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="rounded-full border border-orange-200 bg-white px-3 py-2 text-xs font-medium text-orange-800 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
