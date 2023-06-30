import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { Link } from 'react-router-dom'
import Rating from './Rating'

import { useContext } from 'react'
import { Store } from '../Store'
import { CartItem } from '../types/Cart'
import { Product } from '../types/Product'
import { convertProductToCartItem } from '../utils'
import { toast } from 'react-toastify'

function ProductItem({ product }: { product: Product }) {
  const { state, dispatch } = useContext(Store)
  const {
    cart: { cartItems },
  } = state

  const addToCartHandler = async (item: CartItem) => {
    const existItem = cartItems.find((x) => x._id === product._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    if (product.countInStock < quantity) {
      toast.warn('Üzgünüz. Bu ürün stoklarda kalmadı.')
      return
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    })
    toast.success('Ürün sepetinize eklendi.')
  }

  return (
    <Card>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
            <Link to={`/product/${product.slug}`} className="text-decoration-none text-dark ">
        <h5>{product.name}</h5>
      </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>
          <h5>₺{product.price.toFixed(2)}</h5></Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            Stokda Kalmadı
          </Button>
        ) : (
          <Button
            onClick={() => addToCartHandler(convertProductToCartItem(product))}
          >
            Sepete Ekle
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}
export default ProductItem
