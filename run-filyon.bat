@echo off
chcp 65001 >nul
title FILYON: Makine Ikmal ve Filo Bilgi Sistemi Baslatici

echo =======================================================================
echo          FILYON: SIRADAKI NESIL FILO VE MAKINE IKMAL SISTEMI
echo               Sayistay Uyumlu ve Offline-First Platform
echo =======================================================================
echo.

:: Node.js Kontrolu
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Node.js sisteminizde bulunamadi!
    echo Lutfen https://nodejs.org adresinden Node.js yukleyiniz.
    pause
    exit /b
)

echo [1/3] Frontend bagimliliklari kontrol ediliyor...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Paketler ilk defa kuruluyor, lutfen bekleyiniz...
    call npm install
)

echo.
echo [2/3] FILYON Web Yonetim Paneli Baslatiliyor...
echo.
echo =======================================================================
echo   Web Yonetim Paneli Adresi: http://localhost:3000
echo   Giris Ekraninda 'Tek Tikla Demo' ile tum rolleri deneyebilirsiniz:
echo   - Yonetici (Admin)      - Filo Muduru (Manager)
echo   - Atolye Sefi (Chief)   - Bas Usta (Mechanic)
echo   - Ambarci (Storekeeper) - Sofor/Operator (Driver)
echo =======================================================================
echo.

start http://localhost:3000
npm run dev

pause
