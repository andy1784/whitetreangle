
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';

interface AdminPanelProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ orders, onUpdateStatus }) => {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Global Trade Management</h1>
        <p className="text-gray-500">Oversee all active "White Triangle" transactions across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-semibold uppercase">Total Volume</p>
          <p className="text-2xl font-bold text-blue-600">${orders.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-semibold uppercase">Active Escrows</p>
          <p className="text-2xl font-bold text-orange-600">{orders.filter(o => o.status === OrderStatus.ESCROW_LOCKED).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-semibold uppercase">Completed</p>
          <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === OrderStatus.COMPLETED).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-semibold uppercase">Disputes</p>
          <p className="text-2xl font-bold text-red-600">{orders.filter(o => o.status === OrderStatus.DISPUTED).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Transaction History</h2>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value={OrderStatus.PENDING}>Pending</option>
            <option value={OrderStatus.ESCROW_LOCKED}>Escrow Locked</option>
            <option value={OrderStatus.COMPLETED}>Completed</option>
            <option value={OrderStatus.DISPUTED}>Disputed</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-400">{order.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.creatorEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">${order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.type === 'BUY' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {order.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === OrderStatus.COMPLETED ? 'bg-green-50 text-green-700' : 
                      order.status === OrderStatus.ESCROW_LOCKED ? 'bg-orange-50 text-orange-700' :
                      order.status === OrderStatus.DISPUTED ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                    >
                      Verify
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(order.id, OrderStatus.DISPUTED)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Dispute
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
