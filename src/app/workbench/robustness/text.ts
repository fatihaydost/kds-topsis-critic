import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import en from '../../../i18n/robustness.en.json'
import tr from '../../../i18n/robustness.tr.json'

/**
 * The Robustness stage's texts are a namespace of their own, added when this chunk loads, so the /app entry does not
 * carry them. Both languages are added at once: switching language needs no load.
 */
export const ROBUSTNESS_NS = 'robustness'

if (!i18n.hasResourceBundle('en', ROBUSTNESS_NS)) {
  i18n.addResourceBundle('en', ROBUSTNESS_NS, en)
  i18n.addResourceBundle('tr', ROBUSTNESS_NS, tr)
}

/** `t` for the robustness namespace (typed from robustness.en.json). */
export function useRobustnessText() {
  return useTranslation(ROBUSTNESS_NS)
}
