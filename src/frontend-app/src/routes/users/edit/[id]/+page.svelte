<script lang="ts">
  // Importa o componente de formulário de usuário
  import UserForm from '../../../../components/UserForm.svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  // Captura o parâmetro 'id' da URL
  const { id } = get(page).params;
</script>

<!-- Utiliza o componente UserForm passando id -->
<UserForm id={Number(id)} />
