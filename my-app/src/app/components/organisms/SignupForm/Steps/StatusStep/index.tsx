import React from 'react'
import { SignupStatusInfo } from './Status/Info'
import { SignupStatusSuccess } from './Status/Success'
import { SignupStatusError } from './Status/Error'
import { SignupNotLinkedSuccess } from './Status/NotLinked'
import { NotCreatedInApp } from './Status/NotCreatedInApp'

interface IStatusStep {
  status: 1 | 2 | 3 | 4 | 5 | 6 | null
}

export const StatusStep: React.FC<IStatusStep> = ({ status }) => {
  switch (status) {
    case 1: {
      // Conta cadastrada, conta já existente na App e vínculo automático
      return <SignupStatusSuccess type="created" />
    }
    // Conta cadastrada, conta criada na app e vínculo automático
    case 2: {
      return <SignupStatusSuccess type="active" />
    }

    // Envio de email após solicitação dos dados
    case 3: {
      return <SignupStatusInfo />
    }

    // Erro no cadastro
    case 4: {
      return <SignupStatusError />
    }

    // Conta cadastrada, conta criada no app, porém sem vínculo automático
    case 5: {
      return <SignupNotLinkedSuccess />
    }

    // Conta cadastrada e conta não criada no app (logo também não tem vínculo)
    case 6: {
      return <NotCreatedInApp />
    }
  }
}
