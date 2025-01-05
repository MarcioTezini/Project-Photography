'use client'

import Image from 'next/image'
import Button from '../../atoms/Button'
import { useHomeStore } from '@/stores/HomeStore'

export function BrandSection() {
  const { isLoggedIn } = useHomeStore()

  return (
    <>
      {!isLoggedIn && (
        <section className="lg:grid xl:grid lg:grid-cols-2 xl:grid-cols-2 md:flex md:flex-col bg-fichasPay-secondary-400 w-full py-32 px-16 sm:px-3 items-center gap-s justify-center">
          <div className="flex justify-center">
            <Image
              src="/images/img-mockup-pay.png"
              alt=""
              width={645}
              height={795}
            />
          </div>
          <div className="flex flex-col w-full justify-center gap-xm">
            <h1 className="text-grey-300 text-tittle-mid sm:text-title-xsmall font-Medium">
              É rápido, é fácil, é seguro,
              <br />
              <span className="text-fichasPay-main-400 text-tittle-mid sm:text-title-xsmall font-extrabold">
                é Suprema!
              </span>
            </h1>
            <p className="text-grey-300 text-body-mid sm:text-BODY-XM font-Medium">
              Aqui você tem todas as suas fichas sob controle.
              <br />
              Crie ou acesse sua conta, garanta suas fichas e <br />
              bora pro jogo!
            </p>
            <div className="flex items-start gap-s">
              <Button variant="outline" size="lg">
                Criar conta
              </Button>
              <Button size="lg">Iniciar Sessão</Button>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
