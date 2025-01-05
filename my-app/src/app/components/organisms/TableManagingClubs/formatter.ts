import { ManigingClubsTable } from './type'
import { ManagingClubs } from '@/services/clubs/clubs'

const formatterManigingClubsTable = (
  clubs: ManagingClubs[],
): ManigingClubsTable[] => {
  return clubs.map((club) => {
    return {
      id: club.id,
      logo: {
        logo: club.logo,
      },
      app: club.app,
      appName: club.app,
      club: {
        name: club.name,
        slotID: club.slotID,
      },
      operatorID: club.operatorID,
      agentID: club.agentID,
      default: club.default,
    }
  })
}

export { formatterManigingClubsTable }
