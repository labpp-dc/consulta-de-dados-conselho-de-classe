<script>
    export var title ="";
    export var tabela=[];
</script>


<div>
    <div class="bg-blue-500">
        <div>{title}</div>
        
        <div>searchbar</div>
    </div>
    {#each tabela as linha}
        {#each linha as coluna}
        
        {/each}
    {/each}
</div>