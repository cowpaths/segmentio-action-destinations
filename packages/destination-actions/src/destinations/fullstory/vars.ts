import camelCase from 'lodash/camelCase'

/**
 * Camel cases `.`, `-`, `_`, and white space within var names. Preserves type suffix casing.
 *
 * NOTE: Does not fix otherwise malformed fieldNames.
 * FullStory will scrub characters from keys that do not conform to /^[a-zA-Z][a-zA-Z0-9_]*$/.
 *
 * @param {string} varName
 */
function camelCaseVarName(varName: string) {
  // Do not camel case known type suffixes.
  const parts = varName.split('_')
  if (parts.length > 1) {
    const typeSuffix = parts.pop()
    switch (typeSuffix) {
      case 'str':
      case 'int':
      case 'date':
      case 'real':
      case 'bool':
      case 'strs':
      case 'ints':
      case 'dates':
      case 'reals':
      case 'bools':
        return camelCase(parts.join('_')) + '_' + typeSuffix
      default: // passthrough
    }
  }

  // No type suffix found. Camel case the whole field name.
  return camelCase(varName)
}

export const normalizeVarNames = (obj?: {}, options?: { camelCase?: boolean }): Record<string, unknown> => {
  if (!options?.camelCase) {
    return obj || {}
  }

  if (!obj) {
    return {}
  }

  return Object.entries(obj).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [camelCaseVarName(key)]: value
    }),
    {}
  )
}
