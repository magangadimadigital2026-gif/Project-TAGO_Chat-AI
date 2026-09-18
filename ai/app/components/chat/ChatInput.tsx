type ChatInputProps = {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function ChatInput({
  value,
  loading,
  onChange,
  onSend,
}: ChatInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="border-t border-orange-100 bg-white p-4">
      <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 p-2 focus-within:border-orange-400">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Mau makan apa hari ini?"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={loading || !value.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-lg text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-200"
        >
          ➤
        </button>
      </div>

      <p className="mt-2 text-center text-[10px] text-zinc-400">
        Foodie AI membantu menemukan makanan yang cocok untukmu 🍜
      </p>
    </div>
  );
}
