type ChatBubbleProps = {
  role: "user" | "assistant";
  content: string;
};

function formatMessage(content: string) {
  return content
    .replace(/^### /gm, "")
    .replace(/^## /gm, "")
    .replace(/^# /gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^---$/gm, "");
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-end gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
          ✨
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 ${
          isUser
            ? "rounded-br-md bg-orange-500 text-white"
            : "rounded-bl-md bg-orange-50 text-orange-950"
        }`}
      >
        <p
          className={`mb-1 text-[11px] font-semibold ${
            isUser ? "text-orange-100" : "text-orange-500"
          }`}
        >
          {isUser ? "Kamu" : "Foodie AI"}
        </p>

        <div className="whitespace-pre-wrap text-sm leading-6">
          {formatMessage(content)}
        </div>
      </div>
    </div>
  );
}
