const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret || keyId === 'rzp_test_hometutorxkey') {
    console.warn('[PAYMENT] Razorpay keys not configured or using default sandbox key. Using mock payment simulation.');
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    return razorpayInstance;
  } catch (error) {
    console.error('[PAYMENT] Failed to initialize Razorpay SDK:', error.message);
    return null;
  }
};

/**
 * @desc    Create a new Razorpay Order for ₹1
 * @route   POST /api/payments/create-order
 * @access  Public
 */
exports.createOrder = async (req, res, next) => {
  try {
    const amount = 1 * 100; // ₹1.00 in paise
    const client = getRazorpayInstance();

    if (!client) {
      // Prevent mock payment bypass in production environment
      if (process.env.NODE_ENV === 'production') {
        console.error('[CRITICAL PAYMENT BYPASS ATTEMPT] Payment gateway is unconfigured in production mode.');
        return res.status(500).json({
          success: false,
          message: 'Payment gateway configuration error. Live payments are currently unavailable.'
        });
      }

      // Mock order creation for development/demo when key is not set
      const mockOrder = {
        id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
        amount: amount,
        currency: 'INR',
        receipt: `receipt_mock_${Math.random().toString(36).substring(2, 11)}`,
        status: 'created'
      };
      return res.status(200).json({
        success: true,
        data: mockOrder,
        isMock: true
      });
    }

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_order_${Math.random().toString(36).substring(2, 11)}`
    };

    const order = await client.orders.create(options);
    res.status(200).json({
      success: true,
      data: order,
      isMock: false
    });
  } catch (err) {
    const errorMsg = err.description || err.error?.description || err.message || JSON.stringify(err);
    console.error('[PAYMENT ERROR] Razorpay order creation failed:', errorMsg, err);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment gateway order: ' + errorMsg
    });
  }
};
