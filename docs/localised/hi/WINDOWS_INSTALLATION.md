# The Safex Mine — Windows इंस्टॉलेशन और पहली बार उपयोग

> **समुदाय अनुवाद।** यह पृष्ठ आवश्यक इंस्टॉलेशन और सुरक्षा निर्देशों का AI-सहायता प्राप्त परियोजना अनुवाद है। [अंग्रेज़ी इंस्टॉलेशन गाइड](../../WINDOWS_INSTALLATION.md) परियोजना का canonical संदर्भ बना रहता है। भाषा और शब्दावली सुधारों का स्वागत है।

## 1. केवल आधिकारिक रिलीज़ से डाउनलोड करें

The Safex Mine एक **unsigned** Windows x64 ऐप है जिसमें CPU miner, elevated helper और WinRing driver शामिल हैं। इंस्टॉलर केवल परियोजना की आधिकारिक GitHub Release से डाउनलोड करें।

## 2. चलाने से **पहले** SHA-256 सत्यापित करें

PowerShell में:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

परिणाम को रिलीज़ के साथ प्रकाशित SHA-256 से ध्यानपूर्वक मिलाएँ।

**यदि Microsoft Defender डाउनलोड के तुरंत बाद इंस्टॉलर को quarantine कर देता है:** पहले **उसी विशेष डाउनलोड किए गए इंस्टॉलर को ही** restore/allow करें, फिर उसका SHA-256 निकालें और जब तक hash आधिकारिक मान से मेल न खाए, उसे **न चलाएँ**।

## 3. SmartScreen और antivirus

रिलीज़ unsigned है और उसमें mining components शामिल हैं, इसलिए SmartScreen या अन्य security product चेतावनी दे सकता है या फाइलों को quarantine कर सकता है। source और hash सत्यापित करने के बाद ही आगे बढ़ें।

Antivirus को व्यापक रूप से बंद न करें। Downloads, पूरा user profile या पूरी drive को exclusion में न डालें। यदि रिलीज़ सत्यापित करने के बाद वास्तव में exclusion आवश्यक हो, तो इसे केवल यहाँ तक सीमित रखें:

    %LOCALAPPDATA%\The Safex Mine

## 4. इंस्टॉलेशन, भाषा और जोखिम सूचना

NSIS इंस्टॉलर सामान्यतः Windows display language के आधार पर हिन्दी चुनता है। ऐप शुरू होने के बाद application language बदली जा सकती है।

पहली बार चलाने पर चुनी गई समर्थित application language में **Mining Risk Acknowledgement — Version 1.0** दिखाया जाता है। आगे बढ़ने से पहले इसे पढ़ें। **Exit** बिना acceptance सहेजे ऐप बंद करता है। अंग्रेज़ी canonical संदर्भ है: [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC helper और MSR

Graphical app सामान्य user के रूप में चलता है। किसी session में पहली बार **Start Mining** करने पर Windows इस file के लिए UAC approval माँगता है:

    safex-mine-helper.exe

केवल यही helper elevated होता है। यह XMRig को शुरू और supervise करता है तथा MSR optimisation का प्रयास संभव बनाता है। यदि Windows security MSR को block करती है, तो mining कम performance के साथ जारी रह सकती है। केवल अधिक hashrate पाने के लिए सुरक्षा सुविधाएँ बंद न करें।

## 6. Uninstall

Uninstall से application हट जाती है। आपके द्वारा manually जोड़ा गया Defender exclusion रह सकता है; जरूरत न रहने पर उसे बाद में manually हटाएँ।

अधिक सहायता: [अंग्रेज़ी troubleshooting](../../../TROUBLESHOOTING.md).
