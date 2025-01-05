import { ClubsUpdateParams } from '.'

const isClubsDifferent = (
  obj1: ClubsUpdateParams,
  obj2: ClubsUpdateParams,
): boolean => {
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

  for (const key of allKeys) {
    if (
      obj1[key as keyof ClubsUpdateParams] !==
      obj2[key as keyof ClubsUpdateParams]
    ) {
      return true
    }
  }
  return false
}

export { isClubsDifferent }
