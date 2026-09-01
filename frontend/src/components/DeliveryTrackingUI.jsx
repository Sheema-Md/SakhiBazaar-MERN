import React from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, Copy, Check } from 'lucide-react';

const TRACKING_STEPS = [
  { status: 'Confirmed', label: 'Order Confirmed', icon: Package, description: 'Seller received your order request' },
  { status: 'Processing', label: 'Crafting / Preparing', icon: Clock, description: 'Artisan is crafting & packaging your items' },
  { status: 'Packed', label: 'Ready for Courier', icon: Package, description: 'Parcel packed with protective seal' },
  { status: 'Shipped', label: 'In Transit', icon: Truck, description: 'Package dispatched with express courier' },
  { status: 'Out For Delivery', label: 'Out for Delivery', icon: Truck, description: 'Courier agent is en route to your address' },
  { status: 'Delivered', label: 'Delivered', icon: CheckCircle2, description: 'Parcel delivered safely to recipient' }
];

const DeliveryTrackingUI = ({ order }) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-rose-100/50 dark:border-slate-700">
        <Truck className="mx-auto text-slate-400 mb-2" size={32} />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No active shipment selected</p>
      </div>
    );
  }

  const currentStatus = order.orderStatus || order.shipmentStatus || 'Pending';
  
  // Calculate current active step index
  const activeStepIdx = TRACKING_STEPS.findIndex(
    (step) => step.status.toLowerCase() === currentStatus.toLowerCase()
  );

  const normalizedIdx = activeStepIdx >= 0 ? activeStepIdx : 0;
  const progressPercent = Math.min(Math.max(Math.round(((normalizedIdx + 1) / TRACKING_STEPS.length) * 100), 15), 100);

  const copyTracking = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-rose-100/40 dark:border-slate-700/70 p-6 sm:p-8 rounded-3xl shadow-xl space-y-8 animate-fadeIn text-slate-800 dark:text-slate-100">
      
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-rose-50 dark:border-slate-750 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full">
              Live Shipment Tracking
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">
              Order #{order._id?.slice(-8)}
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
            Status: <span className="text-rose-600 dark:text-rose-400 capitalize">{currentStatus}</span>
          </h2>
        </div>

        {/* Tracking Number Pill */}
        {order.trackingNumber && (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-2xl">
            <div>
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Tracking Number</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">{order.trackingNumber}</span>
            </div>
            <button
              onClick={copyTracking}
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Copy Tracking Number"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
          <span>Dispatched</span>
          <span className="text-rose-600 font-extrabold">{progressPercent}% Completed</span>
          <span>Delivered</span>
        </div>

        <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700 relative p-0.5">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Step Timeline (Grid view) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TRACKING_STEPS.map((step, idx) => {
          const isDone = idx <= normalizedIdx;
          const isCurrent = idx === normalizedIdx;
          const IconComp = step.icon;

          return (
            <div
              key={step.status}
              className={`p-3.5 rounded-2xl border transition-all text-center space-y-1.5 ${
                isCurrent
                  ? 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-500/80 shadow-md ring-2 ring-rose-500/10'
                  : isDone
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isDone ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                <IconComp size={16} />
              </div>
              <p className={`text-xs font-bold ${isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {step.label}
              </p>
              <p className="text-[9px] text-slate-400 leading-tight">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Timeline Audit Logs */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="pt-4 border-t border-rose-50 dark:border-slate-750">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Audit Activity Timeline
          </h4>
          <div className="relative pl-6 space-y-4 border-l-2 border-rose-100 dark:border-slate-700 ml-2">
            {order.timeline.map((event, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-slate-800" />
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{event.status}</span>
                  <span className="text-[10px] text-slate-400">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                {event.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Destination Shipping Address Footer */}
      {order.shippingAddress && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 rounded-2xl flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
          <MapPin size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Delivery Address</span>
            <span>{order.shippingAddress}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryTrackingUI;
