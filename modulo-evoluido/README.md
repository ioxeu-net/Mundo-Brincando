# Mundo Brincando — Módulo Evoluído v0.1

Módulo alternativo e independente. Não substitui nem altera a versão original.

## Estrutura
- `index.html`: interface.
- `styles.css`: identidade visual responsiva e estilos de acessibilidade.
- `app.js`: atividades, pontuação, preferências, rotina e quadro básico de comunicação.
- `servidor.py`: servidor local de pré-visualização (Python 3.9+, sem dependências).

## Testar no Windows
Abra o terminal nesta pasta, execute `python servidor.py` e acesse http://localhost:8000.

## Publicação
O frontend (HTML/CSS/JS) é estático e pode ser publicado no Cloudflare Pages. O servidor Python é somente para desenvolvimento local; Pages não executa este servidor.

## Preservação
Este módulo usa exclusivamente as chaves locais `mb_evolved_score`, `mb_evolved_age`, `mb_evolved_settings` e `mb_evolved_routine`. Não lê nem altera as chaves do aplicativo antigo. Não há migração automática de progresso.

## Incluído nesta etapa
- Faixas de aprendizagem (3–5, 6–8, 9–12, 13–17 e adultos).
- Atividades iniciais de linguagem, matemática, conhecimento do mundo, lógica, rotina e socioemocional.
- Pontuação própria e progresso local.
- Preferências de movimento, som, vibração, aparência, texto e leitura em voz alta.
- Quadro inicial de comunicação com mensagens rápidas.
- Rotina visual e pausa sem cronômetro.

## Ainda não incluído
Login, sincronização em nuvem, painel de responsáveis, perfis múltiplos, CAA personalizável com fotos/símbolos, autoria de conteúdo, currículo completo ou avaliação pedagógica validada.

As opções de acessibilidade são ajustes de interface; não diagnosticam condições nem substituem sistemas de comunicação, terapias ou suportes que a pessoa já utiliza. O produto deve ser testado com usuários e profissionais antes de ser divulgado como solução especializada.
