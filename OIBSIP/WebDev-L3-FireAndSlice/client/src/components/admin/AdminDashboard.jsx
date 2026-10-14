import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Package, Box, Plus, Search, Filter, ChevronDown, Edit, Trash2, AlertTriangle, Bell, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { adminApi, inventoryApi, orderApi } from '../../services/api';
import { formatPrice, formatRelativeTime, getStatusColor, getStatusIcon } from '../../utils/helpers';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import { useAdminStore } from '../../store/adminStore';

const INVENTORY_CATEGORIES = ['base', 'sauce', 'cheese', 'vegetable'];
const ORDER_STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    inventory,
    orders,
    inventoryLoading,
    ordersLoading,
    setInventory,
    setOrders,
    setInventoryLoading,
    setOrdersLoading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addOrder,
    updateOrder,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('inventory');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({ category: '', name: '', stock: 0, unit: 'units', threshold: 20, price: 0 });
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setInventoryLoading(true);
    setOrdersLoading(true);
    try {
      const [invData, ordData] = await Promise.all([
        inventoryApi.getAll(),
        orderApi.getAllOrders(),
      ]);
      setInventory(invData);
      setOrders(ordData);
      checkLowStock(invData);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setInventoryLoading(false);
      setOrdersLoading(false);
    }
  };

  const checkLowStock = (items) => {
    const lowStock = items.filter(item => item.stock <= item.threshold);
    setLowStockAlerts(lowStock);
    if (lowStock.length > 0) {
      toast.warning(`${lowStock.length} items are running low on stock!`);
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryApi.update(editingItem._id, formData);
        updateInventoryItem(editingItem._id, formData);
        toast.success('Inventory updated successfully');
      } else {
        const newItem = await inventoryApi.create(formData);
        addInventoryItem(newItem);
        toast.success('Inventory item created successfully');
      }
      closeInventoryModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save inventory item');
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await inventoryApi.delete(id);
      deleteInventoryItem(id);
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      updateOrder(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      closeOrderModal();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const openInventoryModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ category: item.category, name: item.name, stock: item.stock, unit: item.unit, threshold: item.threshold, price: item.price });
    } else {
      setEditingItem(null);
      setFormData({ category: '', name: '', stock: 0, unit: 'units', threshold: 20, price: 0 });
    }
    setShowInventoryModal(true);
  };

  const closeInventoryModal = () => {
    setShowInventoryModal(false);
    setEditingItem(null);
    setFormData({ category: '', name: '', stock: 0, unit: 'units', threshold: 20, price: 0 });
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesStatus;
  });

  const lowStockCount = inventory.filter(item => item.stock <= item.threshold).length;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface-elevated border-b border-surface-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/admin" className="flex items-center gap-2">
                <Box className="w-8 h-8 text-ember-glow" />
                <span className="font-bold text-xl text-crust-cream">FIRE & SLICE Admin</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1 bg-surface-container rounded-xl p-1">
                {[
                  { id: 'inventory', label: 'Inventory', icon: Box },
                  { id: 'orders', label: 'Orders', icon: Package },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-surface-elevated text-ember-glow shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
                        : 'text-on-surface-variant hover:text-crust-cream'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {lowStockCount > 0 && (
                <Button variant="outline" size="sm" className="gap-1 border-yellow-500 text-yellow-700 bg-yellow-50">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{lowStockCount} Low Stock</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inventory' && (
          <InventoryTab
            inventory={filteredInventory}
            loading={inventoryLoading}
            lowStockAlerts={lowStockAlerts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            openInventoryModal={openInventoryModal}
            onDelete={handleDeleteInventory}
            fetchData={fetchData}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={filteredOrders}
            loading={ordersLoading}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            openOrderModal={openOrderModal}
          />
        )}
      </main>

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={showInventoryModal}
        onClose={closeInventoryModal}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleInventorySubmit}
      />

      {/* Order Modal */}
      <OrderStatusModal
        isOpen={showOrderModal}
        onClose={closeOrderModal}
        order={selectedOrder}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </div>
  );
}

function InventoryTab({ 
  inventory, 
  loading, 
  lowStockAlerts,
  searchQuery, 
  setSearchQuery, 
  categoryFilter, 
  setCategoryFilter,
  openInventoryModal,
  onDelete,
  fetchData
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-crust-cream">Inventory Management</h1>
          <p className="text-on-surface-variant">Manage stock levels for all pizza ingredients</p>
        </div>
        <Button onClick={() => openInventoryModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {lowStockAlerts.length} item{lowStockAlerts.length > 1 ? 's are' : ' is'} below threshold
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lowStockAlerts.map(item => (
                    <Badge key={item._id} variant="warning" className="text-xs">
                      {item.name} ({item.stock}/{item.threshold})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ash-muted" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Categories</option>
          {INVENTORY_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-12">
              <Box className="w-12 h-12 mx-auto text-ash-muted/40 mb-4" />
              <p className="text-ash-muted">No inventory items found</p>
              <Button onClick={() => openInventoryModal()} className="mt-4">Add First Item</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-elevated border-b border-surface-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Threshold</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-ash-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {inventory.map(item => (
                    <tr key={item._id} className="hover:bg-surface-elevated">
                      <td className="px-6 py-4">
                        <div className="font-medium text-crust-cream">{item.name}</div>
                        <div className="text-sm text-ash-muted">{item.unit}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          item.category === 'base' ? 'primary' :
                          item.category === 'sauce' ? 'warning' :
                          item.category === 'cheese' ? 'success' : 'info'
                        }>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${item.stock <= item.threshold ? 'text-red-600' : 'text-crust-cream'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-ash-muted">{item.threshold}</td>
                      <td className="px-6 py-4 font-medium text-crust-cream">{formatPrice(item.price)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.stock <= item.threshold ? 'danger' : 'success'}>
                          {item.stock <= item.threshold ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openInventoryModal(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDelete(item._id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersTab({ orders, loading, statusFilter, setStatusFilter, openOrderModal }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-crust-cream">Order Management</h1>
          <p className="text-on-surface-variant">View and update order statuses</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', ...ORDER_STATUSES].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary-container text-white'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-ash-muted/40 mb-4" />
              <p className="text-ash-muted">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-elevated border-b border-surface-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Pizza</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ash-muted uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-ash-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-surface-elevated">
                      <td className="px-6 py-4 font-mono font-medium text-crust-cream">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-crust-cream">{order.userId?.name || 'Unknown'}</div>
                        <div className="text-sm text-ash-muted">{order.userId?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-crust-cream">{order.pizza?.base}</div>
                        <div className="text-xs text-ash-muted">
                          {order.pizza?.sauce}, {order.pizza?.cheese}
                          {order.pizza?.vegetables?.length > 0 && ` +${order.pizza.vegetables.length} veggies`}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-crust-cream">{formatPrice(order.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)} {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-ash-muted">{formatRelativeTime(order.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => openOrderModal(order)}>
                          Update Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InventoryModal({ isOpen, onClose, editingItem, formData, setFormData, onSubmit }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            >
              <option value="">Select category</option>
              {INVENTORY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Item Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            placeholder="e.g., Thin Crust"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Current Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              className="input"
              min="0"
              required
            />
          </div>
          <div>
            <label className="label">Low Stock Threshold</label>
            <input
              type="number"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 20 })}
              className="input"
              min="0"
              required
            />
          </div>
          <div>
            <label className="label">Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="input"
              min="0"
              step="0.5"
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function OrderStatusModal({ isOpen, onClose, order, onUpdateStatus }) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Order #${order.orderNumber}`} size="md">
      <div className="space-y-6">
        {/* Order Info */}
        <div className="bg-surface-elevated rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-ash-muted">Customer</p>
              <p className="font-medium">{order.userId?.name}</p>
            </div>
            <div>
              <p className="text-ash-muted">Total</p>
              <p className="font-medium text-ember-glow">{formatPrice(order.totalPrice)}</p>
            </div>
            <div>
              <p className="text-ash-muted">Pizza</p>
              <p className="font-medium text-sm">{order.pizza?.base}, {order.pizza?.sauce}, {order.pizza?.cheese}</p>
            </div>
            <div>
              <p className="text-ash-muted">Order Time</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div>
          <label className="label">Current Status</label>
          <Badge variant={getStatusColor(order.status)} className="text-base px-4 py-2">
            {getStatusIcon(order.status)} {order.status}
          </Badge>
        </div>

        {/* Status Selector */}
        <div>
          <label className="label">Update Status</label>
          <div className="grid grid-cols-2 gap-2">
            {ORDER_STATUSES.map(status => (
              <button
                key={status}
                onClick={() => onUpdateStatus(order._id, status)}
                disabled={status === order.status}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  status === order.status
                    ? 'border-primary-container bg-primary-container/15'
                    : 'border-surface-border hover:border-primary-300 hover:bg-surface-elevated'
                }`}
              >
                <div className="text-2xl mb-1">{getStatusIcon(status)}</div>
                <div className="font-medium text-crust-cream">{status}</div>
              </button>
            ))}
          </div>
        </div>

        <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}