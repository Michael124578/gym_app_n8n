import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Receipt, Download, Printer, Plus, Trash2, 
  QrCode, CheckCircle2, ShieldCheck, 
  Building2, CreditCard, Calendar, User, ShoppingBag
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { QRCodeSVG } from 'qrcode.react'

export default function POSInvoiceGenerator({ session }) {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-8942')
  const [customerName, setCustomerName] = useState(session?.user?.email ? 'Michael Kiriakos' : 'John Doe')
  const [customerEmail, setCustomerEmail] = useState(session?.user?.email || 'member@irongym.com')
  const [paymentMethod, setPaymentMethod] = useState('Apple Pay / Contactless NFC')
  const [taxRate, setTaxRate] = useState(10) // 10%
  const [discountAmount, setDiscountAmount] = useState(0)

  const [items, setItems] = useState([
    { id: '1', description: 'Annual VIP All-Access Membership Pass', qty: 1, unitPrice: 9600.00 },
    { id: '2', description: 'Iron ISO-100 Hydrolyzed Whey (5 lbs)', qty: 1, unitPrice: 2450.00 },
    { id: '3', description: 'Pre-Workout Energy Drink (C4 Can)', qty: 2, unitPrice: 120.00 },
    { id: '4', description: 'Digital Smart Locker 6-Month Reservation', qty: 1, unitPrice: 650.00 },
  ])

  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemQty, setNewItemQty] = useState(1)
  const [newItemPrice, setNewItemPrice] = useState('')

  const [isDownloading, setIsDownloading] = useState(false)
  const invoiceRef = useRef(null)

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!newItemDesc.trim() || !newItemPrice) return

    const item = {
      id: `item-${Date.now()}`,
      description: newItemDesc.trim(),
      qty: parseInt(newItemQty) || 1,
      unitPrice: parseFloat(newItemPrice) || 0
    }

    setItems(prev => [...prev, item])
    setNewItemDesc('')
    setNewItemQty(1)
    setNewItemPrice('')
  }

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0)
  const tax = (subtotal - discountAmount) * (taxRate / 100)
  const grandTotal = Math.max(0, subtotal - discountAmount + tax)

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current) return
    setIsDownloading(true)
    try {
      const dataUrl = await toPng(invoiceRef.current, { cacheBust: true, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `${invoiceNumber}_IronGym_Receipt.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Invoice download error', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Receipt className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Point-of-Sale Invoicing & Transaction Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Branded POS Invoice Generator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Generate official receipts with tax breakdowns, transaction verification tokens, and instant PDF/Image export.
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold px-4 py-3 rounded-2xl transition flex items-center space-x-2 shadow-xl"
            >
              <Printer className="h-4 w-4" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Exporting...' : 'Download Invoice PNG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE: CONFIG ON LEFT, LIVE INVOICE PREVIEW ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: INVOICE BUILDER CONFIG */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <User className="h-4 w-4 text-indigo-400" />
              <span>Invoice & Customer Parameters</span>
            </h3>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Invoice Reference #</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Apple Pay / Contactless NFC">Apple Pay / Contactless</option>
                  <option value="Visa / Mastercard (**** 4892)">Visa / Mastercard</option>
                  <option value="Cash at Reception">Cash at Reception</option>
                  <option value="Direct Bank Wire">Direct Bank Wire</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Discount Amount ($)</label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* ADD LINE ITEM FORM */}
          <form onSubmit={handleAddItem} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              <span>Add Line Item / Product</span>
            </h3>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Item Description</label>
              <input
                type="text"
                placeholder="e.g. 1-Month Unlimited Pass"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Unit Price (EGP)</label>
                <input
                  type="number"
                  step="1"
                  placeholder="0"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase py-3 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Invoice</span>
            </button>
          </form>
        </div>

        {/* RIGHT: LIVE BRANDED INVOICE PREVIEW (EXPORT TARGET) */}
        <div className="lg:col-span-7">
          <div
            ref={invoiceRef}
            className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 space-y-8 relative overflow-hidden"
          >
            {/* INVOICE BRAND HEADER */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white uppercase leading-none">
                      IRON <span className="text-indigo-500">GYM</span>
                    </h2>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">
                      Commercial Gate Terminal Systems
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 mt-4 space-y-0.5">
                  <p>Iron Gym Flagship Facility • Terminal #01</p>
                  <p>Tax ID: GYM-TAX-2026-9042</p>
                  <p>support@irongym.com • www.irongym.com</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                  OFFICIAL TAX INVOICE
                </span>
                <span className="text-lg font-mono font-black text-white">{invoiceNumber}</span>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  Issued: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* BILLED TO / PAYMENT METHOD */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Billed To Member</span>
                <span className="font-bold text-white uppercase text-sm block mt-0.5">{customerName}</span>
                <span className="text-slate-400 font-mono text-[11px]">{customerEmail}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Payment Method</span>
                <span className="font-bold text-emerald-400 text-xs block mt-0.5">{paymentMethod}</span>
                <span className="text-[10px] font-mono text-slate-400">Status: <strong className="text-emerald-400">PAID & AUTHORIZED</strong></span>
              </div>
            </div>

            {/* ITEMIZED TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 pb-2">
                    <th className="py-2.5 px-2">Item Description</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Price</th>
                    <th className="py-2.5 px-2 text-right">Amount</th>
                    <th className="py-2.5 px-1 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-2 font-sans font-bold text-white">{item.description}</td>
                      <td className="py-3 px-2 text-center text-slate-300">{item.qty}</td>
                      <td className="py-3 px-2 text-right text-slate-300">{item.unitPrice.toLocaleString()} EGP</td>
                      <td className="py-3 px-2 text-right font-bold text-white">{(item.qty * item.unitPrice).toLocaleString()} EGP</td>
                      <td className="py-3 px-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-600 hover:text-rose-400 p-1 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS CALCULATION */}
            <div className="border-t border-slate-800 pt-4 flex justify-between items-end">
              <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className="bg-white p-2 rounded-xl">
                  <QRCodeSVG value={`https://irongym.com/verify/${invoiceNumber}`} size={44} />
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  <span className="font-bold text-indigo-300 block">QR VERIFICATION</span>
                  <span>Scan to verify authenticity</span>
                </div>
              </div>

              <div className="w-60 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString()} EGP</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>-{discountAmount.toLocaleString()} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Sales Tax ({taxRate}%):</span>
                  <span>{tax.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white border-t border-slate-800 pt-2">
                  <span>Grand Total:</span>
                  <span className="text-emerald-400">{grandTotal.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-slate-900 pt-4 text-center text-[10px] font-mono text-slate-500">
              Thank you for training with IRON GYM. Turnstile gate passes are synced to your digital pass.
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
