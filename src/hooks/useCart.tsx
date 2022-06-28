import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  setCart: (products: Product[]) => void;
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  function onChangeCart(newCart: Product[]) {
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    setCart(newCart);
  }

  const addProduct = async (productId: number) => {
    try {
      // consultando estoque do produto
      var response = await api.get(`/stock/${productId}`);
      var quantStock = response.data.amount;

      // se tiver estoque disponível
      if (quantStock > 1) {
        var product = await (await api.get(`/products/${productId}`)).data;

        // add produto no carrinho
        let isExistsProduct = false;
        const newCart = cart.map((item) => {
          if (item.id === product.id) {
            isExistsProduct = true;
            return {
              ...item,
              amount: item.amount + 1,
            };
          }

          return item;
        });

        if (isExistsProduct === false) {
          newCart.push({ ...product, amount: 1 });
        }

        onChangeCart(newCart);
      } else {
        toast.error("Quantidade solicitada fora de estoque");
      }
    } catch (error) {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = async (productId: number) => {
    var isExistsProduct = cart.some((item) => item.id === productId);

    if (isExistsProduct) {
      let newCart = cart.filter((item) => item.id !== productId);

      onChangeCart(newCart);
    } else {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async (data: UpdateProductAmount) => {
    const { productId, amount } = data;
    if (amount <= 0) return null;

    try {
      // consultando estoque do produto
      var response = await api.get(`/stock/${productId}`);
      var quantStock = response.data.amount;

      // se tiver estoque disponível
      if (quantStock >= amount) {
        // update cart
        let newCart = cart.map((item) => {
          if (item.id === productId) {
            return {
              ...item,
              amount,
            };
          }

          return { ...item };
        });

        onChangeCart(newCart);
      } else {
        toast.error("Quantidade solicitada fora de estoque");
      }
    } catch (error) {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
