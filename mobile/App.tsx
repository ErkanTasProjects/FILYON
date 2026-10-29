import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { offlineSyncService, QueuedIssueReport } from './src/services/offlineSync';

export default function App() {
  // Mobile active role: DRIVER or MECHANIC
  const [activeRole, setActiveRole] = useState<'DRIVER' | 'MECHANIC'>('DRIVER');
  const [isOnline, setIsOnline] = useState<boolean>(false); // Offline default to demo offline capabilities

  // Driver Zimmet State
  const [scannedPlate, setScannedPlate] = useState('06 FLN 101');
  const [zimmetActive, setZimmetActive] = useState(false);
  const [zimmetMeter, setZimmetMeter] = useState('142,500 KM');

  // Arıza Bildirimi State
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  // Mechanic Hurda Kilidi State
  const [scrapPhotoUploaded, setScrapPhotoUploaded] = useState(false);
  const [scrapApproved, setScrapApproved] = useState(false);

  // Sürücü Kabin QR Okutma
  const handleScanCabinQr = () => {
    // 06 FLN 303 test muayene kilidi
    if (scannedPlate === '06 FLN 303') {
      Alert.alert(
        '🚨 MUAYENE KİLİDİ DEVREDE!',
        '06 FLN 303 plakalı aracın TÜVTÜRK yasal muayene süresi dolmuştur. Araç sistem tarafından otomatik kilitlenmiştir ve zimmetlenemez!',
        [{ text: 'Anladım' }]
      );
      return;
    }

    setZimmetActive(true);
    Alert.alert(
      '✅ QR Kod Doğrulandı',
      `${scannedPlate} plakalı araç kabin QR kodu başarıyla doğrulandı ve adınıza zimmetlendi. İyi yolculuklar!`,
      [{ text: 'Tamam' }]
    );
  };

  // Arıza Bildirimi Gönderme (Offline-First)
  const handleSubmitIssue = async () => {
    if (!issueTitle || !issueDesc) {
      Alert.alert('Eksik Bilgi', 'Lütfen arıza başlığı ve açıklamasını yazınız.');
      return;
    }

    if (!hasPhoto || !hasAudio) {
      Alert.alert(
        '⚠️ Medya Zorunluluğu',
        'FILYON Saha Yönergesi gereği arıza bildiriminde en az 1 adet fotoğraf çekilmeli ve sesli not kaydedilmelidir.'
      );
      return;
    }

    await offlineSyncService.enqueueIssue({
      vehiclePlate: scannedPlate,
      title: issueTitle,
      description: issueDesc,
      priority: 'HIGH',
      photoUris: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'],
      audioRecordingUri: 'local-voice-record-01.mp3',
      voiceTranscript: 'Sol arka tekerden aşırı fren sürtünme sesi ve balata kokusu geldi.',
      latitude: 39.92077,
      longitude: 32.85411,
    });

    setQueueCount(offlineSyncService.getPendingCount());
    setIssueTitle('');
    setIssueDesc('');
    setHasPhoto(false);
    setHasAudio(false);

    if (!isOnline) {
      Alert.alert(
        '💾 Çevrimdışı Kaydedildi',
        'İnternet bağlantısı olmadığı için arıza kaydı telefon hafızasına kaydedildi. Şebeke geldiğinde otomatik sunucuya aktarılacaktır.'
      );
    } else {
      Alert.alert('✅ Başarılı', 'Arıza bildirimi Atölye Şefliğine anında iletildi.');
    }
  };

  // İnternet Geldiğinde Senkronize Et
  const handleSyncNow = async () => {
    setIsOnline(true);
    const result = await offlineSyncService.syncPending('https://api.filyon.gov.tr', 'mock-token');
    setQueueCount(offlineSyncService.getPendingCount());
    Alert.alert('☁️ Senkronizasyon Tamamlandı', `${result.syncedCount} adet çevrimdışı arıza kaydı sunucuya başarıyla aktarıldı!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoTitle}>FILYON SAHA</Text>
          <Text style={styles.logoSub}>Mobil Filo & Makine İkmal</Text>
        </View>

        {/* Online / Offline Toggle */}
        <TouchableOpacity
          style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeOffline]}
          onPress={() => setIsOnline(!isOnline)}
        >
          <Text style={styles.badgeText}>
            {isOnline ? '🟢 ÇEVRİMİÇİ' : '🟠 ÇEVRİMDISI MOD'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Role Switcher */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, activeRole === 'DRIVER' && styles.roleButtonActive]}
          onPress={() => setActiveRole('DRIVER')}
        >
          <Text style={[styles.roleButtonText, activeRole === 'DRIVER' && styles.roleButtonTextActive]}>
            ŞOFÖR & OPERATÖR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, activeRole === 'MECHANIC' && styles.roleButtonActive]}
          onPress={() => setActiveRole('MECHANIC')}
        >
          <Text style={[styles.roleButtonText, activeRole === 'MECHANIC' && styles.roleButtonTextActive]}>
            USTA & AMBAR
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ===================== ŞOFÖR MODÜLÜ ===================== */}
        {activeRole === 'DRIVER' ? (
          <View style={styles.moduleWrapper}>
            {/* 1. Kabin QR Zimmet */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🚗 Kabin QR Zimmet & Teslim Alma</Text>
              <Text style={styles.cardDesc}>
                Araç direksiyon yanındaki kabin QR kodunu telefon kamerasıyla okutunuz.
              </Text>

              <View style={styles.plateSelector}>
                <TouchableOpacity
                  style={[styles.plateChip, scannedPlate === '06 FLN 101' && styles.plateChipActive]}
                  onPress={() => setScannedPlate('06 FLN 101')}
                >
                  <Text style={styles.plateChipText}>06 FLN 101 (Actros)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.plateChip, scannedPlate === '06 FLN 303' && styles.plateChipActiveRose]}
                  onPress={() => setScannedPlate('06 FLN 303')}
                >
                  <Text style={styles.plateChipText}>06 FLN 303 (Kilitli)</Text>
                </TouchableOpacity>
              </View>

              {zimmetActive ? (
                <View style={styles.activeZimmetBox}>
                  <Text style={styles.activeZimmetTitle}>✅ AKTİF ZİMMET SİZDE</Text>
                  <Text style={styles.activeZimmetSub}>Plaka: {scannedPlate} • Sayaç: {zimmetMeter}</Text>
                  <TouchableOpacity
                    style={styles.returnButton}
                    onPress={() => {
                      setZimmetActive(false);
                      Alert.alert('İade Edildi', 'Araç teslimi sonlandırıldı ve sayaç güncellendi.');
                    }}
                  >
                    <Text style={styles.returnButtonText}>Aracı İade Et / Teslim Bırak</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.actionButton} onPress={handleScanCabinQr}>
                  <Text style={styles.actionButtonText}>📷 Kabin QR Kodu Okut & Teslim Al</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 2. Arıza Bildirimi (Fotoğraf + Ses Zorunluluğu) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>⚠️ Arıza Bildirimi (Fotoğraf & Sesli Not)</Text>
              <Text style={styles.cardDesc}>
                Saha arızalarında fotoğraf çekmek ve ses kaydı eklemek zorunludur.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Arıza Başlığı (Örn: Fren hava kaçağı)"
                placeholderTextColor="#64748b"
                value={issueTitle}
                onChangeText={setIssueTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Arıza açıklaması ve hissedilen sorun..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
                value={issueDesc}
                onChangeText={setIssueDesc}
              />

              {/* Medya Butonları */}
              <View style={styles.mediaRow}>
                <TouchableOpacity
                  style={[styles.mediaButton, hasPhoto && styles.mediaButtonActive]}
                  onPress={() => setHasPhoto(true)}
                >
                  <Text style={styles.mediaButtonText}>
                    {hasPhoto ? '✓ Fotoğraf Çekildi' : '📸 Fotoğraf Çek'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mediaButton, hasAudio && styles.mediaButtonActive]}
                  onPress={() => setHasAudio(true)}
                >
                  <Text style={styles.mediaButtonText}>
                    {hasAudio ? '✓ Ses Kaydedildi (0:24)' : '🎙️ Ses Kaydı Al'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitIssue}>
                <Text style={styles.submitButtonText}>Arıza Bildirimini Kaydet</Text>
              </TouchableOpacity>
            </View>

            {/* 3. Çevrimdışı Kuyruk Bilgisi */}
            {queueCount > 0 && (
              <View style={styles.offlineBox}>
                <Text style={styles.offlineText}>
                  💾 Telefonda bekleyen {queueCount} adet çevrimdışı bildirim var.
                </Text>
                <TouchableOpacity style={styles.syncButton} onPress={handleSyncNow}>
                  <Text style={styles.syncButtonText}>Şimdi Senkronize Et (İnternet Bağlandı)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* ===================== USTA & AMBAR MODÜLÜ ===================== */
          <View style={styles.moduleWrapper}>
            {/* Usta İş Emri ve Sayıştay Hurda Kilidi */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔧 Atanan İş Emri: WO-2026-00109</Text>
              <Text style={styles.cardDesc}>
                Araç: 06 FLN 404 (MAN Vidanjör) • Sol Arka Balata & Kaliper Değişimi
              </Text>

              {/* Şoförün Ses Kaydı ve Fotoğrafı */}
              <View style={styles.driverNoteBox}>
                <Text style={styles.driverNoteTitle}>Şoför Ali Kaya'nın Sesli Notu:</Text>
                <Text style={styles.driverNoteDesc}>
                  "Ustam iyi günler, sol arkadan aşırı koku ve duman geldi, teker göbeği çok sıcak."
                </Text>
              </View>

              {/* Sayıştay Hurda Kilidi */}
              <View style={styles.scrapLockSection}>
                <Text style={styles.scrapLockTitle}>🔒 Sayıştay Hurda Parça Kilidi</Text>
                <Text style={styles.scrapLockDesc}>
                  Yeni balata takıldığı için sökülen eski hurda balatanın fotoğrafı çekilip ambara teslim edilmelidir.
                </Text>

                <TouchableOpacity
                  style={[styles.actionButton, scrapPhotoUploaded && styles.actionButtonSuccess]}
                  onPress={() => {
                    setScrapPhotoUploaded(true);
                    Alert.alert('Fotoğraf Yüklendi', 'Sökülen hurda parçanın net fotoğrafı sisteme işlendi.');
                  }}
                >
                  <Text style={styles.actionButtonText}>
                    {scrapPhotoUploaded ? '✓ Hurda Fotoğrafı Yüklendi' : '📸 Sökülen Hurda Parçayı Fotoğrafla'}
                  </Text>
                </TouchableOpacity>

                {/* Ambar Onayı */}
                <TouchableOpacity
                  style={[styles.returnButton, scrapApproved && styles.actionButtonSuccess]}
                  onPress={() => {
                    if (!scrapPhotoUploaded) {
                      Alert.alert('Uyarı', 'Önce hurda fotoğrafı yüklenmelidir.');
                      return;
                    }
                    setScrapApproved(true);
                    Alert.alert('Ambar Onayı Alındı', 'Hurda balata ambar yetkilisi Ahmet Çelik tarafından teslim alındı.');
                  }}
                >
                  <Text style={styles.returnButtonText}>
                    {scrapApproved ? '✓ Ambar Tarafından Onaylandı' : '📦 Ambar Yetkilisinden Hurda Onayı İste'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* İş Emrini Kapat */}
              <TouchableOpacity
                style={[styles.submitButton, (!scrapPhotoUploaded || !scrapApproved) && styles.disabledButton]}
                onPress={() => {
                  if (!scrapPhotoUploaded || !scrapApproved) {
                    Alert.alert(
                      '🚨 SAYIŞTAY HURDA KİLİDİ DEVREDE!',
                      'Sökülen hurda parça fotoğrafı olmadan ve ambar teslimi onaylanmadan iş emrini kapatamazsınız!'
                    );
                    return;
                  }
                  Alert.alert('✅ Başarılı', 'İş emri başarıyla kapatıldı ve araç sefere hazırlandı!');
                }}
              >
                <Text style={styles.submitButtonText}>İş Emrini Tamamla ve Kapat</Text>
              </TouchableOpacity>
            </View>

            {/* Parça Barkodu Okutma */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📦 Ambar Barkod Okutma & Parça Talebi</Text>
              <Text style={styles.cardDesc}>
                Ambardan parça alırken parça üzerindeki karekod veya barkodu okutunuz.
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => Alert.alert('Barkod Okundu', 'FLN-BRK-001 (Fren Balata Takımı) ambardan talep edildi.')}
              >
                <Text style={styles.actionButtonText}>📷 Parça Barkodunu Tara</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#06b6d4',
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeOffline: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  roleContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0f172a',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: '#06b6d4',
  },
  roleButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  roleButtonTextActive: {
    color: '#090d16',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  moduleWrapper: {
    gap: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 14,
  },
  plateSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  plateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1e293b',
  },
  plateChipActive: {
    backgroundColor: '#0284c7',
  },
  plateChipActiveRose: {
    backgroundColor: '#e11d48',
  },
  plateChipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionButton: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonSuccess: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#090d16',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeZimmetBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 14,
    padding: 12,
  },
  activeZimmetTitle: {
    color: '#06b6d4',
    fontWeight: 'bold',
    fontSize: 13,
  },
  activeZimmetSub: {
    color: '#cbd5e1',
    fontSize: 11,
    marginVertical: 4,
  },
  returnButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  returnButtonText: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 11,
  },
  input: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 10,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  mediaButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
  },
  mediaButtonText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#334155',
  },
  submitButtonText: {
    color: '#090d16',
    fontWeight: 'bold',
    fontSize: 12,
  },
  offlineBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 16,
    padding: 14,
  },
  offlineText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  syncButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#090d16',
    fontWeight: 'bold',
    fontSize: 11,
  },
  driverNoteBox: {
    backgroundColor: '#090d16',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  driverNoteTitle: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  driverNoteDesc: {
    color: '#94a3b8',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  scrapLockSection: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  scrapLockTitle: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scrapLockDesc: {
    color: '#cbd5e1',
    fontSize: 10,
    marginVertical: 4,
  },
});
