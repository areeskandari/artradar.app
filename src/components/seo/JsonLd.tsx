type SchemaObject = Record<string, unknown>

interface JsonLdProps {
  data: SchemaObject | SchemaObject[]
}

export function JsonLd({ data }: JsonLdProps) {
  const graph = Array.isArray(data) ? data : [data]
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graph,
        }),
      }}
    />
  )
}
