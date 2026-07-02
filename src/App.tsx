import React, { useState, useEffect, useMemo } from 'react';

// Google Apps Script API Base URL
const API_URL = import.meta.env.VITE_API_URL || "";

// ─── 介面型別定義 (Interfaces) ───
interface DrinkItem {
  name: string;
  price: number;
  category: string;
  description: string;
}

interface OrderItem {
  orderId?: string | number;
  name: string;
  drink: string;
  sugar: string;
  ice: string;
  quantity: number;
  totalPrice: number;
  timestamp?: string;
}

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

interface OrderFormProps {
  menu: DrinkItem[];
  onSubmit: (formData: OrderItem) => void;
  isSubmitting: boolean;
  editingOrder: OrderItem | null;
  onCancelEdit: () => void;
}

interface StatCardsProps {
  orders: OrderItem[];
}

interface OrderListProps {
  orders: OrderItem[];
  onEdit: (order: OrderItem) => void;
  onDelete: (orderId: string | number) => void;
  isDeletingId: string | number | null;
  isRefreshing: boolean;
}

// ─── SVG ICONS ───
const Icons = {
  Coffee: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
  Drink: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  TeaCup: ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C11.5 3.5 11.5 5 12 6.5C12.5 5 12.5 3.5 12 2ZM8 4C7.5 5.5 7.5 7 8 8.5C8.5 7 8.5 5.5 8 4ZM16 4C15.5 5.5 15.5 7 16 8.5C16.5 7 16.5 5.5 16 4M6 10H16C17.1 10 18 10.9 18 12V14C18 15.1 17.1 16 16 16H15.5C15 18.5 13 20.5 10.5 21C7.5 21.5 5 19 5 16H4C2.9 16 2 15.1 2 14V12C2 10.9 2.9 10 4 10H6ZM19 11C20.1 11 21 11.9 21 13C21 14.1 20.1 15 19 15H18V11H19Z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
  ),
  Refresh: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3m0 0l3-3m-3 3V8" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5 text-emerald-500" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Users: ({ className = "w-5 h-5 text-indigo-500" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Cash: ({ className = "w-5 h-5 text-amber-500" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CupIcon: ({ className = "w-5 h-5 text-rose-500" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
};

// ─── 預設菜單備用資料 ───
const FALLBACK_MENU: DrinkItem[] = [
  { name: "經典珍珠奶茶", price: 55, category: "經典奶茶", description: "香濃醇厚奶茶搭配手工黑糖蜜漬珍珠，Q彈有嚼勁" },
  { name: "茉莉鮮綠茶", price: 35, category: "清新原茶", description: "精選優質茉莉花苞多次薰製，茶湯金黃清甜，花香悠揚" },
  { name: "錫蘭紅茶拿鐵", price: 60, category: "醇香鮮乳", description: "經典錫蘭紅茶融入鮮乳坊優質鮮乳，口感絲滑濃郁" },
  { name: "黃金炭焙烏龍", price: 35, category: "清新原茶", description: "深山鐵觀音慢火炭焙，喉韻綿長回甘，帶有獨特焙火香" },
  { name: "芝芝莓莓起司", price: 85, category: "芝芝奶蓋", description: "當季新鮮草莓現打冰沙，淋上厚厚一層海鹽芝士奶蓋" },
  { name: "翡翠檸檬綠", price: 50, category: "鮮果特調", description: "黃金比例手擠鮮香檸檬汁，搭配沁涼茉莉綠茶，消暑首選" },
  { name: "小芋圓香奶茶", price: 60, category: "經典奶茶", description: "經典招牌奶茶，搭配口感細緻的小芋圓與地瓜圓雙重享受" },
  { name: "靜岡抹茶拿鐵", price: 65, category: "醇香鮮乳", description: "日本靜岡直送無糖抹茶粉，多重刷茶工藝，甘醇微苦與鮮乳完美交融" }
];

// ─── 提示訊息元件 ───
function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-500 border-emerald-600 text-white',
    error: 'bg-rose-500 border-rose-600 text-white',
    info: 'bg-slate-800 border-slate-900 text-white'
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border animate-fade-in max-w-sm w-11/12 md:max-w-md transition-all">
      <div className={`flex-1 flex items-center gap-3 ${bgColors[type] || bgColors.info} p-1 rounded-lg`}>
        {type === 'success' && <Icons.Check />}
        {type === 'error' && <Icons.Alert />}
        {type === 'info' && <Icons.Info />}
        <p className="font-medium text-sm md:text-base">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-white opacity-70 hover:opacity-100 transition-opacity p-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── 訂購表單元件 ───
function OrderForm({ menu, onSubmit, isSubmitting, editingOrder, onCancelEdit }: OrderFormProps) {
  const [name, setName] = useState(() => localStorage.getItem("beverage_order_name") || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedDrink, setSelectedDrink] = useState<DrinkItem | null>(null);
  const [sugar, setSugar] = useState("半糖");
  const [ice, setIce] = useState("少冰");
  const [quantity, setQuantity] = useState(1);

  // 取得所有不重複的飲料類別
  const categories = useMemo(() => {
    const list = ["全部"];
    menu.forEach(item => {
      if (item.category && !list.includes(item.category)) {
        list.push(item.category);
      }
    });
    return list;
  }, [menu]);

  // 篩選後菜單
  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory = selectedCategory === "全部" || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  // 當編輯模式啟動時，填充表單資料
  useEffect(() => {
    if (editingOrder) {
      setName(editingOrder.name);
      setSugar(editingOrder.sugar || "半糖");
      setIce(editingOrder.ice || "少冰");
      setQuantity(editingOrder.quantity || 1);
      
      // 尋找對應的飲料
      const drinkObj = menu.find(d => d.name === editingOrder.drink);
      if (drinkObj) {
        setSelectedDrink(drinkObj);
        setSelectedCategory(drinkObj.category || "全部");
      } else {
        setSelectedDrink({ name: editingOrder.drink, price: editingOrder.totalPrice / editingOrder.quantity, category: "", description: "" });
      }
    } else {
      setSelectedDrink(null);
      setSugar("半糖");
      setIce("少冰");
      setQuantity(1);
    }
  }, [editingOrder, menu]);

  // 自動儲存姓名到本地 localStorage
  useEffect(() => {
    localStorage.setItem("beverage_order_name", name);
  }, [name]);

  const sugarLevels = ["正常糖", "七分糖", "半糖", "微糖", "無糖"];
  const iceLevels = ["正常冰", "少冰", "微冰", "去冰", "溫熱"];

  const totalPrice = useMemo(() => {
    if (!selectedDrink) return 0;
    return selectedDrink.price * quantity;
  }, [selectedDrink, quantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("請填寫您的訂購姓名！");
      return;
    }
    if (!selectedDrink) {
      alert("請在下方清單中點擊選擇一款飲料！");
      return;
    }

    onSubmit({
      orderId: editingOrder ? editingOrder.orderId : undefined,
      name: name.trim(),
      drink: selectedDrink.name,
      sugar,
      ice,
      quantity,
      totalPrice
    });
  };

  return (
    <div id="order-form-container" className={`bg-white rounded-3xl p-6 md:p-8 shadow-xl transition-all border-2 ${editingOrder ? 'border-amber-500 ring-4 ring-amber-100' : 'border-slate-100/80'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className={`p-2 rounded-xl flex items-center justify-center ${editingOrder ? 'bg-amber-100 text-amber-700' : 'bg-brand-50 text-brand-600'}`}>
            <Icons.TeaCup className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {editingOrder ? "修改我的訂單" : "點一杯好茶"}
          </h2>
        </div>
        {editingOrder && (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full animate-bounce-subtle">
            修改模式
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 訂購人姓名 */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">訂購人姓名 <span className="text-rose-500">*</span></label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="請輸入您的姓名或綽號 (例如: 小明)"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none transition-colors font-medium pl-10 bg-slate-50/50"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
          </div>
        </div>

        {/* 飲料選擇器 */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-sm font-semibold text-slate-700">
              選擇飲料 <span className="text-rose-500">*</span>
              {selectedDrink && (
                <span className="ml-2 text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded text-xs">
                  已選: {selectedDrink.name} (${selectedDrink.price})
                </span>
              )}
            </label>
            
            {/* 搜尋框 */}
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="搜尋飲料..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-full border border-slate-200 text-xs focus:outline-none focus:border-brand-400"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
                <Icons.Search />
              </span>
            </div>
          </div>

          {/* 分類標籤 */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 飲料卡片列表 */}
          <div className="border-2 border-slate-100 rounded-2xl max-h-[220px] overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            {filteredMenu.length > 0 ? (
              filteredMenu.map(drink => (
                <div
                  key={drink.name}
                  onClick={() => setSelectedDrink(drink)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedDrink?.name === drink.name
                      ? 'border-brand-500 bg-brand-50/70 shadow-sm'
                      : 'border-transparent bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-sm md:text-base truncate">{drink.name}</span>
                      {drink.category && (
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded">
                          {drink.category}
                        </span>
                      )}
                    </div>
                    {drink.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{drink.description}</p>
                    )}
                  </div>
                  <div className="font-extrabold text-brand-600 text-sm md:text-base whitespace-nowrap">
                    ${drink.price}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                沒有找到符合條件的飲料 🥤
              </div>
            )}
          </div>
        </div>

        {/* 甜度與冰塊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 甜度 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">甜度調節</label>
            <div className="flex flex-wrap gap-1.5">
              {sugarLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSugar(level)}
                  className={`flex-1 min-w-[65px] px-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center ${
                    sugar === level
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/10'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* 冰塊 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">冰塊調節</label>
            <div className="flex flex-wrap gap-1.5">
              {iceLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setIce(level)}
                  className={`flex-1 min-w-[65px] px-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center ${
                    ice === level
                      ? 'border-sky-500 bg-sky-50/50 text-sky-700 shadow-sm shadow-sky-500/10'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 數量 */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-sm font-semibold text-slate-700">訂購數量</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-50 disabled:hover:bg-white transition-colors shadow-sm"
            >
              <Icons.Minus />
            </button>
            <span className="w-8 text-center font-bold text-lg text-slate-800">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(q => q + 1)}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <Icons.Plus />
            </button>
          </div>
        </div>

        {/* 結帳明細 */}
        {selectedDrink && (
          <div className="bg-brand-50/40 border-2 border-dashed border-brand-200 rounded-2xl p-4 flex items-center justify-between text-slate-700 animate-fade-in">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400">結帳估算明細</p>
              <p className="font-bold text-slate-800 text-sm md:text-base">
                {selectedDrink.name}
              </p>
              <p className="text-xs text-brand-600 font-medium">
                ${selectedDrink.price} × {quantity} 杯 ({sugar} / {ice})
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">應付總額</p>
              <p className="font-black text-2xl text-brand-600">${totalPrice}</p>
            </div>
          </div>
        )}

        {/* 按鈕組 */}
        <div className="flex gap-3 pt-2">
          {editingOrder && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm md:text-base transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              取消修改
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !selectedDrink}
            className={`flex-[2] py-4 px-6 rounded-2xl font-bold text-sm md:text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] ${
              isSubmitting
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : !selectedDrink
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : editingOrder
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>送出處理中...</span>
              </>
            ) : editingOrder ? (
              "確認修改訂單 ✏️"
            ) : (
              "送出訂單 🚀"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── 今日訂單統計卡片 ───
function StatCards({ orders }: StatCardsProps) {
  const stats = useMemo(() => {
    const totalCups = orders.reduce((sum, o) => sum + o.quantity, 0);
    const totalCost = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const uniqueBuyers = new Set(orders.map(o => o.name)).size;
    
    const drinkCounts: Record<string, number> = {};
    orders.forEach(o => {
      drinkCounts[o.drink] = (drinkCounts[o.drink] || 0) + o.quantity;
    });
    
    let popularDrink = "無";
    let maxCount = 0;
    Object.entries(drinkCounts).forEach(([drink, count]) => {
      if (count > maxCount) {
        maxCount = count;
        popularDrink = drink;
      }
    });

    return { totalCups, totalCost, uniqueBuyers, popularDrink, maxCount };
  }, [orders]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 總杯數 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
          <Icons.CupIcon />
        </div>
        <div>
          <p className="text-[10px] md:text-xs text-slate-400 font-semibold tracking-wide uppercase">今日總杯數</p>
          <p className="text-lg md:text-xl font-extrabold text-slate-800">{stats.totalCups} <span className="text-xs font-normal text-slate-400">杯</span></p>
        </div>
      </div>

      {/* 總金額 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
          <Icons.Cash />
        </div>
        <div>
          <p className="text-[10px] md:text-xs text-slate-400 font-semibold tracking-wide uppercase">累計總金額</p>
          <p className="text-lg md:text-xl font-extrabold text-slate-800">${stats.totalCost} <span className="text-xs font-normal text-slate-400">元</span></p>
        </div>
      </div>

      {/* 訂購人數 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
          <Icons.Users />
        </div>
        <div>
          <p className="text-[10px] md:text-xs text-slate-400 font-semibold tracking-wide uppercase">參與人數</p>
          <p className="text-lg md:text-xl font-extrabold text-slate-800">{stats.uniqueBuyers} <span className="text-xs font-normal text-slate-400">人</span></p>
        </div>
      </div>

      {/* 人氣王 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
          <Icons.TrendingUp />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] md:text-xs text-slate-400 font-semibold tracking-wide uppercase">人氣人氣王</p>
          <p className="text-sm md:text-base font-extrabold text-slate-800 truncate" title={stats.popularDrink}>
            {stats.popularDrink === "無" ? "尚未統計" : stats.popularDrink}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 當日訂單列表元件 ───
function OrderList({ orders, onEdit, onDelete, isDeletingId, isRefreshing }: OrderListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.drink.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.sugar && o.sugar.includes(searchQuery)) ||
      (o.ice && o.ice.includes(searchQuery))
    );
  }, [orders, searchQuery]);

  const formatTime = (ts?: string) => {
    if (!ts) return "";
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return ts;
      return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch(e) {
      return ts;
    }
  };

  const downloadCSV = () => {
    if (orders.length === 0) return;
    const headers = ["訂單編號", "訂購人", "飲料名稱", "甜度", "冰塊", "數量", "總金額", "時間"];
    const rows = filteredOrders.map(o => [
      o.orderId,
      o.name,
      o.drink,
      o.sugar,
      o.ice,
      o.quantity,
      o.totalPrice,
      formatTime(o.timestamp)
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `辦公室飲料點單_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateTextReport = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalCups = orders.reduce((sum, o) => sum + o.quantity, 0);
    const totalCost = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    const grouped: Record<string, number> = {};
    orders.forEach(o => {
      const key = `${o.drink} (${o.sugar}/${o.ice})`;
      grouped[key] = (grouped[key] || 0) + o.quantity;
    });

    let report = `📅 辦公室飲料點單統計報表 (${todayStr})\n`;
    report += `====================================\n`;
    report += `🥤 今日總計：${totalCups} 杯\n`;
    report += `💰 累計金額：$${totalCost} 元\n`;
    report += `====================================\n\n`;
    
    report += `📋 【店家點單總計】\n`;
    Object.entries(grouped).forEach(([drinkKey, qty], idx) => {
      report += `${idx + 1}. ${drinkKey} x ${qty} 杯\n`;
    });
    
    report += `\n👤 【訂購人詳細名單】\n`;
    orders.forEach((o, idx) => {
      report += `${idx + 1}. ${o.name}：${o.drink} (${o.sugar}/${o.ice}) x ${o.quantity} 杯 [小計 $${o.totalPrice}]\n`;
    });
    
    report += `\n✨ 本報表由 辦公室精美飲料點單系統 自動產生`;
    return report;
  };

  const downloadTXT = () => {
    if (orders.length === 0) return;
    const reportText = generateTextReport();
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `辦公室飲料點單_${todayStr}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyTextToClipboard = () => {
    if (orders.length === 0) return;
    const reportText = generateTextReport();
    
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("📋 已複製今日訂單統計文字至剪貼簿！可以立刻貼到 LINE / Slack 囉 🥤");
      } catch (err) {
        alert("複製失敗，請手動複製！");
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(reportText).then(() => {
        alert("📋 已複製今日訂單統計文字至剪貼簿！可以立刻貼到 LINE / Slack 囉 🥤");
      }).catch(() => {
        fallbackCopy(reportText);
      });
    } else {
      fallbackCopy(reportText);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100/80 flex flex-col h-full min-h-[450px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-cocoa-100 text-cocoa-800 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">當日訂單明細</h3>
            <p className="text-xs text-slate-400 mt-0.5">即時統計今日辦公室所有跟單</p>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="搜尋訂購人、飲料..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl border-2 border-slate-100 text-sm focus:outline-none focus:border-brand-400 focus:bg-white bg-slate-50/50"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <Icons.Search />
            </span>
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-brand-50/30 rounded-2xl border-2 border-dashed border-brand-100">
          <div className="w-full text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            今日跟單匯出與下載工具：
          </div>
          
          <button
            onClick={downloadCSV}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="下載 CSV 試算表格式，可直接使用 Excel / Google 試算表開啟"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            下載 Excel 報表
          </button>

          <button
            onClick={downloadTXT}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="下載純文字點單總結報表"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            下載純文字檔
          </button>

          <button
            onClick={copyTextToClipboard}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10 active:scale-95"
            title="一鍵複製整理好的文字，方便貼到 LINE 或 Slack 群組中跟飲料店叫外送"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-4 5h6m-6 4h6m-6 4h3" />
            </svg>
            一鍵複製 LINE 格式
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between overflow-y-auto max-h-[500px] pr-1 space-y-3">
        {isRefreshing && orders.length === 0 ? (
          <div className="space-y-3 my-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="shimmer-bg h-4 w-24 rounded-lg"></div>
                  <div className="shimmer-bg h-3 w-40 rounded-lg"></div>
                </div>
                <div className="shimmer-bg h-6 w-16 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="my-auto py-12 flex flex-col items-center text-center max-w-sm mx-auto">
            <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 animate-bounce-subtle mb-4">
              <Icons.TeaCup className="w-12 h-12" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">今天尚未有人訂購 🥤</h4>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              目前訂單還是空的呢！快使用左邊的表單，點選你最心儀的飲料，發起今日的第一杯辦公室能量飲料吧！
            </p>
            <button 
              onClick={() => {
                document.getElementById("order-form-container")?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-5 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-full shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              立刻發起點單 ☕️
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            沒有找到符合「{searchQuery}」的訂單記錄。
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, index) => (
              <div
                key={order.orderId || index}
                className="border border-slate-100 bg-white p-4 rounded-2xl hover:border-brand-200 hover:shadow-md transition-all flex items-center justify-between gap-4 animate-fade-in group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 font-black text-sm flex items-center justify-center border border-brand-100/50 shrink-0">
                    {order.name ? order.name.substring(0, 2) : "無"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-sm md:text-base truncate">{order.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {formatTime(order.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="font-bold text-slate-700 text-xs md:text-sm truncate">
                        {order.drink}
                      </span>
                      <span className="text-[10px] md:text-xs text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded">
                        ×{order.quantity} 杯
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                        {order.sugar}
                      </span>
                      <span className="bg-sky-50 text-sky-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                        {order.ice}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2.5 shrink-0">
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block leading-none mb-1">小計</span>
                    <span className="font-black text-base md:text-lg text-brand-600">${order.totalPrice}</span>
                  </div>

                  <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(order)}
                      className="p-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-amber-300 hover:text-amber-600 text-slate-500 transition-all shadow-sm"
                      title="編輯訂單"
                    >
                      <Icons.Edit />
                    </button>
                    
                    <button
                      onClick={() => { if (order.orderId !== undefined) onDelete(order.orderId); }}
                      disabled={isDeletingId === order.orderId}
                      className="p-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-500 transition-all disabled:opacity-50 shadow-sm"
                      title="刪除訂單"
                    >
                      {isDeletingId === order.orderId ? (
                        <svg className="animate-spin h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Icons.Trash />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 整合 APP 核心元件 ───
export default function App() {
  const [menu, setMenu] = useState<DrinkItem[]>(FALLBACK_MENU);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({ message: '', type: 'info' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const fetchData = async (quiet = false) => {
    if (!API_URL) {
      console.warn("API_URL is not set. Using fallback menu.");
      setMenu(FALLBACK_MENU);
      setIsLoading(false);
      return;
    }
    if (!quiet) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("後端連接失敗");
      const result = await res.json();
      
      if (result.menu && result.menu.length > 0) {
        setMenu(result.menu);
      } else {
        setMenu(FALLBACK_MENU);
      }
      
      if (result.orders) {
        setOrders(result.orders);
      }
      
      if (quiet) {
        showToast("資料已成功重新整理！☕️", "success");
      }
    } catch (error) {
      console.error("載入出錯：", error);
      showToast("無法獲取最新資料，已為您啟用本機備用菜單 🥤", "error");
      setMenu(FALLBACK_MENU);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = async (formData: OrderItem) => {
    if (!API_URL) {
      showToast("未設定後端 API_URL，無法提交訂單！", "error");
      return;
    }
    setIsSubmitting(true);
    const isEdit = !!formData.orderId;
    const payload = {
      action: isEdit ? "update" : "create",
      data: formData
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === "success") {
        showToast(isEdit ? "訂單更新成功！🎉" : "訂單已成功送出！請記得付款喔 💸", "success");
        setEditingOrder(null);
        fetchData(true);
      } else {
        throw new Error(result.message || "後端處理失敗");
      }
    } catch (error: any) {
      console.error("提交失敗：", error);
      showToast("操作失敗：" + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (orderId: string | number) => {
    if (!API_URL) {
      showToast("未設定後端 API_URL，無法刪除訂單！", "error");
      return;
    }
    if (!window.confirm("您確定要刪除這筆訂單嗎？這是不可逆的操作喔！")) return;
    
    setIsDeletingId(orderId);
    const payload = {
      action: "delete",
      data: { orderId }
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === "success") {
        showToast("訂單已成功刪除！🥤", "success");
        if (editingOrder?.orderId === orderId) {
          setEditingOrder(null);
        }
        fetchData(true);
      } else {
        throw new Error(result.message || "後端處理失敗");
      }
    } catch (error: any) {
      console.error("刪除失敗：", error);
      showToast("刪除失敗：" + error.message, "error");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleEditClick = (order: OrderItem) => {
    setEditingOrder(order);
    document.getElementById("order-form-container")?.scrollIntoView({ behavior: 'smooth' });
    showToast(`已進入訂單修改模式`, "info");
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    showToast("已取消修改模式", "info");
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-bold text-sm tracking-wider">努力載入辦公室茶水間選單中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 flex flex-col">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'info' })} 
      />

      <header className="bg-gradient-to-r from-amber-800 via-amber-700 to-orange-700 text-white shadow-lg relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute -bottom-10 left-10 w-48 h-48 rounded-full bg-black/10 pointer-events-none blur-xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-200 border border-white/20 shadow-inner">
              <Icons.TeaCup className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2 justify-center sm:justify-start">
                辦公室飲料點單系統
              </h1>
              <p className="text-xs md:text-sm text-brand-100/90 mt-1 font-medium tracking-wide">
                ⚡️ 每日點單統計・下午茶跟單神幫手
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-200 bg-amber-900/40 border border-amber-600/30 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
              📅 今天日期：{new Date().toISOString().split('T')[0]}
            </span>
            
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center border border-white/20 disabled:opacity-50"
              title="重新整理訂單與菜單"
            >
              <Icons.Refresh className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 w-full flex-1 flex flex-col gap-8">
        <StatCards orders={orders} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <OrderForm
              menu={menu}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              editingOrder={editingOrder}
              onCancelEdit={handleCancelEdit}
            />
          </div>

          <div className="lg:col-span-3 h-full">
            <OrderList
              orders={orders}
              onEdit={handleEditClick}
              onDelete={handleDeleteOrder}
              isDeletingId={isDeletingId}
              isRefreshing={isRefreshing}
            />
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-xs text-slate-400 py-6 border-t border-slate-200/60 max-w-7xl mx-auto w-full">
        <p>© 2026 辦公室精美飲料點單系統 | 同步記錄於 Google Sheets 試算表</p>
        <p className="mt-1 font-mono text-[10px] text-slate-300">GAS API Connection Active</p>
      </footer>
    </div>
  );
}
