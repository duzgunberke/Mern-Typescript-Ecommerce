import { useContext, useEffect } from 'react'
import {
  PayPalButtons,
  usePayPalScriptReducer,
  SCRIPT_LOADING_STATE,
  PayPalButtonsComponentProps,
} from '@paypal/react-paypal-js'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import Card from 'react-bootstrap/Card'
import { Link } from 'react-router-dom'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store'
import { getError } from '../utils'
import { toast } from 'react-toastify'
import { ApiError } from '../types/ApiError'
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from '../hooks/orderHooks'

export default function OrderPage() {
  const { state } = useContext(Store)
  const { userInfo } = state

  const params = useParams()
  const { id: orderId } = params

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderDetailsQuery(orderId!)

  const { mutateAsync: deliverOrder, isLoading: loadingDeliver } =
    useDeliverOrderMutation()
  async function deliverOrderHandler() {
    try {
      await deliverOrder(orderId!)
      refetch()
      toast.success('Sipariş Teslim Edildi')
    } catch (err) {
      toast.error(getError(err as ApiError))
    }
  }

  const testPayHandler = () => {
    payOrder({ orderId: orderId! })
    refetch()
    toast.success('Ödenen Yapıldı')
  }
  const paypalbuttonTransactionProps: PayPalButtonsComponentProps = {
    style: { layout: 'vertical' },
    createOrder(data, actions) {
      return actions.order
        .create({
          purchase_units: [
            {
              amount: {
                value: order!.totalPrice.toString(),
              },
            },
          ],
        })
        .then((orderID: string) => {
          return orderID
        })
    },
    onApprove(data, actions) {
      return actions.order!.capture().then(async (details) => {
        try {
          payOrder({ orderId: orderId!, ...details })
          refetch()
          toast.success('Sipariş ödemesi alındı')
        } catch (err) {
          toast.error(getError(err as ApiError))
        }
      })
    },
    onError: (err) => {
      toast.error(getError(err as ApiError))
    },
  }
  const [{ isPending, isRejected }, paypalDispatch] = usePayPalScriptReducer()
  const { data: paypalConfig } = useGetPaypalClientIdQuery()

  useEffect(() => {
    if (paypalConfig && paypalConfig.clientId) {
      const loadPaypalScript = async () => {
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': paypalConfig!.clientId,
            currency: 'USD',
          },
        })
        paypalDispatch({
          type: 'setLoadingStatus',
          value: SCRIPT_LOADING_STATE.PENDING,
        })
      }
      loadPaypalScript()
    }
  }, [paypalConfig])
  const { mutateAsync: payOrder, isLoading: loadingPay } = usePayOrderMutation()

  return isLoading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{getError(error as ApiError)}</MessageBox>
  ) : order ? (
    <div>
      <Helmet>
        <title>Sipariş {orderId}</title>
      </Helmet>
      <h1 className="my-3">Sipariş {orderId}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Teslimat</Card.Title>
              <Card.Text>
                <strong>Adınız:</strong> {order!.shippingAddress.fullName} <br />
                      <Col>
                <strong>Adres:</strong>
              </Col>
              <Col>
                <ul className="list-unstyled">
                  <li>{order.shippingAddress.address}</li>
                  <li>{order.shippingAddress.city}</li>
                  <hr/>
                  <strong>Sipariş Notu ve Telefon:</strong>
                  <li>📝 {order.shippingAddress.postalCode}</li>
                  <li>📞<a className='text-decoration-none' href={'//wa.me/9'+order.shippingAddress.country}>{order.shippingAddress.country}</a> </li>
                </ul>
              </Col>
                
                {/* {order.shippingAddress.location &&
                  order.shippingAddress.location.lat && (
                    <a
                      target="_new"
                      href={`https://maps.google.com?q=${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}
                    >
                      Haritada Gör
                    </a>
                  )} */}
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant="success">
                  Teslim Edildi {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="warning">Teslim Edilmedi</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Ödeme</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {order.paymentMethod}
              </Card.Text>
              {order.isPaid ? (
                <MessageBox variant="success">
                  Şu tarihte ödendi {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="warning">Ödeme Yapılmadı</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Ürünler</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded thumbnail"
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>₺{item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Sipariş Fatura Özeti</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Ürünler</Col>
                    <Col>₺{order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Gönderim</Col>
                    <Col>₺{order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                {/* <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>₺{order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item> */}
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Sipariş Toplam</strong>
                    </Col>
                    <Col>
                      <strong>₺{order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {userInfo!.isAdmin && !order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : isRejected ? (
                      <MessageBox variant="danger">
                        Error in connecting to PayPal
                      </MessageBox>
                    ) : (
                      <div>
                        <PayPalButtons
                          {...paypalbuttonTransactionProps}
                        ></PayPalButtons>
                        <Button onClick={testPayHandler}>Ödeme Al</Button>
                      </div>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                )}
                {userInfo!.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    <div className="d-grid">
                      <Button type="button" onClick={deliverOrderHandler}>
                        Sipariş Teslimi
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  ) : (
    <div>no order data</div>
  )
}
