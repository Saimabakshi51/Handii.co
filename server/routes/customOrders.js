import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Submit a new custom craft request
router.post('/', (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerPhone,
      customerEmail,
      category,
      subcategory,
      customText,
      colorPreferences,
      specifications,
      referencePhotos,
      targetDate
    } = req.body;

    if (!customerName || !customerPhone || !category || !specifications) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, craft category, and specifications are required.'
      });
    }

    const customOrderId = 'CUST-' + Math.floor(1000 + Math.random() * 9000);

    const newCustomOrder = db.insert('customOrders', {
      customOrderId,
      userId: userId || null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : '',
      category, // e.g. 'resin', 'pipecleaner', 'clay', 'crochet', 'hamper'
      subcategory: subcategory || 'Custom Craft',
      customText: customText ? customText.trim() : '',
      colorPreferences: colorPreferences || '',
      specifications: specifications.trim(),
      referencePhotos: Array.isArray(referencePhotos) ? referencePhotos : [],
      targetDate: targetDate || '',
      status: 'submitted', // 'submitted' -> 'quoted' -> 'accepted' -> 'crafting' -> 'completed' | 'declined'
      quotePrice: null,
      estimatedDays: null,
      quoteNotes: '',
      declineReason: ''
    });

    // Create initial welcome system message in the private DM thread
    db.insert('customMessages', {
      customOrderId,
      sender: 'admin',
      senderName: 'Handii Studio',
      message: `Hi ${customerName}! 🌸 Thanks for your custom ${category} order inquiry. Our artisans are reviewing your specifications and photos. We will quote you an estimate and chat right here!`,
      attachments: [],
      isSystemMessage: true
    });

    res.status(201).json({ success: true, customOrder: newCustomOrder });
  } catch (err) {
    console.error('[Custom Order Create Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to submit custom order.' });
  }
});

// Customer: Get all their custom orders
router.get('/my', authenticateToken, (req, res) => {
  try {
    const requests = db.find(
      'customOrders',
      (c) => c.userId === req.user.id || (c.customerEmail && c.customerEmail.toLowerCase() === req.user.email.toLowerCase())
    );
    res.json({ success: true, count: requests.length, customOrders: requests.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch custom orders.' });
  }
});

// Admin: Get all custom orders
router.get('/admin/all', requireAdmin, (req, res) => {
  try {
    const { status, category } = req.query;
    let requests = db.find('customOrders');

    if (status) requests = requests.filter((r) => r.status === status);
    if (category) requests = requests.filter((r) => r.category === category);

    res.json({ success: true, count: requests.length, customOrders: requests.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch all custom orders.' });
  }
});

// Get single custom order and its DM chat messages
router.get('/:customOrderId', (req, res) => {
  try {
    const { customOrderId } = req.params;
    const customOrder = db.findOne('customOrders', (c) => c.customOrderId === customOrderId);
    if (!customOrder) {
      return res.status(404).json({ success: false, message: 'Custom order not found.' });
    }

    const messages = db.find('customMessages', (m) => m.customOrderId === customOrderId);
    res.json({ success: true, customOrder, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve custom order and chat.' });
  }
});

// Send a DM message in the chat thread
router.post('/:customOrderId/messages', (req, res) => {
  try {
    const { customOrderId } = req.params;
    const { sender, senderName, message, attachments } = req.body;

    const customOrder = db.findOne('customOrders', (c) => c.customOrderId === customOrderId);
    if (!customOrder) {
      return res.status(404).json({ success: false, message: 'Custom order not found.' });
    }

    if (!message && (!attachments || !attachments.length)) {
      return res.status(400).json({ success: false, message: 'Message text or attachment required.' });
    }

    const newMessage = db.insert('customMessages', {
      customOrderId,
      sender: sender === 'admin' ? 'admin' : 'customer',
      senderName: senderName || (sender === 'admin' ? 'Handii Artisan' : customOrder.customerName),
      message: message ? message.trim() : '',
      attachments: Array.isArray(attachments) ? attachments : [],
      isSystemMessage: false
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// Admin: Send a Quote Offer
router.patch('/:customOrderId/quote', requireAdmin, (req, res) => {
  try {
    const { customOrderId } = req.params;
    const { quotePrice, estimatedDays, quoteNotes } = req.body;

    if (!quotePrice) {
      return res.status(400).json({ success: false, message: 'Quote price is required.' });
    }

    const priceNum = parseInt(String(quotePrice).replace(/[^0-9]/g, ''), 10);
    const updated = db.update('customOrders', (c) => c.customOrderId === customOrderId, {
      status: 'quoted',
      quotePrice: priceNum,
      estimatedDays: estimatedDays || 3,
      quoteNotes: quoteNotes || ''
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Custom order not found.' });
    }

    // Post an automated offer card in the DM chat
    db.insert('customMessages', {
      customOrderId,
      sender: 'admin',
      senderName: 'Handii Studio (Quote Offer)',
      message: `✨ Custom Quote Offer: ₹${priceNum} (Estimated crafting time: ${estimatedDays || 3} days). ${quoteNotes || ''}`,
      quoteCard: {
        price: priceNum,
        days: estimatedDays || 3,
        notes: quoteNotes || ''
      },
      isQuoteOffer: true
    });

    res.json({ success: true, customOrder: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send quote.' });
  }
});

// Admin: Decline custom order request
router.patch('/:customOrderId/decline', requireAdmin, (req, res) => {
  try {
    const { customOrderId } = req.params;
    const { declineReason } = req.body;

    const updated = db.update('customOrders', (c) => c.customOrderId === customOrderId, {
      status: 'declined',
      declineReason: declineReason || 'Materials or timing currently unavailable.'
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Custom order not found.' });
    }

    db.insert('customMessages', {
      customOrderId,
      sender: 'admin',
      senderName: 'Handii Studio',
      message: `⚠️ Custom Request Update: Unfortunately we cannot fulfill this custom request at this time. Reason: ${declineReason || 'Craft feasibility limits.'}`,
      isSystemMessage: true
    });

    res.json({ success: true, customOrder: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to decline custom order.' });
  }
});

// Customer: Accept Quote & Convert to Ready Cart Item
router.post('/:customOrderId/accept', (req, res) => {
  try {
    const { customOrderId } = req.params;
    const customOrder = db.findOne('customOrders', (c) => c.customOrderId === customOrderId);

    if (!customOrder || customOrder.status !== 'quoted') {
      return res.status(400).json({ success: false, message: 'Invalid custom order or quote not available.' });
    }

    const updated = db.update('customOrders', (c) => c.customOrderId === customOrderId, {
      status: 'accepted'
    });

    // Create a ready-to-checkout cart representation
    const cartItem = {
      isCustomOrder: true,
      customOrderId: customOrder.customOrderId,
      name: `Custom ${customOrder.category} (${customOrder.customOrderId})`,
      price: String(customOrder.quotePrice),
      numericPrice: customOrder.quotePrice,
      img: customOrder.referencePhotos[0] || '/images/flowermain.jpeg',
      color: customOrder.colorPreferences || 'Custom Tailored',
      customText: customOrder.customText,
      specifications: customOrder.specifications
    };

    db.insert('customMessages', {
      customOrderId,
      sender: 'customer',
      senderName: customOrder.customerName,
      message: `🎉 I have accepted the quote offer of ₹${customOrder.quotePrice}! Proceeding to order.`,
      isSystemMessage: true
    });

    res.json({ success: true, customOrder: updated, cartItem });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to accept quote.' });
  }
});

export default router;
