const flowbite = require('flowbite/plugin');

module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite/**/*.{html,js,svelte,ts}',
    "./node_modules/flowbite-svelte-icons/**/*.{html,js,svelte,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    flowbite
  ],
};
