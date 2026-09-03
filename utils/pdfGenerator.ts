import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types.ts';

/**
 * Generates and downloads a high-resolution, beautifully formatted PDF invoice/receipt.
 */
export const generateOrderPDF = (order: Order, customerEmail?: string) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [17, 17, 17]; // Luxury Black #111111
    const goldColor = [212, 175, 55]; // Luxury Gold #D4AF37
    const lightBg = [248, 248, 248];

    // Page Width: 210mm, Height: 297mm
    // Margins: 15mm left/right

    // --- HEADER ---
    // Brand Logo / Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('MyFitStore', 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('ATELIER LUXURY APPAREL & HIGH-PERFORMANCE ACTIVEWEAR', 15, 25);

    // Invoice Title & Status Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('OFFICIAL RECEIPT / INVOICE', 195, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    if (order.paymentStatus === 'DEPOSIT_PAID') {
      doc.setTextColor(217, 119, 6); // Amber
      doc.text('STATUS: PRE-ORDER DEPOSIT PAID', 195, 26, { align: 'right' });
    } else {
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text('STATUS: PAID IN FULL', 195, 26, { align: 'right' });
    }

    // Decorative Line
    doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setLineWidth(0.8);
    doc.line(15, 30, 195, 30);

    // --- ORDER & CUSTOMER METADATA ---
    // Left Box: Customer Details
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(15, 35, 88, 38, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('CUSTOMER & SHIPPING DETAILS', 18, 41);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const nameStr = order.customerName || customerEmail || 'Valued Client';
    doc.text(nameStr.toUpperCase(), 18, 47);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    if (order.shippingAddress) {
      doc.text(`${order.shippingAddress.street || ''}`, 18, 53);
      doc.text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zip || ''}`, 18, 58);
      doc.text(`${order.shippingAddress.country || 'USA'}`, 18, 63);
    } else {
      doc.text(`Email: ${customerEmail || order.customerName || 'N/A'}`, 18, 53);
      doc.text('White-Glove Delivery Address Confirmed', 18, 58);
    }

    // Right Box: Invoice Meta
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(107, 35, 88, 38, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('INVOICE & REFERENCE DATA', 110, 41);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    doc.text(`Order Reference:`, 110, 47);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${order.id}`, 150, 47);

    doc.setFont('helvetica', 'normal');
    doc.text(`Transaction Date:`, 110, 53);
    doc.setFont('helvetica', 'bold');
    doc.text(`${order.date || new Date().toLocaleDateString()}`, 150, 53);

    doc.setFont('helvetica', 'normal');
    doc.text(`Logistics Tracking:`, 110, 58);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.text(`${order.trackingNumber || 'MFS-EXPRESS-LOGISTICS'}`, 150, 58);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`Carrier Partner:`, 110, 63);
    doc.setFont('helvetica', 'bold');
    doc.text(`${(order.carrier || 'USPS Luxury Air').toUpperCase()}`, 150, 63);

    // --- ITEMS TABLE ---
    const tableBody = (order.items || []).map((item, idx) => {
      const itemSize = item.size || (item as any).selectedSize || '';
      let detailsStr = itemSize ? `Size: ${itemSize}` : '';
      if (item.measurements) {
        if (typeof item.measurements === 'string') {
          detailsStr += detailsStr ? ` (${item.measurements})` : item.measurements;
        } else if (typeof item.measurements === 'object') {
          const mStr = Object.entries(item.measurements)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          detailsStr += detailsStr ? ` (${mStr})` : mStr;
        }
      }
      if (item.isPreOrder) {
        detailsStr += detailsStr ? ' [PRE-ORDER]' : 'PRE-ORDER';
      }

      const unitPrice = `$${item.price.toFixed(2)}`;
      const lineTotal = `$${(item.price * (item.quantity || 1)).toFixed(2)}`;

      return [
        `${idx + 1}`,
        item.name || 'Luxury Apparel Item',
        detailsStr || 'Standard Atelier Fit',
        `${item.quantity || 1}`,
        unitPrice,
        lineTotal
      ];
    });

    autoTable(doc, {
      startY: 78,
      head: [['#', 'Item Description', 'Specifications & Sizing', 'Qty', 'Unit Price', 'Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [17, 17, 17],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 55 },
        2: { cellWidth: 55 },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 23, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
      },
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 150;

    // --- FINANCIAL SUMMARY BREAKDOWN ---
    const summaryX = 120;
    let currentY = finalY;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    const subtotal = order.total - (order.shippingCost || 0);

    doc.text('Subtotal:', summaryX, currentY);
    doc.text(`$${Math.max(0, subtotal).toFixed(2)}`, 195, currentY, { align: 'right' });
    currentY += 5;

    doc.text('Shipping & Handling:', summaryX, currentY);
    doc.text(order.shippingCost && order.shippingCost > 0 ? `$${order.shippingCost.toFixed(2)}` : 'COMPLIMENTARY', 195, currentY, { align: 'right' });
    currentY += 5;

    doc.text('Sales Tax (Included):', summaryX, currentY);
    doc.text('$0.00', 195, currentY, { align: 'right' });
    currentY += 6;

    // Total Line
    doc.setDrawColor(200, 200, 200);
    doc.line(summaryX, currentY, 195, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

    if (order.isDepositOrder && order.depositAmount) {
      doc.text('Total Order Value:', summaryX, currentY);
      doc.text(`$${order.total.toFixed(2)}`, 195, currentY, { align: 'right' });
      currentY += 6;

      doc.setTextColor(217, 119, 6);
      doc.text('Initial Deposit Paid (Today):', summaryX, currentY);
      doc.text(`$${order.depositAmount.toFixed(2)}`, 195, currentY, { align: 'right' });
      currentY += 6;

      doc.setTextColor(100, 100, 100);
      doc.text('Remaining Balance Due:', summaryX, currentY);
      doc.text(`$${(order.remainingBalance || (order.total - order.depositAmount)).toFixed(2)}`, 195, currentY, { align: 'right' });
    } else {
      doc.text('Total Amount Paid:', summaryX, currentY);
      doc.text(`$${order.total.toFixed(2)}`, 195, currentY, { align: 'right' });
    }

    // --- FOOTER & GUARANTEE NOTE ---
    const footerY = 265;
    doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setLineWidth(0.5);
    doc.line(15, footerY, 195, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('THANK YOU FOR YOUR PATRONAGE • MYFITSTORE ATELIER', 105, footerY + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text(
      'Complimentary luxury alterations are available within 30 days of delivery. For support or white-glove inquiries, contact atelier@myfitstore.com',
      105,
      footerY + 9,
      { align: 'center' }
    );

    // Save PDF
    const filename = `MyFitStore-Invoice-${order.id.replace('ord_', '')}.pdf`;
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Could not generate PDF receipt. Please try again.');
    return false;
  }
};
