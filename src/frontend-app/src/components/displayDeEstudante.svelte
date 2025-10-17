<script lang="ts">
    export var foto ="";
    export var suspenso="";
    export var faltasPorcentagem =0;
    export var faltasTotais = 0;
    export var pagina = "";
</script>

<div>
    <img src={foto} alt="">
    {#if suspenso}
        <div class="bg-red-500">{suspenso}</div>
    {/if}

    {#if pagina != 'estudante'}
        <div>
            <div>{faltasTotais}</div>
            <div>{faltasPorcentagem}</div>
        </div>
    {/if}
</div>
