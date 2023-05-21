import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default function CheckoutSteps(props: {
  step1?: boolean
  step2?: boolean
  step3?: boolean
  step4?: boolean
}) {
  return (
    <Row className="checkout-steps">
      <Col className={props.step1 ? 'active' : ''}>Giriş Yap</Col>
      <Col className={props.step2 ? 'active' : ''}>Teslimat</Col>
      <Col className={props.step3 ? 'active' : ''}>Ödeme</Col>
      <Col className={props.step4 ? 'active' : ''}>Sipariş Ver 🎉</Col>
    </Row>
  )
}
