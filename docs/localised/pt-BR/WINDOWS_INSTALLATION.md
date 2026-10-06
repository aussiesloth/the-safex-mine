# The Safex Mine — Instalação no Windows e primeiro uso

> **Tradução comunitária.** Esta página é uma tradução do projeto assistida por IA das orientações essenciais de instalação e segurança. O [guia de instalação em inglês](../../WINDOWS_INSTALLATION.md) continua sendo a referência canônica do projeto. Correções de idioma e terminologia são bem-vindas.

## 1. Baixe somente da versão oficial

The Safex Mine é um aplicativo Windows x64 **não assinado** que inclui um minerador de CPU, um auxiliar executado com elevação e o driver WinRing. Baixe o instalador somente da versão oficial do projeto no GitHub.

## 2. Verifique o SHA-256 **antes de executar**

No PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Compare cuidadosamente o resultado com o SHA-256 publicado junto da versão.

**Se o Microsoft Defender colocar o instalador em quarentena imediatamente após o download:** primeiro restaure/permita **somente esse instalador específico que foi baixado**, depois calcule o SHA-256 e **não o execute** até que o hash corresponda ao valor oficial.

## 3. SmartScreen e antivírus

Como a versão não é assinada e contém componentes de mineração, o SmartScreen ou outros produtos de segurança podem exibir avisos ou colocar arquivos em quarentena. Só continue depois de verificar a origem e o hash.

Não desative o antivírus de forma ampla. Não exclua Downloads, todo o perfil do usuário nem unidades inteiras. Se, após verificar a versão, uma exclusão for realmente necessária, limite-a a:

    %LOCALAPPDATA%\The Safex Mine

## 4. Instalação, idioma e aviso de risco

O instalador NSIS normalmente seleciona automaticamente Português do Brasil conforme o idioma do Windows. O idioma do aplicativo ainda pode ser alterado após a inicialização.

Na primeira execução, **Termo de Ciência dos Riscos da Mineração — v1.0** é exibido no idioma de aplicativo compatível escolhido. Leia antes de continuar. **Sair** fecha o aplicativo sem registrar a aceitação. O inglês continua sendo a referência canônica: [Termo de Ciência dos Riscos da Mineração v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. Auxiliar UAC e MSR

A interface gráfica é executada como usuário comum. No primeiro **Iniciar mineração** de uma sessão, o Windows solicita aprovação UAC para:

    safex-mine-helper.exe

Somente esse auxiliar é elevado. Ele inicia e supervisiona o XMRig e permite tentar a otimização MSR. Se a segurança do Windows bloquear MSR, a mineração pode continuar com desempenho reduzido. Não desative recursos de segurança apenas para aumentar o hashrate.

## 6. Desinstalação

A desinstalação remove o aplicativo. Uma exclusão do Defender adicionada manualmente pode permanecer; remova-a depois se não for mais necessária.

Mais ajuda: [solução de problemas em inglês](../../../TROUBLESHOOTING.md).
