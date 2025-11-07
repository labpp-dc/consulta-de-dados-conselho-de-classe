<script lang='ts'>
    import TextForm from "../../components/textForm.Svelte"
    var fields = [
        {
            ano:0
        }, 
        {
            nome:""
        },
        {
            nome:"", turno:"", serie:"", curso:"", anoLetivo:0
        }
    ]
    import api from '$lib/api'; // API backend
    import { onMount } from 'svelte'; // ciclo de vida

    async function criarAnoLetivo(){
        await api.post('/anoLetivo', anoLetivoData);

    }

    async function criarCurso(){
        await api.post('/curso', cursoData);

    }

    async function criarTurma(){
        await api.post('/turma', turmaData);

    }

</script>

{#each fields as field}

    <TextForm field/>
{/each}
    <div></div>