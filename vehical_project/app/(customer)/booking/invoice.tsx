import { formatCurrency } from '@/utils/formatting';
import { useAdmin } from '@/context/AdminContext';
import { useCustomer } from '@/context/CustomerContext';
import { customerService } from '@/services/customerService';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';



import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

export default function InvoiceScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { vehicles } = useCustomer();
    const { settings } = useAdmin();

    const [job, setJob] = useState<any>(null);
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const [logoBase64, setLogoBase64] = useState('');

    useEffect(() => {
        loadLogo();
    }, []);

    const loadLogo = async () => {
        const logoAsset = Asset.fromModule(require('@/assets/logo/logo.jpeg'));
        await logoAsset.downloadAsync();

        const base64 = await FileSystem.readAsStringAsync(
            logoAsset.localUri!,
            { encoding: 'base64' as any }
        );

        setLogoBase64(`data:image/jpeg;base64,${base64}`);
    };


    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await customerService.getJob(id);

            // Backend returns job data directly (has 'id' field), not wrapped in ApiResponse
            const jobData = response?.id ? response : response?.data;

            if (jobData && jobData.id) {
                setJob(jobData);

                // ServiceRequest has 'vehicle' field which can be ID or populated object
                const vehicleRef = jobData.vehicle;
                if (vehicleRef) {
                    const vehicleId = typeof vehicleRef === 'string' ? vehicleRef : (vehicleRef.id || vehicleRef._id);
                    const v = vehicles.find(v => (v.id === vehicleId || v._id === vehicleId)) || (typeof vehicleRef === 'object' ? vehicleRef : null);
                    setVehicle(v);
                }
            } else {
                console.error('Job not found in response:', response);
                Alert.alert('Error', 'Invoice data not found.');
            }
        } catch (e) {
            console.error('Failed to load invoice data:', e);
            Alert.alert('Error', 'Failed to load invoice details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center} edges={['top']}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Fetching Invoice Details...</Text>
            </SafeAreaView>
        );
    }

    if (!job || !vehicle) {
        return (
            <SafeAreaView style={styles.center} edges={['top']}>
                <Ionicons name="receipt-outline" size={64} color="#8E8E93" />
                <Text style={styles.errorText}>Invoice not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtnError}>
                    <Text style={styles.backBtnTextError}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const labor = job.bill?.laborAmount || 0;
    const itemsTotal = (job.bill?.items || []).reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    const grandTotal = job.bill?.totalAmount || (labor + itemsTotal);
    const invoiceNo = `INV-${id?.substring(0, 6).toUpperCase()}`;
    const transactionId = `TXN-${job.id.slice(-8).toUpperCase()}`;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `📄 OFFICIAL SERVICE INVOICE - PAPAZ\n` +
                    `--------------------------------\n` +
                    `🚗 Vehicle: ${vehicle.make} ${vehicle.model}\n` +
                    `🔢 Reg No: ${vehicle.registrationNumber}\n` +
                    `💰 Total Paid: ${formatCurrency(grandTotal, settings.currency)}\n` +
                    `✅ Status: PAID FULLY\n` +
                    `--------------------------------\n` +
                    `Generated via VehicleCare Digital Suite.`,
            });
        } catch (e) {
            Alert.alert('Error', 'Could not share invoice');
        }
    };

    const handleDownloadPDF = async () => {
        setGenerating(true);

        try {
            // Use the pre-loaded logo base64
            const logoSrc = logoBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

            const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Invoice ${invoiceNo}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                    color: #1a1a1a;
                    line-height: 1.6;
                    background: #f8f9fb;
                    padding: 40px 20px;
                }
                .invoice-container { 
                    max-width: 800px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    overflow: hidden;
                }
                
                .invoice-header {
                    background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
                    padding: 40px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .logo-section img {
                    width: 70px;
                    height: 70px;
                    border-radius: 12px;
                    background: white;
                    padding: 8px;
                    object-fit: contain;
                }
                .brand-info h1 {
                    font-size: 28px;
                    font-weight: 800;
                    margin-bottom: 4px;
                    letter-spacing: -0.5px;
                }
                .brand-info p {
                    font-size: 13px;
                    opacity: 0.9;
                    font-weight: 500;
                }
                .invoice-meta {
                    text-align: right;
                }
                .invoice-meta h2 {
                    font-size: 14px;
                    font-weight: 600;
                    opacity: 0.9;
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                }
                .invoice-meta .invoice-number {
                    font-size: 24px;
                    font-weight: 800;
                    margin-bottom: 4px;
                }
                .invoice-meta .invoice-date {
                    font-size: 13px;
                    opacity: 0.85;
                }
                
                .invoice-body {
                    padding: 40px;
                }
                
                .parties-section {
                    display: flex;
                    gap: 40px;
                    margin-bottom: 40px;
                    padding-bottom: 30px;
                    border-bottom: 2px solid #f2f2f7;
                }
                .party-info {
                    flex: 1;
                }
                .party-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #8e8e93;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 10px;
                }
                .party-name {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 6px;
                }
                .party-details {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.8;
                }
                
                .vehicle-banner {
                    background: linear-gradient(135deg, #f8f9fe 0%, #e8eaf6 100%);
                    padding: 20px 24px;
                    border-radius: 12px;
                    margin-bottom: 35px;
                    border-left: 4px solid #007AFF;
                }
                .vehicle-banner h3 {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 6px;
                }
                .vehicle-banner p {
                    font-size: 13px;
                    color: #666;
                }
                .vehicle-reg {
                    display: inline-block;
                    background: #007AFF;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 13px;
                    margin-top: 6px;
                }
                
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                .items-table thead {
                    background: #f8f9fe;
                }
                .items-table th {
                    padding: 14px 16px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: 800;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #e0e0e0;
                }
                .items-table th:last-child,
                .items-table td:last-child {
                    text-align: right;
                }
                .items-table th:nth-child(2),
                .items-table td:nth-child(2) {
                    text-align: center;
                    width: 80px;
                }
                .items-table th:nth-child(3),
                .items-table td:nth-child(3) {
                    text-align: right;
                    width: 120px;
                }
                .items-table tbody tr {
                    border-bottom: 1px solid #f2f2f7;
                }
                .items-table tbody tr:hover {
                    background: #fafbfc;
                }
                .items-table td {
                    padding: 16px;
                    font-size: 14px;
                    color: #1a1a1a;
                }
                .item-description {
                    font-weight: 600;
                }
                .item-meta {
                    font-size: 12px;
                    color: #8e8e93;
                    margin-top: 4px;
                }
                
                .summary-section {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 35px;
                }
                .summary-table {
                    width: 350px;
                    background: #f9f9fb;
                    padding: 24px;
                    border-radius: 12px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    font-size: 14px;
                }
                .summary-label {
                    color: #666;
                    font-weight: 500;
                }
                .summary-value {
                    font-weight: 700;
                    color: #1a1a1a;
                }
                .grand-total-row {
                    border-top: 2px solid #007AFF;
                    margin-top: 12px;
                    padding-top: 16px !important;
                }
                .grand-total-label {
                    font-size: 16px;
                    font-weight: 800;
                    color: #1a1a1a;
                }
                .grand-total-value {
                    font-size: 24px;
                    font-weight: 900;
                    color: #34C759;
                }
                
                .payment-status-banner {
                    background: linear-gradient(135deg, #f0f9f1 0%, #e8f5e9 100%);
                    padding: 20px 24px;
                    border-radius: 12px;
                    border-left: 4px solid #34C759;
                    margin-bottom: 35px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .payment-icon {
                    width: 48px;
                    height: 48px;
                    background: #34C759;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
                }
                .payment-details h4 {
                    font-size: 15px;
                    font-weight: 800;
                    color: #34C759;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .payment-details p {
                    font-size: 12px;
                    color: #666;
                    margin: 2px 0;
                }
                .payment-details .txn-id {
                    font-weight: 700;
                    color: #1a1a1a;
                }
                
                .invoice-footer {
                    background: #f8f9fb;
                    padding: 30px 40px;
                    text-align: center;
                    border-top: 1px solid #e0e0e0;
                }
                .invoice-footer p {
                    font-size: 12px;
                    color: #8e8e93;
                    line-height: 1.8;
                    margin-bottom: 8px;
                }
                .invoice-footer .thank-you {
                    font-size: 14px;
                    font-weight: 600;
                    color: #007AFF;
                    margin-top: 12px;
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="invoice-header">
                    <div class="logo-section">
                        <img src="${logoSrc}" alt="PAPAZ Logo" />
                        <div class="brand-info">
                            <h1>PAPAZ</h1>
                            <p>Professional Vehicle Service Network</p>
                        </div>
                    </div>
                    <div class="invoice-meta">
                        <h2>SERVICE INVOICE</h2>
                        <div class="invoice-number">${invoiceNo}</div>
                        <div class="invoice-date">${new Date(job.completedAt || Date.now()).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>
                
                <div class="invoice-body">
                    <div class="parties-section">
                        <div class="party-info">
                            <div class="party-label">Billed To</div>
                            <div class="party-name">${job.customer?.fullName || 'Customer'}</div>
                            <div class="party-details">
                                ${job.customer?.phoneNumber ? `Phone: ${job.customer.phoneNumber}<br/>` : ''}
                                ${job.customer?.address ? job.customer.address : ''}
                            </div>
                        </div>
                        <div class="party-info">
                            <div class="party-label">Service Provider</div>
                            <div class="party-name">${job.technician?.garageName || job.garageName || job.technician?.fullName || 'Service Center'}</div>
                            <div class="party-details">
                                ${job.technician?.fullName ? `Technician: ${job.technician.fullName}<br/>` : ''}
                                ${job.technician?.address || job.address || ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="vehicle-banner">
                        <h3>${vehicle.make} ${vehicle.model}</h3>
                        <p>${vehicle.year || ''} ${vehicle.year && vehicle.fuelType ? '•' : ''} ${vehicle.fuelType || ''}</p>
                        <span class="vehicle-reg">${vehicle.registrationNumber}</span>
                    </div>
                    
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(job.bill?.items || []).map((item: any) => `
                                <tr>
                                    <td>
                                        <div class="item-description">${item.description}</div>
                                        ${item.brand ? `<div class="item-meta">Brand: ${item.brand}${item.partNumber ? ` | Part #${item.partNumber}` : ''}</div>` : ''}
                                    </td>
                                    <td>${item.quantity || 1}</td>
                                    <td>${formatCurrency((item.total || 0) / (item.quantity || 1), settings.currency)}</td>
                                    <td>${formatCurrency(item.total || 0, settings.currency)}</td>
                                </tr>
                            `).join('')}
                            <tr>
                                <td>
                                    <div class="item-description">Professional Labor & Service</div>
                                    <div class="item-meta">Technical expertise and execution</div>
                                </td>
                                <td>1</td>
                                <td>${formatCurrency(labor, settings.currency)}</td>
                                <td>${formatCurrency(labor, settings.currency)}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="summary-section">
                        <div class="summary-table">
                            <div class="summary-row">
                                <span class="summary-label">Parts & Materials</span>
                                <span class="summary-value">${formatCurrency(itemsTotal, settings.currency)}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Labor Charges</span>
                                <span class="summary-value">${formatCurrency(labor, settings.currency)}</span>
                            </div>
                            <div class="summary-row grand-total-row">
                                <span class="grand-total-label">Grand Total</span>
                                <span class="grand-total-value">${formatCurrency(grandTotal, settings.currency)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-status-banner">
                        <div class="payment-icon">✓</div>
                        <div class="payment-details">
                            <h4>Payment Completed</h4>
                            <p>Transaction ID: <span class="txn-id">${transactionId}</span></p>
                            <p>Payment Method: ${job.bill?.paymentMethod?.toUpperCase() || 'CASH'}</p>
                            <p>Date: ${new Date(job.bill?.createdAt || Date.now()).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
                
                <div class="invoice-footer">
                    <p>This is a computer-generated invoice and does not require a physical signature.</p>
                    <p>For any queries regarding this invoice, please contact our support team.</p>
                    <p class="thank-you">Thank you for choosing PAPAZ - Your trusted vehicle service partner</p>
                </div>
            </div>
        </body>
        </html>
        `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            await Sharing.shareAsync(uri, {
                UTI: '.pdf',
                mimeType: 'application/pdf',
                dialogTitle: `Invoice_${invoiceNo}`,
            });

        } catch (e) {
            console.error('PDF Generation Error:', e);
            Alert.alert('Error', 'Failed to generate PDF invoice.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(customer)/(tabs)')} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.title}>Service Receipt</Text>
                <TouchableOpacity onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.invoiceCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.brandBadge}>
                            <Image
                                source={require('@/assets/logo/logo.jpeg')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.invoiceNoText}>{invoiceNo}</Text>
                            <Text style={styles.dateText}>{new Date(job.completedAt || Date.now()).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoGrid}>
                        <View style={styles.infoCol}>
                            <Text style={styles.miniLabel}>Billed To</Text>
                            <Text style={styles.infoValue}>{job.customer?.fullName || 'Customer'}</Text>
                        </View>
                        <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
                            <Text style={styles.miniLabel}>Provider</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>{job.garageName || job.technician?.fullName || 'Royal Motors HQ'}</Text>
                        </View>
                    </View>

                    <View style={styles.vehiclePill}>
                        <View style={styles.vehicleIconCircle}>
                            <Ionicons name="car-sport" size={20} color="#007AFF" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.vehiclePillName}>{vehicle.make} {vehicle.model}</Text>
                            <Text style={styles.vehiclePillReg}>{vehicle.registrationNumber}</Text>
                            <Text style={styles.vehiclePillMeta}>{vehicle.year} • {vehicle.fuelType}</Text>
                        </View>
                    </View>

                    <View style={styles.itemsSection}>
                        <Text style={styles.sectionTitle}>Itemized Details</Text>
                        {(job.bill?.items || []).map((item: any) => (
                            <View key={item.id || item._id} style={styles.itemRow}>
                                <View style={styles.itemMain}>
                                    <Text style={styles.itemDesc}>{item.description}</Text>
                                    {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
                                </View>
                                <View style={styles.itemPriceCol}>
                                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                                    <Text style={styles.itemTotal}>{formatCurrency(item.total || 0, settings.currency)}</Text>
                                </View>
                            </View>
                        ))}

                        <View style={styles.itemRow}>
                            <View style={styles.itemMain}>
                                <Text style={styles.itemDesc}>Labor Service</Text>
                                <Text style={styles.itemBrand}>Professional execution</Text>
                            </View>
                            <View style={styles.itemPriceCol}>
                                <Text style={styles.itemQty}>Fixed</Text>
                                <Text style={styles.itemTotal}>{formatCurrency(labor, settings.currency)}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryLine}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(itemsTotal, settings.currency)}</Text>
                        </View>
                        <View style={styles.summaryLine}>
                            <Text style={styles.summaryLabel}>Execution & Labor</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(labor, settings.currency)}</Text>
                        </View>
                        <View style={[styles.summaryLine, { marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 }]}>
                            <Text style={styles.grandTotalLabel}>Grand Total</Text>
                            <Text style={styles.grandTotalVal}>{formatCurrency(grandTotal, settings.currency)}</Text>
                        </View>
                    </View>

                    <View style={styles.paymentBannerDetail}>
                        <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.paymentStatusText}>Paid Successfully</Text>
                            <Text style={styles.transactionIdText}>{transactionId}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.downloadButton, generating && { opacity: 0.7 }]}
                    onPress={handleDownloadPDF}
                    disabled={generating}
                >
                    {generating ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="cloud-download-outline" size={22} color="#FFF" />
                            <Text style={styles.downloadButtonText}>Save Official PDF</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.thankYouNote}>Thank you for choosing Papaz. Your trust is our commitment to excellence.</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 15, fontSize: 14, color: '#8E8E93', fontWeight: '500' },
    errorText: { marginTop: 15, fontSize: 16, color: '#1A1A1A', fontWeight: 'bold' },
    backBtnError: { marginTop: 20, paddingHorizontal: 25, paddingVertical: 12, backgroundColor: '#007AFF', borderRadius: 12 },
    backBtnTextError: { color: '#FFF', fontWeight: 'bold' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    backBtn: { padding: 5 },
    title: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
    content: { padding: 20 },
    invoiceCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    brandBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    logo: { width: 70, height: 70 },
    brandText: { color: '#FFF', fontWeight: '900', fontSize: 13, letterSpacing: -0.5 },
    invoiceNoText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
    dateText: { fontSize: 11, color: '#8E8E93', marginTop: 3 },
    divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 20 },
    infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    infoCol: { flex: 1 },
    miniLabel: { fontSize: 9, color: '#8E8E93', fontWeight: '800', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
    infoValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '700' },
    vehiclePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FE', padding: 16, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderStyle: 'dashed', borderColor: '#D1D1D6' },
    vehicleIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    vehiclePillName: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
    vehiclePillReg: { fontSize: 12, color: '#007AFF', fontWeight: '700', marginTop: 1 },
    vehiclePillMeta: { fontSize: 10, color: '#8E8E93', marginTop: 2 },
    itemsSection: { marginBottom: 25 },
    sectionTitle: { fontSize: 11, fontWeight: '900', color: '#8E8E93', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, alignItems: 'flex-start' },
    itemMain: { flex: 1, marginRight: 15 },
    itemDesc: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
    itemBrand: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
    itemPriceCol: { alignItems: 'flex-end' },
    itemQty: { fontSize: 10, color: '#8E8E93', fontWeight: '600' },
    itemTotal: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginTop: 2 },
    summaryContainer: { backgroundColor: '#F9F9FB', padding: 20, borderRadius: 20 },
    summaryLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { fontSize: 13, color: '#666' },
    summaryValue: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
    grandTotalLabel: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' },
    grandTotalVal: { fontSize: 22, fontWeight: '900', color: '#34C759' },
    paymentBannerDetail: { flexDirection: 'row', alignItems: 'center', marginTop: 25, padding: 18, backgroundColor: '#F0F9F1', borderRadius: 18 },
    paymentStatusText: { fontSize: 13, fontWeight: '800', color: '#34C759', textTransform: 'uppercase' },
    transactionIdText: { fontSize: 10, color: '#8E8E93', marginTop: 2 },
    downloadButton: { flexDirection: 'row', backgroundColor: '#1A1A1A', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
    downloadButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    thankYouNote: { textAlign: 'center', color: '#8E8E93', fontSize: 11, marginTop: 30, lineHeight: 18, paddingHorizontal: 40 },
});
