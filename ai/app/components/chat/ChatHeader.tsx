export default function ChatHeader() {
  return (
    <header className="border-b border-orange-100 bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
          🍜
        </div>

        <div>
          <h1 className="text-lg font-bold text-orange-950">Foodie AI</h1>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <p className="text-xs text-zinc-500">Teman pilih makananmu</p>
          </div>
        </div>
      </div>
    </header>
  );
}
