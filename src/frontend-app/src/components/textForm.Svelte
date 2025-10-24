<script lang="ts">
    import { Card, Button, Input, Label, Alert } from "flowbite-svelte";
    export var field ="";
</script>
    
        <div>
            <Label for={field} class="mb-2">{field}</Label>
            <Input
            id={field}
            type="text"
            bind:value={field}
            placeholder="Digite seu {field}"
            required
            />
        </div>
