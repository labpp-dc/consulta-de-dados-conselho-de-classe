<script lang="ts">
  // Formulário de ano letivo
  import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
  import { onMount } from 'svelte'; // ciclo de vida
  import api from '$lib/api'; // API backend
  import { goto } from '$app/navigation'; // navegação
  import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones

  export let id: number | null = null; // id do ano

  type Curso = {
    id: number;
    Nome: string;
  };

  let curso: Curso = { id: 0, Nome: ''}; // dados do form
  let loading = false;
  let error = '';

  // Carrega curso se for edição
  onMount(async () => {
    if (id !== null) {
      loading = true;
      try {
        const res = await api.get(`/curso/${id}`);
        curso = { ...res.data.data};
        console.log(curso);
      } catch (e) {
        error = 'Erro ao carregar curso.';
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
      const cursoData = { ...curso };
      if (id === null) {
        await api.post('/curso', cursoData);
      } else {
        await api.put(`/curso/${id}`, cursoData);
      }
      goto('/curso');
    } catch (e: any) {
      error = e.response?.data?.message || 'Erro ao salvar curso.';
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    console.log('Cancelar');
    goto('/curso');
  }
</script>

<!-- Card do formulário -->
<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg">
  <!-- Formulário principal -->
  <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
    <!-- Título -->
    <Heading tag="h3" class="mb-2 text-center">
      {id === null ? 'Cadastrar Curso' : 'Editar Curso'}
    </Heading>
    <!-- Mensagem de erro -->
    {#if error}
      <div class="text-red-500 text-center">{error}</div>
    {/if}
    <!-- Campo Nome do curso -->
    <div>
      <Label for="Nome">Nome do Curso</Label>
      <Input id="Nome" bind:value={curso.Nome} placeholder="Escreva o nome do  curso" required class="mt-1" type="text" />
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
