<script lang="ts">
  // Formulário de ano letivo
  import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
  import { onMount } from 'svelte'; // ciclo de vida
  import api from '$lib/api'; // API backend
  import { goto } from '$app/navigation'; // navegação
  import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones

  export let id: number | null = null; // id do ano

  type Ano = {
    id: number;
    Ano: string;
  };

  let ano: Ano = { id: 0, Ano: ''}; // dados do form
  let loading = false;
  let error = '';

  // Carrega ano se for edição
  onMount(async () => {
    if (id !== null) {
      loading = true;
      try {
        const res = await api.get(`/anoLetivo/${id}`);
        ano = { ...res.data.data};
        console.log(ano);
      } catch (e) {
        error = 'Erro ao carregar ano.';
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
      const anoData = { ...ano };
      if (id === null) {
        await api.post('/anoLetivo', anoData);
      } else {
        await api.put(`/anoLetivo/${id}`, anoData);
      }
      goto('/anoLetivo');
    } catch (e: any) {
      error = e.response?.data?.message || 'Erro ao salvar ano.';
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    console.log('Cancelar');
    goto('/anoLetivo');
  }
</script>

<!-- Card do formulário -->
<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg">
  <!-- Formulário principal -->
  <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
    <!-- Título -->
    <Heading tag="h3" class="mb-2 text-center">
      {id === null ? 'Cadastrar Ano' : 'Editar Ano'}
    </Heading>
    <!-- Mensagem de erro -->
    {#if error}
      <div class="text-red-500 text-center">{error}</div>
    {/if}
    <!-- Campo ano -->
    <div>
      <Label for="ano">Ano</Label>
      <Input id="ano" bind:value={ano.Ano} placeholder="Escreva o ano" required class="mt-1" type="number" />
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
