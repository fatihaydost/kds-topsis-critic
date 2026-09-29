import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Problem } from '../../core'
import type { MethodContent } from '../../content/types'
import { getExample, type ExampleDataset } from '../../data/examples'
import { CriticIdea } from '../../features/illustrations/CriticIdea'
import { MethodGlyph } from '../../features/illustrations/MethodGlyph'
import { TopsisGeometry } from '../../features/illustrations/TopsisGeometry'
import { useLang, useNumberFormat, type Lang } from '../../i18n'

function toProblem(ex: ExampleDataset, lang: Lang): Problem {
  return { alternatives: ex.alternatives, criteria: ex.criteria.map((c) => ({ name: c.name[lang], type: c.type })), matrix: ex.matrix }
}

/**
 * The picture at the top of a method page. TOPSIS and CRITIC draw their idea on their published
 * example; every other method shows its family glyph (no illustration for methods in research yet).
 */
export function MethodIdea({ m }: { m: MethodContent }) {
  const { t } = useTranslation()
  const [lang] = useLang()
  const { format } = useNumberFormat(3)

  const topsisEx = m.id === 'topsis' ? getExample('opricovic-tzeng-2004-f') : undefined
  const criticEx = m.id === 'critic' ? getExample('krishnan-2021-smartphones') : undefined
  const problem = useMemo(() => {
    const ex = topsisEx ?? criticEx
    return ex ? toProblem(ex, lang) : null
  }, [topsisEx, criticEx, lang])

  const source = (ex: ExampleDataset) => (
    <p className="text-12 text-text-2">{t('methods.page.idea.source', { citation: ex.name[lang] })}</p>
  )

  if (topsisEx && problem) {
    return (
      <div className="flex flex-col gap-2">
        <TopsisGeometry
          problem={problem}
          weights={topsisEx.weights ?? [0.5, 0.5]}
          format={(v) => format(v, 3)}
          labels={{
            title: t('methods.page.idea.topsis.title'),
            caption: t('methods.page.idea.topsis.caption'),
            projectionNote: t('methods.page.idea.topsis.projectionNote'),
            select: t('methods.page.idea.topsis.select'),
            point: (name, c) => t('methods.page.idea.topsis.point', { name, c }),
            showTable: t('methods.page.idea.showTable'),
            alternative: t('methods.page.idea.alternative'),
          }}
        />
        {source(topsisEx)}
      </div>
    )
  }

  if (criticEx && problem) {
    return (
      <div className="flex flex-col gap-2">
        <CriticIdea
          problem={problem}
          format={(v) => format(v, 4)}
          labels={{
            title: t('methods.page.idea.critic.title'),
            contrast: t('methods.page.idea.critic.contrast'),
            conflict: t('methods.page.idea.critic.conflict'),
            weight: t('methods.page.idea.critic.weight'),
            information: t('methods.page.idea.critic.information'),
            showTable: t('methods.page.idea.showTable'),
            criterion: t('methods.page.idea.criterion'),
          }}
        />
        {source(criticEx)}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 text-text-2">
      <MethodGlyph family={m.family} size={40} />
      <span className="text-14">{t(`methods.families.${m.family}`)}</span>
    </div>
  )
}
