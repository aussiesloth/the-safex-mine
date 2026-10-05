# The Safex Mine — Cài đặt Windows và lần sử dụng đầu tiên

> **Bản dịch cộng đồng.** Trang này là bản dịch dự án có hỗ trợ AI của các hướng dẫn thiết yếu về cài đặt và bảo mật. [Hướng dẫn cài đặt tiếng Anh](../../WINDOWS_INSTALLATION.md) vẫn là tài liệu tham chiếu chuẩn của dự án. Hoan nghênh các sửa đổi về ngôn ngữ và thuật ngữ.

## 1. Chỉ tải từ bản phát hành chính thức

The Safex Mine là ứng dụng Windows x64 **không ký số**, bao gồm trình đào CPU, tiến trình trợ giúp chạy với quyền nâng cao và trình điều khiển WinRing. Chỉ tải trình cài đặt từ bản phát hành GitHub chính thức của dự án.

## 2. Xác minh SHA-256 **trước khi chạy**

Trong PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

So sánh cẩn thận kết quả với SHA-256 được công bố cùng bản phát hành.

**Nếu Microsoft Defender cách ly trình cài đặt ngay sau khi tải xuống:** trước tiên chỉ khôi phục/cho phép **đúng tệp trình cài đặt vừa tải đó**, sau đó tính SHA-256 và **không chạy** cho đến khi hash khớp với giá trị chính thức.

## 3. SmartScreen và phần mềm chống virus

Vì bản phát hành không ký số và chứa thành phần đào tiền mã hóa, SmartScreen hoặc sản phẩm bảo mật khác có thể cảnh báo hoặc cách ly tệp. Chỉ tiếp tục sau khi đã xác minh nguồn và hash.

Không tắt rộng rãi phần mềm chống virus. Không loại trừ Downloads, toàn bộ hồ sơ người dùng hoặc cả ổ đĩa. Nếu sau khi xác minh bản phát hành thực sự cần ngoại lệ, chỉ giới hạn ở:

    %LOCALAPPDATA%\The Safex Mine

## 4. Cài đặt, ngôn ngữ và thông báo rủi ro

Trình cài đặt NSIS thường tự động chọn Tiếng Việt theo ngôn ngữ hiển thị của Windows. Ngôn ngữ ứng dụng vẫn có thể đổi sau khi khởi động.

Ở lần chạy đầu tiên, **Mining Risk Acknowledgement — Version 1.0** được hiển thị bằng ngôn ngữ ứng dụng được hỗ trợ mà bạn chọn. Hãy đọc trước khi tiếp tục. **Exit** đóng ứng dụng mà không lưu chấp thuận. Tiếng Anh vẫn là tham chiếu chuẩn: [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. Trợ giúp UAC và MSR

Ứng dụng đồ họa chạy với quyền người dùng thông thường. Ở lần **Start Mining** đầu tiên trong một phiên, Windows yêu cầu phê duyệt UAC cho:

    safex-mine-helper.exe

Chỉ tiến trình trợ giúp này được nâng quyền. Nó khởi chạy và giám sát XMRig, đồng thời cho phép thử tối ưu hóa MSR. Nếu bảo mật Windows chặn MSR, việc đào vẫn có thể tiếp tục với hiệu năng thấp hơn. Không tắt tính năng bảo mật chỉ để tăng hashrate.

## 6. Gỡ cài đặt

Gỡ cài đặt sẽ xóa ứng dụng. Ngoại lệ Defender do bạn thêm thủ công có thể vẫn còn; hãy xóa sau đó nếu không còn cần thiết.

Trợ giúp thêm: [khắc phục sự cố bằng tiếng Anh](../../../TROUBLESHOOTING.md).
