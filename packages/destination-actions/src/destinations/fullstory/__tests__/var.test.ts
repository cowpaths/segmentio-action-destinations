import { normalizeVarNames } from '../vars'

const suffixToExampleValuesMap: Record<string, any[]> = {
  str: ['some string'],
  bool: [true, false],
  real: [1.23],
  int: [1],
  date: [new Date()],
  obj: [{}]
}

suffixToExampleValuesMap.strs = [suffixToExampleValuesMap.str]
suffixToExampleValuesMap.bools = [suffixToExampleValuesMap.bool]
suffixToExampleValuesMap.reals = [suffixToExampleValuesMap.real]
suffixToExampleValuesMap.ints = [suffixToExampleValuesMap.int]
suffixToExampleValuesMap.dates = [suffixToExampleValuesMap.date]
suffixToExampleValuesMap.objs = [suffixToExampleValuesMap.obj]

describe('normalizeVarNames', () => {
  it('does not add type suffix for undefined values', () => {
    const obj = {
      someProp: undefined
    }
    const normalizedObj = normalizeVarNames(obj)
    expect(normalizedObj).toEqual(obj)
  })

  it('returns empty object given undefined object', () => {
    expect(normalizeVarNames(undefined)).toEqual({})
  })

  it('does not add type suffix if known type suffix is present', () => {
    const obj: Record<string, unknown> = {}
    Object.entries(suffixToExampleValuesMap).forEach(([suffix, values]) => {
      values.forEach((value, index) => {
        obj[`prop${index}_${suffix}`] = value
      })
    })
    const normalizedObj = normalizeVarNames(obj)
    expect(normalizedObj).toEqual(obj)
  })

  it('adds type suffixes when type can be inferred and known type suffix is absent', () => {
    const obj = {
      string_prop: suffixToExampleValuesMap.str[0],
      bool_prop1: suffixToExampleValuesMap.bool[0],
      bool_prop2: suffixToExampleValuesMap.bool[1],
      real_prop: suffixToExampleValuesMap.real[0],
      int_prop: suffixToExampleValuesMap.int[0],
      date_prop: suffixToExampleValuesMap.date[0],
      obj_prop: suffixToExampleValuesMap.obj[0],
      strs_prop: suffixToExampleValuesMap.strs[0],
      bools_prop: suffixToExampleValuesMap.bools[0],
      reals_prop: suffixToExampleValuesMap.reals[0],
      ints_prop: suffixToExampleValuesMap.ints[0],
      dates_prop: suffixToExampleValuesMap.dates[0],
      objs_prop: suffixToExampleValuesMap.objs[0]
    }
    const expected = {
      string_prop_str: obj.string_prop,
      bool_prop1_bool: obj.bool_prop1,
      bool_prop2_bool: obj.bool_prop2,
      real_prop_real: obj.real_prop,
      // This seems counter-intuitive, but this matches the FullStory client API behavior which prefers reals
      // over ints to avoid inconsistent type inference.
      int_prop_real: obj.int_prop,
      date_prop_date: obj.date_prop,
      obj_prop_obj: obj.obj_prop,
      strs_prop_strs: obj.strs_prop,
      bools_prop_bools: obj.bools_prop,
      reals_prop_reals: obj.reals_prop,
      ints_prop_reals: obj.ints_prop,
      dates_prop_dates: obj.dates_prop,
      objs_prop_objs: obj.objs_prop
    }
    const actual = normalizeVarNames(obj)
    expect(actual).toEqual(expected)
  })

  it('camel cases when specified', () => {
    const obj = {
      string_str: 'some string',
      moreStrings: ['more', 'strings'],
      last_string_str: 'last string',
      ['hyphenated-bool']: true,
      'dotted.date': new Date(),
      'spaced real': 1.23
    }
    const expected = {
      string_str: obj.string_str,
      moreStrings_strs: obj.moreStrings,
      lastString_str: obj.last_string_str,
      hyphenatedBool_bool: obj['hyphenated-bool'],
      dottedDate_date: obj['dotted.date'],
      spacedReal_real: obj['spaced real']
    }
    const actual = normalizeVarNames(obj, { camelCase: true })
    expect(actual).toEqual(expected)
  })
})