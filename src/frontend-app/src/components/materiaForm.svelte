<script lang="ts">
    // Formulário de estudantes
    import { Card, Button, Label, Input, Heading } from 'flowbite-svelte'; // UI
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import { goto } from '$app/navigation'; // navegação
    import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones
  
    export let id: number | null = null; // id do estudante
    
    type Materia = {
    id: number;
    nome: string;
    turma_id: number;
    turma: string;
    };
    type Turma = {
    id: number;
    nome: string;
    turno: string;
    serie: number;
    };
    let turmas: Turma[] =[];
    let materia: Materia = { id: 0, nome: '', turma_id:0, turma: '' }; // dados do form
    let loading = false;
    let error = '';
  
    // Carrega matéria se for edição
    onMount(async () => {
      try {
        const res = await api.get(`/materia`);
        materia = res.data.data;
        console.log(materia);
      } catch (e) {
        error = 'Erro ao carregar matérias.';
      } 
      if (id !== null) {
        loading = true;
        try {
          const res = await api.get(`/materia/${id}`);
          materia = { ...res.data.data};
          console.log(materia);
        } catch (e) {
          error = 'Erro ao carregar matérias.';
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
        const materiaData = { ...materia };
        if (id === null) {
          await api.post('/materia', materiaData);
        } else {
          await api.put(`/materia/${id}`, materiaData);
        }
        goto('/materia');
      } catch (e: any) {
        error = e.response?.data?.message || 'Erro ao salvar matéria.';
      } finally {
        loading = false;
      }
    }
  
    function handleCancel() {
      console.log('Cancelar');
      goto('/materia');
    }

  </script>
  
  <!-- Card do formulário -->
  <Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
      <!-- Título -->
      <Heading tag="h3" class="mb-2 text-center">
        {id === null ? 'Cadastrar matéria' : 'Editar matéria'}
      </Heading>
      <!-- Mensagem de erro -->
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
      <!-- Campo nome -->
      <div>
        <Label for="nome">Nome</Label>
        <Input id="nome" bind:value={materia.nome} placeholder="Escreva o nome da matéria" required class="mt-1" />
      </div>
      <!-- Campo turma -->
      <div>
        <Label for="turma">Turma</Label>
      <select name="turma" id="turma" bind:value={materia.turma_id}>
        {#each turmas as turma}
          <option value={turma.id}>{turma.nome}</option>
        {/each}
      </select>
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
  