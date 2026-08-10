import MerchantPost from '../models/MerchantPost.js';
import MerchantRequest from '../models/MerchantRequest.js';

// getPosts: Fetch active MerchantPosts
export const getPosts = async (req, res) => {
  try {
    const posts = await MerchantPost.find({ status: 'active' }).populate('merchant', 'businessName name profileImage');
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// createPost: Create a new MerchantPost
export const createPost = async (req, res) => {
  try {
    const { foodDetails, totalQuantity, originalPrice, discountPercentage, finalPrice, availableUntil } = req.body;
    
    const post = new MerchantPost({
      merchant: req.user._id,
      foodDetails,
      totalQuantity,
      availableQuantity: totalQuantity,
      originalPrice,
      discountPercentage,
      finalPrice,
      availableUntil
    });

    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// updatePost: Update post details or status
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const post = await MerchantPost.findOne({ _id: id, merchant: req.user._id });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
    }

    Object.assign(post, updateData);
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// createRequest: Create a MerchantRequest for a specific post
export const createRequest = async (req, res) => {
  try {
    const { postId, requestedQuantity } = req.body;

    const post = await MerchantPost.findById(postId);
    if (!post || post.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Post not found or inactive' });
    }

    if (post.merchant.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot request your own post' });
    }

    if (requestedQuantity > post.availableQuantity) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available quantity' });
    }

    const request = new MerchantRequest({
      post: postId,
      requester: req.user._id,
      owner: post.merchant,
      requestedQuantity
    });

    await request.save();
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getReceivedRequests: Fetch requests where owner is current user
export const getReceivedRequests = async (req, res) => {
  try {
    const requests = await MerchantRequest.find({ owner: req.user._id })
      .populate('post')
      .populate('requester', 'businessName name profileImage');
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getSentRequests: Fetch requests where requester is current user
export const getSentRequests = async (req, res) => {
  try {
    const requests = await MerchantRequest.find({ requester: req.user._id })
      .populate('post')
      .populate('owner', 'businessName name profileImage');
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// updateRequestStatus: Accept or Reject a request
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await MerchantRequest.findOne({ _id: id, owner: req.user._id });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or unauthorized' });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// completeRequest: Mark request as 'completed', decrement availableQuantity, save post
export const completeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await MerchantRequest.findOne({ _id: id, owner: req.user._id }).populate('post');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or unauthorized' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Request must be accepted before completing' });
    }

    const post = await MerchantPost.findById(request.post._id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.availableQuantity < request.requestedQuantity) {
      return res.status(400).json({ success: false, message: 'Not enough quantity available to complete this request' });
    }

    post.availableQuantity -= request.requestedQuantity;
    await post.save(); // pre-save hook handles status change

    request.status = 'completed';
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
