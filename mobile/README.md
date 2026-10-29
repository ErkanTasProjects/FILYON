# FILYON Saha Mobil Uygulaması (Offline-First)

React Native & Expo tabanlı, şoförler ve atölye mekanik personeli için çevrimdışı öncelikli (Offline-First) saha uygulaması.

## Özellikler

1. **Şoför / Operatör Modülü**:
   - **Kabin QR Zimmet**: Araç kabinindeki QR kodu kamera ile tarayarak anında aracı teslim alma ve teslim bırakma.
   - **Muayene Kilidi**: Yasal muayenesi geçmiş aracı okuttuğunda sistem sefere çıkışı otomatik kilitler.
   - **Arıza Bildirimi**: Fotoğraf ve sesli not kaydı zorunlu form.
   - **Çevrimdışı Destek**: Şebeke olmayan yerlerde arızalar yerel telefona kaydedilir, internet gelince tek tıkla senkronize edilir.

2. **Usta & Atölye Modülü**:
   - **İş Emirleri & Ses Dinleme**: Şoförün kaydettiği sesli arıza anlatımını ve fotoğraflarını inceleme.
   - **Sayıştay Hurda Kilidi**: Sökülen eski parçanın hurda fotoğrafını yükleme ve ambardan onay isteme.
   - **Barkodlu Parça Talebi**: Ambar stoklarından parça barkodu okutarak anında iş emrine tahsis.

## Çalıştırma

```bash
cd mobile
npm install
npx expo start
```
Expo Go uygulamasını telefonunuza yükleyip ekrandaki QR kodu okutabilirsiniz.
