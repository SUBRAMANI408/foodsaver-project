import FoodRequirement from '../models/FoodRequirement.js';
import Sponsorship from '../models/Sponsorship.js';
import Merchant from '../models/Merchant.js';
import HelpingCenter from '../models/HelpingCenter.js';
import Notification from '../models/Notification.js';

// ─── NGO: Create a Food Requirement ───────────────────────────────────────────
// POST /api/requirements
export const createRequirement = async (req, res, next) => {
  try {
    const ngo = req.user;
    const {
      contactName, contactPhone, contactEmail,
      addressText, coordinates, // coordinates: [lng, lat]
      peopleCount, quantityRequired,
      mealType, foodCategory, specificFood,
      requiredDate, requiredTime, availableUntil,
      additionalRequirements,
    } = req.body;

    // Fall back to NGO's stored location if coordinates not provided
    const coords = coordinates
      ? JSON.parse(coordinates)
      : ngo.location.coordinates;

    const requirement = await FoodRequirement.create({
      ngo: ngo._id,
      ngoName: ngo.centerName,
      ngoType: ngo.centerType,
      contactName: contactName || ngo.name,
      contactPhone: contactPhone || ngo.phone,
      contactEmail: contactEmail || ngo.email,
      addressText: addressText || ngo.address,
      location: { type: 'Point', coordinates: coords },
      peopleCount: parseInt(peopleCount),
      quantityRequired: parseInt(quantityRequired),
      mealType,
      foodCategory: foodCategory || 'Any Suitable Food',
      specificFood: specificFood || '',
      requiredDate: new Date(requiredDate),
      requiredTime,
      availableUntil,
      additionalRequirements: additionalRequirements || '',
    });

    // Find nearby merchants within 20km
    const nearbyMerchants = await Merchant.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: 20000, // 20 km
        },
      },
      isActive: true,
    }).select('_id');

    const merchantIds = nearbyMerchants.map((m) => m._id);

    // Save notified merchants list
    requirement.notifiedMerchants = merchantIds;
    await requirement.save();

    // Create in-app notifications & emit socket events to each merchant
    const notifications = merchantIds.map((merchantId) => ({
      recipient: merchantId,
      recipientModel: 'Merchant',
      title: '🍱 New Food Requirement',
      message: `${ngo.centerName} needs ${quantityRequired} meals (${mealType}) at ${requiredTime} near ${addressText || ngo.address}`,
      type: 'donation',
      data: {
        requirementId: requirement._id,
        ngoName: ngo.centerName,
        mealType,
        quantityRequired,
        requiredTime,
        availableUntil,
        location: addressText || ngo.address,
      },
    }));

    await Notification.insertMany(notifications);

    // Emit real-time socket events
    merchantIds.forEach((merchantId) => {
      req.io?.to(`user_${merchantId}`).emit('notification:new', {
        title: '🍱 New Food Requirement',
        message: `${ngo.centerName} needs ${quantityRequired} meals (${mealType}) at ${requiredTime}`,
        data: { requirementId: requirement._id },
      });
    });

    res.status(201).json({
      success: true,
      message: `Food requirement created! ${merchantIds.length} nearby merchants have been notified.`,
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

// ─── NGO: Get my requirements ─────────────────────────────────────────────────
// GET /api/requirements/my
export const getMyRequirements = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { ngo: req.userId };
    if (status) query.status = status;

    const total = await FoodRequirement.countDocuments(query);
    const requirements = await FoodRequirement.find(query)
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Attach sponsorships for each requirement
    const requirementsWithSpons = await Promise.all(
      requirements.map(async (req_item) => {
        const sponsorships = await Sponsorship.find({ requirement: req_item._id })
          .populate('merchant', 'businessName address phone logo rating');
        return { ...req_item.toJSON(), sponsorships };
      })
    );

    res.json({
      success: true,
      data: requirementsWithSpons,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── NGO: Accept a sponsorship offer ─────────────────────────────────────────
// PUT /api/requirements/:id/sponsorships/:sponsorshipId/accept
export const acceptSponsorship = async (req, res, next) => {
  try {
    const { id, sponsorshipId } = req.params;

    const requirement = await FoodRequirement.findOne({ _id: id, ngo: req.userId });
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    const sponsorship = await Sponsorship.findOne({ _id: sponsorshipId, requirement: id });
    if (!sponsorship) {
      return res.status(404).json({ success: false, message: 'Sponsorship not found' });
    }

    if (sponsorship.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Sponsorship already processed' });
    }

    // Update sponsorship
    sponsorship.status = 'accepted';
    sponsorship.acceptedAt = new Date();
    await sponsorship.save();

    // Update requirement fulfilled quantity
    requirement.quantityFulfilled += sponsorship.quantityOffered;
    if (requirement.quantityFulfilled >= requirement.quantityRequired) {
      requirement.status = 'fulfilled';
    } else {
      requirement.status = 'partially_fulfilled';
    }
    await requirement.save();

    // Notify merchant
    await Notification.create({
      recipient: sponsorship.merchant,
      recipientModel: 'Merchant',
      title: '✅ Sponsorship Accepted!',
      message: `${requirement.ngoName} has accepted your sponsorship of ${sponsorship.quantityOffered} meals for their ${requirement.mealType} requirement.`,
      type: 'donation',
      data: { requirementId: id, sponsorshipId },
    });

    req.io?.to(`user_${sponsorship.merchant}`).emit('notification:new', {
      title: '✅ Sponsorship Accepted!',
      message: `${requirement.ngoName} accepted your offer of ${sponsorship.quantityOffered} meals.`,
    });

    res.json({
      success: true,
      message: 'Sponsorship accepted successfully!',
      data: { requirement, sponsorship },
    });
  } catch (error) {
    next(error);
  }
};

// ─── MERCHANT: Get nearby open requirements ───────────────────────────────────
// GET /api/requirements/nearby
export const getNearbyRequirements = async (req, res, next) => {
  try {
    const merchant = req.user;
    const { radius = 20, page = 1, limit = 20 } = req.query;

    if (!merchant.location || !merchant.location.coordinates) {
      return res.status(400).json({ success: false, message: 'Merchant location not set' });
    }

    const requirements = await FoodRequirement.find({
      status: { $in: ['open', 'partially_fulfilled'] },
      requiredDate: { $gte: new Date() },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: merchant.location.coordinates },
          $maxDistance: parseFloat(radius) * 1000,
        },
      },
    })
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Mark which ones current merchant already sponsored
    const requirementIds = requirements.map((r) => r._id);
    const existingSponsors = await Sponsorship.find({
      requirement: { $in: requirementIds },
      merchant: req.userId,
    }).select('requirement');
    const alreadySponsoredIds = new Set(existingSponsors.map((s) => s.requirement.toString()));

    const data = requirements.map((r) => ({
      ...r.toJSON(),
      alreadySponsored: alreadySponsoredIds.has(r._id.toString()),
      remaining: r.quantityRequired - r.quantityFulfilled,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─── MERCHANT: Submit a sponsorship offer ────────────────────────────────────
// POST /api/requirements/:id/sponsor
export const submitSponsorship = async (req, res, next) => {
  try {
    const { quantityOffered, notes } = req.body;
    const requirement = await FoodRequirement.findById(req.params.id);

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }
    if (!['open', 'partially_fulfilled'].includes(requirement.status)) {
      return res.status(400).json({ success: false, message: 'This requirement is no longer accepting sponsorships' });
    }

    // Check if already sponsored
    const existing = await Sponsorship.findOne({ requirement: req.params.id, merchant: req.userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a sponsorship for this requirement' });
    }

    const sponsorship = await Sponsorship.create({
      requirement: req.params.id,
      merchant: req.userId,
      quantityOffered: parseInt(quantityOffered),
      notes: notes || '',
    });

    // Notify NGO
    await Notification.create({
      recipient: requirement.ngo,
      recipientModel: 'HelpingCenter',
      title: '🎉 New Sponsorship Offer!',
      message: `A merchant wants to sponsor ${quantityOffered} meals for your ${requirement.mealType} requirement on ${requirement.requiredDate.toDateString()}.`,
      type: 'donation',
      data: { requirementId: req.params.id, sponsorshipId: sponsorship._id },
    });

    req.io?.to(`user_${requirement.ngo}`).emit('notification:new', {
      title: '🎉 New Sponsorship Offer!',
      message: `A merchant is offering ${quantityOffered} meals for your ${requirement.mealType} request.`,
    });

    const populated = await sponsorship.populate('merchant', 'businessName address phone logo');

    res.status(201).json({
      success: true,
      message: 'Sponsorship submitted! The NGO will review your offer.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── MERCHANT: Get my sponsorship history ────────────────────────────────────
// GET /api/requirements/my-sponsorships
export const getMySponsorships = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { merchant: req.userId };
    if (status) query.status = status;

    const total = await Sponsorship.countDocuments(query);
    const sponsorships = await Sponsorship.find(query)
      .populate('requirement')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: sponsorships,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUBLIC: Get a single requirement with all its sponsorships ───────────────
// GET /api/requirements/:id
export const getRequirement = async (req, res, next) => {
  try {
    const requirement = await FoodRequirement.findById(req.params.id);
    if (!requirement) return res.status(404).json({ success: false, message: 'Not found' });

    const sponsorships = await Sponsorship.find({ requirement: req.params.id })
      .populate('merchant', 'businessName address phone logo rating');

    res.json({ success: true, data: { ...requirement.toJSON(), sponsorships } });
  } catch (error) {
    next(error);
  }
};

// ─── NGO: Cancel a requirement ────────────────────────────────────────────────
// DELETE /api/requirements/:id
export const cancelRequirement = async (req, res, next) => {
  try {
    const requirement = await FoodRequirement.findOne({ _id: req.params.id, ngo: req.userId });
    if (!requirement) return res.status(404).json({ success: false, message: 'Not found' });

    requirement.status = 'cancelled';
    await requirement.save();

    res.json({ success: true, message: 'Requirement cancelled' });
  } catch (error) {
    next(error);
  }
};
