<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Badge, Button } from 'flowbite-svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import { 
    UserEditOutline, 
    TrashBinOutline, 
    ChevronDownOutline, 
    ChevronRightOutline, 
    UsersOutline,
    CloseOutline,
    ChevronLeftOutline,
    ChevronRightOutline as ChevronRightIcon,
    UserCircleOutline 
  } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';
  import api from '$lib/api';
  import { onMount } from 'svelte';

  type Turma = {
    id: number;
    nome: string;
    turno: string;
    serie: number;
  };

  type Estudante = {
    id: number;
    nome: string;
    nomeSocial: string | null;
    matricula: string;
    turma: string;
  };

  let turmas: Turma[] = [];
  let loading = true;
  let error = '';
  
  // Estados de Deleção
  let deletingId: number | null = null;
  let confirmOpen = false;
  let confirmTargetId: number | null = null;
  
  // Estado de Expansão das Turmas
  let turmasExpandidas: { [key: number]: boolean } = {};
  let alunosPorTurma: { [key: number]: Estudante[] } = {};
  let carregandoAlunos: { [key: number]: boolean } = {};

  // --- NOVOS ESTADOS PARA O PERFIL (DETALHES DO ESTUDANTE) ---
  let showPerfil = false;
  let estudanteSelecionado: Estudante | null = null;
  let estudanteIndex: number = 0;
  let listaNavegacaoAtual: Estudante[] = []; 
  let notasSelecionado: any[] = [];
  let loadingNotas = false;

  onMount(async () => {
    try {
      const res = await api.get('/turmas');
      turmas = res.data.data;
    } catch (e: any) {
      error = e.response?.data?.message || 'Erro ao carregar turmas';
    } finally {
      loading = false;
    }
  });

  // --- LÓGICA DE EXPANSÃO DA TURMA ---
  async function toggleTurma(turma: Turma) {
    const turmaId = turma.id;
    if (turmasExpandidas[turmaId]) {
      turmasExpandidas[turmaId] = false;
      return;
    }
    
    turmasExpandidas[turmaId] = true;
    if (alunosPorTurma[turmaId] && alunosPorTurma[turmaId].length > 0) return;
    
    carregandoAlunos[turmaId] = true;
    try {
      const response = await api.get(`/turmas/estudantes/${encodeURIComponent(turma.nome)}`);
      if (response.data.success) {
        const dados = response.data.data;
        alunosPorTurma[turmaId] = Array.isArray(dados) ? dados : (dados.estudantes || [dados]);
      }
    } catch (e: any) {
      if (e.response?.status === 404) alunosPorTurma[turmaId] = [];
    } finally {
      carregandoAlunos[turmaId] = false;
    }
  }

  // --- LÓGICA DO PERFIL ---
  async function abrirPerfil(aluno: Estudante, listaDaTurma: Estudante[]) {
    listaNavegacaoAtual = listaDaTurma;
    estudanteIndex = listaDaTurma.findIndex(e => e.id === aluno.id);
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

  function navegar(direcao: 'proximo' | 'anterior') {
    let novoIndex = direcao === 'proximo' ? estudanteIndex + 1 : estudanteIndex - 1;
    if (novoIndex >= 0 && novoIndex < listaNavegacaoAtual.length) {
      estudanteIndex = novoIndex;
      estudanteSelecionado = listaNavegacaoAtual[estudanteIndex];
      carregarNotas(estudanteSelecionado);
    }
  }

  function fecharPerfil() {
    showPerfil = false;
    estudanteSelecionado = null;
    notasSelecionado = [];
  }

  // --- LÓGICA DE DELEÇÃO ---
  function openConfirm(id: number) { confirmTargetId = id; confirmOpen = true; }
  async function handleConfirm() {
    if (confirmTargetId) {
      try {
        await api.delete(`/turmas/${confirmTargetId}`);
        turmas = turmas.filter(t => t.id !== confirmTargetId);
      } catch (e) { error = 'Erro ao deletar'; }
    }
    confirmOpen = false;
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
  <div class="my-8 text-center text-gray-500">Carregando turmas...</div>
{:else if error}
  <div class="my-8 text-center text-red-500">{error}</div>
{:else}
  <div class="hidden xl:block">
    <Table class="w-full max-w-6xl mx-auto my-8 shadow-lg border border-gray-200">
      <TableHead>
        <TableHeadCell class="w-8"></TableHeadCell>
        <TableHeadCell>Nome</TableHeadCell>
        <TableHeadCell>Turno</TableHeadCell>
        <TableHeadCell>Série</TableHeadCell>
        <TableHeadCell>Alunos</TableHeadCell>
        <TableHeadCell>Ações</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each turmas as turma}
          <TableBodyRow class="hover:bg-gray-50">
            <TableBodyCell>
              <button class="p-1 hover:bg-gray-200 rounded-full" on:click={() => toggleTurma(turma)}>
                {#if turmasExpandidas[turma.id]}
                  <ChevronDownOutline class="w-5 h-5" />
                {:else}
                  <ChevronRightOutline class="w-5 h-5" />
                {/if}
              </button>
            </TableBodyCell>
            <TableBodyCell class="font-medium">{turma.nome}</TableBodyCell>
            <TableBodyCell>{turma.turno}</TableBodyCell>
            <TableBodyCell>{turma.serie}ª</TableBodyCell>
            <TableBodyCell>
              {#if alunosPorTurma[turma.id]}
                <Badge color="blue">{alunosPorTurma[turma.id].length} alunos</Badge>
              {:else}-{/if}
            </TableBodyCell>
            <TableBodyCell>
              <div class="flex gap-1">
                <button class="p-2 text-primary-500" on:click={() => goto(`/turmas/edit/${turma.id}`)}><UserEditOutline /></button>
                <button class="p-2 text-red-500" on:click={() => openConfirm(turma.id)}><TrashBinOutline /></button>
              </div>
            </TableBodyCell>
          </TableBodyRow>

          {#if turmasExpandidas[turma.id]}
            <TableBodyRow class="bg-gray-50">
              <TableBodyCell colspan="6" class="p-4">
                <div class="border-t pt-4">
                  <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <UsersOutline class="w-4 h-4" /> Alunos da Turma
                  </h4>
                  {#if carregandoAlunos[turma.id]}
                    <p class="text-xs text-gray-400">Buscando...</p>
                  {:else if alunosPorTurma[turma.id]?.length > 0}
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {#each alunosPorTurma[turma.id] as aluno}
                        <div class="flex items-center justify-between p-3 bg-white border rounded shadow-sm">
                          <button 
                            on:click={() => abrirPerfil(aluno, alunosPorTurma[turma.id])}
                            class="text-sm font-bold text-blue-600 hover:underline text-left"
                          >
                            {aluno.nome}
                          </button>
                          <span class="text-xs text-gray-400">{aluno.matricula}</span>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <p class="text-xs text-gray-400 italic">Nenhum aluno encontrado.</p>
                  {/if}
                </div>
              </TableBodyCell>
            </TableBodyRow>
          {/if}
        {/each}
      </TableBody>
    </Table>
  </div>
{/if}

<!-- MODAL DE PERFIL EM TELA CHEIA -->
{#if showPerfil && estudanteSelecionado}
  <div class="perfil-overlay p-8 pt-20">
    <div class="max-w-4xl mx-auto relative">
      <button on:click={fecharPerfil} class="absolute -top-12 right-0 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
        <CloseOutline class="w-8 h-8 text-gray-700" />
      </button>

      <div class="flex items-center justify-between gap-6 mb-8">
        <button 
          on:click={() => navegar('anterior')} 
          disabled={estudanteIndex === 0}
          class="p-3 bg-gray-100 rounded-full disabled:opacity-30"
        >
          <ChevronLeftOutline class="w-8 h-8" />
        </button>

        <div class="text-center flex-1">
          <h2 class="text-4xl font-extrabold text-gray-900">{estudanteSelecionado.nome}</h2>
          <div class="flex justify-center gap-3 mt-4">
            <Badge color="blue">Matrícula: {estudanteSelecionado.matricula}</Badge>
            <Badge color="indigo">Turma: {estudanteSelecionado.turma}</Badge>
          </div>
          <p class="text-sm text-gray-500 mt-2">{estudanteIndex + 1} de {listaNavegacaoAtual.length}</p>
        </div>

        <button 
          on:click={() => navegar('proximo')} 
          disabled={estudanteIndex === listaNavegacaoAtual.length - 1}
          class="p-3 bg-gray-100 rounded-full disabled:opacity-30"
        >
          <ChevronRightIcon class="w-8 h-8" />
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
                  <TableBodyCell>{n.pfv ?? '-'}</TableBodyCell>
                </TableBodyRow>
              {/each}
            </TableBody>
          </Table>
        {:else}
          <p class="text-center py-10 text-gray-500">Nenhuma nota registrada.</p>
        {/if}
        
      </div>
    </div>
  </div>

  
{/if}

<ConfirmModal 
  open={confirmOpen} 
  onConfirm={handleConfirm} 
  onCancel={() => confirmOpen = false} 
  title="Excluir Turma"
  message="Tem certeza que deseja excluir esta turma?"
/>
