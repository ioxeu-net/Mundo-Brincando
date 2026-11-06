# Mundo Brincando — Módulo Evoluído (v0.1)

Este pacote é uma primeira etapa independente. **Não substitui nem modifica o Mundo Brincando original.**

## Arquivos

- `index.html` — estrutura do módulo.
- `styles.css` — identidade visual responsiva e estilos de acessibilidade.
- `app.js` — atividades, pontuação, preferências, quadro de comunicação e rotina.
- `servidor.py` — servidor local de pré-visualização, sem dependências externas.

## Como testar no Windows

1. Extraia a pasta.
2. Abra o terminal dentro dela.
3. Execute `python servidor.py`.
4. Acesse `http://localhost:8000`.

Também é possível abrir `index.html` diretamente, mas o servidor local é preferível para testes.

## Como subir ao GitHub sem afetar o original

1. Mantenha os arquivos originais exatamente como estão.
2. Crie uma pasta nova chamada `modulo-evoluido`.
3. Coloque os quatro arquivos do pacote dentro dela.
4. Faça commit e push.

Exemplo de estrutura:

```text
repositorio/
  index.html                 # original, sem alterações
  modulo-evoluido/
    index.html
    styles.css
    app.js
    servidor.py
    README.md
```

O endereço do novo módulo será `/modulo-evoluido/` depois de publicado em hospedagem estática. A ligação visual entre o original e o novo módulo será feita em uma etapa posterior, sem reescrever o original.

## Publicação na Cloudflare

O frontend (HTML/CSS/JS) pode ser publicado no Cloudflare Pages como conteúdo estático. O arquivo Python serve apenas para desenvolvimento local: **Cloudflare Pages não executa este servidor Python**. Se no futuro forem necessários login, sincronização entre dispositivos, painel de responsáveis ou banco de dados, a camada de API será implementada separadamente, por exemplo com Cloudflare Workers e D1.

## Isolamento e preservação

O módulo usa somente estas chaves de armazenamento:

- `mb_evolved_score`
- `mb_evolved_level`
- `mb_evolved_age`
- `mb_evolved_settings`
- `mb_evolved_routine`

As chaves do original (`mb_score` e `mb_level`) não são alteradas. Não há migração nem compartilhamento automático de progresso.

## Escopo desta versão

Incluído:
- seleção de faixa de aprendizagem;
- atividades iniciais de linguagem, matemática, mundo, lógica, rotina e socioemocional;
- pontuação e etapas próprias;
- configurações de movimento, som, vibração, aparência e tamanho de texto;
- quadro básico de comunicação com mensagens rápidas;
- sequência visual de rotina e pausa;
- layout responsivo.

Ainda não incluído:
- contas e sincronização em nuvem;
- painel de responsáveis e perfis múltiplos;
- criação de atividades por professores;
- CAA personalizada com símbolos/fotos/voz configuráveis;
- avaliação pedagógica validada ou diagnóstico;
- conteúdo completo para todas as matérias e faixas etárias.

As opções de acessibilidade são preferências de interface; não representam diagnóstico nem substituem recursos de comunicação ou acompanhamento que a pessoa já utiliza. Testar com usuários e profissionais é necessário antes de divulgar o produto como solução especializada.
