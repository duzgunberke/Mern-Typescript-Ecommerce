import React, { useContext, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import Form from 'react-bootstrap/Form'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Rating from '../components/Rating'
import { Helmet } from 'react-helmet-async'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { convertProductToCartItem, getError } from '../utils'
import { Store } from '../Store'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import { toast } from 'react-toastify'
import { Review } from '../types/Product'
import { ApiError } from '../types/ApiError'
import {
  useCreateReviewMutation,
  useGetProductDetailsBySlugQuery,
} from '../hooks/productHooks'

function ProductPage() {
  const reviewsRef = useRef<HTMLDivElement>(null)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedImage, setSelectedImage] = useState('')

  const navigate = useNavigate()
  const params = useParams()
  const { slug } = params

  const {
    data: product,
    refetch,
    isLoading,
    error,
  } = useGetProductDetailsBySlugQuery(slug!)

  const { mutateAsync: createReview, isLoading: loadingCreateReview } =
    useCreateReviewMutation()

  const { state, dispatch } = useContext(Store)
  const { cart, userInfo } = state

  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product!._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    if (product!.countInStock < quantity) {
      toast.warn('Üzgünüz, bu ürün stokta yok.')
      return
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...convertProductToCartItem(product!), quantity },
    })
    navigate('/cart')
  }

  const submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!comment || !rating) {
      toast.error('Lütfen yorum ve puan verin.')
      return
    }
    try {
      await createReview({
        productId: product!._id,
        rating,
        comment,
        name: userInfo!.name,
      })
      refetch()
      toast.success('Yorumunuz kaydedildi.')
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current!.offsetTop,
      })
      setComment('')
      setRating(0)
    } catch (err) {
      toast.error(getError(err as ApiError))
    }
  }
  return isLoading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{getError(error as ApiError)}</MessageBox>
  ) : product ? (
    <div>
      <Row>
        <Col md={6}>
          <img
            className="large"
            src={selectedImage || product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                rating={product.rating}
                numReviews={product.numReviews}
              ></Rating>
            </ListGroup.Item>
            <ListGroup.Item>
                <h3>Fiyat : ₺{product!.price.toFixed(2)}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row xs={1} md={2} className="g-2">
                {[product.image, ...product.images].map((x) => (
                  <Col key={x}>
                    <Card>
                      <Button
                        className="thumbnail"
                        type="button"
                        variant="light"
                        onClick={() => setSelectedImage(x)}
                      >
                        <Card.Img variant="top" src={x} alt="product" />
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              Açıklama:
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Fiyat:</Col>
                    <Col className='display-6'>₺{product!.price.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Durum:</Col>
                    <Col>
                      {product!.countInStock > 0 ? (
                        <Badge bg="success">Stokda Var</Badge>
                      ) : (
                        <Badge bg="danger">Stokda Kalmamış</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button onClick={addToCartHandler} variant="primary">
                        Sepete Ekle
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="my-3">
        <h2 ref={reviewsRef}>Yorumlar</h2>
        <div className="mb-3">
          {product.reviews.length === 0 && (
            <MessageBox>Hiç yorum yok</MessageBox>
          )}
        </div>
        <ListGroup>
          {product.reviews.map((review: Review) => (
            <ListGroup.Item key={review.createdAt}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} numReviews={0} caption=""></Rating>
              <p>{review.createdAt.substring(0, 10)}</p>
              <p>{review.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="my-3">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>Müşteri Yorumu</h2>
              <Form.Group className="mb-3" controlId="rating">
                <Form.Label>Değerlendirme</Form.Label>
                <Form.Select
                  aria-label="Rating"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value="">Seçiniz...</option>
                  <option value="1">1- Çok Kötü</option>
                  <option value="2">2- İdare Eder</option>
                  <option value="3">3- İyi</option>
                  <option value="4">4- Çok İyi</option>
                  <option value="5">5- Mükemmel</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel
                controlId="floatingTextarea"
                label="Comments"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Yorumunuzu bırakın"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </FloatingLabel>

              <div className="mb-3">
                <Button disabled={loadingCreateReview} type="submit">
                  Gönder
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </form>
          ) : (
            <MessageBox>
              Lütfen{' '}
              <Link to={`/signin?redirect=/product/${product.slug}`}>
                Giriş Yapın
              </Link>{' '}
              yorum yazabilmek için
            </MessageBox>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div>no product</div>
  )
}
export default ProductPage
