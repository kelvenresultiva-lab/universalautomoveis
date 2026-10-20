# Universal Automóveis — site

Site de estoque da Universal Automóveis (Contagem/MG), no estilo de listagem da Webmotors.

- `index.html` — página principal (catálogo): https://universalautomoveis.vercel.app/
- `modelos/catalogo/` — arquivos do catálogo: filtros, ordenação e cards. O estoque fica em `estoque.js`, e as fotos em `fotos/<slug>/` (`capa.jpg` para os cards, `01.jpg`, `02.jpg`... para a galeria).
- `modelos/pagina-veiculo/` — página de cada carro, aberta em `/<slug>` (ex.: /toyota-hilux-srx-2019). O `vercel.json` faz esse redirecionamento. Os dados vêm do mesmo `estoque.js`.

Para adicionar um carro: criar a pasta de fotos com o slug e acrescentar o bloco dele em `modelos/catalogo/estoque.js`.

Site estático: não precisa de build. Basta servir a pasta (ex.: Vercel, GitHub Pages).
