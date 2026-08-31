import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Product } from '../types';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Copy,
  Trash2,
  X,
  IndianRupee,
  CheckCircle2
} from 'lucide-react';

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    description: '',
    defaultRefillingPrice: '' as any,
    defaultNewPrice: '' as any,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products', { params: { search } });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      capacity: '5Kg',
      description: '',
      defaultRefillingPrice: 900,
      defaultNewPrice: 2200,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      capacity: p.capacity,
      description: p.description,
      defaultRefillingPrice: p.defaultRefillingPrice ?? '',
      defaultNewPrice: p.defaultNewPrice ?? '',
      notes: p.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await apiClient.post(`/products/${id}/duplicate`);
      fetchProducts();
    } catch (err) {
      alert('Failed to duplicate product');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Deactivate this product from library?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to deactivate product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    try {
      setSaving(true);
      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.id}`, formData);
      } else {
        await apiClient.post('/products', formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Package className="w-7 h-7 text-purple-600" />
            <span>Product Description Library</span>
          </h2>
          <p className="text-sm text-slate-500">
            Reusable technical fire extinguisher descriptions and default refilling & new unit pricing.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product descriptions, names, capacities..."
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No Products Found</h3>
            <p className="text-xs max-w-sm mx-auto mb-4">
              Add standard extinguisher models so you never have to copy-paste long descriptions again.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className={`bg-white p-5 rounded-xl border transition flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                p.isActive ? 'border-slate-200' : 'border-slate-300 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base uppercase">
                      {p.name}
                    </h3>
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-black px-2 py-0.5 rounded mt-1">
                      {p.capacity}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Description snippet */}
                <div className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed uppercase">
                  {p.description}
                </div>
              </div>

              <div>
                {/* Default Pricing */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3 mb-3">
                  <div>
                    <span className="text-slate-400 text-[11px] font-bold block">Refill Price</span>
                    <span className="font-black text-slate-900">
                      {p.defaultRefillingPrice ? `₹${p.defaultRefillingPrice}` : '---------'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] font-bold block">New Unit Price</span>
                    <span className="font-black text-slate-900">
                      {p.defaultNewPrice ? `₹${p.defaultNewPrice}` : '---------'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleDuplicate(p.id)}
                    className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition cursor-pointer"
                    title="Duplicate Description"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {p.isActive && (
                    <button
                      onClick={() => handleDeactivate(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Deactivate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product Description'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Product Model / Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. ABC – 5Kg"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold uppercase focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Capacity *</label>
                  <input
                    type="text"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g. 5Kg"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold text-center uppercase focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Full Technical Description * (Used on Invoice)
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="STORE PRESURE DRY CHEMICAL POWDER, IT CONSISTS OF MONO AMONIUM PHOSPHET..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase leading-snug focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Default Refilling Price (Rs.)</label>
                  <input
                    type="number"
                    value={formData.defaultRefillingPrice}
                    onChange={(e) => setFormData({ ...formData, defaultRefillingPrice: e.target.value })}
                    placeholder="900"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold text-right focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Default New Unit Price (Rs.)</label>
                  <input
                    type="number"
                    value={formData.defaultNewPrice}
                    onChange={(e) => setFormData({ ...formData, defaultNewPrice: e.target.value })}
                    placeholder="2200"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold text-right focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes for internal reference..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
