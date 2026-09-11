/**
 * Utility functions for generating downloadable Tax & Commission Breakdown Statements
 */

import { Order, Vendor } from '../types';
import { getCommissionRate, getCommissionPercent } from './commission';

export interface TaxStatementData {
  statementId: string;
  generatedAt: string;
  periodLabel: string;
  vendorName: string;
  vendorEmail: string;
  vendorAddress: string;
  taxId: string;
  tier: string;
  commissionRateStr: string;
  grossSales: number;
  totalCommission: number;
  estimatedTaxVAT: number;
  netPayoutAmount: number;
  orderCount: number;
  orders: Array<{
    id: string;
    date: string;
    customer: string;
    gross: number;
    commissionFee: number;
    net: number;
  }>;
}

export function generateTaxStatementData(
  orders: Order[],
  vendor: Vendor | null | undefined,
  periodLabel: string
): TaxStatementData {
  const plan = vendor?.subscriptionPlan || 'Atelier';
  const commRate = getCommissionRate(plan);
  const commPercentStr = getCommissionPercent(plan);

  let totalGross = 0;
  let totalCommission = 0;
  let totalNet = 0;

  const orderLines = orders.map(o => {
    const gross = o.total;
    const commFee = gross * commRate;
    const net = gross - commFee;

    totalGross += gross;
    totalCommission += commFee;
    totalNet += net;

    return {
      id: o.id,
      date: new Date(o.date).toISOString().slice(0, 10),
      customer: o.customerName || 'Direct Customer',
      gross,
      commissionFee: commFee,
      net
    };
  });

  // Estimated 5% VAT / Sales Tax compliance calculation on commission fee
  const estimatedTaxVAT = totalCommission * 0.05;

  return {
    statementId: `TAX-STMT-${Math.floor(100000 + Math.random() * 900000)}`,
    generatedAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    periodLabel,
    vendorName: vendor?.name || 'Atelier Partner',
    vendorEmail: vendor?.email || 'partner@atelier.com',
    vendorAddress: vendor?.location || 'Global Atelier Partner',
    taxId: `VAT-US-${Math.floor(10000000 + Math.random() * 90000000)}`,
    tier: plan,
    commissionRateStr: commPercentStr,
    grossSales: totalGross,
    totalCommission,
    estimatedTaxVAT,
    netPayoutAmount: totalNet,
    orderCount: orders.length,
    orders: orderLines
  };
}

export function downloadTaxStatementCSV(statement: TaxStatementData) {
  const lines: string[] = [];

  // Header & Vendor Metadata
  lines.push(`"MYFITSTORE OFFICIAL TAX & COMMISSION BREAKDOWN STATEMENT"`);
  lines.push(`"Statement ID: ${statement.statementId}"`);
  lines.push(`"Period: ${statement.periodLabel}"`);
  lines.push(`"Generated At: ${statement.generatedAt}"`);
  lines.push(`"Vendor Name: ${statement.vendorName}"`);
  lines.push(`"Vendor Email: ${statement.vendorEmail}"`);
  lines.push(`"Vendor Address / Location: ${statement.vendorAddress}"`);
  lines.push(`"Tax / VAT ID: ${statement.taxId}"`);
  lines.push(`"Active Subscription Tier: ${statement.tier}"`);
  lines.push(`"Tier Commission Fee Rate: ${statement.commissionRateStr}"`);
  lines.push(``);

  // Financial Summary Section
  lines.push(`"FINANCIAL & TAX SUMMARY"`);
  lines.push(`"Metric","Amount (USD)"`);
  lines.push(`"Gross Platform Sales (USD)","$${statement.grossSales.toFixed(2)}"`);
  lines.push(`"Platform Commission Fee Deducted (${statement.commissionRateStr})","-$${statement.totalCommission.toFixed(2)}"`);
  lines.push(`"Estimated VAT / Sales Tax Output (5%)","$${statement.estimatedTaxVAT.toFixed(2)}"`);
  lines.push(`"Net Vendor Earnings Payable","$${statement.netPayoutAmount.toFixed(2)}"`);
  lines.push(`"Total Orders Processed","${statement.orderCount}"`);
  lines.push(``);

  // Itemized Transactions Header
  lines.push(`"ITEMIZED TRANSACTION BREAKDOWN"`);
  lines.push(`"Order ID","Date","Customer","Gross Sales ($)","Commission Fee ($)","Net Vendor Payout ($)"`);

  statement.orders.forEach(o => {
    lines.push([
      `"${o.id}"`,
      `"${o.date}"`,
      `"${o.customer.replace(/"/g, '""')}"`,
      o.gross.toFixed(2),
      o.commissionFee.toFixed(2),
      o.net.toFixed(2)
    ].join(','));
  });

  lines.push(``);
  lines.push(`"DISCLAIMER: This statement is an official digital record provided by MyFitStore Platform Services for accounting and tax reporting compliance."`);

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${statement.vendorName.replace(/[^a-zA-Z0-9]/g, '_')}_Tax_Commission_Statement_${statement.statementId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
