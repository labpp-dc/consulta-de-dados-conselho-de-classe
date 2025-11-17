<script lang="ts">
    import TurmaForm from '../../../../components/TurmaForm.svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    const { id } = get(page).params;
  </script>
  
  <TurmaForm id={Number(id)} />
