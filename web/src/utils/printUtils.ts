/**
 * Utility for printing orders as professional receipts.
 * This can be expanded to support PDF generation (e.g. via html2canvas/jspdf) in the future.
 */

export const printOrderReceipt = (orderId: string) => {
    // Current simple approach is window.print(), but this utility
    // ensures we can later add custom printing logic (hidden iframe, etc.)
    // to avoid UI clutter on the actual page.
    window.print();
};

export const exportOrderData = (order: any) => {
    try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(order, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `Order_${order.id?.slice(-6).toUpperCase() || 'Export'}.json`);
        dlAnchorElem.click();
        return true;
    } catch (err) {
        console.error("Export failed:", err);
        return false;
    }
};

/**
 * Formats a currency value as Indian Rupee (INR).
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Safely converts potentially object values (like location) to strings for rendering.
 */
export const safeString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        if (val.lat !== undefined && val.lng !== undefined) return `GPS: ${Number(val.lat).toFixed(4)}, ${Number(val.lng).toFixed(4)}`;
        if (val.name) return String(val.name);
        if (val.address) return String(val.address);
        return 'N/A';
    }
    return String(val);
};
