import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, Inbox, Send } from 'lucide-react';
import { fetchReceivedRequests, fetchSentRequests, updateRequestStatus, completeRequest } from '../../redux/slices/merchantCommunitySlice';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ManageRequests = () => {
  const dispatch = useDispatch();
  const { receivedRequests, sentRequests, loading, error } = useSelector(state => state.merchantCommunity);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    dispatch(fetchReceivedRequests());
    dispatch(fetchSentRequests());
  }, [dispatch]);

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await dispatch(updateRequestStatus({ requestId, status })).unwrap();
      toast.success(`Request ${status} successfully!`);
      // Refresh to ensure we have latest data
      dispatch(fetchReceivedRequests());
    } catch (err) {
      toast.error(err || 'Failed to update request');
    }
  };

  const handleComplete = async (requestId) => {
    try {
      await dispatch(completeRequest(requestId)).unwrap();
      toast.success('Food marked as given and quantity updated!');
      dispatch(fetchReceivedRequests());
    } catch (err) {
      toast.error(err || 'Failed to complete request');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Accepted</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1"><Package className="w-3 h-3"/> Completed</span>;
      default:
        return null;
    }
  };

  const activeData = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-dark-900">
      <div className="p-6 shrink-0 border-b border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-primary-500" />
            Manage Food Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Accept or reject requests from other merchants for your excess food.
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-dark-900 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'received' 
                ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Received Requests
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'sent' 
                ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Send className="w-4 h-4" />
            Sent Requests
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {loading && activeData?.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : activeData?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'received' ? <Inbox className="w-8 h-8 text-slate-400" /> : <Send className="w-8 h-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No {activeTab} requests</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              {activeTab === 'received' 
                ? "You haven't received any requests for your excess food yet." 
                : "You haven't sent any requests to other merchants."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {activeData?.map(request => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-slate-200 dark:border-dark-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                        {activeTab === 'received' ? request.requester?.businessName : request.owner?.businessName}
                      </h3>
                      {renderStatusBadge(request.status)}
                    </div>
                    <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-xl border border-slate-100 dark:border-dark-800">
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-1">
                        {request.post?.foodDetails || "Food details unavailable"}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-4">
                        <span>Requested: <strong className="text-primary-600 dark:text-primary-400">{request.requestedQuantity} meals</strong></span>
                        <span>Total Price: <strong className="text-slate-800 dark:text-white">₹{(request.post?.finalPrice || 0) * request.requestedQuantity}</strong></span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {activeTab === 'received' && (
                    <div className="flex flex-row md:flex-col gap-2 min-w-[140px] shrink-0">
                      {request.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(request._id, 'accepted')}
                            className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(request._id, 'rejected')}
                            className="flex-1 py-2 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {request.status === 'accepted' && (
                        <button 
                          onClick={() => handleComplete(request._id)}
                          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-green-500/20"
                        >
                          <Package className="w-4 h-4" />
                          Mark as Given
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRequests;
