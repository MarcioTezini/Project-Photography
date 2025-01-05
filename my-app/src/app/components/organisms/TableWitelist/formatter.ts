import { AgentWhitelist } from '@/services/agent/agent'
import { WhitelistTable } from './type'

const formatterWhitelistAgentsToWhitelistTable = (
  agents: AgentWhitelist[],
): WhitelistTable[] => {
  return agents.map((agent) => {
    return {
      id: agent.id,
      app: agent.app,
      clubId: agent.clubId,
      agentId: agent.agentId,
      agentName: agent.agentName,
      autoapproved: agent.autoapproved,
    }
  })
}

export { formatterWhitelistAgentsToWhitelistTable }
