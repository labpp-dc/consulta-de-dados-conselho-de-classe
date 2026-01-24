<script lang="ts">
  import { onMount } from "svelte";
  import { logout, getCurrentUser, getToken, type User } from "$lib/auth";
  import { goto } from "$app/navigation";
  import { ArrowRightToBracketOutline, UserCircleOutline } from "flowbite-svelte-icons";
  import { page } from "$app/stores";
  
  let user: User | null = null;
  let hasToken = false;
  let isMenuOpen = false; // Controle do menu mobile

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function updateAuthStatus() {
    hasToken = getToken() !== null;
    
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

  $: if ($page.url) {
    updateAuthStatus();
    isMenuOpen = false; // Fecha o menu ao mudar de página
  }

  onMount(() => {
    updateAuthStatus();
  });

  async function handleLogout() {
    try {
      await logout();
      user = null;
      hasToken = false;
      goto('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }
</script>

<nav class="bg-[#003366] border-b-4 border-[#eab308] shadow-xl relative z-50">
  <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
    
    <a href="/" class="flex items-center space-x-3 group">
      <div class="bg-white p-1 rounded-full shadow-md group-hover:scale-105 transition-transform">
        <img src="../images/CP2TudoouNada.png" class="h-10 w-10 object-contain" alt="Logo CP2" />
      </div>
      <div class="flex flex-col">
        <span class="self-center text-xl font-bold whitespace-nowrap text-white tracking-tight">
          Sistema de Apoio ao Conselho de Classe
        </span>
        <span class="text-[10px] text-yellow-400 font-bold tracking-widest uppercase">
          Colégio Pedro II
        </span>
      </div>
    </a>

    <button 
      on:click={toggleMenu}
      type="button" 
      class="inline-flex items-center p-2 w-10 h-10 justify-center text-white rounded-lg md:hidden hover:bg-[#004488] focus:outline-none focus:ring-2 focus:ring-yellow-400" 
      aria-expanded={isMenuOpen}
    >
        <span class="sr-only">Abrir menu</span>
        {#if isMenuOpen}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        {:else}
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
        {/if}
    </button>

    <div class="{isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto transition-all" id="navbar-default">
      <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-blue-700 rounded-lg bg-[#004488] md:flex-row md:space-x-6 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent items-center">
        
        <li class="w-full md:w-auto text-center">
          <a href="/" class="block py-2 px-3 text-white hover:text-yellow-400 transition-colors md:p-0">Início</a>
        </li>
        <li class="w-full md:w-auto text-center">
          <a href="/freq" class="block py-2 px-3 text-white hover:text-yellow-400 transition-colors md:p-0">Frequência</a>
        </li>
        <li class="w-full md:w-auto text-center">
          <a href="/turmas" class="block py-2 px-3 text-white hover:text-yellow-400 transition-colors md:p-0">Turmas</a>
        </li>
        <li class="w-full md:w-auto text-center">
          <a href="/aviso" class="block py-2 px-3 text-white hover:text-yellow-400 transition-colors md:p-0">Avisos</a>
        </li>

        <li class="w-full md:w-auto py-2 md:py-0">
          <a href="/estudante" class="flex items-center justify-center gap-2 py-2 px-4 text-[#003366] bg-yellow-400 hover:bg-yellow-300 rounded-full font-bold transition-all transform hover:scale-105 shadow-md">
            <UserCircleOutline class="w-5 h-5" />
            Estudante
          </a>
        </li>

        {#if hasToken}
          <li class="w-full md:w-auto md:ml-4 border-t md:border-t-0 md:border-l border-blue-400 pt-2 md:pt-0 md:pl-6">
            <button 
              on:click={handleLogout} 
              class="flex items-center justify-center w-full gap-2 py-2 px-3 text-red-400 hover:text-red-300 font-semibold transition-colors md:p-0"
            >
              <ArrowRightToBracketOutline class="w-5 h-5" />
              Sair
            </button>
          </li>
        {:else}
          <li class="w-full md:w-auto md:ml-4 border-t md:border-t-0 md:border-l border-blue-400 pt-2 md:pt-0 md:pl-6 text-center">
            <a href="/login" class="text-white hover:text-yellow-400 font-semibold transition-colors">Entrar</a>
          </li>
        {/if}
      </ul>
    </div>
  </div>
</nav>

<style>
  :global(body) {
    background-color: #f8fafc;
  }
</style>