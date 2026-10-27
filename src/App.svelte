<script lang="ts">
  import './app.css';
  import { Button } from '$lib/components/ui/button';

  let count: number = $state(0);

  const increment = () => {
    count += 1;
  };
</script>

<Button onclick={increment}>
  Button
</Button>

<p>Count: {count}</p>
