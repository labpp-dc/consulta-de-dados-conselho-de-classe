<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge, Button } from 'flowbite-svelte'; 
  import ConfirmModal from './ConfirmModal.svelte'; 
  import { UserEditOutline, TrashBinOutline, UserCircleOutline, CloseOutline, ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons'; 
  import { goto } from '$app/navigation'; 
  import api from '$lib/api'; 
  import { onMount } from 'svelte'; 

  type Estudante = {
    id: number;
    nome: string; 
    nomesocial: string; 
    matricula: string;
    turma: string;
  };

  let estudante: Estudante[] = []; 
  let loading = true;
  let error = '';
  
  // Estados para o Perfil em Tela Cheia
  let showPerfil = false;
  let estudanteSelecionado: any = null;
  let estudanteIndex: number = 0; // NOVO: controlar o índice atual
  let notasSelecionado: any[] = [];
  let loadingNotas = false;

  // Estados de Deleção
  let deletingId: number | null = null; 
  let confirmOpen = false; 
  let confirmTargetId: number | null = null; 

  onMount(async () => {
    try {
      const res = await api.get('/estudante');
      estudante = res.data.data;
    } catch (e: any) {
      error = 'Erro ao carregar estudantes';
    } finally {
      loading = false;
    }
  });

  // Função para abrir o perfil e buscar notas
  async function abrirPerfil(aluno: Estudante) {
    // Encontrar o índice do aluno
    const index = estudante.findIndex(e => e.id === aluno.id);
    if (index !== -1) {
      estudanteIndex = index;
    }
    
    estudanteSelecionado = aluno;
    showPerfil = true;
    await carregarNotas(aluno);
  }

  async function carregarNotas(aluno: Estudante) {
    loadingNotas = true;
    try {
      const res = await api.get(`/estudante/notas/estudante/${aluno.nome}`);
      const dados = res.data.data;
      notasSelecionado = Array.isArray(dados) ? dados : [dados];
    } catch (err) {
      notasSelecionado = [];
    } finally {
      loadingNotas = false;
    }
  }

  function fecharPerfil() {
    showPerfil = false;
    estudanteSelecionado = null;
    notasSelecionado = [];
    estudanteIndex = 0;
  }

  // NOVA FUNÇÃO DE NAVEGAÇÃO - usando o índice
  function navegar(direcao: 'proximo' | 'anterior') {
    if (estudante.length === 0) return;
    
    let novoIndex;
    if (direcao === 'proximo') {
      novoIndex = estudanteIndex + 1;
    } else {
      novoIndex = estudanteIndex - 1;
    }
    
    // Verificar se o novo índice é válido
    if (novoIndex >= 0 && novoIndex < estudante.length) {
      // Atualizar o índice
      estudanteIndex = novoIndex;
      
      // Pegar o novo aluno
      const novoAluno = estudante[estudanteIndex];
      
      // Atualizar o estudante selecionado
      estudanteSelecionado = novoAluno;
      
      // Carregar as notas do novo aluno
      carregarNotas(novoAluno);
    }
  }

  // Funções de Deleção
  function openConfirm(id: number) { 
    confirmTargetId = id; 
    confirmOpen = true; 
  }
  
  async function handleDelete(id: number) {
    deletingId = id;
    try {
      await api.delete(`/estudante/${id}`);
      estudante = estudante.filter(e => e.id !== id);
      
      // Ajustar o índice se necessário
      if (estudanteSelecionado?.id === id) {
        if (estudante.length > 0) {
          // Se ainda há estudantes, seleciona o primeiro
          estudanteIndex = 0;
          estudanteSelecionado = estudante[0];
          await carregarNotas(estudante[0]);
        } else {
          // Se não há mais estudantes, fecha o perfil
          fecharPerfil();
        }
      }
    } finally { 
      deletingId = null; 
      confirmOpen = false; 
    }
  }
</script>

<style>
  .perfil-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 9999;
    overflow-y: auto;
  }
</style>

{#if loading}
  <div class="my-8 text-center text-gray-500">Carregando estudantes...</div>
{:else}
  <div class="hidden xl:block">
    <Table class="w-full max-w-7xl mx-auto my-8 shadow-lg border border-gray-200">
      <TableHead>
        <TableHeadCell>Nome</TableHeadCell>
        <TableHeadCell>Matrícula</TableHeadCell>
        <TableHeadCell>Turma</TableHeadCell>
        <TableHeadCell>Ações</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each estudante as est}
          <TableBodyRow>
            <TableBodyCell 
              class="cursor-pointer font-bold text-blue-600 hover:underline"
              on:click={() => abrirPerfil(est)}
            >
              {est.nome}
            </TableBodyCell>
            <TableBodyCell>{est.matricula}</TableBodyCell>
            <TableBodyCell>{est.turma}</TableBodyCell>
            <TableBodyCell>
              <div class="flex gap-2">
                <button on:click={() => abrirPerfil(est)} class="p-2"><UserCircleOutline class="text-gray-500" /></button>
                <button on:click={() => goto(`/estudante/edit/${est.id}`)} class="p-2"><UserEditOutline class="text-blue-500" /></button>
                <button on:click={() => openConfirm(est.id)} class="p-2"><TrashBinOutline class="text-red-500" /></button>
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  {#if showPerfil && estudanteSelecionado}
    <div class="perfil-overlay p-8 pt-20">
      <div class="max-w-4xl mx-auto">
        <button 
          on:click={fecharPerfil}
          class="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          <CloseOutline class="w-8 h-8 text-gray-700" />
        </button>

        <div class="flex items-center justify-between gap-6 mb-8">
          <!-- Botão Anterior -->
          <button 
            on:click={() => navegar('anterior')}
            disabled={estudanteIndex === 0}
            class="p-3 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeftOutline class="w-8 h-8" />
          </button>

          <div class="text-center flex-1">
            <h2 class="text-4xl font-extrabold text-gray-900">{estudanteSelecionado.nome}</h2>
            <div class="flex justify-center gap-3 mt-4">
              <Badge color="blue">Matrícula: {estudanteSelecionado.matricula}</Badge>
              <Badge color="indigo">Turma: {estudanteSelecionado.turma}</Badge>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              {estudanteIndex + 1} de {estudante.length}
            </p>
          </div>

          <!-- Botão Próximo -->
          <button 
            on:click={() => navegar('proximo')}
            disabled={estudanteIndex === estudante.length - 1}
            class="p-3 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRightOutline class="w-8 h-8" />
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-4 border-b pb-2">Boletim Escolar</h3>
          {#if loadingNotas}
            <p class="text-center py-10">Buscando notas...</p>
          {:else if notasSelecionado.length > 0}
            <Table hoverable={true}>
              <TableHead>
                <TableHeadCell>Matéria</TableHeadCell>
                <TableHeadCell>Cert 1</TableHeadCell>
                <TableHeadCell>Apoio 1</TableHeadCell>
                <TableHeadCell>Cert 2</TableHeadCell>
                <TableHeadCell>Apoio 2</TableHeadCell>
                <TableHeadCell>PFV</TableHeadCell>
              </TableHead>
              <TableBody>
                {#each notasSelecionado as n}
                  <TableBodyRow>
                    <TableBodyCell class="font-bold">{n.materia || 'Geral'}</TableBodyCell>
                    <TableBodyCell>{n.cert1 ?? '-'}</TableBodyCell>
                    <TableBodyCell>{n.apoio1 ?? '-'}</TableBodyCell>
                    <TableBodyCell>{n.cert2 ?? '-'}</TableBodyCell>
                    <TableBodyCell>{n.apoio2 ?? '-'}</TableBodyCell>
                    <TableBodyCell class="text-blue-600 font-bold">{n.pfv ?? '-'}</TableBodyCell>
                  </TableBodyRow>
                {/each}
              </TableBody>
            </Table>
          {:else}
            <p class="text-center py-10 text-gray-500">Nenhuma nota registrada para este aluno.</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Cards para telas pequenas (Mobile e Tablet) -->
<div class="block xl:hidden px-4">
  <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
    {#each estudante as est}
      <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-gray-200 bg-white">
        <!-- Cabeçalho do Card: Nome e Ações Principais -->
        <div class="px-4 pt-4 pb-2 bg-gray-50 text-left flex items-center justify-between border-b border-gray-100">
          <div class="truncate mr-2">
            <div 
              class="text-lg font-bold text-blue-600 cursor-pointer hover:underline truncate"
              on:click={() => abrirPerfil(est)}
            >
              {est.nome}
            </div>
            {#if est.nomesocial}
              <div class="text-xs text-gray-500 italic truncate">{est.nomesocial}</div>
            {/if}
          </div>
          
          <div class="flex gap-2 flex-shrink-0">
            <!-- Botão Ver Perfil -->
            <button
              class="p-2 rounded border border-gray-200 hover:bg-gray-100 transition"
              title="Ver Perfil"
              on:click={() => abrirPerfil(est)}
            >
              <UserCircleOutline class="w-5 h-5 text-gray-500" />
            </button>
            <!-- Botão Editar -->
            <button
              class="p-2 rounded border border-blue-100 hover:border-blue-300 transition bg-transparent"
              title="Editar"
              on:click={() => goto(`/estudante/edit/${est.id}`)}
            >
              <UserEditOutline class="w-5 h-5 text-blue-500" />
            </button>
            <!-- Botão Remover -->
            <button
              title="Remover"
              class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
              on:click={() => openConfirm(est.id)}
              disabled={deletingId === est.id || loading}
            >
              <TrashBinOutline class="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        <!-- Corpo do Card: Dados Secundários -->
        <div class="px-4 pb-4 pt-3 flex flex-col gap-2 text-left">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase text-gray-400 w-16">Matrícula:</span>
            <span class="text-gray-700 text-sm font-mono">{est.matricula}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase text-gray-400 w-16">Turma:</span>
            <Badge color="indigo" class="font-medium">{est.turma}</Badge>
          </div>
        </div>
      </Card>
    {/each}
  </div>
</div>
{/if}

<ConfirmModal
  open={confirmOpen}
  message="Tem certeza que deseja remover?"
  onConfirm={() => handleDelete(confirmTargetId)}
  onCancel={() => confirmOpen = false}
/>