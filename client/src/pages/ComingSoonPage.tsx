export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm opacity-70">
        ဒီစာမျက်နှာကို နောက်အဆင့်မှာ ဆောက်ပါမယ်။
      </p>
    </div>
  );
}
