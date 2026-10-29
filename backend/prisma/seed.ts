/**
 * FILYON: Makine İkmal ve Filo Bilgi Sistemi
 * Prisma Database Seed Script
 * 
 * Bu betik; denetim, filo operasyonu, atölye iş emirleri, hurda kilidi ve
 * ambar stok hareketleri için gerçekçi kurumsal test verilerini oluşturur.
 */

import { PrismaClient, UserRole, MeterType, VehicleStatus, IssuePriority, IssueStatus, WorkOrderStatus, ScrapStatus, PartTransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 FILYON Veritabanı tohumlama (seed) işlemi başlatılıyor...');

  // 1. TENANT OLUŞTUR
  const tenant = await prisma.tenant.upsert({
    where: { code: 'FILYON-DEMO-2026' },
    update: {},
    create: {
      code: 'FILYON-DEMO-2026',
      name: 'FILYON Büyükşehir Makine İkmal ve Filo İşletmeleri',
      taxNumber: '3880491820',
      contactPhone: '+90 (312) 555 40 00',
      contactEmail: 'ikmal@filyon.gov.tr',
      address: 'Merkez Atölye ve İkmal Tesisleri, No: 44, Ankara',
      logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    },
  });

  console.log(`✅ Tenant oluşturuldu: ${tenant.name} (${tenant.code})`);

  // 2. KULLANICILAR (Tüm Roller: Admin, Manager, Chief, Mechanic, Storekeeper, Driver)
  // Şifreler demo için bcrypt eşdeğeri olarak kurgulanmıştır
  const passwordHash = '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ec5Pyb62D72w50.O2'; // demo123

  const usersData = [
    {
      email: 'admin@filyon.gov.tr',
      firstName: 'Kemal',
      lastName: 'Öztürk',
      role: UserRole.ADMIN,
      phone: '+90 532 100 0001',
      nationalId: '10928374650',
    },
    {
      email: 'mudur@filyon.gov.tr',
      firstName: 'Selim',
      lastName: 'Aksoy',
      role: UserRole.MANAGER,
      phone: '+90 532 100 0002',
      nationalId: '20938475611',
    },
    {
      email: 'seffuat@filyon.gov.tr',
      firstName: 'Fuat',
      lastName: 'Yılmaz',
      role: UserRole.CHIEF,
      phone: '+90 532 100 0003',
      nationalId: '30948576122',
    },
    {
      email: 'usta.mehmet@filyon.gov.tr',
      firstName: 'Mehmet',
      lastName: 'Demir',
      role: UserRole.MECHANIC,
      phone: '+90 532 100 0004',
      nationalId: '40958677233',
    },
    {
      email: 'ambar.ahmet@filyon.gov.tr',
      firstName: 'Ahmet',
      lastName: 'Çelik',
      role: UserRole.STOREKEEPER,
      phone: '+90 532 100 0005',
      nationalId: '50968778344',
    },
    {
      email: 'sofor.ali@filyon.gov.tr',
      firstName: 'Ali',
      lastName: 'Kaya',
      role: UserRole.DRIVER,
      phone: '+90 532 100 0006',
      nationalId: '60978879455',
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: u.email,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        phone: u.phone,
        nationalId: u.nationalId,
      },
    });
    createdUsers[u.role] = user;
    console.log(`👤 Kullanıcı oluşturuldu: ${user.firstName} ${user.lastName} [${user.role}]`);
  }

  // 3. ARAÇLAR & İŞ MAKİNELERİ
  // Biri Muayene Kilidi testini göstermek üzere bilerek muayenesi geçmiş (INSPECTION_EXPIRED) olarak oluşturulur!
  const today = new Date();
  const pastDate = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 gün önce geçti
  const futureDate = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 ay sonra

  const vehiclesData = [
    {
      plateNumber: '06 FLN 101',
      brand: 'Mercedes-Benz',
      model: 'Actros 1845 L',
      year: 2023,
      category: 'Ağır Ticari Çekici',
      meterType: MeterType.KM,
      currentMeter: 142500,
      chassisNumber: 'WDB9634031L890123',
      engineNumber: 'OM471LA-45091',
      status: VehicleStatus.AVAILABLE,
      lastInspectionDate: new Date('2024-03-10'),
      nextInspectionDate: futureDate,
      insuranceExpiryDate: futureDate,
      fuelType: 'Dizel',
      assignedDepartment: 'Lojistik ve Sevkiyat Dairesi',
    },
    {
      plateNumber: '06 FLN 202',
      brand: 'Caterpillar',
      model: '320D Paletli Ekskavatör',
      year: 2021,
      category: 'Ağır İş Makinesi',
      meterType: MeterType.WORKING_HOUR,
      currentMeter: 4890,
      chassisNumber: 'CAT0320DPK10928',
      engineNumber: 'CAT-C7.1-9981',
      status: VehicleStatus.ASSIGNED,
      lastInspectionDate: new Date('2024-01-15'),
      nextInspectionDate: futureDate,
      insuranceExpiryDate: futureDate,
      fuelType: 'Dizel',
      assignedDepartment: 'Fen İşleri Yol Yapım',
    },
    {
      plateNumber: '06 FLN 303',
      brand: 'Ford',
      model: 'Cargo 2533 Damperli Kamyon',
      year: 2020,
      category: 'Hafriyat Kamyonu',
      meterType: MeterType.KM,
      currentMeter: 231400,
      chassisNumber: 'NM0HXXTT1H10948',
      engineNumber: 'ECOTORQ9L-201',
      status: VehicleStatus.INSPECTION_EXPIRED, // ⚠️ MUAYENE KİLİDİ AKTİF!
      lastInspectionDate: new Date('2023-10-01'),
      nextInspectionDate: pastDate, // Süresi geçmiş
      insuranceExpiryDate: pastDate,
      fuelType: 'Dizel',
      assignedDepartment: 'Altyapı ve Asfalt Şube',
      notes: 'Yasal muayene süresi doldu. Sistem tarafından otomatik olarak Göreve Uygun Değil durumuna alındı.',
    },
    {
      plateNumber: '06 FLN 404',
      brand: 'MAN',
      model: 'TGS 33.400 Vidanjör',
      year: 2022,
      category: 'Belediye Hizmet Aracı',
      meterType: MeterType.KM,
      currentMeter: 87600,
      chassisNumber: 'WMA06XZZ2M39811',
      engineNumber: 'D2066LF-119',
      status: VehicleStatus.UNDER_MAINTENANCE,
      lastInspectionDate: new Date('2024-04-01'),
      nextInspectionDate: futureDate,
      insuranceExpiryDate: futureDate,
      fuelType: 'Dizel',
      assignedDepartment: 'Kanalizasyon ve Arıtma',
    },
  ];

  const createdVehicles: Record<string, any> = {};

  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.upsert({
      where: {
        tenantId_plateNumber: {
          tenantId: tenant.id,
          plateNumber: v.plateNumber,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        ...v,
      },
    });
    createdVehicles[v.plateNumber] = vehicle;
    console.log(`🚛 Araç oluşturuldu: ${vehicle.plateNumber} (${vehicle.brand} ${vehicle.model}) [${vehicle.status}]`);
  }

  // 4. AMBAR & YEDEK PARÇALAR (OEM Kodları, Raf Konumları, Asgari Stok Seviyeleri)
  const partsData = [
    {
      partCode: 'FLN-BRK-001',
      oemCode: 'A0004202220',
      name: 'Ön Fren Balata Takımı (Ağır Vasıta)',
      category: 'Fren Sistemi',
      unit: 'TAKIM',
      unitPrice: 4250.0,
      stockQuantity: 18,
      minStockLevel: 5,
      shelfLocation: 'A-02-RAF-03',
      barcode: '869001234001',
      compatibleVehicles: 'Mercedes Actros, Axor, Travego',
    },
    {
      partCode: 'FLN-FLT-102',
      oemCode: '1R-0716',
      name: 'Yüksek Basınçlı Motor Yağ Filtresi',
      category: 'Filtre Grubu',
      unit: 'ADET',
      unitPrice: 1350.0,
      stockQuantity: 4, // ⚠️ Asgari stok uyarısı (min: 8)
      minStockLevel: 8,
      shelfLocation: 'B-01-RAF-01',
      barcode: '869001234002',
      compatibleVehicles: 'Caterpillar 320D, 330D',
    },
    {
      partCode: 'FLN-HYD-505',
      oemCode: 'HYD-ISO-46-200L',
      name: 'Hidrolik Sistem Yağı ISO VG 46 (200 Litre Varil)',
      category: 'Madeni Yağ & Kimyasal',
      unit: 'VARIL',
      unitPrice: 28500.0,
      stockQuantity: 7,
      minStockLevel: 3,
      shelfLocation: 'DEPO-VARIL-01',
      barcode: '869001234003',
      compatibleVehicles: 'Tüm Ekskavatör ve Vinçler',
    },
    {
      partCode: 'FLN-ENG-303',
      oemCode: '0445120236',
      name: 'Common Rail Dizel Enjektör Takımı',
      category: 'Motor & Yakıt',
      unit: 'ADET',
      unitPrice: 18900.0,
      stockQuantity: 3,
      minStockLevel: 2,
      shelfLocation: 'KASA-OZEL-04',
      barcode: '869001234004',
      compatibleVehicles: 'Ford Cargo Ecotorq',
    },
  ];

  const createdParts: Record<string, any> = {};

  for (const p of partsData) {
    const part = await prisma.sparePart.upsert({
      where: {
        tenantId_partCode: {
          tenantId: tenant.id,
          partCode: p.partCode,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        ...p,
      },
    });
    createdParts[p.partCode] = part;
    console.log(`📦 Parça oluşturuldu: ${part.name} [OEM: ${part.oemCode}] - Stok: ${part.stockQuantity}`);
  }

  // 5. ŞOFÖR ARIZA BİLDİRİMİ (Ses ve Fotoğraf Kaydı URL'leri)
  const issueReport = await prisma.issueReport.create({
    data: {
      tenantId: tenant.id,
      vehicleId: createdVehicles['06 FLN 404'].id,
      driverId: createdUsers[UserRole.DRIVER].id,
      title: 'Fren Basınç Düşüklüğü ve Aşırı Balata Kokusu',
      description: 'Yokuş aşağı inişte sol arka tekerden yoğun duman ve hava boşalma sesi geldi. Güvenli cebe çektim.',
      priority: IssuePriority.HIGH,
      status: IssueStatus.WORK_ORDER_CREATED,
      photoUrls: [
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
      ],
      audioRecordingUrl: 'https://cdn.filyon.gov.tr/audio/reports/2026-06fln404-driver-note.mp3',
      voiceTranscript: 'Ustam iyi günler, aracın sol arkasından hava kaçırma sesi ve ısınma kokusu geldi, teker göbeği aşırı sıcak.',
      latitude: 39.92077,
      longitude: 32.85411,
      syncedAt: new Date(),
    },
  });
  console.log(`⚠️ Arıza Bildirimi oluşturuldu: ${issueReport.title}`);

  // 6. İŞ EMRİ VE SAYIŞTAY "HURDA KİLİDİ" ÖRNEĞİ
  const workOrder = await prisma.workOrder.create({
    data: {
      tenantId: tenant.id,
      workOrderNumber: 'WO-2026-00109',
      vehicleId: createdVehicles['06 FLN 404'].id,
      chiefId: createdUsers[UserRole.CHIEF].id,
      assignedMechanicId: createdUsers[UserRole.MECHANIC].id,
      issueReportId: issueReport.id,
      title: 'Sol Arka Kaliper ve Balata Değişimi',
      description: 'Sol arka fren balatasının diske sürtmesi sebebiyle aşınmış balatalar söküldü, yeni balata takımı monte ediliyor.',
      priority: IssuePriority.HIGH,
      status: WorkOrderStatus.WAITING_SCRAP_CONFIRMATION, // 🔒 HURDA KİLİDİ DEVREDE!
      laborHours: 3.5,
      laborHourlyRate: 600.0,
      laborCost: 2100.0,
      partsCost: 4250.0,
      totalCost: 6350.0,
      diagnosisNotes: 'Balata demirine kadar aşınmış, kaliper pistonu temizlendi ve yağlandı.',
    },
  });

  // İş Emrine Parça Bağla
  await prisma.workOrderPart.create({
    data: {
      tenantId: tenant.id,
      workOrderId: workOrder.id,
      sparePartId: createdParts['FLN-BRK-001'].id,
      quantity: 1,
      unitPrice: 4250.0,
      totalPrice: 4250.0,
    },
  });

  // Sayıştay Hurda Kilidi Kaydı (Eski çıkan parçanın fotoğrafı yüklendi, Ambar Onayı Bekleniyor)
  await prisma.scrapRecord.create({
    data: {
      tenantId: tenant.id,
      workOrderId: workOrder.id,
      sparePartId: createdParts['FLN-BRK-001'].id,
      scrapPhotoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      scrapQuantity: 1,
      status: ScrapStatus.PENDING_WAREHOUSE_APPROVAL,
      warehouseNotes: 'Usta Mehmet Demir hurda balatayı teslim kutusuna bıraktı, Ambarcı Ahmet Çelik onayı bekleniyor.',
    },
  });

  console.log(`🔒 İş Emri ve Sayıştay Hurda Kilidi oluşturuldu: ${workOrder.workOrderNumber}`);

  // 7. AKTİF ZİMMET KAYDI (QR Kod Doğrulamalı)
  await prisma.zimmet.create({
    data: {
      tenantId: tenant.id,
      vehicleId: createdVehicles['06 FLN 202'].id,
      driverId: createdUsers[UserRole.DRIVER].id,
      assignedByUserId: createdUsers[UserRole.MANAGER].id,
      startingMeter: 4850,
      qrScanVerified: true,
      status: 'ACTIVE',
      checkoutNotes: 'Çalışma saati 4850 olarak kabin QR okutularak teslim alındı. Paletler ve tırnaklar sağlam.',
    },
  });

  console.log('✨ Seed işlemi başarıyla tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Tohumlama hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
