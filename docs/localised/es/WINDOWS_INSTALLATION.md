# The Safex Mine — Instalación en Windows y primer uso

> **Traducción comunitaria.** Esta página es una traducción del proyecto asistida por IA de las instrucciones esenciales de instalación y seguridad. La [guía de instalación en inglés](../../WINDOWS_INSTALLATION.md) sigue siendo la referencia canónica del proyecto. Se agradecen correcciones de idioma y terminología.

## 1. Descargar únicamente desde la versión oficial

The Safex Mine es una aplicación **sin firma** para Windows x64 que incluye un minero de CPU, un ayudante con elevación y el controlador WinRing. Descarga el instalador únicamente desde la publicación oficial de GitHub del proyecto.

## 2. Verificar SHA-256 **antes de ejecutar**

En PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Compara cuidadosamente el resultado con el SHA-256 publicado junto a la versión.

**Si Microsoft Defender pone el instalador en cuarentena inmediatamente después de descargarlo:** primero restaura/permite **solo ese instalador descargado**, después calcula su SHA-256 y **no lo ejecutes** a menos que coincida con el valor oficial.

## 3. SmartScreen y antivirus

Al ser una versión sin firma y contener componentes de minería, SmartScreen u otros productos de seguridad pueden mostrar advertencias o poner archivos en cuarentena. Continúa solo después de verificar el origen y el hash.

No desactives el antivirus de forma general. No excluyas Descargas, todo tu perfil de usuario ni unidades completas. Si después de verificar la versión necesitas una exclusión, limítala a:

    %LOCALAPPDATA%\The Safex Mine

## 4. Instalación, idioma y aviso de riesgos

El instalador NSIS normalmente selecciona Español (Internacional) según el idioma de Windows. El idioma de la aplicación puede cambiarse después del inicio.

En el primer inicio se muestra **Mining Risk Acknowledgement — Version 1.0** en el idioma de aplicación compatible que elijas. Léelo antes de continuar. **Exit** cierra la aplicación sin registrar aceptación. El inglés sigue siendo la referencia canónica: [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. Ayudante UAC y MSR

La interfaz gráfica se ejecuta como usuario normal. La primera vez que pulses **Start Mining** en una sesión, Windows pedirá aprobación UAC para:

    safex-mine-helper.exe

Solo ese ayudante se eleva. Inicia y supervisa XMRig y permite intentar la optimización MSR. Si las funciones de seguridad de Windows bloquean MSR, la minería puede continuar con menor rendimiento. No desactives funciones de seguridad únicamente para aumentar el hashrate.

## 6. Desinstalación

La desinstalación elimina la aplicación. Una exclusión de Defender añadida manualmente puede permanecer; elimínala después si ya no la necesitas.

Más ayuda: [solución de problemas en inglés](../../../TROUBLESHOOTING.md).
