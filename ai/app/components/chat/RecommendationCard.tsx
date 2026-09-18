type RecommendationCardProps = {
  name: string;
  description: string;
  image?: string;
  price?: string;
};

export default function RecommendationCard({
  name,
  description,
  image,
  price,
}: RecommendationCardProps) {
  return (
    <div className="w-64 shrink-0 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      {image ? (
        <img src={image} alt={name} className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 items-center justify-center bg-orange-50 text-5xl">
          🍽️
        </div>
      )}

      <div className="p-4">
        <h3 className="font-bold text-orange-950">{name}</h3>

        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>

        {price && <p className="mt-3 font-bold text-orange-600">{price}</p>}
      </div>
    </div>
  );
}
