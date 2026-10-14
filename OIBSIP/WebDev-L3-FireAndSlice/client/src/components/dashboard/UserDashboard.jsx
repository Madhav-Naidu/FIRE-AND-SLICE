import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Pizza, Package, Clock, ChevronRight, User, Settings, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderApi } from '../../services/api';
import { formatDate, formatRelativeTime, getStatusColor, getStatusIcon } from '../../utils/helpers';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';

export function UserDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    setPollingInterval(interval);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleReorder = (order) => {
    navigate('/builder');
    toast.info('Redirecting to builder...');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface-elevated border-b border-surface-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Pizza className="w-8 h-8 text-ember-glow" />
                <span className="font-bold text-xl text-crust-cream">FIRE & SLICE</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-sm font-medium text-ember-glow">My Orders</Link>
                <Link to="/menu" className="text-sm font-medium text-on-surface-variant hover:text-crust-cream">Menu</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-on-surface-variant">
                Welcome, {user?.name}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-crust-cream">My Orders</h1>
          <p className="text-on-surface-variant mt-1">Track your pizza deliveries in real-time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Orders" 
            value={orders.length} 
            icon={Package} 
            color="primary" 
          />
          <StatCard 
            title="Delivered" 
            value={orders.filter(o => o.status === 'Delivered').length} 
            icon={Package} 
            color="success" 
          />
          <StatCard 
            title="In Progress" 
            value={orders.filter(o => ['Order Received', 'In Kitchen', 'Sent to Delivery'].includes(o.status)).length} 
            icon={Clock} 
            color="warning" 
          />
          <StatCard 
            title="Total Spent" 
            value={formatPrice(orders.reduce((sum, o) => sum + o.totalPrice, 0))} 
            icon={Heart} 
            color="danger" 
          />
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <EmptyState onOrderNow={() => navigate('/menu')} />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                onView={() => handleViewOrder(order)}
                onReorder={() => handleReorder(order)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    primary: 'bg-primary-container/15 text-ember-glow border-primary-100',
    success: 'bg-green-50 text-green-600 border-green-100',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <Card className={`border ${colors[color]}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ash-muted">{title}</p>
            <p className="text-2xl font-bold text-crust-cream mt-1">{value}</p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-surface-container/50">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onOrderNow }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto rounded-full bg-surface-container flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-ash-muted" />
      </div>
      <h2 className="text-xl font-semibold text-crust-cream mb-2">No orders yet</h2>
      <p className="text-ash-muted mb-6">Start your pizza journey by ordering your first custom pizza!</p>
      <Button onClick={onOrderNow} size="lg">
        <Pizza className="w-5 h-5 mr-2" />
        Order Now
      </Button>
    </div>
  );
}

function OrderCard({ order, onView, onReorder }) {
  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);

  return (
    <Card hover className="overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-container/15 flex items-center justify-center">
              <span className="text-2xl">{statusIcon}</span>
            </div>
            <div>
              <p className="font-semibold text-crust-cream">Order #{order.orderNumber}</p>
              <p className="text-sm text-ash-muted">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusColor}>
              {statusIcon} {order.status}
            </Badge>
            <span className="text-lg font-bold text-ember-glow">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        {/* Progress Timeline */}
        <OrderTimeline status={order.status} />

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-border">
          <div className="flex items-center gap-2 text-sm text-ash-muted">
            <span>{order.pizza.base}</span>
            <span>•</span>
            <span>{order.pizza.sauce}</span>
            <span>•</span>
            <span>{order.pizza.cheese}</span>
            {order.pizza.vegetables.length > 0 && (
              <>
                <span>•</span>
                <span>{order.pizza.vegetables.length} veggies</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
              View Details
            </Button>
            <Button variant="secondary" size="sm" onClick={onReorder}>
              Reorder
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function OrderTimeline({ status }) {
  const statuses = [
    { key: 'Order Received', label: 'Order Received', icon: '📦' },
    { key: 'In Kitchen', label: 'In Kitchen', icon: '🍳' },
    { key: 'Sent to Delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'Delivered', label: 'Delivered', icon: '✅' },
  ];

  const currentIndex = statuses.findIndex(s => s.key === status);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {statuses.map((s, i) => (
          <div key={s.key} className="flex flex-col items-center relative z-10 flex-1">
            <div 
              className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                i <= currentIndex ? 'bg-primary-container border-primary-container' : 'bg-surface-container border-surface-border'
              }`}
            />
            <span className={`text-xs font-medium mt-1.5 max-w-[70px] text-center ${
              i <= currentIndex ? 'text-ember-glow' : 'text-ash-muted'
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-[6px] left-1/2 right-1/2 h-0.5 -z-10">
        <div 
          className="h-full bg-primary-container transition-all duration-500"
          style={{ width: `${Math.max(0, (currentIndex / (statuses.length - 1)) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <Modal isOpen={!!order} onClose={onClose} title={`Order #${order?.orderNumber}`} size="lg">
      <div className="space-y-6">
        {/* Status Timeline */}
        <div>
          <h3 className="font-semibold text-crust-cream mb-4">Order Status</h3>
          <div className="timeline">
            {[
              { key: 'Order Received', label: 'Order Received', desc: 'Your order has been confirmed', time: order?.createdAt },
              { key: 'In Kitchen', label: 'In Kitchen', desc: 'Our chefs are preparing your pizza', time: order?.updatedAt },
              { key: 'Sent to Delivery', label: 'Out for Delivery', desc: 'Your pizza is on the way', time: order?.updatedAt },
              { key: 'Delivered', label: 'Delivered', desc: 'Enjoy your meal!', time: order?.updatedAt },
            ].map((s, i) => (
              <div key={s.key} className={`timeline-item ${i === 0 ? 'completed' : i < 3 ? 'active' : ''}`}>
                <div className="timeline-content">
                  <div className="timeline-time">{s.time && formatRelativeTime(s.time)}</div>
                  <div className="timeline-title">{s.label}</div>
                  <div className="timeline-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="border-t border-surface-border pt-6 space-y-4">
          <h3 className="font-semibold text-crust-cream">Pizza Details</h3>
          <div className="space-y-3">
            <DetailRow label="Base" value={order?.pizza?.base} />
            <DetailRow label="Sauce" value={order?.pizza?.sauce} />
            <DetailRow label="Cheese" value={order?.pizza?.cheese} />
            {order?.pizza?.vegetables?.length > 0 && (
              <DetailRow label="Vegetables" value={order.pizza.vegetables.join(', ')} />
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t border-surface-border pt-6 space-y-3">
          <h3 className="font-semibold text-crust-cream">Payment</h3>
          <DetailRow label="Order Total" value={formatPrice(order?.totalPrice)} />
          <DetailRow label="Payment ID" value={order?.paymentId} />
          <DetailRow label="Payment Status" value={
            <Badge variant={order?.paymentStatus === 'completed' ? 'success' : 'warning'}>
              {order?.paymentStatus}
            </Badge>
          } />
        </div>

        <div className="flex gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button>
          <Button onClick={() => { onClose(); window.location.href = '/menu'; }} className="flex-1">
            Order Again
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-crust-cream">{value}</span>
    </div>
  );
}