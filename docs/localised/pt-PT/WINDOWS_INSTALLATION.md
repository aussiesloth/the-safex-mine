# The Safex Mine — Instalação no Windows e primeira utilização

> **Tradução comunitária.** Esta página é uma tradução do projecto assistida por IA das instruções essenciais de instalação e segurança. O [guia de instalação em inglês](../../WINDOWS_INSTALLATION.md) continua a ser a referência canónica do projecto. São bem-vindas correcções de idioma e terminologia.

## 1. Descarregar apenas da versão oficial

The Safex Mine é uma aplicação Windows x64 **não assinada** que inclui um minerador de CPU, um auxiliar executado com elevação e o controlador WinRing. Descarregue o instalador apenas da versão oficial do projecto no GitHub.

## 2. Verificar SHA-256 **antes de executar**

No PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Compare cuidadosamente o resultado com o SHA-256 publicado com a versão.

**Se o Microsoft Defender colocar o instalador em quarentena imediatamente após a transferência:** primeiro restaure/permita **apenas esse instalador específico que foi descarregado**, depois calcule o SHA-256 e **não o execute** enquanto o hash não corresponder ao valor oficial.

## 3. SmartScreen e antivírus

Como a versão não é assinada e contém componentes de mineração, o SmartScreen ou outros produtos de segurança podem apresentar avisos ou colocar ficheiros em quarentena. Só prossiga depois de verificar a origem e o hash.

Não desactive o antivírus de forma geral. Não exclua a pasta Downloads, todo o perfil do utilizador nem unidades inteiras. Se, após verificar a versão, for realmente necessária uma exclusão, limite-a a:

    %LOCALAPPDATA%\The Safex Mine

## 4. Instalação, idioma e aviso de risco

O instalador NSIS normalmente selecciona automaticamente Português de Portugal de acordo com o idioma do Windows. O idioma da aplicação pode ser alterado após o arranque.

Na primeira execução, **Mining Risk Acknowledgement — Version 1.0** é apresentado no idioma de aplicação suportado escolhido. Leia-o antes de continuar. **Exit** fecha a aplicação sem registar aceitação. O inglês continua a ser a referência canónica: [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. Auxiliar UAC e MSR

A interface gráfica é executada como utilizador normal. No primeiro **Start Mining** de uma sessão, o Windows pede aprovação UAC para:

    safex-mine-helper.exe

Apenas este auxiliar é elevado. Ele inicia e supervisiona o XMRig e permite tentar a optimização MSR. Se a segurança do Windows bloquear MSR, a mineração pode continuar com desempenho reduzido. Não desactive funcionalidades de segurança apenas para aumentar o hashrate.

## 6. Desinstalação

A desinstalação remove a aplicação. Uma exclusão do Defender adicionada manualmente pode permanecer; remova-a depois se já não for necessária.

Mais ajuda: [resolução de problemas em inglês](../../../TROUBLESHOOTING.md).
