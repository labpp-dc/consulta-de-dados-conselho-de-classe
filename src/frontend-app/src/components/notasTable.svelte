<script lang="ts">
  // Tabela de usuários
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge } from 'flowbite-svelte'; // UI
  import ConfirmModal from './ConfirmModal.svelte'; // modal de confirmação
  import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
  import { goto } from '$app/navigation'; // navegação
  import api from '$lib/api'; // API backend
  import { onMount } from 'svelte'; // ciclo de vida


type Estudante = {
    id: number;   
    materia:string;
    estudante:string;
    matricula:string;
    boletim: Record<string, Boletim>;
  };
// tipo para boletim, com as notas de cada avaliação
type Boletim = {
  cert1:number | null;
  apoio1:number | null; 
  cert2:number | null;
  apoio2:number | null;
  pfv:number | null;
};

  let boletim: Estudante[] = []; // lista de estudantes
  let nota: Boletim[] = []; // lista de boletins
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
      boletim = boletim.filter(boletim => boletim.id !== id);
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
      const res = await api.get(`/estudante/notas`);
      boletim = res.data.data;
      console.log(boletim);
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
    <Table class="w-full max-w-7xl mx-auto my-8 shadow-lg border border-gray-200 rounded-lg">
      <TableHead>
        <TableHeadCell class="w-32">Estudante</TableHeadCell>
        <TableHeadCell class="w-16">Matrícula</TableHeadCell>
        <TableHeadCell class="w-16">1 certificação</TableHeadCell>
        <TableHeadCell class="w-16">apoio 1</TableHeadCell> 
        <TableHeadCell class="w-16">2 certificação</TableHeadCell>
        <TableHeadCell class="w-16">apoio 2</TableHeadCell>
        <TableHeadCell class="w-16">pfv</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each boletim as aluno}
          <TableBodyRow>
            <TableBodyCell>{aluno.estudante}</TableBodyCell>
            <TableBodyCell>{aluno.matricula}</TableBodyCell>
            <TableBodyCell>
            {#each Object.entries(aluno.boletim) as [materia, nota]}
            <div class="flex justify-between border-b last:border-0 py-1">
            <span class="font-medium">{materia}:</span>
              {#if nota.cert1 < 5}
                <span class="text-red-500">{nota.cert1}</span>
              {:else if nota.cert1 >= 6 }
                <span class="text-blue-500">{nota.cert1}</span>
              {:else}
                <span class="text-green-500">{nota.cert1}</span>
              {/if}
            </div>
            {/each}
            </TableBodyCell>
            <TableBodyCell>
            {#each Object.entries(aluno.boletim) as [materia, nota]}
            <div class="flex justify-between border-b last:border-0 py-1">
            <span class="font-medium">{materia}:</span>
              {#if nota.apoio1 < 6}
                <span class="text-red-500">{nota.apoio1}</span>
              {:else}
                <span class="text-blue-500">{nota.apoio1}</span>
              {/if}
            </div>
            {/each}
            </TableBodyCell>
            <TableBodyCell>
            {#each Object.entries(aluno.boletim) as [materia, nota]}
            <div class="flex justify-between border-b last:border-0 py-1">
            <span class="font-medium">{materia}:</span>
              {#if nota.cert2 < 5}
                <span class="text-red-500">{nota.cert2}</span>
              {:else if nota.cert2 >= 6 }
                <span class="text-blue-500">{nota.cert2}</span>
              {:else}
                <span class="text-green-500">{nota.cert2}</span>
              {/if}
            </div>
            {/each}
            </TableBodyCell>
            <TableBodyCell>
            {#each Object.entries(aluno.boletim) as [materia, nota]}
            <div class="flex justify-between border-b last:border-0 py-1">
            <span class="font-medium">{materia}:</span>
              {#if nota.apoio2 < 6}
                <span class="text-red-500">{nota.apoio2}</span>
              {:else}
                <span class="text-blue-500">{nota.apoio2}</span>
              {/if}
            </div>
            {/each}
            </TableBodyCell>
            <TableBodyCell>
            {#each Object.entries(aluno.boletim) as [materia, nota]}
            <div class="flex justify-between border-b last:border-0 py-1">
            <span class="font-medium">{materia}:</span>
              {#if nota.pfv < 6}
                <span class="text-red-500">{nota.pfv}</span>
              {:else}
                <span class="text-blue-500">{nota.pfv}</span>
              {/if}
              </div>
            {/each}
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>
  <!-- Cards para telas pequenas -->
  <div class="block xl:hidden">
    <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
      {#each boletim as aluno}
        <!-- Card de usuário -->
        <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-gray-200">
          <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
            <div>
              <div class="text-lg font-semibold text-gray-800 text-left">{aluno.estudante}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{aluno.matricula}</div>
              <div class="text-lg font-semibold text-gray-800 text-left">{aluno.materia}</div>
              <br>
              <div class="flex flex-row gap-8">
              <div class="text-lg font-semibold text-gray-800 text-left flex flex-col">1° Certificação
              {#each Object.entries(aluno.boletim) as [materia, nota]}
              <div class="flex justify-between border-b last:border-0 py-1">
              <span class="font-medium">{materia}:</span>
              <span>{nota.cert1}</span>
              </div>
              {/each}
              <br>
              </div>
              <div class="text-lg font-semibold text-gray-800 text-left flex flex-col">Apoio 1
              {#each Object.entries(aluno.boletim) as [materia, nota]}
              <div class="flex justify-between border-b last:border-0 py-1">
              <span class="font-medium">{materia}:</span>
              <span>{nota.apoio1}</span>
              </div>
              {/each}
              <br>
              </div>
              </div>
              <div class="flex flex-row gap-8">
              <div class="text-lg font-semibold text-gray-800 text-left">2° Certificação
              {#each Object.entries(aluno.boletim) as [materia, nota]}
              <div class="flex justify-between border-b last:border-0 py-1">
              <span class="font-medium">{materia}:</span>
              <span>{nota.cert2}</span>
              </div>
              {/each}
              <br>
              </div>
              <div class="text-lg font-semibold text-gray-800 text-left flex flex-col">Apoio 2
              {#each Object.entries(aluno.boletim) as [materia, nota]}
              <div class="flex justify-between border-b last:border-0 py-1">
              <span class="font-medium">{materia}:</span>
              <span>{nota.apoio2}</span>
              </div>
              {/each}
              <br>
              </div>
              </div>
              <div class="flex flex-row gap-8">
              <div class="text-lg font-semibold text-gray-800 text-left flex flex-col">PFV
              {#each Object.entries(aluno.boletim) as [materia, nota]}
              <div class="flex justify-between border-b last:border-0 py-1">
              <span class="font-medium">{materia}:</span>
              <span>{nota.pfv}</span>
              </div>
              {/each}
              <br>
              </div>
              </div>
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
