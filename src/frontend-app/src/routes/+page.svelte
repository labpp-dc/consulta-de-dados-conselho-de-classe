<script lang="ts">
  import { Heading, P, Card, Button } from 'flowbite-svelte';
  import { InfoCircleSolid, DatabaseSolid, ClipboardCheckSolid, ChartPieSolid } from "flowbite-svelte-icons";
  import Menu from '../components/Menu.svelte';
</script>



<div class="bg-white min-h-screen">
  <div class="max-w-5xl mx-auto p-6 pt-16 lg:pt-24">
    
    <div class="text-center mb-16">
      <Heading tag="h1" class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-[#003366] md:text-5xl lg:text-6xl">
        Sistema de Apoio ao <span class="text-[#eab308]">Conselho de Classe</span>
      </Heading>
      <P class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 text-center italic">
        "Tradição e excelência no acompanhamento pedagógico do Colégio Pedro II"
      </P>
    </div>

    <div class="grid md:grid-cols-2 gap-8 mb-16">
      
      <div class="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-[#003366]">
        <div class="flex items-center mb-4">
          <div class="p-2 bg-blue-50 rounded-lg mr-3">
            <DatabaseSolid class="w-6 h-6 text-[#003366]" />
          </div>
          <h3 class="text-xl font-bold text-[#003366]">Armazenamento Seguro</h3>
        </div>
        <p class="text-gray-600 leading-relaxed text-justify">
          Otimizamos o armazenamento das informações do estudante ao longo de toda a <strong>certificação</strong>. Dados de desempenho e observações pedagógicas são guardados de forma estruturada, eliminando a perda de informações entre os trimestres.
        </p>
      </div>

      <div class="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-[#eab308]">
        <div class="flex items-center mb-4">
          <div class="p-2 bg-yellow-50 rounded-lg mr-3">
            <ClipboardCheckSolid class="w-6 h-6 text-[#eab308]" />
          </div>
          <h3 class="text-xl font-bold text-[#003366]">Acesso Facilitado</h3>
        </div>
        <p class="text-gray-600 leading-relaxed text-justify">
          Garantimos que o corpo docente tenha acesso imediato aos dados relevantes do <strong>ano letivo</strong>. A agilidade na consulta permite que o Conselho de Classe foque em estratégias de intervenção pedagógica em tempo real.
        </p>
      </div>

    </div>

    <div class="border-y border-gray-100 py-12 mb-16">
      <div class="flex flex-col md:flex-row gap-12 items-center">
        <div class="md:w-1/2">
           <Heading tag="h2" class="text-2xl font-bold text-[#003366] mb-4 text-left">Objetivo Estratégico</Heading>
           <P class="text-gray-600 mb-4 text-justify">
            O sistema nasce da necessidade de modernizar os processos do conselho, transformando registros manuais em ativos digitais de fácil recuperação. Isso assegura uma transição suave entre as etapas de ensino e uma memória acadêmica fidedigna.
           </P>
           <ul class="space-y-2 text-gray-600">
              <li class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#eab308]"></div> 
                Transparência nos critérios de avaliação.
              </li>
              <li class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#eab308]"></div> 
                Integridade no armazenamento de notas e faltas.
              </li>
              <li class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#eab308]"></div> 
                Suporte à certificação oficial do aluno.
              </li>
           </ul>
        </div>
        <div class="md:w-1/2 bg-[#003366] p-10 rounded-3xl shadow-2xl">
            <h4 class="text-white text-xl font-bold mb-4">Pronto para iniciar os trabalhos?</h4>
            <p class="text-blue-100 mb-6">Acesse o painel de frequências e turmas para começar o registro do conselho atual.</p>
            <Button size="lg" class="bg-[#eab308] text-[#003366] hover:bg-yellow-300 font-bold w-full" href="/turmas">
              Acessar Painel de Controle
            </Button>
        </div>
      </div>
    </div>

  </div>
</div>

<style>
  /* Fundo branco limpo para a página toda */
  :global(body) {
    background-color: #ffffff;
    color: #1a202c;
  }
</style>