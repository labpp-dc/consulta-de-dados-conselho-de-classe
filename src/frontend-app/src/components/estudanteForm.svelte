<script lang="ts">
    // Formulário de estudantes
    import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import { goto } from '$app/navigation'; // navegação
    import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones
  
    export let id: number | null = null; // id do estudante
    
    let thumbnail;

    type Turma = {
    id: number;
    nome: string;
    turno: string;
    serie: number;
    curso_id: string;
    anoLetivo_id: string;
    };
    type Estudante = {
        id: number;
        nome:string; 
        nomeSocial:string;
        matricula:string;
        suspenso:number;
        foto:string | ArrayBuffer;
        turma_id:number;
    };
    let turmas: Turma[] =[];
    let estudante: Estudante = { id: 0, nome: '', nomeSocial: '', matricula: '', suspenso: 0, foto: '', turma_id:0 }; // dados do form
    let loading = false;
    let error = '';
  
    // Carrega estudante se for edição
    onMount(async () => {
      try {
        const res = await api.get(`/turmas`);
        turmas = res.data.data;
        console.log(turmas);
      } catch (e) {
        error = 'Erro ao carregar turmas.';
      } 
      if (id !== null) {
        loading = true;
        try {
          const res = await api.get(`/estudante/${id}`);
          estudante = { ...res.data.data};
          console.log(estudante);
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
        const estudanteData = { ...estudante };
        if (id === null) {
          await api.post('/estudante', estudanteData);
        } else {
          await api.put(`/estudante/${id}`, estudanteData);
        }
        goto('/estudante');
      } catch (e: any) {
        error = e.response?.data?.message || 'Erro ao salvar estudante.';
      } finally {
        loading = false;
      }
    }
  
    function handleCancel() {
      console.log('Cancelar');
      goto('/estudante');
    }

     function handleFileChange(event) {
    // Ou faça algo mais útil com os arquivos
    let image = event.target.files[0];
            let reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onload = event => {
                 thumbnail = event?.target?.result;
                 if (event?.target?.result) {
                  estudante.foto = event.target.result;
                 } else {
                  estudante.foto = "";
                 }
                 
            };
  }
  </script>
  
  <!-- Card do formulário -->
  <Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
      <!-- Título -->
      <Heading tag="h3" class="mb-2 text-center">
        {id === null ? 'Cadastrar estudante' : 'Editar estudante'}
      </Heading>
      <!-- Mensagem de erro -->
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
      <!-- Campo nome -->
      <div>
        <Label for="nome">Nome</Label>
        <Input id="nome" bind:value={estudante.nome} placeholder="Escreva o nome do estudante" required class="mt-1" />
      </div>
      <!-- Campo turno -->
      <div>
        <Label for="nomeSocial">Nome Social</Label>
        <Input id="nomeSocial" bind:value={estudante.nomeSocial} placeholder="Escreva o nomeSocial" required class="mt-1" />
      </div>
      <!-- Campo serie -->
      <div>
        <Label for="matricula">Matricula</Label>
        <Input id="matricula" bind:value={estudante.matricula} placeholder="Escreva a matricula" required class="mt-1" />
      </div>
      <!-- Campo curso -->
      <div>
        <Label for="suspenso">Suspenso</Label>
        <Input id="suspenso" bind:value={estudante.suspenso} placeholder="Suspenso ou não" required class="mt-1" />
      </div>

      <!-- Campo turma -->
      <div>
        <Label for="turma">Turma</Label>
      <select name="turma" id="turma" bind:value={estudante.turma_id}>
        {#each turmas as turma}
          <option value={turma.id}>{turma.nome}</option>
        {/each}
      </select>
      </div>

       <!-- Campo imagem -->
     <div class="max-w-md mx-auto">
      {#if thumbnail}
      <img src="{thumbnail}">
      {:else}
      <label for="file-upload" class="flex justify-center items-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <!-- Pré-visualização da imagem (inicialmente oculta) -->
        <img id="preview-image" class="hidden h-full w-full object-cover rounded-lg" alt="Pré-visualização da imagem">
        
        <!-- Ícone e texto de upload (exibidos quando nenhuma imagem for selecionada) -->
        <div id="upload-placeholder" class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3-3m0 0l-3-3m3 3V8M28 8h12a4 4 0 014 4v4m-32 0l-3-3m0 0l-3-3m3 3V8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-600">
            <span class="font-semibold">Clique para fazer upload</span> ou arraste e solte
          </p>
          <p class="text-xs text-gray-500 mt-1">PNG, JPG, GIF e WEBP até 10MB</p>
        </div>
      </label>
      <!--<input id="file-upload" type="file" class="sr-only" accept="image/*" on:change={handleFileChange}>-->
        <input id="file-upload" style="display:none" type="file" accept=".jpg, .jpeg, .png, .webp" on:change={(e)=>handleFileChange(e)} >
      {/if}
      
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
  