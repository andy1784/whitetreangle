
import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, OrderStatus, Message, LoginEvent, ActiveSession } from './types';
import { getAiSupportResponse } from './services/gemini';
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';
import SecurityDashboard from './components/SecurityDashboard';

type AuthStep = 'EMAIL' | '2FA';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [authStep, setAuthStep] = useState<AuthStep>('EMAIL');
  const [otp, setOtp] = useState('');
  
  // Dashboard Filters
  const [tradeFilterType, setTradeFilterType] = useState<string>('ALL');
  const [tradeFilterCurrency, setTradeFilterCurrency] = useState<string>('ALL');
  const [tradeFilterStatus, setTradeFilterStatus] = useState<string>('ALL');

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord_1',
      type: 'SELL',
      amount: 1500,
      currency: 'USDT',
      price: 1.01,
      commission: 1500 * 0.008,
      totalAmount: 1500 * 1.008,
      status: OrderStatus.PENDING,
      creatorId: 'user_2',
      creatorEmail: 'seller_example@mail.com',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ord_2',
      type: 'BUY',
      amount: 500,
      currency: 'BTC',
      price: 65000,
      commission: 500 * 0.008,
      totalAmount: 500 * 1.008,
      status: OrderStatus.ESCROW_LOCKED,
      creatorId: 'user_3',
      creatorEmail: 'crypto_whale@mail.com',
      createdAt: new Date().toISOString()
    }
  ]);

  const [supportOpen, setSupportOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your WhiteTriangle AI assistant. I am now powered by an advanced thinking model for complex security queries. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setAuthStep('2FA');
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: email.includes('admin') ? 'ADMIN' : 'USER',
        balance: 1000,
        is2FAEnabled: true,
        loginHistory: [
          { id: '1', timestamp: new Date().toISOString(), ip: '192.168.1.1', device: 'Chrome on MacOS', location: 'London, UK', status: 'SUCCESS' },
          { id: '2', timestamp: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.1', device: 'Safari on iPhone', location: 'London, UK', status: 'SUCCESS' }
        ],
        activeSessions: [
          { id: 's1', device: 'Chrome on MacOS', ip: '192.168.1.1', lastActive: 'Just now', isCurrent: true },
          { id: 's2', device: 'Safari on iPhone', ip: '192.168.1.1', lastActive: '2 hours ago', isCurrent: false }
        ]
      };
      setUser(newUser);
      setCurrentPage('home');
      setAuthStep('EMAIL');
      setOtp('');
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentPage('home');
    setAuthStep('EMAIL');
  };

  const revokeSession = (id: string) => {
    if (!user) return;
    setUser({
      ...user,
      activeSessions: user.activeSessions.filter(s => s.id !== id)
    });
  };

  const toggle2FA = () => {
    if (!user) return;
    setUser({ ...user, is2FAEnabled: !user.is2FAEnabled });
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    const context = `User is currently on ${currentPage} page. User role is ${user?.role || 'Guest'}. 2FA is ${user?.is2FAEnabled ? 'enabled' : 'disabled'}. Platform fee is 0.8%.`;
    const result = await getAiSupportResponse(userMsg, context);
    
    setChatMessages(prev => [...prev, { 
      role: 'model', 
      text: result.text, 
      groundingUrls: result.links 
    }]);
    setIsTyping(false);
  };

  const createOrder = () => {
    if (!user) {
      setCurrentPage('auth');
      return;
    }
    const amount = Math.floor(Math.random() * 2000) + 100;
    const commission = amount * 0.008;
    const newOrder: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 5),
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      amount: amount,
      currency: Math.random() > 0.5 ? 'USDT' : 'BTC',
      price: Math.random() > 0.5 ? 1.00 : 65000,
      commission: commission,
      totalAmount: amount + commission,
      status: OrderStatus.PENDING,
      creatorId: user.id,
      creatorEmail: user.email,
      createdAt: new Date().toISOString()
    };
    setOrders([newOrder, ...orders]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handlePayPalPayment = (orderId: string) => {
    alert("Initiating Secure PayPal Escrow payment for " + orderId);
    setTimeout(() => {
      updateOrderStatus(orderId, OrderStatus.ESCROW_LOCKED);
      alert("Payment Locked in Escrow. Waiting for Seller delivery.");
    }, 1500);
  };

  const filteredUserOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(o => {
      const isOwner = o.creatorId === user.id;
      const matchType = tradeFilterType === 'ALL' || o.type === tradeFilterType;
      const matchCurrency = tradeFilterCurrency === 'ALL' || o.currency === tradeFilterCurrency;
      const matchStatus = tradeFilterStatus === 'ALL' || o.status === tradeFilterStatus;
      return isOwner && matchType && matchCurrency && matchStatus;
    });
  }, [orders, user, tradeFilterType, tradeFilterCurrency, tradeFilterStatus]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        user={user} 
        onLogout={logout} 
        onNavigate={setCurrentPage} 
        currentPage={currentPage}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center py-12 px-4 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Secure P2P <span className="text-blue-600">"White Triangle"</span> Escrow
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
                The safest way to exchange electronic payments. Our platform acts as the trusted third party to ensure both parties fulfill their promises.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={createOrder}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Create New Trade Offer
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4">Platform Fee: 0.8% applies to all trades</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2">
                     <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded">0.8% FEE</span>
                   </div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.type === 'BUY' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {order.type} {order.currency}
                    </span>
                    <span className="text-sm font-medium text-gray-400">{order.status}</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">${order.amount.toLocaleString()}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-400">Fee: ${order.commission.toFixed(2)}</p>
                      <p className="text-xs font-bold text-gray-500">Total: ${order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {order.creatorEmail[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Seller/Buyer</p>
                      <p className="text-sm font-bold text-gray-700 truncate w-40">{order.creatorEmail}</p>
                    </div>
                  </div>
                  
                  {order.status === OrderStatus.PENDING && (
                    <button 
                      onClick={() => handlePayPalPayment(order.id)}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-100"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zm10-5c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zm-10 2c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3z"/></svg>
                      Lock via PayPal
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'auth' && (
          <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="w-16 h-1 w-full bg-gray-100 rounded-full mb-8 overflow-hidden">
               <div className={`h-full bg-blue-600 transition-all duration-500 ${authStep === 'EMAIL' ? 'w-1/2' : 'w-full'}`} />
            </div>

            {authStep === 'EMAIL' ? (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
                  <p className="text-gray-500 text-sm mt-2">Access your WhiteTriangle account</p>
                </div>
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Continue
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Verification Code</h2>
                  <p className="text-gray-500 text-sm mt-2">Enter the 6-digit code sent to {email}</p>
                </div>
                <form onSubmit={handleVerify2FA} className="space-y-6">
                  <div>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="000000"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={otp.length !== 6}
                    className="w-full bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Verify & Login
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAuthStep('EMAIL')}
                    className="w-full text-sm font-semibold text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Use different email
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {currentPage === 'admin' && user?.role === 'ADMIN' && (
          <AdminPanel orders={orders} onUpdateStatus={updateOrderStatus} />
        )}

        {currentPage === 'security' && user && (
          <SecurityDashboard 
            user={user} 
            onRevokeSession={revokeSession} 
            onToggle2FA={toggle2FA} 
          />
        )}

        {currentPage === 'dashboard' && user && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold">My Trading Dashboard</h2>
              <div className="flex flex-wrap gap-3">
                <select 
                  value={tradeFilterType}
                  onChange={(e) => setTradeFilterType(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
                <select 
                  value={tradeFilterCurrency}
                  onChange={(e) => setTradeFilterCurrency(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ALL">All Currencies</option>
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                </select>
                <select 
                  value={tradeFilterStatus}
                  onChange={(e) => setTradeFilterStatus(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value={OrderStatus.PENDING}>Pending</option>
                  <option value={OrderStatus.ESCROW_LOCKED}>Escrow Locked</option>
                  <option value={OrderStatus.COMPLETED}>Completed</option>
                  <option value={OrderStatus.DISPUTED}>Disputed</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Available Balance</p>
                  <p className="text-3xl font-black text-blue-900">${user.balance.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Completed Trades</p>
                  <p className="text-3xl font-black text-green-900">12</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Reputation Score</p>
                  <p className="text-3xl font-black text-gray-900">4.9/5</p>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Trade History ({filteredUserOrders.length})</h3>
                  {(tradeFilterType !== 'ALL' || tradeFilterCurrency !== 'ALL' || tradeFilterStatus !== 'ALL') && (
                    <button 
                      onClick={() => {
                        setTradeFilterType('ALL');
                        setTradeFilterCurrency('ALL');
                        setTradeFilterStatus('ALL');
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {filteredUserOrders.length > 0 ? (
                    filteredUserOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg font-bold text-xs ${o.type === 'BUY' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {o.type}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{o.amount.toLocaleString()} {o.currency}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                              <span className="text-[10px] text-gray-300">•</span>
                              <p className="text-[10px] text-gray-400">Fee: ${o.commission.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            o.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                            o.status === OrderStatus.ESCROW_LOCKED ? 'bg-orange-100 text-orange-700' :
                            o.status === OrderStatus.DISPUTED ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {o.status}
                          </span>
                          <p className="text-[10px] text-gray-400 font-mono">ID: {o.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium italic">No trades matching your filters.</p>
                      <button 
                        onClick={() => {
                          setTradeFilterType('ALL');
                          setTradeFilterCurrency('ALL');
                          setTradeFilterStatus('ALL');
                        }}
                        className="mt-2 text-sm text-blue-600 font-bold"
                      >
                        Reset all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Gemini AI Support Sidebar */}
      <div className={`fixed right-6 bottom-24 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all transform z-50 ${supportOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="p-4 bg-blue-600 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Escrow Assistant</p>
              <p className="text-blue-100 text-[10px]">Thinking-Enabled Security</p>
            </div>
          </div>
          <button onClick={() => setSupportOpen(false)} className="text-white/80 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="h-96 overflow-y-auto p-4 space-y-4 text-sm">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'}`}>
                {msg.text}
                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-200/50">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Verifiable Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingUrls.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] bg-white/50 px-2 py-1 rounded hover:bg-white transition-colors border border-gray-200 truncate max-w-[150px] inline-block"
                        >
                          {link.title || 'Source'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-gray-400 italic flex items-center gap-2">
                <span className="flex gap-1"><span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-75"></span><span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150"></span></span>
                Analyzing deep context...
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Deep reasoning support..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={sendMessage}
            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>

      <button 
        onClick={() => setSupportOpen(!supportOpen)}
        className="fixed right-6 bottom-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40 text-white ring-4 ring-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>© 2024 WhiteTriangle P2P. Enhanced Intelligence & Safety.</p>
      </footer>
    </div>
  );
};

export default App;
