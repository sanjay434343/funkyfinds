import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import QRCode from 'qrcode';
import { getDatabase, ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

// Styled components animations
const slideIn = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Styled components
const Layout = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  color: #1a1a1a;
`;

const Header = styled.header`
  margin-bottom: 4rem;
  animation: ${fadeUp} 0.6s ease-out;
`;

const Title = styled.h1`
  font-size: 2rem;
  position: absolute;
  top: 17%;
  font-weight: 600;
  margin-bottom: -2rem;
  border-bottom: 2px solid #000;
  padding-bottom: 0.5rem;
  max-width: 1200px;
  width: 90%;
`;

const Section = styled.section`
  margin: 0;
  animation: ${slideIn} 0.6s ease-out;
`;

const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const PaymentOption = styled.button.attrs(props => ({
  type: 'button'
}))`
  background: transparent;
  border: 2px solid ${props => {
    if (props.$selected) {
      if (props.$isPayNow && props.$paymentConfirmed) {
        return '#22c55e';
      } else if (props.$isCod) {
        return '#22c55e';
      }
      return 'black';
    }
    return '#ddd';
  }};
  padding: 1rem;
  text-align: left;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.3s ease;
  font-size: 0.9rem;
  border-radius: 8px;

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: ${props => props.$selected ? '#1a1a1a' : '#4a4a4a'};
  }

  p {
    color: #666;
  }
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  animation: ${fadeUp} 0.4s ease-out;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #1a1a1a;
`;

const ItemPrice = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid #1a1a1a;
  font-size: 1rem;
  font-weight: 600;
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => props.disabled ? 'gray' : 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: transform 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    opacity: ${props => props.disabled ? '1' : '0.9'};
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  position: relative;
  animation: ${fadeUp} 0.3s ease-out;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const PaidButton = styled.button`
  display: block;
  margin: 0 auto;
  padding: 10px 20px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

// QR Code generation utility function
const generateQRCode = async (text) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const totalPrice = calculateTotalPrice();
  const shippingFee = 10;

  useEffect(() => {
    const fetchQRCode = async () => {
      const qrCode = await generateQRCode(`Total Price: $${(totalPrice + shippingFee).toFixed(2)}`);
      setQrCodeDataUrl(qrCode);
    };
    fetchQRCode();
  }, [totalPrice]);

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
    if (method === 'pay_now') {
      setShowModal(true);
    }
  };

  const handleConfirmCheckout = async () => {
    const db = getDatabase();
    const currentUser = 'sanjay434343'; // Using the provided user login
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentUTCDate = new Date('2024-12-22T08:40:41Z'); // Using the provided UTC date/time

    // Create order data structure
    const orderData = {
      createdAt: currentUTCDate.toISOString(),
      deliveryStatus: 'processing',
      id: orderId,
      items: cartItems.map(item => ({
        color: item.color || 'N/A',
        id: item.id,
        image: item.image || 'N/A',
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        size: item.size || 'N/A'
      })),
      paymentMethod: selectedPayment,
      paymentStatus: 'pending',
      shippingFee: shippingFee,
      status: 'pending',
      subtotal: totalPrice,
      total: totalPrice + shippingFee,
      totalAmount: totalPrice,
      userLogin: currentUser
    };

    try {
      // Store the order directly under the orderId
      await set(ref(db, orderId), orderData);
      
      // Clear cart and local storage
      localStorage.removeItem('cartItems');
      setCartItems([]);
      setOrderSuccess(true);
      setShowModal(true);

      // Redirect to Track Order page after a short delay
      setTimeout(() => {
        navigate(`/track-order/`);
      }, 2000);
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('Failed to process checkout. Please try again.');
    }
  };

  const handleConfirmCheckoutV2 = async () => {
    const db = getDatabase();
    const currentUser = 'sanjay434343'; // Using the provided user login
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentUTCDate = new Date('2024-12-22T08:47:31Z'); // Using the provided UTC date/time

    // Create order data structure
    const orderData = {
      createdAt: currentUTCDate.toISOString(),
      deliveryStatus: 'processing',
      id: orderId,
      items: cartItems.map(item => ({
        color: item.color || 'N/A',
        id: item.id,
        image: item.image || 'N/A',
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        size: item.size || 'N/A'
      })),
      paymentMethod: selectedPayment,
      paymentStatus: 'pending',
      shippingFee: shippingFee,
      status: 'pending',
      subtotal: totalPrice,
      total: totalPrice + shippingFee,
      totalAmount: totalPrice,
      userLogin: currentUser
    };

    try {
      // Store the order under the "orders" node with the orderId as the key
      await set(ref(db, `orders/${orderId}`), orderData);
      
      // Clear cart and local storage
      localStorage.removeItem('cartItems');
      setCartItems([]);
      setOrderSuccess(true);
      setShowModal(true);

      // Redirect to Track Order page after a short delay
      setTimeout(() => {
        navigate(`/track-order?orderId=${orderId}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('Failed to process checkout. Please try again.');
    }
};

  const closeModal = () => {
    setShowModal(false);
    setOrderSuccess(false);
  };

  const isCheckoutEnabled = selectedPayment === 'cod' || (selectedPayment === 'pay_now' && paymentConfirmed);

  return (
    <Layout>
      <Header>
        <Title>Checkout</Title>
      </Header>

      <Section>
        <h2>Payment Method</h2>
        <PaymentGrid>
          <PaymentOption 
            $selected={selectedPayment === 'pay_now'}
            $isPayNow={true}
            $paymentConfirmed={paymentConfirmed}
            onClick={() => handlePaymentSelect('pay_now')}
          >
            <h3>Pay Now</h3>
            <p>Pay securely with your card</p>
          </PaymentOption>
          
          <PaymentOption 
            $selected={selectedPayment === 'cod'}
            $isCod={true}
            onClick={() => handlePaymentSelect('cod')}
          >
            <h3>Cash on Delivery</h3>
            <p>Pay when you receive your order</p>
          </PaymentOption>
        </PaymentGrid>
      </Section>

      <Section>
        <h2>Order Summary</h2>
        {cartItems.map((item) => (
          <ItemRow key={item.id}>
            <ItemInfo>
              <ItemName>{item.name} (Qty: {item.quantity || 1})</ItemName>
            </ItemInfo>
            <ItemPrice>${(item.price * (item.quantity || 1)).toFixed(2)}</ItemPrice>
          </ItemRow>
        ))}
        
        <TotalRow>
          <span>Subtotal</span>
          <span>${totalPrice.toFixed(2)}</span>
        </TotalRow>
        <TotalRow>
          <span>Shipping Fee</span>
          <span>${shippingFee.toFixed(2)}</span>
        </TotalRow>
        <TotalRow>
          <span>Total</span>
          <span>${(totalPrice + shippingFee).toFixed(2)}</span>
        </TotalRow>

        <CheckoutButton 
          onClick={handleConfirmCheckoutV2}
          disabled={!isCheckoutEnabled}
        >
          Complete Purchase
        </CheckoutButton>

        {showModal && (
          <Modal>
            <ModalContent>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
              {orderSuccess ? (
                <>
                  <h2>Order Confirmed!</h2>
                  <p>Thank you for your purchase.</p>
                  <p>Your order has been successfully placed.</p>
                  <p>Order ID: {`order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}</p>
                  <p>You will be redirected to track your order...</p>
                </>
              ) : (
                <>
                  <h2>💫 Scan & Pay in a Flash! 📱</h2>
                  <p>Total Amount: ${(totalPrice + shippingFee).toFixed(2)}</p>
                  {qrCodeDataUrl && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      margin: '20px 0' 
                    }}>
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code for Payment" 
                        style={{ 
                          width: '250px', 
                          height: '250px',
                          marginBottom: '20px'
                        }} 
                      />
                      <p style={{ marginBottom: '20px' }}>
                        Scan the QR code to complete your payment
                      </p>
                      <PaidButton onClick={handlePaymentConfirmation}>
                        I Have Completed the Payment
                      </PaidButton>
                    </div>
                  )}
                </>
              )}
            </ModalContent>
          </Modal>
        )}
      </Section>
    </Layout>
  );
};

export default Checkout;