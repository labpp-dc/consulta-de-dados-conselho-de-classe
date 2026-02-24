<script lang="ts">
    import NotasForm from '../../../../components/NotasForm.svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    const { id } = get(page).params;
  </script>
  
  <NotasForm id={Number(id)} />
