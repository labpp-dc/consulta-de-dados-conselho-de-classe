<script lang="ts">
  // Formulário de turmas
  import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
  import { onMount } from 'svelte'; // ciclo de vida
  import api from '$lib/api'; // API backend
  import { goto } from '$app/navigation'; // navegação
  import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones

  export let id: number | null = null; // id da turma
  type Ano = {
    id: number;
    Ano: string;
  };
  type Curso = {
    id: number;
    Nome: string;
  };
  type Turma = {
    id: number;
    nome: string;
    turno: string;
    serie: number;
    curso_id: string;
    anoLetivo_id: string;
  };
  let anoLetivos: Ano[]
  let cursos: Curso[] 
  let turma: Turma = { id: 0, nome: '', turno: '', serie: 0, curso_id: '', anoLetivo_id: ''}; // dados do form
  let loading = false;
  let error = '';

  // Carrega turma se for edição
  onMount(async () => {
    if (id !== null) {
      loading = true;
      try {
        const res = await api.get(`/curso`);
        cursos = { ...res.data};
        console.log(cursos);
      } catch (e) {
        error = 'Erro ao carregar cursos.';
      } 
      try {
        const res = await api.get(`/anoLetivo`);
        anoLetivos = { ...res.data};
        console.log(anoLetivos);
      } catch (e) {
        error = 'Erro ao carregar anos letivos.';
      } 
      try {
        const res = await api.get(`/turmas/${id}`);
        turma = { ...res.data.data};
        console.log(turma);
      } catch (e) {
        error = 'Erro ao carregar turma.';
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
        console.log(turmaData)
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
      <Input id="curso" type="curso" bind:value={turma.curso_id} placeholder="Escreva o curso" required class="mt-1" />

       <select name="curso" id="curso">
        {#each cursos as curso}
          <option value={curso[0]}>{curso[1]}</option>
        {/each}
      </select>
    </div>
    <!-- Campo ano letivo -->
    <div>
      <Label for="anoLetivo">Ano letivo</Label>
      <Input id="anoLetivo" type="anoLetivo" bind:value={turma.anoLetivo_id} placeholder="Escreva o ano letivo" required class="mt-1" />
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
