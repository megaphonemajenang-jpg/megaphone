import { ShoppingBag, Smartphone, Eye, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  isInCart?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onViewDetail,
  isInCart = false,
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-2xl border border-stone-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image Container */}
      <div
        onClick={() => onViewDetail(product)}
        className="relative aspect-square bg-stone-100 overflow-hidden cursor-pointer flex items-center justify-center p-4"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-400 gap-2">
            {product.category === 'handphone' ? (
              <Smartphone className="w-16 h-16 stroke-1" />
            ) : (
              <ShoppingBag className="w-16 h-16 stroke-1" />
            )}
            <span className="text-[11px] font-medium text-stone-400">Megaphone Majenang</span>
          </div>
        )}

        {/* Category Badge */}
        <span
          className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs ${
            product.category === 'handphone'
              ? 'bg-red-600 text-white'
              : 'bg-stone-800 text-stone-100'
          }`}
        >
          {product.category === 'handphone' ? 'Handphone' : 'Aksesoris'}
        </span>

        {/* Stock Status */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
            Stok Habis
          </span>
        ) : product.stock <= 3 ? (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
            Sisa {product.stock}
          </span>
        ) : null}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none sm:pointer-events-auto">
          <span className="bg-white text-stone-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-red-600" />
            Lihat Spesifikasi
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onViewDetail(product)}
            className="font-bold text-sm text-stone-900 line-clamp-2 hover:text-red-600 transition-colors cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Key Specs snippet if any */}
          {product.specs && product.specs.length > 0 && (
            <p className="mt-1 text-[11px] text-stone-500 line-clamp-1">
              {product.specs.slice(0, 3).join(' • ')}
            </p>
          )}
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-stone-400 font-medium">Harga</p>
            <p className="text-base font-extrabold text-red-600 leading-none">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-[11px] text-stone-400 line-through">
                Rp {product.originalPrice.toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className={`p-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : isInCart
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-red-600/30'
            }`}
            title={isInCart ? 'Sudah di keranjang' : 'Tambah ke keranjang'}
          >
            {isInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
