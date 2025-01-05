import { SettingsDataSchema } from '.'

const isSettingsDataDifferent = (
  obj1: SettingsDataSchema,
  obj2: SettingsDataSchema,
): boolean => {
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

  for (const key of allKeys) {
    if (
      obj1[key as keyof SettingsDataSchema] !==
      obj2[key as keyof SettingsDataSchema]
    ) {
      return true
    }
  }
  return false
}

export { isSettingsDataDifferent }
