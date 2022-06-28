import React from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  function onCalcPriceTotal() {
    const priceTotal = cart.reduce((total, item) => {
      return total + item.price * item.amount;
    }, 0);

    return formatPrice(priceTotal);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id} data-testid="product">
              <td>
                <img src={item.image} alt={item.title} />
              </td>
              <td>
                <strong>{item.title}</strong>
                <span>{formatPrice(item.price)}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={item.amount <= 1}
                    onClick={() =>
                      updateProductAmount({
                        productId: item.id,
                        amount: item.amount - 1,
                      })
                    }
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={item.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() =>
                      updateProductAmount({
                        productId: item.id,
                        amount: item.amount + 1,
                      })
                    }
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{formatPrice(item.price * item.amount)}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => removeProduct(item.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{onCalcPriceTotal()}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
