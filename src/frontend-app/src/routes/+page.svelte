<script lang="ts">
  import { Heading } from 'flowbite-svelte';
  import Menu from '../components/Menu.svelte';
  import {  P, ImagePlaceholder, Skeleton, TextPlaceholder } from "flowbite-svelte";
</script>

<div class="text-center p-8 pt-32">
	
<form class="max-w-sm mx-auto">
	<input type="text" id="disabled-input" aria-label="disabled input" class="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value="Disabled input" disabled>
	<input type="text" id="disabled-input-2" aria-label="disabled input 2" class="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value="Disabled readonly input" disabled readonly>
  </form>
  
	<Heading tag="h2" class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">Página principal</Heading>
	<P class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-justify">
		Aqui teremos alguns caminhos e informações para o uso do sistema.
	</P>
	<Skeleton class="mt-16 mb-8" />
	<ImagePlaceholder class="my-8" />
	<TextPlaceholder class="my-8" />
</div>