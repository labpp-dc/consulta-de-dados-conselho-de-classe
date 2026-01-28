<script lang="ts">
    import MateriaForm from '../../../../components/materiaForm.svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    const { id } = get(page).params;
  </script>

  <MateriaForm id={Number(id)} />