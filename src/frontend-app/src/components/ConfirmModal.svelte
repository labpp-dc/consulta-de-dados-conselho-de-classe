<script lang="ts">

  import { Modal, Button } from 'flowbite-svelte';
  import { CloseOutline, CheckOutline } from 'flowbite-svelte-icons';

  export let open = false; // controla exibição
  export let message = 'Tem certeza?'; // texto principal
  export let confirmText = 'Confirmar'; // texto botão confirmar
  export let cancelText = 'Cancelar'; // texto botão cancelar
  export let onConfirm: () => void; // ação confirmar
  export let onCancel: () => void; // ação cancelar

</script>

<Modal bind:open={open} size="sm" class="z-50">
  <div slot="header" class="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-t-lg border-b border-gray-200">
    <span class="font-semibold text-gray-700">Confirmação</span>
    <!-- Botão fechar -->
    <Button color="light" size="xs" onclick={onCancel} aria-label="Fechar">
      <CloseOutline class="w-5 h-5 text-gray-500" />
    </Button>
  </div>
  <form method="dialog" class="flex flex-col gap-4 p-6">
    <div class="text-lg text-gray-800 text-center">{message}</div>
    <div class="flex justify-center gap-4 mt-4">
      <!-- Botão cancelar -->
      <Button color="light" type="button" onclick={onCancel}>
        <CloseOutline class="w-5 h-5 text-gray-500" /> {cancelText}
      </Button>
      <!-- Botão confirmar -->
      <Button color="primary" type="button" onclick={onConfirm}>
        <CheckOutline class="w-5 h-5 text-white" /> {confirmText}
      </Button>
    </div>
  </form>
</Modal>
