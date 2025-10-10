<script lang="ts">
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Heading} from "flowbite-svelte";
  import { onMount } from "svelte";
  import { logout, getCurrentUser, getToken, type User } from "$lib/auth";
  import { goto } from "$app/navigation";
  import { ArrowRightToBracketOutline } from "flowbite-svelte-icons";
  import { page } from "$app/stores";
  
  let user: User | null = null;
  let hasToken = false;

  // Verifica token sincronamente (instantâneo)
  function updateAuthStatus() {
    hasToken = getToken() !== null;
    
    // Se tem token, carrega dados do usuário em background
    if (hasToken && !user) {
      getCurrentUser().then(userData => {
        user = userData;
      }).catch(() => {
        user = null;
        hasToken = false;
      });
    } else if (!hasToken) {
      user = null;
    }
  }

  // Reativo à mudança de página
  $: if ($page.url) {
    updateAuthStatus();
  }

  onMount(() => {
    updateAuthStatus();
  });

  // função para logout (só apaga o token)
  async function handleLogout() {
    console.log('Logout iniciado...');
    try {
      await logout();
      user = null; // Limpar estado local
      console.log('Logout concluído, redirecionando...');
      goto('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }
</script>

<div class="relative px-8">
  <Navbar class="fixed start-0 top-0 z-20 w-full bg-gray-800 px-2 py-2.5 sm:px-4">
    <NavBrand href="/">
      <img src="/images/icon.svg" class="me-3 h-6 sm:h-9" alt="Logo aleatória" />
      <Heading class="self-center text-xl font-semibold whitespace-nowrap text-primary-500 dark:text-primary-400">Projeto Modelo 2025</Heading>
    </NavBrand>
    <NavHamburger />
    <NavUl>
      <NavLi href="/" class="text-lg font-bold px-4 py-2 text-primary-500 dark:text-primary-400 hover:text-yellow-300 hover:bg-gray-700 focus:text-yellow-400 focus:bg-gray-700 transition-colors rounded-lg">Home</NavLi>
      <NavLi href="/about" class="text-lg font-bold px-4 py-2 text-primary-500 dark:text-primary-400 hover:text-yellow-300 hover:bg-gray-700 focus:text-yellow-400 focus:bg-gray-700 transition-colors rounded-lg">Sobre</NavLi>
      
      {#if hasToken}
        {#if user} <!-- se existir usuário é porque conseguiu logar-->
          {#if user.role === 'admin'} <!-- só exibe menu usuários para admin-->
            <NavLi href="/users" class="text-lg font-bold px-4 py-2 text-primary-500 dark:text-primary-400 hover:text-yellow-300 hover:bg-gray-700 focus:text-yellow-400 focus:bg-gray-700 transition-colors rounded-lg">Usuários</NavLi>
          {/if}
          <NavLi>
            <div class="flex items-center">
              <span class="text-primary-500 dark:text-primary-400 px-4 py-2">Olá, {user.login}</span>
              <button 
                class="ml-2 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm flex items-center gap-1"
                on:click={handleLogout}
              >
                <ArrowRightToBracketOutline class="w-4 h-4" />
                Sair
              </button>
            </div>
          </NavLi>
        {/if}
      {:else}
        <!-- se não tem token, exibe botão de login-->
        <NavLi href="/login" class="text-lg font-bold px-4 py-2 text-primary-500 dark:text-primary-400 hover:text-yellow-300 hover:bg-gray-700 focus:text-yellow-400 focus:bg-gray-700 transition-colors rounded-lg">Login</NavLi>
      {/if}
    </NavUl>
  </Navbar>
</div>