import { JsonLd } from '@/components/seo/JsonLd'
import { FAQ_ITEMS, faqPageSchema } from '@/lib/seo'

export function FaqSection() {
  return (
    <section id="faq" className="py-12 sm:py-16 px-4 sm:px-6 bg-card border-t border-ink-200">
      <JsonLd data={faqPageSchema(FAQ_ITEMS)} />
      <div className="max-w-3xl mx-auto">
        <h2 className="type-section-title text-ink-900 mb-2">Frequently asked questions</h2>
        <p className="type-lead-sm text-ink-500 mb-8">
          Quick answers about Art Radar, Dubai exhibitions, UAE galleries, and regional art prizes.
        </p>
        <dl className="space-y-6">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="border border-ink-200 rounded-xl p-5 sm:p-6 bg-ink-50">
              <dt className="type-h4 text-ink-900 mb-2">{item.question}</dt>
              <dd className="type-body text-ink-600">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
