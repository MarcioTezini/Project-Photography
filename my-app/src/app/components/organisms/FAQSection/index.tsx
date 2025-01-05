import { QuestionAccordion } from '../QuestionAccordion'

export function FAQSection() {
  return (
    <section
      id="faq"
      className="bg-[url('/images/home-first-section-bg.jpeg')] w-full inline-flex flex-col py-xxl px-xl md:px-s sm:px-s items-center gap-xm"
    >
      <h1 className="text-grey-300 font-bold text-tittle-mid md:text-body-large sm:text-body-large">
        Dúvidas frequentes
      </h1>
      <div className="flex flex-col justify-start w-full">
        <QuestionAccordion
          title="Não encontrei meu clube na vinculação de contas, e agora?"
          content={
            <p>
              Para um clube estar disponível na vinculação de contas ele precisa
              estar cadastrado em nossa plataforma. Caso não esteja encontrando
              o clube desejado na lista de vinculação, pode ser que o clube{' '}
              <span className="text-grey-300 text-BODY-XM md:text-BODY-XM sm:text-BODY-XM font-bold">
                NÃO{' '}
              </span>
              utilize essa plataforma para compras de fichas e diamantes ou
              saques. Nesse caso, entre em contato com seu agente ou clube.
            </p>
          }
        />
        <QuestionAccordion
          title="Posso vincular mais de uma conta ou clube?"
          content={
            <p>
              Sim, você pode vincular mais de uma conta do mesmo aplicativo ou
              contas diferentes de ambos os aplicativos (Cacheta League e
              Suprema Poker). O cadastro de mais de um clube também é possível,
              desde que o clube utilize nossa plataforma. Mas lembre-se de
              selecionar corretamente a conta vinculada quando for realizar a
              compra de fichas ou diamantes.
            </p>
          }
        />
        <QuestionAccordion
          title="Não tenho um clube, posso colocar fichas ou diamantes na minha conta mesmo assim?"
          content={
            <p>
              Para a compra de diamantes sim, é possível. Porém, tanto a Suprema
              Poker como o Cacheta League são aplicativos focados na formação e
              crescimento de clubes, por isso, para a aquisição de fichas, você
              obrigatoriamente precisa fazer parte de algum clube.
            </p>
          }
        />
        <QuestionAccordion
          title="Quanto tempo leva para as fichas caírem na minha conta ou para receber meu dinheiro?"
          content={
            <p>
              O prazo mínimo é de 24 horas para fichas e diamantes. Para saques,
              o tempo mínimo estipulado é de 48 horas.
            </p>
          }
        />
      </div>
    </section>
  )
}
