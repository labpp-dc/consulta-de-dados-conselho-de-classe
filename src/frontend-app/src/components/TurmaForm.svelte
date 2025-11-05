<script lang="ts">
  // Formulário de turmas
  import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
  import { onMount } from 'svelte'; // ciclo de vida
  import api from '$lib/api'; // API backend
  import { goto } from '$app/navigation'; // navegação
  import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones

  export let id: number | null = null; // id da turma

  type Turma = {
    id: number;
    nome: string;
    turno: string;
    serie: number;
    curso: string;
    anoLetivo: string;
  };

  let turma: Turma = { id: 0, nome: '', turno: '', serie: 0, curso: '', anoLetivo: ''}; // dados do form
  let loading = false;
  let error = '';

  // Carrega turma se for edição
  onMount(async () => {
    if (id !== null) {
      loading = true;
      try {
        const res = await api.get(`/turmas/${id}`);
        turma = { ...res.data.data};
        console.log(turma);
      } catch (e) {
        error = 'Erro ao carregar usuário.';
      } finally {
        loading = false;
      }
    } 
  });

  // Submissão do formulário
  async function handleSubmit() {
    loading = true;
    error = '';
    try {
      const turmaData = { ...turma };
      if (id === null) {
        await api.post('/turmas', turmaData);
      } else {
        await api.put(`/turmas/${id}`, turmaData);
      }
      goto('/turmas');
    } catch (e: any) {
      error = e.response?.data?.message || 'Erro ao salvar turma.';
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    console.log('Cancelar');
    goto('/turmas');
  }
</script>

<!-- Card do formulário -->
<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg">
  <!-- Formulário principal -->
  <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
    <!-- Título -->
    <Heading tag="h3" class="mb-2 text-center">
      {id === null ? 'Cadastrar Turma' : 'Editar Turma'}
    </Heading>
    <!-- Mensagem de erro -->
    {#if error}
      <div class="text-red-500 text-center">{error}</div>
    {/if}
    <!-- Campo nome -->
    <div>
      <Label for="nome">Nome</Label>
      <Input id="nome" bind:value={turma.nome} placeholder="Escreva o nome da turma" required class="mt-1" />
    </div>
    <!-- Campo turno -->
    <div>
      <Label for="turno">Turno</Label>
      <Input id="turno" type="turno" bind:value={turma.turno} placeholder="Escreva o turno" required class="mt-1" />
    </div>
    <!-- Campo serie -->
    <div>
      <Label for="serie">Serie</Label>
      <Input id="serie" type="serie" bind:value={turma.serie} placeholder="Escreva a série" required class="mt-1" />
    </div>
    <!-- Campo curso -->
    <div>
      <Label for="curso">Curso</Label>
      <Input id="curso" type="curso" bind:value={turma.curso} placeholder="Escreva o curso" required class="mt-1" />
    </div>
    <!-- Campo ano letivo -->
    <div>
      <Label for="anoLetivo">Ano letivo</Label>
      <Input id="anoLetivo" type="anoLetivo" bind:value={turma.anoLetivo} placeholder="Escreva o ano letivo" required class="mt-1" />
    </div>
    <!-- Botões de ação -->
    <div class="flex gap-4 justify-end mt-4">
      <!-- Botão cancelar/voltar -->
      <Button color="light" type="button" onclick={handleCancel} disabled={loading}>
        <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
        {id === null ? 'Voltar' : 'Cancelar'}
      </Button>
      <!-- Botão salvar -->
      <Button type="submit" color="blue" disabled={loading}>
        <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
        {id === null ? 'Cadastrar' : 'Salvar'}
      </Button>
    </div>
  </form>
</Card>
