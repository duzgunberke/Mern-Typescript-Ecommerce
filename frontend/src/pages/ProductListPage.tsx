import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { toast } from 'react-toastify'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { getError } from '../utils'
import { ApiError } from '../types/ApiError'
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetAdminProdcutsQuery,
} from '../hooks/productHooks'
import { Form, FormControl } from 'react-bootstrap'

export default function ProductListPage() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const page = Number(sp.get('page') || 1)

  const { data, isLoading, error, refetch } = useGetAdminProdcutsQuery(page)

  const { mutateAsync: createProduct, isLoading: loadingCreate } =
    useCreateProductMutation()

  const createHandler = async () => {
    if (window.confirm('Ürün Oluşturmak İstiyor Musunuz?')) {
      try {
        const data = await createProduct()
        refetch()
        toast.success('Ürün Başarıyla Oluşturuldu')
        navigate(`/admin/product/${data.product._id}`)
      } catch (err) {
        toast.error(getError(err as ApiError))
      }
    }
  }
  const { mutateAsync: deleteProduct, isLoading: loadingDelete } =
    useDeleteProductMutation()

  const deleteHandler = async (id: string) => {
    if (window.confirm('Silmek İstiyor Musunuz?')) {
      try {
        deleteProduct(id)
        refetch()
        toast.success('Başarı İle Silindi')
      } catch (err) {
        toast.error(getError(err as ApiError))
      }
    }
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [showZeroStock, setShowZeroStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    refetch();
  }, [searchTerm, page, selectedCategory]);

  const filteredProducts = data?.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
    && (selectedCategory === "" || product.category === selectedCategory)
  ) || [];

  const zeroStockProducts = showZeroStock ? filteredProducts.filter(product => product.countInStock <= 0) : filteredProducts;

  const categories = [...new Set(data?.products.map(product => product.category))];

  return (
    <div>
      <Row>
        <Col>
          <h1>Ürünler</h1>
        </Col>
        <Col className="col text-end">
          <div>
            <Button type="button" onClick={createHandler}>
              Ürün Oluştur
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form className="mb-3">
            <FormControl
              type="text"
              placeholder="Ürün Ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form>
        </Col>
      </Row>
      <div className='mb-2'>
            <h6>Kategori:</h6>
            <select
              className='form-control'
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
      <div>
        <Row>
          <Col>
            {data?.pages && [...Array(data.pages).keys()].map((x) => (
              <Link
                className={
                  x + 1 === Number(data.page) ? 'btn btn-primary active mx-1' : 'btn btn-light mx-1'
                }
                key={x + 1}
                to={`/admin/products?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </Col>
        
          <Col className="text-end">
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowZeroStock(!showZeroStock)}
            >
              Stokta Olmayan Ürünleri Göster
            </Button>
          </Col>
        </Row>
      </div>

      {loadingCreate && <LoadingBox></LoadingBox>}
      {loadingDelete && <LoadingBox></LoadingBox>}

      {isLoading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{getError(error as ApiError)}</MessageBox>
      ) : (
        <>
          {zeroStockProducts.length === 0 && (
            <MessageBox variant="info">Aradığınız ürün bulunamadı.</MessageBox>
          )}
          {zeroStockProducts.length > 0 && (
            <table className="table">
              <thead>
                <tr className="fs-5">
                  <th>ID</th>
                  <th>Ürün Adı</th>
                  <th>Ücreti</th>
                  <th>Kategori</th>
                  <th>Marka</th>
                  <th>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {zeroStockProducts.map((product) => (
                  <tr key={product._id} className={product.countInStock <= 0 ? 'bg-danger' : '' + "fw-bolder"}>
                    <td>{product._id}</td>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => navigate(`/admin/product/${product._id}`)}
                      >
                        Güncelle
                      </Button>
                      &nbsp;
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => deleteHandler(product._id)}
                      >
                        Sil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}
