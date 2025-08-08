<script lang="ts">	import Nav from './Components/Nav.svelte';
</script>
<svelte:head>
    <link rel="stylesheet" href="app.css">

</svelte:head>
<Nav />


<div class="m-6 flex">
    <div class="w-60 h-70 bg-sky-50 border-2 rounded-2xl border-sky-900 mr-6" >
        <div class=" h-20 w-full bg-red-400 rounded-2xl  border-1"> </div> 
    </div>
    <div class="flex mb-6 mx-2 flex-col">
        <div>
            <label for="nome" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome completo</label>
            <input type="text" id="nome" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Nome do aluno"  />
        </div>
        <div class="flex">
            <div>
                <label for="turma" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Turma</label>
                <input type="text" id="turma" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-center p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Turma"  />
            </div>
            
            <div>
                <label for="matricula" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">matricula</label>
                <input type="text" id="matricula" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-center p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Matrícula"  />
            </div>
            <div>
                <label for="Turno" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Turno</label>
                <input type="text" id="Turno" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-center p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Turno"  />
            </div>
        </div>
        
    </div>
   
    <button class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cadastrar</button>
</div>


