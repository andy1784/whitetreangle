
import React, { useState, useEffect, useCallback } from 'react';
import { User, Order, OrderStatus, Message } from './types';
import { getAiSupportResponse } from './services/gemini';
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord_1',
      type: 'SELL',
      amount: 1500,
      currency: 'USDT',
      price: 1.01,
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
      status: OrderStatus.ESCROW_LOCKED,
      creatorId: 'user_3',
      creatorEmail: 'crypto_whale@mail.com',
      createdAt: new Date().toISOString()
    }
  ]);

  const [supportOpen, setSupportOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your WhiteTriangle AI assistant. How can I help you with your secure P2P exchange today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Authentication Mock
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: email.includes('admin') ? 'ADMIN' : 'USER',
        balance: 1000
      };
      setUser(newUser);
      setCurrentPage('home');
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  // Chat handling
  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    const context = `User is currently on ${currentPage} page. User role is ${user?.role || 'Guest'}.`;
    const response = await getAiSupportResponse(userMsg, context);
    
    setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  const createOrder = () => {
    if (!user) {
      setCurrentPage('auth');
      return;
    }
    const newOrder: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 5),
      type: 'BUY',
      amount: 250,
      currency: 'USDT',
      price: 1.00,
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
    // Mock successful PayPal flow
    alert("Initiating Secure PayPal Escrow payment for " + orderId);
    setTimeout(() => {
      updateOrderStatus(orderId, OrderStatus.ESCROW_LOCKED);
      alert("Payment Locked in Escrow. Waiting for Seller delivery.");
    }, 1500);
  };

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
          <div className="space-y-12">
            {/* Hero Section */}
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
                  Create Buy Offer
                </button>
                <button className="bg-white text-gray-700 border-2 border-gray-100 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  How it Works
                </button>
              </div>
            </div>

            {/* Marketplace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.type === 'BUY' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {order.type} {order.currency}
                    </span>
                    <span className="text-sm font-medium text-gray-400">{order.status}</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-gray-900">${order.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Price: {order.price} USD / {order.currency}</p>
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
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zm10-5c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zm-10 2c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3z"/></svg>
                      Lock via PayPal
                    </button>
                  )}
                  {order.status === OrderStatus.ESCROW_LOCKED && (
                    <div className="text-center p-3 border-2 border-dashed border-orange-200 rounded-xl">
                      <p className="text-xs font-bold text-orange-600">FUNDS IN ESCROW</p>
                      <p className="text-[10px] text-gray-400">Secure White Triangle process active</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'auth' && (
          <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Sign in to WhiteTriangle</h2>
              <p className="text-gray-500 text-sm mt-2">Enter your email to access the P2P marketplace</p>
            </div>
            <form onSubmit={handleAuth} className="space-y-6">
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
                Continue with Email
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-6">
              By continuing, you agree to our Terms of Service regarding Escrow operations.
            </p>
          </div>
        )}

        {currentPage === 'admin' && user?.role === 'ADMIN' && (
          <AdminPanel orders={orders} onUpdateStatus={updateOrderStatus} />
        )}

        {currentPage === 'dashboard' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Your Trading Dashboard</h2>
            {user ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Available Balance</p>
                    <p className="text-3xl font-black text-blue-900">${user.balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Completed Trades</p>
                    <p className="text-3xl font-black text-green-900">12</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Reputation Score</p>
                    <p className="text-3xl font-black text-gray-900">4.9/5</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4">Active & History</h3>
                  <div className="space-y-4">
                    {orders.filter(o => o.creatorId === user.id).map(o => (
                      <div key={o.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${o.type === 'BUY' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {o.type}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{o.amount} {o.currency}</p>
                            <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{o.status}</p>
                          <p className="text-xs text-gray-400">ID: {o.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500">Please sign in to view your dashboard</p>
                <button onClick={() => setCurrentPage('auth')} className="mt-4 text-blue-600 font-bold underline">Login</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Gemini AI Support Sidebar */}
      <div className={`fixed right-6 bottom-24 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all transform ${supportOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
        <div className="p-4 bg-blue-600 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Support Bot</p>
              <p className="text-blue-100 text-[10px]">Powered by Gemini AI</p>
            </div>
          </div>
          <button onClick={() => setSupportOpen(false)} className="text-white/80 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="h-96 overflow-y-auto p-4 space-y-4 text-sm scrollbar-hide">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-gray-400">
                Thinking...
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
            placeholder="Ask about White Triangle..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={sendMessage}
            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>

      <button 
        onClick={() => setSupportOpen(!supportOpen)}
        className="fixed right-6 bottom-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40 text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>© 2024 WhiteTriangle P2P Exchange. Powered by Gemini AI & PayPal.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="hover:text-blue-600">Terms</a>
          <a href="#" className="hover:text-blue-600">Privacy</a>
          <a href="#" className="hover:text-blue-600">Security</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
