import camelCase from 'lodash/camelCase'

const isString = (x: any) => typeof x === 'string'

const isBool = (x: any) => typeof x === 'boolean'

const isReal = (x: any) => typeof x === 'number'

const isInt = (x: any) => typeof x === 'number' && x - Math.floor(x) === 0

const isDate = (x: any) => {
  if (!x) {
    return false
  }
  if (x.constructor === Date) {
    return !isNaN(x as any)
  } else if (typeof x === 'number' || typeof x === 'string') {
    return !isNaN(new Date(x) as any)
  }
  return false
}

const isArrayOf = (f: (val: any) => boolean) => {
  return function (x: any): boolean {
    if (!(x instanceof Array)) {
      return false
    }
    for (let i = 0; i < x.length; i++) {
      if (!f(x[i])) {
        return false
      }
    }
    return true
  }
}

const isObject = (x: any) => {
  if (!x) {
    return false
  }
  return typeof x === 'object'
}

const varTypeValidators: Readonly<Record<string, (_: any) => boolean>> = {
  str: isString,
  bool: isBool,
  real: isReal,
  int: isInt,
  date: isDate,
  strs: isArrayOf(isString),
  bools: isArrayOf(isBool),
  reals: isArrayOf(isReal),
  ints: isArrayOf(isInt),
  dates: isArrayOf(isDate),
  objs: isArrayOf(isObject),
  obj: isObject
}

const inferType = (value: any) => {
  for (const t in varTypeValidators) {
    if (varTypeValidators[t](value)) {
      return t
    }
  }
  return null
}

const isKnownTypeSuffix = (suffix: string) => !!varTypeValidators[suffix]

/**
 * Camel cases `.`, `-`, `_`, and white space within var names. Preserves type suffix casing.
 *
 * NOTE: Does not fix otherwise malformed fieldNames.
 * FullStory will scrub characters from keys that do not conform to /^[a-zA-Z][a-zA-Z0-9_]*$/.
 *
 * @param {string} name
 */
const camelCaseVarName = (name: string) => {
  // Do not camel case known type suffixes.
  const parts = name.split('_')
  if (parts.length > 1) {
    const typeSuffix = parts.pop()
    if (typeSuffix && varTypeValidators[typeSuffix]) {
      return camelCase(parts.join('_')) + '_' + typeSuffix
    }
  }

  // No type suffix found. Camel case the whole field name.
  return camelCase(name)
}

const typeSuffixVarName = (name: string, value: unknown) => {
  const valueTypeName = typeof value

  if (valueTypeName === 'undefined') {
    // We can't infer the variable type for undefined values
    return name
  }

  let lastUnderscore = name.lastIndexOf('_')

  if (lastUnderscore === -1 || !isKnownTypeSuffix(name.substring(lastUnderscore + 1))) {
    // Either no type suffix or the name contains an underscore with an unknown suffix.
    const maybeType = inferType(value)
    if (maybeType === null) {
      // We can't infer the type. Don't change the var name.
      return name
    }

    lastUnderscore = name.length
    // TODO(nate): Consider further validation on name.
    return `${name}_${maybeType}`
  }

  return name
}

export const normalizeVarNames = (obj?: {}, options?: { camelCase?: boolean }): Record<string, unknown> => {
  if (!obj) {
    return {}
  }

  const normalizeVarName = (name: string, value: unknown) => {
    let transformedName = name
    if (options?.camelCase) {
      transformedName = camelCaseVarName(name)
    }
    return typeSuffixVarName(transformedName, value)
  }

  return Object.entries(obj).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [normalizeVarName(key, value)]: value
    }),
    {}
  )
}
