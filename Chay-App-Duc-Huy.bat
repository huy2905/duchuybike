@echo off
title May Chu Xe Dap Duc Huy
color 0b
echo ========================================================
echo   HE THONG QUAN LY BAN HANG XE DAP THE THAO DUC HUY
echo ========================================================
echo [1/2] Dang khoi dong may chu noi bo... Vui long doi 3 giay...

:: Chuyen ve thu muc hien tai cua file bat
cd /d "%~dp0"

:: Hen gio 3 giay de mo trinh duyet sau khi may chu san sang
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo [2/2] Dang mo ung dung tren trinh duyet...
echo.
echo ========================================================
echo   MAY CHU DANG CHAY TAI: http://localhost:3000
echo   Luu y: KHONG TAT CUA SO NAY trong khi dang lam viec!
echo   (Neu tat cua so nay, may chu se dung va app se bi trang)
echo ========================================================
echo.

:: Khoi chay dev server
npm run dev
