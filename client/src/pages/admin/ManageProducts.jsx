import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, X, Save, Upload, Image, PlusCircle } from "lucide-react";
import { AdminSidebar } from "./Dashboard";
import API from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "", description: "", price: "", discountPrice: "",
  category: "Electronics", brand: "", stock: "",
  thumbnail: "", images: [], isFeatured: false,
};

const CATEGORIES = ["Electronics","Clothing","Footwear","Home & Living","Books","Beauty","Sports","Toys","Other"];

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  // Image upload state
  const [uploading, setUploading]       = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null); // which slot is uploading
  const thumbnailInputRef = useRef(null);
  const galleryInputRef   = useRef(null);

  const load = () => {
    setLoading(true);
    API.get("/products?limit=100")
      .then(({ data }) => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      name:          p.name,
      description:   p.description,
      price:         p.price,
      discountPrice: p.discountPrice || "",
      category:      p.category,
      brand:         p.brand || "",
      stock:         p.stock,
      thumbnail:     p.thumbnail || "",
      images:        p.images || [],
      isFeatured:    p.isFeatured,
    });
    setModal(true);
  };

  // Upload a single image file to backend/cloudinary
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await API.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  };

  // Upload thumbnail
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadingIdx("thumbnail");
    try {
      const url = await uploadFile(file);
      setForm(prev => ({ ...prev, thumbnail: url }));
      toast.success("Thumbnail uploaded!");
    } catch {
      toast.error("Upload failed — check Cloudinary config");
    } finally { setUploading(false); setUploadingIdx(null); }
  };

  // Upload gallery image(s) — supports multiple files at once
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);

    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      setUploadingIdx(`gallery-${i}`);
      try {
        const url = await uploadFile(files[i]);
        uploaded.push(url);
      } catch {
        toast.error(`Failed to upload image ${i + 1}`);
      }
    }

    setForm(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
    toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} added!`);
    setUploading(false);
    setUploadingIdx(null);
    e.target.value = ""; // reset input
  };

  // Add image via URL
  const addImageUrl = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, ""] }));
  };

  // Update a specific gallery image URL
  const updateImageUrl = (idx, val) => {
    const updated = [...form.images];
    updated[idx] = val;
    setForm(prev => ({ ...prev, images: updated }));
  };

  // Remove gallery image
  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  // Move image up/down
  const moveImage = (idx, dir) => {
    const arr = [...form.images];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setForm(prev => ({ ...prev, images: arr }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim())        { toast.error("Product name is required"); return; }
    if (!form.price)              { toast.error("Price is required"); return; }
    if (!form.description.trim()) { toast.error("Description is required"); return; }

    setSaving(true);
    try {
      // Auto-set thumbnail from first gallery image if empty
      const thumbnail = form.thumbnail || form.images[0] || "";
      const payload = {
        ...form,
        thumbnail,
        price:         Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock:         Number(form.stock),
        images:        form.images.filter(Boolean), // remove empty strings
      };
      if (editing) {
        await API.put(`/products/${editing}`, payload);
        toast.success("Product updated!");
      } else {
        await API.post("/products", payload);
        toast.success("Product created!");
      }
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success("Deleted!");
      load();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Products</h1>
            <p className="admin-subtitle">{products.length} total products</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16}/> Add Product
          </button>
        </div>

        {loading ? <Loader /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Images</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="table-product-cell">
                        <img src={p.thumbnail || `https://placehold.co/40x40/ffffff/2563eb?text=P`} alt="" />
                        <div>
                          <p className="table-product-name">{p.name}</p>
                          <p className="table-product-brand">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-processing">{p.category}</span></td>
                    <td>
                      {p.discountPrice
                        ? <><strong>₹{p.discountPrice}</strong> <s style={{color:"var(--text-3)",fontSize:12}}>₹{p.price}</s></>
                        : <strong>₹{p.price}</strong>
                      }
                    </td>
                    <td>
                      <span style={{ color: p.stock > 0 ? "var(--success)" : "var(--error)", fontWeight: 600 }}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                        {(p.images?.length || 0) + (p.thumbnail ? 1 : 0)} img
                      </span>
                    </td>
                    <td>{p.isFeatured ? "⭐" : "—"}</td>
                    <td>
                      <div className="table-actions">
                        <button className="table-btn edit"   onClick={() => openEdit(p)}><Pencil size={14}/></button>
                        <button className="table-btn delete" onClick={() => handleDelete(p._id, p.name)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="modal-fields">

                {/* ── Thumbnail ── */}
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Thumbnail (Main Image)</label>
                  <div className="thumb-upload-row">
                    <div className="thumb-preview">
                      {form.thumbnail ? (
                        <img src={form.thumbnail} alt="Thumbnail" />
                      ) : (
                        <div className="image-placeholder"><Image size={24}/><span>No image</span></div>
                      )}
                      {uploadingIdx === "thumbnail" && (
                        <div className="image-uploading-overlay">
                          <div className="spinner" style={{width:22,height:22}}/>
                        </div>
                      )}
                    </div>
                    <div className="thumb-controls">
                      <button type="button" className="btn btn-outline"
                        style={{fontSize:13,padding:"8px 14px"}}
                        onClick={() => thumbnailInputRef.current.click()}
                        disabled={uploading}>
                        <Upload size={14}/> Upload
                      </button>
                      <input
                        ref={thumbnailInputRef} type="file" accept="image/*"
                        style={{display:"none"}} onChange={handleThumbnailUpload}
                      />
                      <span className="url-or">or paste URL</span>
                      <input className="form-input" style={{fontSize:13}}
                        placeholder="https://..."
                        value={form.thumbnail}
                        onChange={e => setForm({...form, thumbnail: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Gallery Images ── */}
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">
                    Gallery Images
                    <span style={{color:"var(--text-3)",fontWeight:400,marginLeft:6,textTransform:"none",letterSpacing:0}}>
                      (shown in slider on product page)
                    </span>
                  </label>

                  {/* Gallery grid */}
                  {form.images.length > 0 && (
                    <div className="gallery-grid">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="gallery-item">
                          <div className="gallery-item-preview">
                            {img ? (
                              <img src={img} alt="" onError={e => e.target.style.display="none"} />
                            ) : (
                              <div className="image-placeholder"><Image size={18}/></div>
                            )}
                            <button
                              type="button"
                              className="gallery-remove-btn"
                              onClick={() => removeImage(idx)}
                            ><X size={12}/></button>
                          </div>
                          <input
                            className="form-input gallery-url-input"
                            placeholder="Image URL..."
                            value={img}
                            onChange={e => updateImageUrl(idx, e.target.value)}
                          />
                          <div className="gallery-item-actions">
                            <button type="button" className="gallery-move-btn"
                              onClick={() => moveImage(idx, -1)} disabled={idx === 0}>↑</button>
                            <span style={{fontSize:11,color:"var(--text-3)"}}>{idx+1}</span>
                            <button type="button" className="gallery-move-btn"
                              onClick={() => moveImage(idx, 1)} disabled={idx === form.images.length-1}>↓</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add image buttons */}
                  <div className="gallery-add-row">
                    <button
                      type="button"
                      className="btn btn-outline gallery-upload-btn"
                      onClick={() => galleryInputRef.current.click()}
                      disabled={uploading}
                    >
                      <Upload size={14}/>
                      {uploading && uploadingIdx?.startsWith("gallery")
                        ? "Uploading..."
                        : "Upload Images"}
                    </button>
                    <input
                      ref={galleryInputRef} type="file" accept="image/*" multiple
                      style={{display:"none"}} onChange={handleGalleryUpload}
                    />
                    <button
                      type="button"
                      className="btn btn-outline gallery-url-btn"
                      onClick={addImageUrl}
                    >
                      <PlusCircle size={14}/> Add URL
                    </button>
                    <span className="upload-hint">
                      {form.images.length} image{form.images.length !== 1 ? "s" : ""} · select multiple files at once
                    </span>
                  </div>
                </div>

                {/* ── Basic Fields ── */}
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Description *</label>
                  <textarea className="form-input" rows={3} value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" className="form-input" value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})} required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price (₹)</label>
                  <input type="number" className="form-input" value={form.discountPrice}
                    onChange={e => setForm({...form, discountPrice: e.target.value})} min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={form.brand}
                    onChange={e => setForm({...form, brand: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input type="number" className="form-input" value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})} required min="0" />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="featured-check">
                    <input type="checkbox" checked={form.isFeatured}
                      onChange={e => setForm({...form, isFeatured: e.target.checked})} />
                    ⭐ Mark as Featured Product
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                  <Save size={15}/> {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;