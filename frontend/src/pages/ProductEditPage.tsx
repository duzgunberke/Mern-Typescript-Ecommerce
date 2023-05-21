import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getError } from '../utils'
import Container from 'react-bootstrap/Container'
import ListGroup from 'react-bootstrap/ListGroup'
import Form from 'react-bootstrap/Form'
import { Helmet } from 'react-helmet-async'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import Button from 'react-bootstrap/Button'
import { ApiError } from '../types/ApiError'
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductMutation,
} from '../hooks/productHooks'

export default function ProductEditPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { id: productId } = params

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState(0)
  const [image, setImage] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [banner, setBanner] = useState('')
  const [isFeatured, setIsFeatured] = useState(false);

  const {
    data: product,
    isLoading,
    error,
  } = useGetProductDetailsQuery(productId!)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setSlug(product.slug)
      setPrice(product.price)
      setImage(product.image)
      setImages(product.images)
      setCategory(product.category)
      setCountInStock(product.countInStock)
      setBrand(product.brand)
      setBanner(product.banner)
      setIsFeatured(product.isFeatured)
      setDescription(product.description)
    }
  }, [product])

  const { mutateAsync: updateProduct, isLoading: loadingUpdate } =
    useUpdateProductMutation()

  const submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      await updateProduct({
        _id: productId!,
        name,
        slug,
        price,
        image,
        images,
        category,
        brand,
        banner,
        isFeatured,
        countInStock,
        description,
      })
      toast.success('Product updated successfully')
      navigate('/admin/products')
    } catch (err) {
      toast.error(getError(err as ApiError))
    }
  }

  const { mutateAsync: uploadProduct, isLoading: loadingUpload } =
    useUploadProductMutation()

  const uploadFileHandler = async (
    e: React.FormEvent<HTMLInputElement>,
    forImages: boolean = false,
    forImage: boolean = false,
    forBanner: boolean = false
  ) => {
    const file = e.currentTarget.files![0]
    const bodyFormData = new FormData()
    bodyFormData.append('image', file)

    try {
      const data = await uploadProduct(bodyFormData)

      if (forImages) {
        setImages([...images, data.secure_url])
      } 
      if(forImage) {
        setImage(data.secure_url)
      }
      if(forBanner){
        setBanner(data.secure_url)
      }
      toast.success('Image uploaded successfully. click Update to apply it')
    } catch (err) {
      toast.error(getError(err as ApiError))
    }
  }

  const deleteFileHandler = async (fileName: string) => {
    setImages(images.filter((x) => x !== fileName))
    toast.success('Image removed successfully. click Update to apply it')
  }
  return (
    <Container className="small-container">
      <Helmet>
        <title>Ürün Güncelle {productId}</title>
      </Helmet>
      <h1>Ürün Güncelle {productId}</h1>

      {isLoading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{getError(error as ApiError)}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Ürün Adı</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="slug">
            <Form.Label>Slug URL</Form.Label>
            <Form.Control
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Ücret</Form.Label>
            <Form.Control
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Ana Resim</Form.Label>
            <Form.Control
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="imageFile">
            <Form.Label>Resim Yükle </Form.Label>
            <input type="file" onChange={(e) => uploadFileHandler(e, false,true,false)}></input>
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="additionalImage">
            <Form.Label>Ekstra Resim</Form.Label>
            {images.length === 0 && <MessageBox>Resim Yok</MessageBox>}
            <ListGroup variant="flush">
              {images.map((x) => (
                <ListGroup.Item key={x}>
                  {x}
                  <Button variant="light" onClick={() => deleteFileHandler(x)}>
                    <i className="fa fa-times-circle"></i>
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="additionalImageFile">
            <Form.Label>Ekstra Resim Yükle</Form.Label>
            <input
              type="file"
              onChange={(e) => uploadFileHandler(e, true,false,false)}
            ></input>

            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="category">
            <Form.Label>Kategori</Form.Label>
            <Form.Control
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="brand">
            <Form.Label>Marka</Form.Label>
            <Form.Control
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="countInStock">
            <Form.Label>Stok Sayısı</Form.Label>
            <Form.Control
              value={countInStock}
              onChange={(e) => setCountInStock(Number(e.target.value))}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="isFeatured">
            <Form.Label>Ana Sayfada Gösterilsin mi?</Form.Label>
            <Form.Check
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
          </Form.Group>


          <Form.Group className="mb-3" controlId="banner">
            <Form.Label>Anasayfa Resmi Banner</Form.Label>
            <Form.Control
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="bannerFile">
            <Form.Label>Anasayfa Resmi Banner</Form.Label>
            <input
              type="file"
              onChange={(e) => uploadFileHandler(e, false,false,true)}
            ></input>

            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>

          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Güncelle
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
      )}
    </Container>
  )
}
