import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { ZimmetPage } from './pages/ZimmetPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { SparePartsPage } from './pages/SparePartsPage';
import { IssueReportsPage } from './pages/IssueReportsPage';
import { ReportsPage } from './pages/ReportsPage';
import { CalendarPage } from './pages/CalendarPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { AuthPage } from './pages/AuthPage';
import { QrCodeModal } from './components/QrCodeModal';
import { HurdaKilidiModal } from './components/HurdaKilidiModal';
import {
  initialVehicles,
  initialZimmets,
  initialWorkOrders,
  initialSpareParts,
  initialIssueReports,
  initialFuelTelemetries,
} from './data/mockData';
import { Vehicle, WorkOrder, ZimmetRecord, SparePart, IssueReport } from './types';


const MainLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application State
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [zimmets, setZimmets] = useState<ZimmetRecord[]>(initialZimmets);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [spareParts, setSpareParts] = useState<SparePart[]>(initialSpareParts);
  const [issueReports, setIssueReports] = useState<IssueReport[]>(initialIssueReports);
  const [telemetries, setTelemetries] = useState(initialFuelTelemetries);

  // Modals state
  const [qrModalVehicle, setQrModalVehicle] = useState<Vehicle | null>(null);
  const [scrapModalWorkOrder, setScrapModalWorkOrder] = useState<WorkOrder | null>(null);

  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => {}} />;
  }


  // Handlers
  const handleAddVehicle = (newVeh: Partial<Vehicle>) => {
    setVehicles([newVeh as Vehicle, ...vehicles]);
  };

  const handleAssignZimmet = (newZimmet: ZimmetRecord) => {
    setZimmets([newZimmet, ...zimmets]);
    // Araç statüsünü ASSIGNED yap
    setVehicles(
      vehicles.map((v) =>
        v.id === newZimmet.vehicleId
          ? { ...v, status: 'ASSIGNED', activeDriverName: newZimmet.driverName }
          : v
      )
    );
  };

  const handleReturnZimmet = (zimmetId: string, returnMeter: number) => {
    const targetZimmet = zimmets.find((z) => z.id === zimmetId);
    if (!targetZimmet) return;

    setZimmets(
      zimmets.map((z) =>
        z.id === zimmetId ? { ...z, status: 'RETURNED', returnMeter } : z
      )
    );

    setVehicles(
      vehicles.map((v) =>
        v.id === targetZimmet.vehicleId
          ? { ...v, status: 'AVAILABLE', currentMeter: returnMeter, activeDriverName: undefined }
          : v
      )
    );
  };

  const handleCreateWorkOrder = (newWo: Partial<WorkOrder>) => {
    setWorkOrders([newWo as WorkOrder, ...workOrders]);
  };

  const handleApproveScrap = (workOrderId: string, scrapId: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === workOrderId) {
          const updatedScraps = wo.scrapRecords.map((s) =>
            s.id === scrapId ? { ...s, status: 'APPROVED' as const, warehouseStaffName: 'Ahmet Çelik (Ambarcı)' } : s
          );
          return { ...wo, scrapRecords: updatedScraps };
        }
        return wo;
      })
    );

    if (scrapModalWorkOrder && scrapModalWorkOrder.id === workOrderId) {
      setScrapModalWorkOrder((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          scrapRecords: prev.scrapRecords.map((s) =>
            s.id === scrapId ? { ...s, status: 'APPROVED' as const, warehouseStaffName: 'Ahmet Çelik (Ambarcı)' } : s
          ),
        };
      });
    }
  };

  const handleUploadScrapPhoto = (workOrderId: string, photoUrl: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === workOrderId) {
          const updatedScraps = wo.scrapRecords.map((s) => ({
            ...s,
            scrapPhotoUrl: photoUrl,
          }));
          return { ...wo, scrapRecords: updatedScraps };
        }
        return wo;
      })
    );

    if (scrapModalWorkOrder && scrapModalWorkOrder.id === workOrderId) {
      setScrapModalWorkOrder((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          scrapRecords: prev.scrapRecords.map((s) => ({
            ...s,
            scrapPhotoUrl: photoUrl,
          })),
        };
      });
    }
  };

  const handleCompleteWorkOrder = (workOrderId: string) => {
    const target = workOrders.find((w) => w.id === workOrderId);
    if (!target) return;

    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === workOrderId
          ? { ...w, status: 'COMPLETED', completedAt: new Date().toLocaleString('tr-TR') }
          : w
      )
    );

    // Araç durumunu tekrar göreve hazır yap
    setVehicles((prev) =>
      prev.map((v) => (v.id === target.vehicleId ? { ...v, status: 'AVAILABLE' } : v))
    );
  };

  const handleStockIn = (partId: string, addedQty: number) => {
    setSpareParts((prev) =>
      prev.map((p) => {
        if (p.id === partId) {
          const newQty = p.stockQuantity + addedQty;
          return {
            ...p,
            stockQuantity: newQty,
            isCriticalStock: newQty <= p.minStockLevel,
          };
        }
        return p;
      })
    );
  };

  const handleUpdatePart = (partId: string, updatedFields: Partial<SparePart>) => {
    setSpareParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, ...updatedFields } : p))
    );
  };


  const handleConvertToWorkOrder = (issue: IssueReport) => {
    const newWo: Partial<WorkOrder> = {
      id: `wo-${Date.now()}`,
      workOrderNumber: `WO-2026-${String(workOrders.length + 1).padStart(5, '0')}`,
      vehicleId: issue.vehicleId,
      vehiclePlate: issue.vehiclePlate,
      vehicleBrandModel: 'MAN TGS 33.400',
      chiefName: 'Fuat Yılmaz (Atölye Şefi)',
      assignedMechanicName: 'Mehmet Demir (Baş Usta)',
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      status: 'ASSIGNED',
      startedAt: new Date().toLocaleString('tr-TR'),
      laborHours: 2.0,
      laborHourlyRate: 600,
      laborCost: 1200,
      partsCost: 0,
      totalCost: 1200,
      usedParts: [],
      scrapRecords: [],
    };

    setWorkOrders([newWo as WorkOrder, ...workOrders]);
    setIssueReports((prev) =>
      prev.map((i) => (i.id === issue.id ? { ...i, status: 'WORK_ORDER_CREATED' } : i))
    );
    setActiveTab('work-orders');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar onLogout={logout} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Workspace View */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardPage
              vehicles={vehicles}
              workOrders={workOrders}
              spareParts={spareParts}
              onOpenQr={(veh) => setQrModalVehicle(veh)}
              onOpenWorkOrderScrap={(wo) => setScrapModalWorkOrder(wo)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'telemetry' && (
            <TelemetryPage telemetries={telemetries} />
          )}

          {activeTab === 'vehicles' && (
            <VehiclesPage

              vehicles={vehicles}
              onOpenQr={(veh) => setQrModalVehicle(veh)}
              onAddVehicle={handleAddVehicle}
            />
          )}

          {activeTab === 'zimmet' && (
            <ZimmetPage
              vehicles={vehicles}
              zimmets={zimmets}
              onAssignZimmet={handleAssignZimmet}
              onReturnZimmet={handleReturnZimmet}
            />
          )}

          {activeTab === 'work-orders' && (
            <WorkOrdersPage
              workOrders={workOrders}
              spareParts={spareParts}
              vehicles={vehicles}
              onOpenScrapModal={(wo) => setScrapModalWorkOrder(wo)}
              onCreateWorkOrder={handleCreateWorkOrder}
            />
          )}

          {activeTab === 'spare-parts' && (
            <SparePartsPage
              spareParts={spareParts}
              onStockIn={handleStockIn}
              onAddPart={() => {}}
              onUpdatePart={handleUpdatePart}
            />
          )}


          {activeTab === 'issue-reports' && (
            <IssueReportsPage
              issueReports={issueReports}
              onConvertToWorkOrder={handleConvertToWorkOrder}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage vehicles={vehicles} workOrders={workOrders} />
          )}

          {activeTab === 'calendar' && <CalendarPage vehicles={vehicles} />}
        </main>
      </div>

      {/* Global Modals */}
      <QrCodeModal
        vehicle={qrModalVehicle}
        isOpen={!!qrModalVehicle}
        onClose={() => setQrModalVehicle(null)}
      />

      {scrapModalWorkOrder && (
        <HurdaKilidiModal
          workOrder={scrapModalWorkOrder}
          isOpen={!!scrapModalWorkOrder}
          onClose={() => setScrapModalWorkOrder(null)}
          onApproveScrap={handleApproveScrap}
          onUploadScrapPhoto={handleUploadScrapPhoto}
          onCompleteWorkOrder={handleCompleteWorkOrder}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
