<script lang="ts">
  // Tabela de usuários
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card } from 'flowbite-svelte'; // UI
  import ConfirmModal from './ConfirmModal.svelte'; // modal de confirmação
  import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
  import { goto } from '$app/navigation'; // navegação
  import api from '$lib/api'; // API backend
  import { onMount } from 'svelte'; // ciclo de vida

  type Materia = {
    id: number;
    nome: string;
    turma_id: number;
    turma: string;
};

  let materia: Materia[] = []; // lista de matérias
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
      await api.delete(`/materia/${id}`);
      materia = materia.filter(materia => materia.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar matéria:', e);
      error = e.response?.data?.message || 'Erro ao remover matéria.';
    } finally {
      deletingId = null;
    }
  }

  onMount(async () => {
    try {
      const res = await api.get('/materia');
      materia = res.data.data;
      console.log(materia);
    } catch (e: any) {
      console.error('Erro ao carregar matérias:', e);
      error = e.response?.data?.message || 'Erro ao carregar matérias';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="my-8 text-center text-gray-500">Carregando matérias...</div>
{:else if error}
  <div class="my-8 text-center text-red-500">{error}</div>
{:else}
  <!-- Tabela para telas médias/grandes -->
  <div class="hidden xl:block">
    <!-- Tabela de matérias -->
    <Table class="w-full max-w-7xl
    mx-auto my-8 shadow-lg border border-gray-200 rounded-lg">
      <TableHead>
        <TableHeadCell class="w-32">Nome</TableHeadCell>
        <TableHeadCell class="w-32">Turma</TableHeadCell>
        <TableHeadCell class="w-24"></TableHeadCell> <!-- coluna para editar/remover -->
      </TableHead>
      <TableBody>
        {#each materia as materia}
          <TableBodyRow>
            <TableBodyCell>{materia.nome}</TableBodyCell>
            <TableBodyCell>{materia.turma}</TableBodyCell>
            <TableBodyCell>
              <!-- Botão editar -->
              <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/materia/edit/${materia.id}`)}
              >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <!-- Botão remover -->
              <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(materia.id)}
                disabled={deletingId === materia.id || loading}
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
      {#each materia as materia}
        <!-- Card de matéria -->
        <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-gray-200">
          <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
            <div>
              <div class="text-lg font-semibold text-gray-800 text-left">{materia.nome}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{materia.turma_id}</div>
            </div>
            <div class="flex gap-2">
              <!-- Botão editar -->
              <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/materia/edit/${materia.id}`)}
              >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <!-- Botão remover -->
              <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(materia.id)}
                disabled={deletingId === materia.id || loading}
              >
                <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
          <div class="px-4 pb-4 pt-2 flex flex-col gap-2 text-left">
            <div class="flex items-center gap-2 text-left">
              
              <svg class="w-4 h-4 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 12A4 4 0 1 0 8 12a4 4 0 0 0 8 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 14v7m-7-7v7m14-7v7"/></svg>
              <span class="text-gray-700 text-sm">{materia.turma_id}</span>
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
  message="Tem certeza que deseja remover esta matéria?"
  confirmText="Remover"
  cancelText="Cancelar"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
