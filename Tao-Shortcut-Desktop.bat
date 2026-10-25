@echo off
title Tao Icon Ngoai Man Hinh Desktop - Xe Dap Duc Huy
color 0a

echo ========================================================
echo   TAO PHIM TAT (SHORTCUT) NGOAI MAN HINH DESKTOP
echo ========================================================
echo.

set SCRIPT_DIR=%~dp0
set VBS_TARGET=%SCRIPT_DIR%Khoi-Dong-An.vbs
set SHORTCUT_PATH=%USERPROFILE%\Desktop\Xe Dap Duc Huy.lnk

:: Su dung PowerShell de tao Shortcut tren Desktop
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%VBS_TARGET%\"'; $s.WorkingDirectory = '%SCRIPT_DIR%'; $s.Description = 'Ung dung quan ly ban hang Xe Dap Duc Huy'; $s.Save()"

echo.
echo [THANH CONG!] 
echo Da tao bieu tuong "Xe Dap Duc Huy" ngay ngoai Man hinh Desktop cua ban!
echo.
echo Tu bay gio:
echo - Ban chi can NHAP DUP vao icon "Xe Dap Duc Huy" ngoai Desktop.
echo - May chu se TU DONG CHAY NGAM (khong he hien cua so den kho chiu).
echo - Cua so ung dung se tu dong mo len nhu 1 phan mem doc lap!
echo.
echo ========================================================
pause
