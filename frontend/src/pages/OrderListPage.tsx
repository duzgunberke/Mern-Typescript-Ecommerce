import { toast } from 'react-toastify'
import Button from 'react-bootstrap/Button'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { getError } from '../utils'
import { ApiError } from '../types/ApiError'
import { useDeleteOrderMutation, useGetOrdersQuery } from '../hooks/orderHooks'

export default function OrderListPage() {
  const navigate = useNavigate()

  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery()

  const { mutateAsync: deleteOrder, isLoading: loadingDelete } =
    useDeleteOrderMutation()

  const deleteHandler = async (id: string) => {
    if (window.confirm('Silmek istediğinize emin misiniz?')) {
      try {
        deleteOrder(id)
        refetch()
        toast.success('Sipariş başarıyla silindi')
      } catch (err) {
        toast.error(getError(err as ApiError))
      }
    }
  }

  return (
    <div>
      <Helmet>
        <title>Siparişler</title>
      </Helmet>
      <h1>Siparişler</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {isLoading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{getError(error as ApiError)}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>KULLANICI</th>
              <th>TARIH</th>
              <th>TOPLAM</th>
              <th>ÖDEME</th>
              <th>TESLİMAT</th>
              <th>AKSİYON</th>
            </tr>
          </thead>
          <tbody>
            {orders!.slice().reverse().map((order) => (
              <tr
              key={order._id}
              className={
                !order.isPaid
                  ? 'bg-danger'
                  : !order.isDelivered
                  ? 'bg-warning'
                  : 'bg-success' 
              }
            >
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}₺</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>

                <td>
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'No'}
                </td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`)
                    }}
                  >
                    Detaylar
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(order._id)}
                  >
                    Sil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
