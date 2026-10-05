# The Safex Mine — Windows ইনস্টলেশন ও প্রথম ব্যবহার

> **কমিউনিটি অনুবাদ।** এই পৃষ্ঠাটি প্রয়োজনীয় ইনস্টলেশন ও নিরাপত্তা নির্দেশনার AI-সহায়তাপ্রাপ্ত প্রকল্প অনুবাদ। [ইংরেজি ইনস্টলেশন গাইড](../../WINDOWS_INSTALLATION.md) প্রকল্পের canonical রেফারেন্স হিসেবে থাকবে। ভাষা ও পরিভাষা সংশোধন স্বাগত।

## 1. শুধু অফিসিয়াল রিলিজ থেকে ডাউনলোড করুন

The Safex Mine একটি **unsigned** Windows x64 অ্যাপ, যাতে CPU miner, elevated helper এবং WinRing driver রয়েছে। ইনস্টলার শুধু প্রকল্পের অফিসিয়াল GitHub Release থেকে ডাউনলোড করুন।

## 2. চালানোর **আগে** SHA-256 যাচাই করুন

PowerShell-এ:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

রিলিজের সঙ্গে প্রকাশিত SHA-256 মানের সঙ্গে ফলাফলটি সতর্কভাবে মিলিয়ে দেখুন।

**Microsoft Defender ডাউনলোডের পরপরই ইনস্টলার quarantine করলে:** প্রথমে **শুধু ওই নির্দিষ্ট ডাউনলোড করা ইনস্টলারটিকেই** restore/allow করুন, তারপর তার SHA-256 হিসাব করুন এবং hash অফিসিয়াল মানের সঙ্গে না মেলা পর্যন্ত **চালাবেন না**।

## 3. SmartScreen ও antivirus

রিলিজটি unsigned এবং এতে mining components রয়েছে, তাই SmartScreen বা অন্য security product সতর্কতা দেখাতে বা ফাইল quarantine করতে পারে। source এবং hash যাচাই করার পরেই এগিয়ে যান।

Antivirus ব্যাপকভাবে বন্ধ করবেন না। Downloads, পুরো user profile বা পুরো drive exclusion-এ দেবেন না। রিলিজ যাচাইয়ের পরে সত্যিই exclusion দরকার হলে শুধু এই ফোল্ডারে সীমাবদ্ধ রাখুন:

    %LOCALAPPDATA%\The Safex Mine

## 4. ইনস্টলেশন, ভাষা ও ঝুঁকি-সংক্রান্ত নোটিশ

**বাংলার জন্য installer UI ইংরেজিতে থাকবে**, কারণ NSIS 3.11-এ Bengali installer language নেই। অ্যাপ চালু হওয়ার পরে application language হিসেবে বাংলা বেছে নেওয়া যাবে।

প্রথমবার চালানোর সময় নির্বাচিত সমর্থিত application language-এ **Mining Risk Acknowledgement — Version 1.0** দেখানো হয়। এগোনোর আগে পড়ুন। **Exit** acceptance সংরক্ষণ না করেই অ্যাপ বন্ধ করে। ইংরেজি canonical রেফারেন্স: [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC helper ও MSR

Graphical app সাধারণ user হিসেবে চলে। একটি session-এ প্রথম **Start Mining** করার সময় Windows এই ফাইলের জন্য UAC approval চায়:

    safex-mine-helper.exe

শুধু এই helper-ই elevated হয়। এটি XMRig চালু ও supervise করে এবং MSR optimisation চেষ্টা করতে দেয়। Windows security MSR block করলে mining কম performance-এ চলতে পারে। শুধু বেশি hashrate-এর জন্য security feature বন্ধ করবেন না।

## 6. Uninstall

Uninstall করলে application সরবে। আপনি manually যোগ করা Defender exclusion থেকে যেতে পারে; আর দরকার না হলে পরে manually সরিয়ে দিন।

আরও সহায়তা: [ইংরেজি troubleshooting](../../../TROUBLESHOOTING.md).
