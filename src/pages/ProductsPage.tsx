import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';

type Product = {
  id: number;
  name: string;
  price: string;      // l’API renvoie une string, c’est ok
  createdAt: string;
};

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [error, setError] = useState('');

  // 🔹 états pour l’édition
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('0');

  const loadProducts = async () => {
    const res = await api.get<Product[]>('/products');
    setProducts(res.data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 🔹 Création produit
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // on remplace la virgule par un point pour parseFloat
      const normalizedPrice = price.replace(',', '.');

      const res = await api.post<Product>('/products', {
        name,
        price: parseFloat(normalizedPrice),
      });

      // on insère le nouveau produit en haut de la liste
      setProducts((prev) => [res.data, ...prev]);

      setName('');
      setPrice('0');
    } catch (err: any) {
      console.log('CREATE ERROR ===>', err.response?.data || err.message || err);

      if (err.response?.status === 403) {
        setError('Accès refusé (rôle admin requis).');
      } else if (err.response?.status === 400) {
        setError('Données invalides (nom/prix).');
      } else {
        setError('Erreur lors de la création.');
      }
    }
  };

  // 🔹 Quand on clique sur "Modifier"
  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(p.price?.toString() ?? '0'); // safe
    setError('');
  };

  // 🔹 Annuler l’édition
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPrice('0');
    setError('');
  };

  // 🔹 Valider l’édition (PATCH)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;

    setError('');

    try {
      // gérer "0,15" -> "0.15"
      const normalizedPrice = editPrice.replace(',', '.');

      const res = await api.patch<Product>(`/products/${editingId}`, {
        name: editName,
        price: parseFloat(normalizedPrice),
      });

      setProducts((prev) =>
        prev.map((product) => (product.id === editingId ? res.data : product)),
      );

      // on ferme le formulaire
      cancelEdit();
    } catch (err: any) {
      console.log('UPDATE ERROR ===>', err.response?.data || err.message || err);

      if (err.response?.status === 403) {
        setError('Accès refusé (rôle admin requis).');
      } else if (err.response?.status === 400) {
        setError('Données invalides (nom/prix).');
      } else if (err.response?.status === 404) {
        setError('Produit introuvable.');
      } else {
        setError('Erreur lors de la mise à jour.');
      }
    }
  };
  

  // 🔹 Supprimer produit (DELETE)
  const handleDelete = async (id: number) => {
    const ok = window.confirm('Tu veux vraiment supprimer ce produit ?');
    if (!ok) return;

    setError('');
    try {
      await api.delete(`/products/${id}`);
      // on recharge proprement la liste
      await loadProducts();
    } catch (err: any) {
      console.log('DELETE ERROR ===>', err.response?.data || err.message || err);

      if (err.response?.status === 403) {
        setError('Accès refusé (rôle admin requis).');
      } else if (err.response?.status === 404) {
        setError('Produit introuvable.');
      } else {
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const formatPrice = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return `${value} €`;
    return `${parsed.toFixed(2).replace('.', ',')} €`;
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date);
  };

  return (
    <section className="page">
      <div className="card products-section">
        <div className="card-header">
          <h1 className="page-title">Produits</h1>
          <p className="text-muted">
            Vue d’ensemble des articles disponibles côté API.
          </p>
        </div>

        <div className="products-list">
          {products.length === 0 ? (
            <div className="empty-state">Aucun produit pour le moment.</div>
          ) : (
            products.map((p) => (
              <article key={p.id} className="product-card">
                <div className="product-info">
                  <span className="product-name">{p.name}</span>
                  <div className="product-meta">
                    <span>{formatPrice(p.price)}</span>
                    <span>{formatDate(p.createdAt)}</span>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="product-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => startEdit(p)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleDelete(p.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>

      {user?.role === 'admin' && (
        <>
          {error && <div className="error-box">{error}</div>}

          {editingId !== null && (
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">
                  Modifier le produit n° {editingId}
                </h2>
                <p className="text-muted">
                  Mets à jour les informations puis sauvegarde.
                </p>
              </div>
              <form className="form" onSubmit={handleUpdate}>
                <div className="form-group">
                  <label className="label" htmlFor="edit-name">
                    Nom
                  </label>
                  <input
                    id="edit-name"
                    className="input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="edit-price">
                    Prix
                  </label>
                  <input
                    id="edit-price"
                    type="text"
                    className="input"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" type="submit">
                    Sauvegarder
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={cancelEdit}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="section-title">Créer un produit</h2>
              <p className="text-muted">Ajoute un article visible par tous.</p>
            </div>
            <form className="form" onSubmit={handleCreate}>
              <div className="form-group">
                <label className="label" htmlFor="create-name">
                  Nom
                </label>
                <input
                  id="create-name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="create-price">
                  Prix
                </label>
                <input
                  id="create-price"
                  type="text"
                  className="input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary" type="submit">
                Créer
              </button>
            </form>
          </div>
        </>
      )}
    </section>
  );
};

export default ProductsPage;
