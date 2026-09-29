import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { getMethod, listMethods } from '../../core'
import { Table, TBody, Td, Th, THead, Tr } from '../../ui'

const pageClass = 'mx-auto w-full max-w-[960px] px-4 py-10 outline-none md:px-8'

/** `/methods`. Stub: the methods in the core registry. */
export function MethodsCatalog() {
  const { t } = useTranslation()
  return (
    <main id="main" tabIndex={-1} className={pageClass}>
      <h1 className="text-24 font-semibold text-text">{t('methods.title')}</h1>
      <p className="mt-2 max-w-[640px] text-14 text-text-2">{t('methods.lead')}</p>
      <Table className="mt-6" stickyHeader={false}>
        <THead>
          <Tr>
            <Th>{t('methods.columns.name')}</Th>
            <Th>{t('methods.columns.kind')}</Th>
            <Th>{t('methods.columns.status')}</Th>
          </Tr>
        </THead>
        <TBody>
          {listMethods().map((m) => (
            <Tr key={m.id}>
              <Th scope="row">
                <Link href={`/methods/${m.id}`} className="underline underline-offset-2 hover:no-underline">
                  {t(`methods.names.${m.id as 'critic' | 'topsis'}`)}
                </Link>
              </Th>
              <Td>{t(`methods.kind.${m.kind}`)}</Td>
              <Td>{t('methods.status.available')}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
      <p className="mt-6 text-13 text-text-3">{t('common.stub')}</p>
    </main>
  )
}

/** `/methods/:id`. Stub: name and full name; unknown ids say so. */
export function MethodPage({ id }: { id: string }) {
  const { t } = useTranslation()
  const method = getMethod(id)
  return (
    <main id="main" tabIndex={-1} className={pageClass}>
      <Link href="/methods" className="text-13 text-text-2 underline underline-offset-2 hover:text-text">
        {t('methods.backToCatalog')}
      </Link>
      {method ? (
        <>
          <h1 className="mt-4 text-24 font-semibold text-text">{t(`methods.names.${method.id as 'critic' | 'topsis'}`)}</h1>
          <p className="mt-1 text-14 text-text-2">{t(`methods.fullNames.${method.id as 'critic' | 'topsis'}`)}</p>
          <p className="mt-6 text-13 text-text-3">{t('common.stub')}</p>
        </>
      ) : (
        <>
          <h1 className="mt-4 text-24 font-semibold text-text">{t('common.notFound.title')}</h1>
          <p className="mt-2 text-14 text-text-2">{t('methods.notFound', { id })}</p>
        </>
      )}
    </main>
  )
}
