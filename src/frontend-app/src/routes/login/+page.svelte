<script lang="ts">
  import { Card, Button, Input, Label, Alert } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import { login as authLogin } from "$lib/auth";
  
  let login = '';
  let password = '';
  let loading = false;
  let error = '';

  async function handleLogin() {
    if (!login || !password) {
      error = 'Por favor, preencha todos os campos';
      return;
    }

    loading = true;
    error = '';

    try {
      const result = await authLogin({ login, password });
      
      if (result.success) {
        goto('/');
      } else {
        error = result.message || 'Credenciais inválidas';
      }
    } catch (err) {
      error = 'Erro interno do servidor';
      console.error('Erro no login:', err);
    } finally {
      loading = false;
    }
  }


</script>

<svelte:head>
  <title>Login - Projeto Modelo 2025</title>
</svelte:head>

<div class="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
  <div class="w-full max-w-sm">
    <h2 class="text-center text-3xl font-extrabold text-gray-900 mb-6">
      Login
    </h2>
    
    <Card class="p-6 w-full">
      <form on:submit|preventDefault={handleLogin} class="space-y-6">
          <div>
            <Label for="login" class="mb-2">Login</Label>
            <Input
              id="login"
              type="text"
              bind:value={login}
              placeholder="Digite seu login"
              required
            />
          </div>

          <div>
            <Label for="password" class="mb-2">Senha</Label>
            <Input
              id="password"
              type="password"
              bind:value={password}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {#if error}
            <Alert color="red" class="mb-4">
              {error}
            </Alert>
          {/if}

          <Button 
            type="submit"
            class="w-full" 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
      </form>
    </Card>
  </div>
</div>
