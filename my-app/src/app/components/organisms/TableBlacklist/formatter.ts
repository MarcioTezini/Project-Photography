import { Agent } from '@/services/agent/agent'
import { BlacklistTable } from './type'

const formatterBlacklistAgentsToBlacklistTable = (
  agents: Agent[],
): BlacklistTable[] => {
  return agents.map((agent) => {
    return {
      id: agent.id,
      app: agent.app,
      clubId: agent.clubId,
      playerId: agent.playerId,
      playerName: agent.playerName,
    }
  })
}

export { formatterBlacklistAgentsToBlacklistTable }
