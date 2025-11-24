<script lang="ts">
    import EstudanteForm from '../../../../components/estudanteForm.svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    const { id } = get(page).params;
  </script>
  
  <EstudanteForm id={Number(id)} />
