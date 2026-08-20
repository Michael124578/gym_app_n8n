import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, Plus, Trash2, CheckCircle2, Package, 
  Tag, DollarSign, Search, Filter, X, CreditCard, 
  Minus, Receipt, ArrowRight, ShieldCheck, ShoppingCart
} from 'lucide-react'
import PillButton from './PillButton'
import PillFilter from './PillFilter'

const DEFAULT_PRODUCTS = [
  {
    id: 'p-1',
    name: 'Iron ISO-100 Hydrolyzed Whey',
    category: 'Proteins & Shakes',
    price: 2450,
    stock: 24,
    rating: 4.9,
    tag: 'Best Seller',
    specs: '27g Protein • 0g Sugar • 5.5g BCAAs',
    description: 'Ultra-pure ultrafiltered whey isolate for maximum protein synthesis and rapid muscle recovery.',
    imageIcon: '🥛'
  },
  {
    id: 'p-2',
    name: 'CyberPUMP High-Stim Pre-Workout',
    category: 'Pre-Workouts & Energy',
    price: 1650,
    stock: 18,
    rating: 4.8,
    tag: 'High Stim',
    specs: '350mg Caffeine • 6g Citrulline • 3.2g Beta-Alanine',
    description: 'Explosive nitric oxide matrix with laser focus and sustained energy without crashes.',
    imageIcon: '⚡'
  },
  {
    id: 'p-3',
    name: 'Heavy Duty Figure-8 Lifting Straps',
    category: 'Lifting Gear & Straps',
    price: 450,
    stock: 40,
    rating: 5.0,
    tag: 'Pro Gear',
    specs: 'Heavy Cotton Canvas • 1000kg Rated',
    description: 'Lock into the bar for heavy deadlifts, shrugs, and bent-over rows with maximum grip security.',
    imageIcon: '🏋️'
  },
  {
    id: 'p-4',
    name: 'Iron Gym Oversized Heavyweight Pump Cover',
    category: 'Apparel',
    price: 850,
    stock: 15,
    rating: 4.9,
    tag: 'Limited Edition',
    specs: '100% 280GSM French Terry Cotton',
    description: 'Breathable, heavy drape bodybuilding pump cover featuring the official Iron Gym crest.',
    imageIcon: '👕'
  },
  {
    id: 'p-5',
    name: 'Electrolyte Hyper-Hydration Fuel (30 Pack)',
    category: 'Snacks & Hydration',
    price: 750,
    stock: 30,
    rating: 4.7,
    tag: 'Essential',
    specs: '1000mg Sodium • 200mg Potassium • 60mg Magnesium',
    description: 'Rapid cellular hydration sticks to prevent muscle cramping during grueling high-volume workouts.',
    imageIcon: '💧'
  },
  {
    id: 'p-6',
    name: 'Creapure Micronized Creatine Monohydrate',
    category: 'Proteins & Shakes',
    price: 1250,
    stock: 22,
    rating: 5.0,
    tag: 'Muscle Mass',
    specs: '5g Pure Creapure • 100 Servings',
    description: 'Clinically proven gold standard creatine to boost ATP power output and cell volumization.',
    imageIcon: '🔋'
  },
  {
    id: 'p-7',
    name: '10mm Lever Action Powerlifting Belt',
    category: 'Lifting Gear & Straps',
    price: 3200,
    stock: 8,
    rating: 4.9,
    tag: 'IPF Spec',
    specs: 'Genuine Suede Leather • Stainless Steel Buckle',
    description: 'Rigid intra-abdominal support for maximal squats and deadlifts with quick-snap release.',
    imageIcon: '🛡️'
  },
  {
    id: 'p-8',
    name: 'Cold Pressed Protein Shake (Vanilla Cream)',
    category: 'Snacks & Hydration',
    price: 120,
    stock: 50,
    rating: 4.6,
    tag: 'Ready to Drink',
    specs: '30g Protein • Real Milk • Lactose Free',
    description: 'Chilled ready-to-drink protein shake available immediately at the front desk fuel bar.',
    imageIcon: '🥤'
  }
]

const CATEGORIES = ['All', 'Proteins & Shakes', 'Pre-Workouts & Energy', 'Lifting Gear & Straps', 'Apparel', 'Snacks & Hydration']

export default function GymShop({ session, userRole }) {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('iron_gym_shop_products')
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS
  })

  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState(null)
  
  // Checkout & Receipt States
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [receiptData, setReceiptData] = useState(null)

  // Admin New Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState('Proteins & Shakes')
  const [newPrice, setNewPrice] = useState('29.99')
  const [newStock, setNewStock] = useState('20')
  const [newSpecs, setNewSpecs] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newIcon, setNewIcon] = useState('📦')

  useEffect(() => {
    localStorage.setItem('iron_gym_shop_products', JSON.stringify(products))
  }, [products])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const playPurchaseChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08) // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16) // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24) // C6
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.45)
    } catch (e) {}
  }

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Max stock reached for ${product.name}`)
          return prev
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      } else {
        return [...prev, { ...product, quantity: 1 }]
      }
    })
    showToast(`Added ${product.name} to cart!`)
  }

  const updateCartQty = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta
          if (newQty <= 0) return null
          return { ...item, quantity: newQty }
        }
        return item
      }).filter(Boolean)
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  }, [cart])

  const cartTotalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart])

  const handleCheckout = async (paymentMethod = 'Member Account') => {
    if (cart.length === 0) return
    setIsCheckingOut(true)

    const orderId = `IG-POS-${Math.floor(100000 + Math.random() * 900000)}`
    const orderItems = [...cart]
    const totalAmount = cartSubtotal

    try {
      // 1. Record payment in Supabase payments table if member is authenticated
      if (session?.user?.id) {
        // Resolve member record
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .or(`auth_id.eq.${session.user.id},email.eq.${session.user.email}`)
          .maybeSingle()

        if (member) {
          await supabase.from('payments').insert([{
            member_id: member.id,
            amount: totalAmount,
            plan_name: `Pro Shop Order (${orderItems.length} items)`
          }])
        }
      }

      // 2. Decrement stock
      setProducts(prev => prev.map(p => {
        const inCart = orderItems.find(item => item.id === p.id)
        if (inCart) {
          return { ...p, stock: Math.max(0, p.stock - inCart.quantity) }
        }
        return p
      }))

      // 3. Set Receipt
      setReceiptData({
        orderId,
        date: new Date().toLocaleString(),
        items: orderItems,
        subtotal: totalAmount,
        paymentMethod,
        buyerName: session?.user?.user_metadata?.full_name || session?.user?.email || 'Valued Member'
      })

      playPurchaseChime()
      setCart([])
      setIsCartOpen(false)
      showToast('Order processed successfully!')
    } catch (err) {
      console.error('Checkout error:', err)
      showToast('Error completing order. Please see front desk.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleAddProduct = (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newProd = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      category: newCat,
      price: parseFloat(newPrice) || 19.99,
      stock: parseInt(newStock, 10) || 10,
      rating: 5.0,
      tag: 'New Arrival',
      specs: newSpecs.trim() || 'Premium Iron Gym Quality',
      description: newDesc.trim() || 'High performance gym equipment and nutrition.',
      imageIcon: newIcon || '📦'
    }

    setProducts(prev => [newProd, ...prev])
    setIsAddModalOpen(false)
    showToast(`Added ${newProd.name} to shop inventory!`)

    // Reset Form
    setNewName('')
    setNewSpecs('')
    setNewDesc('')
  }

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">IRON FUEL BAR & PRO SHOP</h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              OFFICIAL GEAR & NUTRITION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Top-tier supplements, post-workout shakes, heavy lifting gear, and official Iron Gym merchandise
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {userRole === 'admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-2xl transition flex items-center space-x-2 shadow-sm"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Add Product</span>
            </button>
          )}

          <PillButton
            onClick={() => setIsCartOpen(true)}
            theme="emerald"
            icon={ShoppingCart}
            size="sm"
          >
            Cart {cartTotalItems > 0 ? `(${cartTotalItems})` : ''}
          </PillButton>
        </div>
      </div>

      {/* CATEGORY SELECTOR & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto py-1 md:py-0">
          {CATEGORIES.map(cat => (
            <PillFilter
              key={cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              theme="emerald"
              size="sm"
            >
              {cat}
            </PillFilter>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supplements or gear..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* PRODUCTS GRID */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-12 text-center">
          <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-white">No products found</p>
          <p className="text-xs text-slate-400 mt-1">Try selecting another category or refining your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map(prod => {
            const isOutOfStock = prod.stock <= 0
            const inCart = cart.find(item => item.id === prod.id)

            return (
              <motion.div
                key={prod.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 hover:border-emerald-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* TOP BADGES */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                      {prod.tag}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ★ {prod.rating}
                    </span>
                  </div>

                  {/* ICON BANNER */}
                  <div className="h-32 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-950 border border-slate-800/80 flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform">
                    {prod.imageIcon}
                  </div>

                  <h3 className="text-sm font-black text-white leading-tight mb-1 line-clamp-1">{prod.name}</h3>
                  <p className="text-[11px] font-mono text-emerald-400 font-bold mb-2">{prod.specs}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{prod.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Price</p>
                      <p className="text-xl font-black text-white font-mono">{prod.price.toLocaleString()} EGP</p>
                    </div>

                    <span className={`text-[11px] font-mono font-bold ${
                      isOutOfStock ? 'text-rose-400' : prod.stock < 10 ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : `${prod.stock} in stock`}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(prod)}
                    disabled={isOutOfStock}
                    className={`w-full py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                      isOutOfStock
                        ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                        : inCart
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>{inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}</span>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* SLIDE-OUT CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5 text-emerald-400" />
                      <h3 className="text-base font-black text-white">YOUR PRO SHOP CART</h3>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* CART ITEMS LIST */}
                  <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {cart.length === 0 ? (
                      <div className="text-center py-16 text-slate-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-slate-700" />
                        <p className="text-sm font-bold text-slate-400">Your cart is empty</p>
                        <p className="text-xs text-slate-600 mt-1">Explore our fuel bar and pro shop items to power your workout.</p>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                          <div className="text-2xl">{item.imageIcon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{item.name}</p>
                            <p className="text-emerald-400 font-mono font-bold">{item.price.toLocaleString()} EGP each</p>
                          </div>

                          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-2 py-1 rounded-xl">
                            <button onClick={() => updateCartQty(item.id, -1)} className="text-slate-400 hover:text-white p-0.5">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-mono font-bold text-white px-1">{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} className="text-slate-400 hover:text-white p-0.5">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-rose-400 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* CART FOOTER & CHECKOUT */}
                {cart.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Items ({cartTotalItems}):</span>
                        <span>{cartSubtotal.toLocaleString()} EGP</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Tax / Surcharge:</span>
                        <span className="text-emerald-400">0 EGP (Gym Member Exemption)</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800/80">
                        <span>Total Due:</span>
                        <span className="text-emerald-400 font-black text-base">{cartSubtotal.toLocaleString()} EGP</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => handleCheckout('Member Account')}
                        disabled={isCheckingOut}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>{isCheckingOut ? 'Processing...' : `Charge to Member Pass (${cartSubtotal.toLocaleString()} EGP)`}</span>
                      </button>

                      <button
                        onClick={() => handleCheckout('Front Desk Cash/Card')}
                        disabled={isCheckingOut}
                        className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-2xl transition"
                      >
                        Pay at Front Desk
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* RECEIPT MODAL */}
      <AnimatePresence>
        {receiptData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="text-center space-y-1">
                <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black text-white">RECEIPT & ORDER CONFIRMED</h3>
                <p className="text-xs text-slate-400">Order Ref: <span className="font-mono text-emerald-400">{receiptData.orderId}</span></p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex justify-between text-slate-400 font-mono pb-2 border-b border-slate-800">
                  <span>Buyer: {receiptData.buyerName}</span>
                  <span>{receiptData.paymentMethod}</span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {receiptData.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-slate-300">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-mono font-bold text-white">{(item.price * item.quantity).toLocaleString()} EGP</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
                  <span>Grand Total</span>
                  <span className="text-emerald-400 font-black font-mono">{receiptData.subtotal.toLocaleString()} EGP</span>
                </div>
              </div>

              <button
                onClick={() => setReceiptData(null)}
                className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Close & Return to Shop
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN MODAL: ADD PRODUCT */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-emerald-400" />
                  <span>ADD SHOP INVENTORY ITEM</span>
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Whey Isolate (Chocolate Fudge)"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Category</label>
                    <select
                      value={newCat}
                      onChange={e => setNewCat(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Icon Emoji</label>
                    <input
                      type="text"
                      value={newIcon}
                      onChange={e => setNewIcon(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl text-center text-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Price (EGP)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Stock Units</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newStock}
                      onChange={e => setNewStock(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Key Specs / Nutritional Highlights</label>
                  <input
                    type="text"
                    placeholder="e.g. 30g Protein • 0g Sugar • 100% Isolate"
                    value={newSpecs}
                    onChange={e => setNewSpecs(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Product details, benefits, and usage instructions..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold"
          >
            <Award className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
