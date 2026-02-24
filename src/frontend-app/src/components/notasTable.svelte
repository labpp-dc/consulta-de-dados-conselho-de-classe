<script lang="ts">
  // Tabela de usuários
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge } from 'flowbite-svelte'; // UI
  import ConfirmModal from './ConfirmModal.svelte'; // modal de confirmação
  import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
  import { goto } from '$app/navigation'; // navegação
  import api from '$lib/api'; // API backend
  import { onMount } from 'svelte'; // ciclo de vida


type Notas = {
    id: number;
    cert1:number;
    apoio1:number; 
    cert2:number;
    apoio2:number;
    pfv:number;   
    materia:string;
    estudante:string;
    matricula:string;
  };

  let nota: Notas[] = []; // lista de usuários
  let loading = true;
  let error = '';
  let deletingId: number | null = null; // id em deleção
  let confirmOpen = false; // modal aberto?
  let confirmTargetId: number | null = null; // id alvo do modal

  // Abre modal de confirmação
  function openConfirm(id: number) {
    confirmTargetId = id;
    confirmOpen = true;
  }
  // Fecha modal
  function closeConfirm() {
    confirmOpen = false;
    confirmTargetId = null;
  }

  // Confirma remoção
  function handleConfirm() {
    if (confirmTargetId !== null) {
      handleDelete(confirmTargetId);
    }
    closeConfirm();
  }

  // Cancela remoção
  function handleCancel() {
    closeConfirm();
  }

  async function handleDelete(id: number) {
    deletingId = id;
    error = '';
    try {
      await api.delete(`/estudante/nota/${id}`);
      nota = nota.filter(nota => nota.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar nota:', e);
      error = e.response?.data?.message || 'Erro ao remover nota.';
    } finally {
      deletingId = null;
    }
  }

  async function handleDeleteForAllNotas(matricula: string) {
    error = '';
    try {
      await api.delete(`/estudante/notas/${matricula}`);
    } catch (e: any) {
      console.error('Erro ao deletar todas as notas:', e);
      error = e.response?.data?.message || 'Erro ao remover notas.';
    } finally {
    }
  }

  onMount(async () => {
    try {
      const res = await api.get('/estudante');
      nota = res.data.data;
      console.log(nota);
    } catch (e: any) {
      console.error('Erro ao carregar nota do estudante:', e);
      error = e.response?.data?.message || 'Erro ao carregar nota do estudante';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="my-8 text-center text-gray-500">Carregando notas do estudantes...</div>
{:else if error}
  <div class="my-8 text-center text-red-500">{error}</div>
{:else}
  <!-- Tabela para telas médias/grandes -->
  <div class="hidden xl:block">

    <!-- Tabela de notas -->
    <Table class="w-full max-w-7xl
    mx-auto my-8 shadow-lg border border-gray-200 rounded-lg">
      <TableHead>
        <TableHeadCell class="w-32">Estudante</TableHeadCell>
        <TableHeadCell class="w-16">Materia</TableHeadCell>
        <TableHeadCell class="w-16">Matrícula</TableHeadCell>
        <TableHeadCell class="w-16">1 certificação</TableHeadCell>
        <TableHeadCell class="w-16">apoio 1</TableHeadCell> 
        <TableHeadCell class="w-16">2 certificação</TableHeadCell>
        <TableHeadCell class="w-16">apoio 2</TableHeadCell>
        <TableHeadCell class="w-16">pfv</TableHeadCell>
        <TableHeadCell class="w-32"></TableHeadCell><!-- coluna para editar/remover -->
      </TableHead>
      <TableBody>
        {#each nota as nota}
          <TableBodyRow>
            <TableBodyCell>{nota.estudante}</TableBodyCell>
            <TableBodyCell>{nota.materia}</TableBodyCell>
            <TableBodyCell>{nota.matricula}</TableBodyCell>
            <TableBodyCell>{nota.cert1}</TableBodyCell>
            <TableBodyCell>{nota.apoio1}</TableBodyCell>
            <TableBodyCell>{nota.cert2}</TableBodyCell>
            <TableBodyCell>{nota.apoio2}</TableBodyCell>
            <TableBodyCell>{nota.pfv}</TableBodyCell>
            <TableBodyCell>
              <!-- Botão editar -->
              <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/estudante/nota/edit/${nota.id}`)}
              >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <!-- Botão remover -->
              <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(nota.id)}
                disabled={deletingId === nota.id || loading}
              >
                <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>
  <!-- Cards para telas pequenas -->
  <div class="block xl:hidden">
    <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
      {#each nota as nota}
        <!-- Card de usuário -->
        <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-gray-200">
          <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
            <div>
              <div class="text-lg font-semibold text-gray-800 text-left">{nota.estudante}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{nota.matricula}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{nota.materia}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{nota.cert1}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{nota.apoio1}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{nota.cert2}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{nota.apoio2}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{nota.pfv}</div>
              <div class="text-xs text-gray-400 text-left">ID: {nota.id}</div>
            </div>
            <div class="flex gap-2">
              <!-- Botão editar -->
              <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/estudante/edit/nota/${nota.id}`)}
              >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <!-- Botão remover -->
              <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(nota.id)}
                disabled={deletingId === nota.id || loading}
              >
                <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
          <div class="px-4 pb-4 pt-2 flex flex-col gap-2 text-left">
            <div class="flex items-center gap-2 text-left">
              <!-- Ícone de email -->
              <svg class="w-4 h-4 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 12A4 4 0 1 0 8 12a4 4 0 0 0 8 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 14v7m-7-7v7m14-7v7"/></svg>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  </div>
{/if}

<!-- Modal de confirmação -->
<ConfirmModal
  open={confirmOpen}
  message="Tem certeza que deseja remover esta nota?"
  confirmText="Remover"
  cancelText="Cancelar"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
