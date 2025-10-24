<script>
    export var title ="";
    export var tabela=[];
    export var location="";
    export var downloadable="";
</script>


<div>
    <div class="bg-blue-500 w-full">
        <div class="text-white">{title}</div>
        
        {#if location === 'presenceTable'}
            <div>searchbar</div>
        {/if}
        {#if downloadable}
            <div> download as PDF</div>
        {/if}
    </div>

    {#each tabela as linha}

            div
        {#each linha as coluna}

        {/each}
    {/each}
</div>

