// Renders a schema.org JSON-LD block. Server component — no client JS shipped.
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe: pure data, no user-controlled markup executed.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
